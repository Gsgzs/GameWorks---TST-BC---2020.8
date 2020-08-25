// 请求模块
const request = require('superagent');
// 环境
let environment;
// 障物端点
let eOOArr;

// 主监测
async function look() {
    let status = await getStatus();
    status = JSON.parse(status);
    // console.log(status);
    if (status.status == 'free') {
        environment = await getEnvironment();
        environment = JSON.parse(environment);
        // console.log(environment);

        eOOArr = endOfObstacle(environment.obstacles);
        findMoreContact(environment.enemies);
        sortBetterBall(environment.enemies)

        // 路线规划 (速度/角度)
        let routeData = OptimalRoute(environment);

        request
            .post('http://localhost/action')
            .send(routeData)
            .end();
    }
    if (status.status == 'done') {
        clearInterval(timer);
    }
};

// 定时监测
let timer = setInterval(() => {
    look();
}, 500);

// 获取状态
function getStatus() {
    return new Promise((resolve, reject) => {
        request.get('http://localhost/status').then((res) => [
            resolve(res.text)
        ]);
    });
}

// 获取环境信息
function getEnvironment() {
    return new Promise((resolve, reject) => {
        request.get('http://localhost/scene').then((res) => [
            resolve(res.text)
        ]);
    });
}



let arrOk = [];
//#region 算法规范路线
function OptimalRoute() {
    let speed_merit = 100;
    let angle_merit = Math.random() * 360;
    let playerXY = environment.player.center;
    directRoute(environment.player.center); //直达通

    if (arrOk.length >= 1) {
        // filtHigherScore(arrOk);

        // let focusPoint = getFocusPoint();
        // angle_merit = getAngleByPoint([playerXY, focusPoint]);
        angle_merit = getAngleByPoint([playerXY, arrOk[0].center]);

        arrOk = [];
    } else {
        if (environment.chance > 1) {
            let gdPoint = getUsefulPosition();
            if (gdPoint) {
                angle_merit = getAngleByPoint([playerXY, gdPoint]);
                speed_merit = twoDistance(playerXY, gdPoint) * 0.01875;
            } else {
                let dataArr = noPortionRoute(environment.obstacles);
                speed_merit = dataArr[0];
                angle_merit = dataArr[1];
            }
        } else {
            let gdPoint = getUsefulPosition();
            if (gdPoint) {
                speed_merit = 100;
                angle_merit = getAngleByPoint([playerXY, gdPoint]);
            } else {
                let dataArr = noPortionRoute(environment.obstacles);
                speed_merit = dataArr[0];
                angle_merit = dataArr[1];
            }
        }
        //     if (environment.chance > 1) {
        //         arrOk = [];
        //         let dataArr = noPortionRoute(environment.obstacles);
        //         // speed_merit = dataArr[0];
        //         // angle_merit = dataArr[1];
        //         // directRoute([dataArr[0] - 20, dataArr[1] + 20]);
        //         console.log('下一个位置坐标');
        //         console.log(dataArr);
        //         directRoute(dataArr);
        //         if (arrOk.length >= 1) {
        //             speed_merit = dataArr[0];
        //             angle_merit = dataArr[1];
        //         } else {
        //             // speed_merit = 100;
        //             // angle_merit = dataArr[1];
        //             let gdPoint = getUsefulPosition();
        //             angle_merit = getAngleByPoint([playerXY, gdPoint]);
        //             speed_merit = twoDistance(playerXY, gdPoint) * 0.01875;
        //         }
        //     } else {
        //         let dataArr = noPortionRoute(environment.obstacles);
        //         speed_merit = 100;
        //         angle_merit = dataArr[1];
        //     }
        // }
        return {
            speed: speed_merit,
            angle: angle_merit
        }
    }
}
//#endregion


// 始末角 [包装]
function getAngleByPoint(p) {
    let p1 = {
        x: p[0][0],
        y: p[0][1]
    };
    let p2 = {
        x: p[1][0],
        y: p[1][1]
    };
    // console.log(p1, p2);

    // 左方向 y轴angle | 右方向 x轴angle
    if (p2.x - p1.x >= 0) { //右
        let angle = Math.atan2((p1.y - p2.y), (p2.x - p1.x)) //弧度 
        let theta = angle * (180 / Math.PI); //角度 
        if (p2.y - p1.y >= 0) { //上
            theta = -theta
        } else { //下
            theta = -theta
        }
        return theta
    } else { //左
        let angle = Math.atan2((p2.x - p1.x), (p1.y - p2.y)) //弧度 
        let theta = angle * (180 / Math.PI); //角度  
        if (p2.y - p1.y >= 0) { //上
            theta += 270
        } else { //下
            theta -= 90
        }
        return theta
    }

}

