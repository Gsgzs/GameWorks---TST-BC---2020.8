# coding=utf-8

# author ganix 20200814
import threading
import socket
import conn.dispather


class Server(threading.Thread):

    def __init__(self, port):
        super(Server, self).__init__()
        self.socket = socket.socket()
        self.host = '127.0.0.1'
        print("host: %s" % self.host)
        self.port = port
        self.socket.bind((self.host, port))
        self.socket.listen(10)
        self.inited = False

    def run(self):
        while True:
            c, addr = self.socket.accept()
            print('recv request from %s' % str(addr))
            if self.inited:
                threading.Thread(target=self.run_cmd, args=(c, addr)).start()
            else:
                self.run_cmd(c, addr)

    def run_cmd(self, c, addr):
        try:
            cmd = c.recv(4096).decode(encoding='utf-8')
            print('recv cmd: %s' % cmd)
            func, args = parse_cmd(cmd)
            msg = dispatch(func, args)
            print('run cmd finish, sending result: %s' % msg)
            c.send(msg.encode())
        except Exception as e:
            print('error while run cmd!', e)
        finally:
            c.close()
 


def parse_cmd(cmd):
    infos = cmd.split(';')
    func = infos[0]
    args = infos[1:] if len(infos) > 1 else []
    return func, args


def dispatch(func, args):
    print("dispatching... %s(%s)" % (func, args))
    return conn.dispather.dispatch(func, args)
