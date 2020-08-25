import pyglet
from pyglet import shapes

import math
import sys
import json

import pyphx.PhysX4 as px
from pinball.physics import Scene, Entity
from pinball.object import Point, Enemy, Player, Obstacle


class _Scene(Scene):

    def __init__(self, width, height):
        Scene.__init__(self)
        self.width = width
        self.height = height

        px.initPhysics()

        self.add_static(
            Entity(
                'plane',
                px.createStatic(
                    transform=px.PxTransform(
                        px.PxVec3(0, 0, 0),
                        px.PxQuat(px.PxHalfPi, px.PxVec3(0, 0, 1))
                    ),
                    shape=px.createShape(
                        geometry=px.PxPlaneGeometry(),
                        material=px.createMaterial(0, 0, 0),
                    )
                )
            )
        )

    def tick(self, delta_time):
        for entity in self.dynamic:
            entity.tick(delta_time)
        px.stepPhysics(delta_time)


class Viewer(pyglet.window.Window):

    def __init__(self, width, height):
        super(Viewer, self).__init__(
            width=width,
            height=height,
            resizable=False,
            caption='Pinball',
            vsync=False
        )
        pyglet.gl.glClearColor(1, 1, 1, 1)
        self.batch = pyglet.graphics.Batch()

    def render(self):
        self.switch_to()
        self.dispatch_events()
        self.dispatch_event('on_draw')
        self.flip()

    def init(self, player, obstacles, enemies):

        self.player = shapes.Circle(
            player.center.x,
            player.center.y,
            player.radius,
            color=(255, 0, 0),
            batch=self.batch
        )

        self.enemies = []
        for enemy in enemies:
            circle = shapes.Circle(
                enemy.center.x,
                enemy.center.y,
                enemy.radius,
                color=(50, 225, 30),
                batch=self.batch
            )
            self.enemies.append(circle)

        self.obstacles = []
        for obstacle in obstacles:
            alpha = obstacle.rotation / 180 * math.pi
            x = - obstacle.width / 2
            y = - obstacle.height / 2
            x1 = math.sin(alpha) * y + \
                math.cos(alpha) * x + obstacle.center.x
            y1 = math.cos(alpha) * y - \
                math.sin(alpha) * x + obstacle.center.y

            rectangle = shapes.Rectangle(
                x1,
                y1,
                obstacle.width,
                obstacle.height,
                color=(0, 0, 0),
                batch=self.batch
            )
            rectangle.rotation = obstacle.rotation
            self.obstacles.append(rectangle)

    def update(self, player, enemies):

        self.player.x = player.center.x
        self.player.y = player.center.y

        for i in range(len(enemies)):
            if enemies[i].state == 0 and self.enemies[i]._vertex_list is not None:
                self.enemies[i].delete()

    def on_draw(self):
        self.clear()
        self.batch.draw()


class Pinball(object):

    viewer = None
    dt = .05  # Refresh rate

    action_bound = [0, 100]
    action_dim = 2

    def __init__(self, render=False):

        self.scene = None
        self.player = None
        self.enemies = []
        self.obstacles = []
        self.chance = -1
        self.score = 0
        self.operable = False
        self.render = render

    def reset(self, level):

        self.chance = level['chance']

        self.scene = _Scene(
            level['scene']['width'],
            level['scene']['height'],
        )

        self.player = Player(
            self.scene,
            Point(
                level['player']['center'][0],
                level['player']['center'][1]
            ),
            level['player']['radius'],
        )

        fences = [
            {'center': (self.scene.width / 2, 0),
             'width': self.scene.width, 'height': 10, 'rotation': 0},
            {'center': (self.scene.width, self.scene.height / 2),
             'width': self.scene.height, 'height': 10, 'rotation': 90},
            {'center': (self.scene.width / 2, self.scene.height),
             'width': self.scene.width, 'height': 10, 'rotation': 0},
            {'center': (0, self.scene.height / 2),
             'width': self.scene.height, 'height': 10, 'rotation': 90}
        ]

        obstacles = []
        obstacles.extend(level['obstacles'])
        obstacles.extend(fences)

        for obstacle in obstacles:
            self.obstacles.append(
                Obstacle(
                    self.scene,
                    Point(
                        obstacle['center'][0],
                        obstacle['center'][1]
                    ),
                    obstacle['width'],
                    obstacle['height'],
                    obstacle['rotation']
                )
            )

        for enemy in level['enemies']:
            self.enemies.append(
                Enemy(
                    Point(
                        enemy['center'][0],
                        enemy['center'][1]
                    ),
                    enemy['radius'],
                    enemy['score']
                )
            )

        if self.render:
            self.viewer = Viewer(self.scene.width, self.scene.height)
            self.viewer.init(self.player, self.obstacles, self.enemies)
            self.viewer.render()

        self.operable = True

    def action(self, speed_, action_):

        if not self.get_status()['status'] == 'free':
            return

        self.operable = False

        speed = float(speed_)
        angle = float(action_)

        speed = max(self.action_bound[0], min(speed, self.action_bound[1]))
        angle = angle / 180 * math.pi

        speed_x = math.cos(angle) * speed
        speed_y = math.sin(angle) * speed

        self.player.set_velocity(speed_x, speed_y)

        self.scene.tick(self.dt)
        self.scene.tick(self.dt)

        while self.player.speed > 1e-3:
            self.scene.tick(self.dt)
            for enemy in self.enemies:
                if enemy.state and self.player.hit(enemy):
                    self.score += enemy.score
                    enemy.state = 0
            if self.render:
                self.viewer.update(self.player, self.enemies)
                self.viewer.render()

        self.chance -= 1 if self.chance > 0 else 0
        self.operable = True


    def stop(self):
        px.cleanupPhysics()
        sys.exit()

    def get_status(self):
        observation = self.get_observation()
        if observation['chance'] == 0 or len(observation['enemies']) == 0:
            status = 'done'
        elif self.operable:
            status = 'free'
        else:
            status = 'busy'
        return {'status': status}

    def get_observation(self):

        scene = {
            'width': self.scene.width,
            'height': self.scene.height
        }
        player = {
            'center': [
                self.player.center.x,
                self.player.center.y,
            ],
            'radius': self.player.radius
        }
        obstacles = []
        for obstacle in self.obstacles:
            obstacles.append(
                {
                    'center': [
                        obstacle.center.x,
                        obstacle.center.y
                    ],
                    'width': obstacle.width,
                    'height': obstacle.height,
                    'rotation': obstacle.rotation
                }
            )
        enemies = []
        for i in range(len(self.enemies)):
            enemy = self.enemies[i]
            if enemy.state:
                enemies.append(
                    {
                        'id': i,
                        'center': [
                            enemy.center.x,
                            enemy.center.y
                        ],
                        'radius': enemy.radius,
                        'score': enemy.score
                    }
                )

        observation = {
            'scene': scene,
            'player': player,
            'obstacles': obstacles,
            'enemies': enemies,
            'chance': self.chance
        }

        return observation

    def get_score(self):
        return {'score': self.score}