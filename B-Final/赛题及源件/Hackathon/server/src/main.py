# coding=utf-8

# author ganix 20200813

from flask import Flask, request

import core.conn

controller = Flask(__name__)

@controller.route('/action', methods=['POST'])
def action():
    json_data = request.get_json()
    print('/action %s' % json_data)
    speed = json_data['speed']
    angle = json_data['angle']
    core.conn.socket_request('action', speed, angle)
    return ('', 200)

@controller.route('/status', methods=['GET'])
def get_status():
    return core.conn.socket_request('get_status')

@controller.route('/scene', methods=['GET'])
def get_scene():
    return core.conn.socket_request('get_scene')


@controller.route('/score', methods=['GET'])
def get_score():
    return core.conn.socket_request('get_score')

if __name__ == '__main__':
    controller.run(port=80)