// 阻碍物端点
function endOfObstacle(obArr) {
    obArr.splice(-4, 4); //去掉墙面
    let newArr = [];
    for (let i = 0; i < obArr.length; i++) {
        let center = obArr[i].center;
        let width = obArr[i].width;
        let rotation = obArr[i].rotation;
        if (rotation >= 0 && rotation <= 90) { //二四象限
            rotation = Math.sin(rotation * Math.PI / 180);
            let x = width / 2 * Math.cos(rotation);
            let y = width / 2 * Math.sin(rotation);
            // let x = width / 2 * Math.cos(rotation) + environment.player.radius;
            // let y = width / 2 * Math.sin(rotation) + environment.player.radius;
            newArr.push([
                [+(center[0] - x).toFixed(2), +(center[1] + y).toFixed(2)],
                [+(center[0] + x).toFixed(2), +(center[1] - y).toFixed(2)]
            ])
        } else if (rotation >= -180 && rotation <= -90) { //二四
            rotation += 180;
            rotation = Math.sin(rotation * Math.PI / 180);
            let x = width / 2 * Math.cos(rotation);
            let y = width / 2 * Math.sin(rotation);
            // let x = width / 2 * Math.cos(rotation) + environment.player.radius;
            // let y = width / 2 * Math.sin(rotation) + environment.player.radius;
            newArr.push([
                [+(center[0] - x).toFixed(2), +(center[1] + y).toFixed(2)],
                [+(center[0] + x).toFixed(2), +(center[1] - y).toFixed(2)]
            ])
        } else if (rotation > -90 && rotation <= 0) { //一三象限
            rotation = -rotation;
            rotation = Math.sin(rotation * Math.PI / 180);
            let x = width / 2 * Math.cos(rotation);
            let y = width / 2 * Math.sin(rotation);
            // let x = width / 2 * Math.cos(rotation) + environment.player.radius;
            // let y = width / 2 * Math.sin(rotation) + environment.player.radius;
            newArr.push([
                [+(center[0] - x).toFixed(2), +(center[1] - y).toFixed(2)],
                [+(center[0] + x).toFixed(2), +(center[1] + y).toFixed(2)]
            ])
        } else if (rotation > 90 && rotation <= 180) { //一三
            rotation = 180 - rotation;
            rotation = Math.sin(rotation * Math.PI / 180);
            let x = width / 2 * Math.cos(rotation);
            let y = width / 2 * Math.sin(rotation);
            // let x = width / 2 * Math.cos(rotation) + environment.player.radius;
            // let y = width / 2 * Math.sin(rotation) + environment.player.radius;
            newArr.push([
                [+(center[0] - x).toFixed(2), +(center[1] - y).toFixed(2)],
                [+(center[0] + x).toFixed(2), +(center[1] + y).toFixed(2)]
            ])
        }
    }

    return newArr;
}

// 直达筛选
function directRoute(playerXY) {
    console.log(playerXY);
    for (let i = 0; i < environment.enemies.length; i++) {
        let flag = true;
        for (let j = 0; j < eOOArr.length; j++) {
            if (judgeIntersect(eOOArr[j][0], eOOArr[j][1], environment.enemies[i].center, playerXY)) {
                flag = false;
                break;
            };
        }
        if (flag) {
            arrOk.push(environment.enemies[i]);
        }
    };
    console.log('====================');
    console.log(arrOk);
}

