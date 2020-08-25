# coding=utf-8

# author ganix 20200814

functions = {}

def register(name, func):
    print('load func: %s' % name)
    functions[name] = func


def dispatch(name, args):
    print('run [%s] with args:[%s]' % (name, args))
    if name not in functions:
        print('no such function!')
        return 'no such function! %s' % name
    return functions[name](*args)
