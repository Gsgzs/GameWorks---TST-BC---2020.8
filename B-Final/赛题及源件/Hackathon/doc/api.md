# 接口文档

## 游戏状态信息

```
GET /status
```

### 响应类型

|属性|类型|说明|
|:-:|:-:|:-:|
|status|string|游戏当前状态，`busy`：处于忙碌状态，无法执行玩家操作；`free`：处于空闲状态，可执行玩家操作；`done`：游戏已结束，无法执行任何操作。|

### 示例代码

```python
requests.get("http://127.0.0.1/status")
```

```
Status: 200 OK
```

```json
{
    "status": "busy"
}
```

## 游戏场景信息

```
GET /scene
```

### 响应类型

|属性|类型|说明|
|:-:|:-:|:-:|
|scene|object|游戏场景信息|
|player|object|游戏玩家信息|
|obstacles|list.object|游戏障碍物信息|
|enemies|list.object|游戏敌人信息|
|chance|number|剩余行动机会|

`scene`

|属性|类型|说明|
|:-:|:-:|:-:|
|width|number|游戏场景长度（单位：像素）|
|height|number|游戏场景高度（单位：像素）|

`player`

|属性|类型|说明|
|:-:|:-:|:-:|
|center|list|`[x, y]` 玩家所在中心位置|
|raius|number|玩家半径（单位：像素）|

`obstacles`

|属性|类型|说明|
|:-:|:-:|:-:|
|center|list|`[x, y]` 障碍物所在中心位置|
|width|number|障碍物宽度（单位：像素）|
|height|number|障碍物高度（单位：像素）|
|rotation|number|障碍物旋转角度（顺时针方向旋转，当 `rotation=0`时，障碍物水平）（单位：度）|

`enemies`

|属性|类型|说明|
|:-:|:-:|:-:|
|id|number|敌人编号|
|center|list|`[x, y]` 敌人所在中心位置|
|raius|number|敌人半径（单位：像素）|
|score|number|击倒敌人可获得的分数|

### 示例代码

```python
requests.get("http://127.0.0.1/scene)
```

```
Status: 200 OK
```


```json
{
	"scene": {
		"width": 800,
		"height": 800
	},
	"player": {
		"center": [10, 10],
		"radius": 10
	},
	"obstacles": [
        {
            "center": [200, 200],
            "width": 400,
            "height": 10,
            "rotation": 45
        }
    ],
	"enemies": [
        {
            "id": 1,
            "center": [700, 100],
            "radius": 30,
            "score": 10
        }
    ],
	"chance": 10
}
```

## 游戏得分信息

```
GET /score
```

### 响应类型

|属性|类型|说明|
|:-:|:-:|:-:|
|score|number|玩家当前获得分数|

### 示例代码

```python
requests.get("http://127.0.0.1/score")
```

```
Status: 200 OK
```

```json
{
    "score": 0
}
```

## 执行玩家操作

```
POST /action
```

### 请求参数

|名称|类型|位置|说明|
|:-:|:-:|:-:|:-:|
|speed|number|body|玩家前进速度，取值范围为 `[0, 100]`|
|angle|number|body|玩家前进角度（逆时针方向）（单位：度）|

### 示例代码

```python
requests.post("http://127.0.0.1/action", json={"speed": 100, "angle": 10})
```

```
Status: 200 OK
```