// 无分路线
function noPortionRoute(obArr) {
    // obArr.splice(-4, 4); //去掉墙面
    // obArr.push({
    //     center: [environment.scene.width / 2, 0],
    //     width: 800,
    //     height: 10,
    //     rotation: 0
    // }, {
    //     center: [0, environment.scene.height / 2],
    //     width: 800,
    //     height: 10,
    //     rotation: 90
    // }, {
    //     center: [environment.scene.width / 2, environment.scene.height],
    //     width: 800,
    //     height: 10,
    //     rotation: 0
    // }, {
    //     center: [environment.scene.width, environment.scene.height / 2],
    //     width: 800,
    //     height: 10,
    //     rotation: 90
    // })
    // eOOArr.push([
    //     [0, 0],
    //     [0, environment.scene.width]
    // ], [
    //     [0, environment.scene.height],
    //     [environment.scene.width, environment.scene.height]
    // ], [
    //     [0, environment.scene.height],
    //     [0, 0]
    // ], [
    //     [environment.scene.width, environment.scene.height],
    //     [environment.scene.width, 0]
    // ])
    let playerXY = environment.player.center;
    let sortDistance = [];
    // let minDistance = twoDistance(playerXY, obArr[0].center);
    // let minIndex = 0;
    for (let i = 0; i < obArr.length; i++) {
        if (sortDistance.length == 0) {
            sortDistance.push({
                id: i,
                center: obArr[i].center,
                distance: twoDistance(playerXY, obArr[i].center),
            })
        } else {
            let flag = true;
            for (let j = 0; j < sortDistance.length; j++) {
                if (twoDistance(playerXY, obArr[i].center) < sortDistance[j].distance) {
                    sortDistance.splice(j, 0, {
                        id: i,
                        center: obArr[i].center,
                        distance: twoDistance(playerXY, obArr[i].center),
                    })
                    flag = false;
                    break;
                }
            }
            if (flag) {
                sortDistance.push({
                    id: i,
                    center: obArr[i].center,
                    distance: twoDistance(playerXY, obArr[i].center)
                })
            }
        }
    }
    // console.log(sortDistance);
    // console.log(eOOArr);
    // 偏移范围
    let offset = environment.player.radius + 20;
    let ii = 0;
    let resultArr = [];
    while (resultArr.length == 0 && sortDistance.length - 1 != ii) {
        let flag = true;
        let endArr = eOOArr[sortDistance[ii].id];
        if (endArr[0][1] >= endArr[1][1]) { //左高右低
            endArr[1][0] += (offset);
            endArr[1][1] -= (offset);
            // console.log(endArr);
            for (let i = 0; i < environment.obstacles.length; i++) {
                if (judgeIntersect(eOOArr[i][0], eOOArr[i][1], endArr[1], playerXY)) {
                    flag = false;
                    break;
                };
            }
            if (flag) {
                resultArr.push(twoDistance(playerXY, endArr[1]) * 0.01875, getAngleByPoint([playerXY, endArr[1]]))
            } else {
                flag = true;
                endArr[0][0] -= (offset);
                endArr[0][1] += (offset);
                // console.log(endArr);
                for (let i = 0; i < environment.obstacles.length; i++) {
                    if (judgeIntersect(eOOArr[i][0], eOOArr[i][1], endArr[1], playerXY)) {
                        flag = false;
                        break;
                    };
                }
                if (flag) {
                    resultArr.push(twoDistance(playerXY, endArr[0]) * 0.01875, getAngleByPoint([playerXY, endArr[0]]))
                }
            }
        } else { //左低右高
            endArr[0][0] -= (offset);
            endArr[0][1] += (offset);
            // console.log(endArr);
            for (let i = 0; i < environment.obstacles.length; i++) {
                if (judgeIntersect(eOOArr[i][0], eOOArr[i][1], endArr[1], playerXY)) {
                    flag = false;
                    break;
                };
            }
            if (flag) {
                resultArr.push(twoDistance(playerXY, endArr[0]) * 0.01875, getAngleByPoint([playerXY, endArr[0]]))
            } else {
                endArr[1][0] += (offset);
                endArr[1][1] -= (offset);
                // console.log(endArr);
                for (let i = 0; i < environment.obstacles.length; i++) {
                    if (judgeIntersect(eOOArr[i][0], eOOArr[i][1], endArr[1], playerXY)) {
                        flag = false;
                        break;
                    };
                }
                if (flag) {
                    resultArr.push(twoDistance(playerXY, endArr[1]) * 0.01875, getAngleByPoint([playerXY, endArr[1]]))
                }
            }
        }
        ii++;
    }
    if (resultArr.length == 0) {
        // console.log('=====没有可选=====');
        let endArr = eOOArr[sortDistance[0].id];
        if (endArr[0][1] >= endArr[1][1]) { //左高右低
            endArr[1][0] += (offset);
            endArr[1][1] -= (offset);
            // console.log(endArr);
            resultArr.push(twoDistance(playerXY, endArr[1]) * 0.01875, getAngleByPoint([playerXY, endArr[1]]))

        } else { //左低右高
            endArr[0][0] -= (offset);
            endArr[0][1] += (offset);
            // console.log(endArr);
            resultArr.push(twoDistance(playerXY, endArr[0]) * 0.01875, getAngleByPoint([playerXY, endArr[0]]))
        }
    }
    return resultArr;

}

