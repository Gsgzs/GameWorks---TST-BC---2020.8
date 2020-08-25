import requests
import json
import time
import random

# 测评服务地址
base_url = "http://127.0.0.1/"
# 请求间隔时间
dt = .5

def action(speed, angle):
    while True:
        status = requests.get(base_url + 'status').json()['status']
        if status == 'free':
            requests.post(base_url + 'action', json={'speed': speed, 'angle': angle})
            break
        elif status == 'done':
            break
        time.sleep(dt)

if __name__ == "__main__":

    observation = requests.get(base_url + 'scene').json()

    while True:

        speed = random.random() * 100
        angle = random.random() * 360
        
        # speed = 15
        # speed = 1.875
        # angle = 0
        # angle = random.random() * 720 - 360

        action(speed, angle)

        observation = requests.get(base_url + 'scene').json()
        score = requests.get(base_url + 'score').json()['score']
        status = requests.get(base_url + 'status').json()['status']

        print(observation, score)

        if status == 'done':
            break
