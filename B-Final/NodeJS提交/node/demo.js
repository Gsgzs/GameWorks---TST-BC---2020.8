 function judgeIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {

     //快速排斥：
     //两个线段为对角线组成的矩形，如果这两个矩形没有重叠的部分，那么两条线段是不可能出现重叠的

     //这里的确如此，这一步是判定两矩形是否相交
     //1.线段ab的低点低于cd的最高点（可能重合）
     //2.cd的最左端小于ab的最右端（可能重合）
     //3.cd的最低点低于ab的最高点（加上条件1，两线段在竖直方向上重合）
     //4.ab的最左端小于cd的最右端（加上条件2，两直线在水平方向上重合）
     //综上4个条件，两条线段组成的矩形是重合的
     //特别要注意一个矩形含于另一个矩形之内的情况
     if (!(Math.min(x1, x2) <= Math.max(x3, x4) && Math.min(y3, y4) <= Math.max(y1, y2) && Math.min(x3, x4) <= Math.max(x1, x2) && Math.min(y1, y2) <= Math.max(y3, y4))) {
         return false;
     }

     //跨立实验：
     //如果两条线段相交，那么必须跨立，就是以一条线段为标准，另一条线段的两端点一定在这条线段的两段
     //也就是说a b两点在线段cd的两端，c d两点在线段ab的两端

     var u, v, w, z;
     u = (x3 - x1) * (y2 - y1) - (x2 - x1) * (y3 - y1);
     v = (x4 - x1) * (y2 - y1) - (x2 - x1) * (y4 - y1);
     w = (x1 - x3) * (y4 - y3) - (x4 - x3) * (y1 - y3);
     z = (x2 - x3) * (y4 - y3) - (x4 - x3) * (y2 - y3);

     return (u * v <= 0.00000001 && w * z <= 0.00000001);

 }

 let result = judgeIntersect(0, 1, 1, 0, -1, 0, 10, 100);
 console.log(result);

 let obstacles = [{
         center: [200, 200],
         width: 400,
         height: 10,
         rotation: 45
     },
     {
         center: [600, 600],
         width: 400,
         height: 10,
         rotation: 45
     },
     {
         center: [200, 600],
         width: 400,
         height: 10,
         rotation: -45
     },
     {
         center: [600, 200],
         width: 400,
         height: 10,
         rotation: -45
     },
     {
         center: [0, 0],
         width: 800,
         height: 10,
         rotation: 0
     },
     {
         center: [0, 0],
         width: 800,
         height: 10,
         rotation: 90
     },
     {
         center: [0, 0],
         width: 800,
         height: 10,
         rotation: 0
     },
     {
         center: [0, 0],
         width: 800,
         height: 10,
         rotation: 90
     }
 ]


 function endOfObstacle(obArr2) {
     let obArr = obArr2;
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
             newArr.push([
                 [+(center[0] - x).toFixed(20), +(center[1] + y).toFixed(20)],
                 [+(center[0] + x).toFixed(20), +(center[1] - y).toFixed(20)]
             ])
         } else if (rotation >= -180 && rotation <= -90) { //二四
             rotation += 180;
             rotation = Math.sin(rotation * Math.PI / 180);
             let x = width / 2 * Math.cos(rotation);
             let y = width / 2 * Math.sin(rotation);
             newArr.push([
                 [+(center[0] - x).toFixed(20), +(center[1] + y).toFixed(20)],
                 [+(center[0] + x).toFixed(20), +(center[1] - y).toFixed(20)]
             ])
         } else if (rotation > -90 && rotation <= 0) { //一三象限
             rotation = -rotation;
             rotation = Math.sin(rotation * Math.PI / 180);
             let x = width / 2 * Math.cos(rotation);
             let y = width / 2 * Math.sin(rotation);
             newArr.push([
                 [+(center[0] - x).toFixed(20), +(center[1] - y).toFixed(20)],
                 [+(center[0] + x).toFixed(20), +(center[1] + y).toFixed(20)]
             ])
         } else if (rotation > 90 && rotation <= 180) { //一三
             rotation = 180 - rotation;
             rotation = Math.sin(rotation * Math.PI / 180);
             let x = width / 2 * Math.cos(rotation);
             let y = width / 2 * Math.sin(rotation);
             newArr.push([
                 [+(center[0] - x).toFixed(20), +(center[1] - y).toFixed(20)],
                 [+(center[0] + x).toFixed(20), +(center[1] + y).toFixed(20)]
             ])
         }
     }

     return newArr;
 }

 let eOOArr = endOfObstacle(obstacles);
 console.log(eOOArr);


 // 无分路线
 function noPortionRoute(obArr) {
     //  obArr.splice(-4, 4); //去掉墙面
     let minDistance = twoDistance([10, 10], obArr[0].center);
     let minIndex = 0;
     console.log(obArr);
     console.log(obArr.length);
     for (let i = 0; i < obArr.length; i++) {
         if (twoDistance([10, 10], obArr[0].center) < minDistance) {
             minDistance = twoDistance([10, 10], obArr[0].center);
             minIndex = i;
         }
     }
     console.log(minIndex, minDistance);
     let endArr = eOOArr[minIndex];
     console.log(endArr);
 }

 noPortionRoute(obstacles);


 function twoDistance(p1, p2) {
     return Math.sqrt((Math.pow(p2[0] - p1[0], 2) + (Math.pow(p2[1] - p1[1], 2))))
 }
 //  let distance = twoDistance([200, 200], [10, 10]);
 //  console.log(distance);


 let arr = [
     [
         [1, 1],
         [2, 2]
     ]
 ];
 arr.push([
     [2, 2],
     [3, 3]
 ], [
     [4, 4],
     [2, 2]
 ]);
 console.log(arr);