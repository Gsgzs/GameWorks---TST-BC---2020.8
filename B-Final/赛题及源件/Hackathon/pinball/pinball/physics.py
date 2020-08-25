import weakref

class Entity(object):

    def __init__(self, name, px_obj):
        self.px_obj = px_obj
        self.name = name

    def borrow(self):
        return weakref.proxy(self)

    def tick(self, delta_time):
        print("%.4f %s" % (delta_time, self.px_obj.getGlobalPose().p))

class Scene(object):

    def __init__(self):
        self.dynamic = weakref.WeakSet()
        self.static = weakref.WeakSet()
        self.trigger = weakref.WeakSet()
        self.entities = {}

    def add_static(self, entity):
        self.add_entity(entity)
        self.static.add(entity)
        return entity.borrow()

    def add_dynamic(self, entity):
        self.add_entity(entity)
        self.dynamic.add(entity)
        return entity.borrow()

    def add_trigger(self, entity):
        self.add_entity(entity)
        self.trigger.add(entity)
        return entity.borrow()

    def add_entity(self, entity):
        self.entities[entity.name] = entity

    def get_entity_proxy(self, name):
        return self.entities[name].borrow()

    def remove_entity(self, name):
        del self.entities[name]