// 两点间距
function twoDistance(p1, p2) {
    return Math.sqrt((Math.pow(p2[0] - p1[0], 2) + (Math.pow(p2[1] - p1[1], 2))))
}

// 香蕉判断
function judgeIntersect(lineOnePointA, lineOnePointB, lineTwoPointA, lineTwoPointB) {
    let x1 = lineOnePointA[0];
    let y1 = lineOnePointA[1];
    let x2 = lineOnePointB[0];
    let y2 = lineOnePointB[1];
    let x3 = lineTwoPointA[0];
    let y3 = lineTwoPointA[1];
    let x4 = lineTwoPointB[0];
    let y4 = lineTwoPointB[1];
    if (!(Math.min(x1, x2) <= Math.max(x3, x4) && Math.min(y3, y4) <= Math.max(y1, y2) && Math.min(x3, x4) <= Math.max(x1, x2) && Math.min(y1, y2) <= Math.max(y3, y4)))
        return false;
    var u, v, w, z
    u = (x3 - x1) * (y2 - y1) - (x2 - x1) * (y3 - y1);
    v = (x4 - x1) * (y2 - y1) - (x2 - x1) * (y4 - y1);
    w = (x1 - x3) * (y4 - y3) - (x4 - x3) * (y1 - y3);
    z = (x2 - x3) * (y4 - y3) - (x4 - x3) * (y2 - y3);
    return (u * v <= 0.00000001 && w * z <= 0.00000001);
};

// 排优
function findMoreContact(arrBall) {
    for (let i = 0; i < arrBall.length; i++) {
        arrBall[i].contacts = 0;
    }
    for (let i = 0; i < arrBall.length; i++) {
        for (let j = 0; j < arrBall.length; j++) {
            if (i != j) {
                let flag = true;
                for (let k = 0; k < eOOArr.length; k++) {
                    if (judgeIntersect(eOOArr[k][0], eOOArr[k][1], arrBall[i].center, arrBall[j].center)) {
                        flag = false;
                    }
                }
                if (flag) {
                    if (arrBall[i].contacts) {
                        arrBall[i].contacts += 1;
                    } else {
                        arrBall[i].contacts = 1;
                    }
                }
            }
        }
    }
}


// 筛选最高分
// function filtHigherScore(sdts) {
//     function compare(property, desc) {
//         return function (a, b) {
//             var value1 = a[property];
//             var value2 = b[property];
//             if (desc == true) {
//                 // 升序排列
//                 return value1 - value2;
//             } else {
//                 // 降序排列
//                 return value2 - value1;
//             }
//         }
//     }
//     // console.log('最高分：' + sdts.sort(compare("score", false)));
//     arrOk = sdts.sort(compare("score", false));
//     console.log(arrOk);
// }

// 排优
function findMoreContact(arrBall) {
    for (let i = 0; i < arrBall.length; i++) {
        arrBall[i].contacts = 0;
    }
    for (let i = 0; i < arrBall.length; i++) {
        for (let j = 0; j < arrBall.length; j++) {
            if (i != j) {
                let flag = true;
                for (let k = 0; k < eOOArr.length; k++) {
                    if (judgeIntersect(eOOArr[k][0], eOOArr[k][1], arrBall[i].center, arrBall[j].center)) {
                        flag = false;
                    }
                }
                if (flag) {
                    if (arrBall[i].contacts) {
                        arrBall[i].contacts += 1;
                    } else {
                        arrBall[i].contacts = 1;
                    }
                }
            }
        }
    }
}

// 排序小球优先级
function sortBetterBall(sdts) {
    function compare(property, desc) {
        return function (a, b) {
            var value1 = a[property];
            var value2 = b[property];
            if (desc == true) {
                // 升序排列
                return value1 - value2;
            } else {
                // 降序排列
                return value2 - value1;
            }
        }
    }
    // console.log('最高分：' + sdts.sort(compare("score", false)));
    sdts = sdts.sort(compare("contacts", false));
}

