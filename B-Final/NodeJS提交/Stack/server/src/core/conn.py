# coding=utf-8

# author ganix 20200813
import socket


def socket_request(function, *args):
    client = socket.socket()
    host = '127.0.0.1'
    port = 3090
    try:
        client.connect((host, port))
    except Exception as e:
        print(e)
        return 'error on socket conn'
    cmd = function
    if len(args) > 0:
        cmd += ';%s' % ';'.join([str(i) for i in args])
    client.send(cmd.encode(encoding='utf-8'))
    return client.recv(4096).decode(encoding='utf-8')
