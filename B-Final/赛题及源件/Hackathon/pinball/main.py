from pinball.pinball import Pinball
import threading
import time
import json
import sys
from conn import dispather, conn_server

if __name__ == "__main__":
    env = Pinball(render=True)
    server = conn_server.Server(3090)

    def load_map(index):
        level_file = open('./data/%02d.json' % int(index), encoding='utf-8')
        level = json.load(level_file)
        env.reset(level)
        server.inited = True
        return 'ok'

    load_map(int(sys.argv[1]))

    cache = None
    cache_lock = threading.Lock()

    def cache_action(speed, angle):
        global cache
        with cache_lock:
            cache = [speed, angle]
        return "ok"

    dispather.register('action', cache_action)
    dispather.register('get_status', lambda: json.dumps(env.get_status()))
    dispather.register('get_scene', lambda: json.dumps(env.get_observation()))
    dispather.register('get_score', lambda: json.dumps(env.get_score()))
    dispather.register('stop', env.stop)

    server.start()
    while True:
        with cache_lock:
            if cache is not None:
                env.action(cache[0], cache[1])
                cache = None
        time.sleep(0.1)
