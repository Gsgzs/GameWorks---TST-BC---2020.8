import pyphx.PhysX4 as px
from pinball.physics import Entity, Scene

import copy
import math

class Point(object):

    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __abs__(self):
        return (self.x * self.x + self.y * self.y) ** 0.5

    def __sub__(self, other):
        return Point(self.x - other.x, self.y - other.y)

class Enemy(object):

    def __init__(self, center: Point, radius, score):
        self.center = center
        self.radius = radius
        self.score = score
        self.state = 1


class Obstacle(Entity):

    id = 0

    @staticmethod
    def generate_id():
        Obstacle.id += 1
        return Obstacle.id

    def __init__(self, scene: Scene, center: Point, width, height, rotation):
        Entity.__init__(
            self,
            'Obstacle_%d' % Obstacle.generate_id(),
            px.createStatic(
                transform=px.PxTransform(
                    px.PxVec3(center.x, 50, center.y),
                    px.PxQuat(rotation / 180 * math.pi, px.PxVec3(0, 1, 0)) # 顺时针
                ),
                shape=px.createShape(
                    geometry=px.PxBoxGeometry(width / 2, 50, height / 2),
                    material=px.createMaterial(0, 0, 1)
                )
            )
        )
        self.center = center
        self.width = width
        self.height = height
        self.rotation = rotation
        scene.add_static(self)


class Player(Entity):

    def __init__(self, scene: Scene, center: Point, radius):
        Entity.__init__(
            self,
            'player',
            px.createDynamic(
                transform=px.PxTransform(
                    px.PxVec3(center.x, 10, center.y),
                    px.PxQuat(px.PxHalfPi, px.PxVec3(0, 0, 1))
                ),
                shape=px.createShape(
                    geometry=px.PxSphereGeometry(radius),
                    material=px.createMaterial(0.2, 0.2, 1)
                )
            )
        )
        self.center = center
        self.radius = radius
        scene.add_dynamic(self)

        self.speed = 0
        self.last_position = self.center

    def hit(self, enemy: Enemy):
        distance = abs(self.center - enemy.center)
        return distance <= self.radius + enemy.radius

    def tick(self, dt):
        self.center.x = self.px_obj.getGlobalPose().p.x
        self.center.y = self.px_obj.getGlobalPose().p.z

        self.speed = abs(self.last_position - self.center) / dt
        self.last_position = copy.deepcopy(self.center)

    def set_velocity(self, x, z):
        self.px_obj.setLinearVelocity(px.PxVec3(x, 0, z))