// 计算集中点
function getFocusPoint() {
    let focusPX = 0;
    let focusPY = 0;
    for (let i = 0; i < environment.enemies.length; i++) {
        focusPX += environment.enemies[i].center[0];
        focusPY += environment.enemies[i].center[1];
    }
    // for (let i = 0; i < arrOk.length; i++) {
    //     focusPX += arrOk[i].center[0];
    //     focusPY += arrOk[i].center[1];
    // }
    focusPX = focusPX / environment.enemies.length;
    focusPY = focusPY / environment.enemies.length;
    // focusPX = focusPX / arrOk.length;
    // focusPY = focusPY / arrOk.length;
    let minDistance = twoDistance([focusPX, focusPY], arrOk[0].center);
    let minIndex = 0;
    for (let i = 0; i < arrOk.length; i++) {
        if (twoDistance([focusPX, focusPY], arrOk[i].center < minDistance)) {
            minDistance = twoDistance([focusPX, focusPY], arrOk[i].center);
            minIndex = i;
        }
    }
    focusPX = (focusPX + arrOk[minIndex].center[0]) / 2;
    focusPY = (focusPY + arrOk[minIndex].center[1]) / 2;
    return [focusPX, focusPY];
}

// 求一个合理位置
function getUsefulPosition() {
    let maxX = environment.scene.width;
    let maxY = environment.scene.height;
    // let nearestScore;
    // let nearestdistance = 10000;
    // for (let i = 0; i < environment.enemies.length; i++) {
    //     if (nearestdistance > Math.pow(Math.pow(environment.enemies[i].center[0] - environment.player.center[0], 2) + Math.pow(environment.enemies[i].center[1] - environment.player.center[1], 2), 1 / 2)) {
    //         nearestdistance = Math.pow(Math.pow(environment.enemies[i].center[0] - environment.player.center[0], 2) + Math.pow(environment.enemies[i].center[1] - environment.player.center[1], 2), 1 / 2);
    //     }
    // };
    // for (let i = 0; i < environment.enemies.length; i++) {
    //     if (nearestdistance == Math.pow(Math.pow(environment.enemies[i].center[0] - environment.player.center[0], 2) + Math.pow(environment.enemies[i].center[1] - environment.player.center[1], 2), 1 / 2)) {
    //         nearestScore = environment.enemies[i];
    //     }
    // };

    let playerXY = environment.player.center;
    let enemiesArr = environment.enemies;
    let sortDistance = [];
    for (let i = 0; i < enemiesArr.length; i++) {
        if (sortDistance.length == 0) {
            sortDistance.push({
                center: enemiesArr[i].center,
                distance: twoDistance(playerXY, enemiesArr[i].center)
            })
        } else {
            let flag = true;
            for (let j = 0; j < sortDistance.length; j++) {
                if (twoDistance(playerXY, enemiesArr[i].center) < sortDistance[j].distance) {
                    sortDistance.splice(j, 0, {
                        center: enemiesArr[i].center,
                        distance: twoDistance(playerXY, enemiesArr[i].center)
                    })
                    flag = false;
                    break;
                }
            }
            if (flag) {
                sortDistance.push({
                    center: enemiesArr[i].center,
                    distance: twoDistance(playerXY, enemiesArr[i].center)
                })
            }
        }
    }
    console.log('======排序=====');
    console.log(sortDistance);

    for (let i = 0; i < sortDistance.length; i++) {
        let whileflag = true;
        let randomX = Math.floor(Math.random() * maxX);
        let randomY = Math.floor(Math.random() * maxY);

        setTimeout(() => {
            whileflag = false;
        }, 5000)

        while (!flag(sortDistance[i], randomX, randomY) && whileflag) {
            randomX = Math.floor(Math.random() * maxX);
            randomY = Math.floor(Math.random() * maxY);
        };
        if (whileflag) {
            console.log([randomX, randomY]);
            return [randomX, randomY];
        }
    }
};

function flag(nearestScore, randomX, randomY) {
    let flag = true;
    for (let i = 0; i < eOOArr.length; i++) {
        if (judgeIntersect(eOOArr[i][0], eOOArr[i][1], nearestScore.center, [randomX, randomY]) || judgeIntersect(eOOArr[i][0], eOOArr[i][1], [randomX, randomY], environment.player.center)) {
            return flag = false;
        }
    }
    return flag
}