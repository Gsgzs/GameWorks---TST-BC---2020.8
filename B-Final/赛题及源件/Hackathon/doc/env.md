# 运行环境说明

评测环境为 1 台 8 核 16 G、 Windows 10 操作系统的服务器，安装有:

- `Jdk 10.0.2`
- `Python 3.7.6`
- `Node.js 12.18.3`等运行环境。

其中，`Python` 使用 `Miniconda3` 配置环境，所安装具体依赖如下：

```yml
name: base
channels:
  - pytorch
  - defaults
dependencies:
  - python=3.7.6
  - tensorflow=1.15.0
  - flask=1.1.1
  - keras=2.3.1
  - lightgbm=2.3.0
  - pandas=1.0.2
  - psutil=5.7.0
  - scikit-learn=0.22.1
  - scipy=1.4.1
  - theano=1.0.4
  - pytorch=1.4.0
  - torchvision=0.5.0
  - pyyaml=5.3.1
```