# 黑客马拉松

为方便选手迅速上手，我们提供了样例数据、样例程序以及本地测评程序等，选手可在样例程序的基础上进行开发。

```shell
├─data      样例数据，数据定义与接口文档中相同
├─doc       接口文档，在测评中选手通过 API 接口对游戏进行操作
├─pinball   游戏程序，包括游戏逻辑及物理引擎等
├─sample    样例程序，方便选手迅速上手
└─server    测评程序，选手通过该服务对游戏进行操作
```
- 本次竞赛线上测评中，将通过 API 接口获取游戏场景信息并执行玩家操作，请参赛选手认真阅读[接口文档](./doc/api.md)；
- 本次竞赛中，不限制开发语言，具体测评运行环境见[运行环境说明](./doc/env.md)。

## 安装

测评程序运行环境为 `Python 3.7.7`，请选手务必确保本地测试时的测试程序运行环境（已提供 `Python 3.7.7` 的安装包）。

```shell
pip install requirements.txt
```

## 本地测试

```shell
# 启动本地测评服务，后跟参数指定测评地图为 1
./server.bat 1
# 启动游戏 AI 脚本，如：
./sample/run.bat
```

## 提交

将所需文件及启动脚本 `run.bat` 打包为 `zip` 文件，提交至[https://www.kesci.com/home/competition/5ece325973a1b3002c9f1bfb/submit](https://www.kesci.com/home/competition/5ece325973a1b3002c9f1bfb/submit)。

注意：

1. 文件解压后，**根目录**下必须包含 `run.bat` 文件；
2. 在提交作品中，确保 API 请求地址为 `127.0.0.1`。

> 提供 `sample/sample.zip` 样例文件，可直接进行提交。
