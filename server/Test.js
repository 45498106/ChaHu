/*
var score = [3,12,2,2];
var singleScore = [0,0,0,0];

for (var i =0 ; i < score.length; ++i) {
    for (var j =0 ; j < score.length; ++j) {
        if (i !== j) {
            singleScore[i] += (score[i] - score[j])
        }
    }
}

console.log("结算", singleScore);
*/


// var Mahjong = require("./Mahjong.js");

// Util = require("../common/Utility.js");

// //var handCards = [21,22,22,23,24,24,25,26,26,27,28,28,28];
// var handCards = [22,23,24,25,26,27,28];
// var huCards = new Array();

// function comp(a , b) {
//     return b - a;
// }

// //handCards.sort(comp);
// console.log(handCards);

// console.time('GetHuCards');
// var rs = Mahjong.GetHuCards(handCards, huCards);
// console.timeEnd('GetHuCards');
// if (rs) 
//     console.log("胡牌", huCards);
// else
//     console.log("没有可胡的牌!");


// var COS = require('cos-nodejs-sdk-v5');
// // 创建实例
// var cos = new COS({
//     AppId: '1253106522',
//     SecretId: 'AKIDOhojR1P6LUWWP6Nv56uZ2JOGuLclYfVB',
//     SecretKey: 'e8PTKyRhtypgOwOfmjVAh2CAvUsgOvLZ',
// });

// cos.getService(function(err, data) {
//     if(err) {
//         console.log(err);
//     } else {
//         //console.log(data);

//         var params = {
//             Bucket : data.Buckets[0].Name,    /* 必须 */
//             Region : data.Buckets[0].Location /* 必须 */
//         };

//         cos.headBucket(params, function(err, data) {
//             if(err) {
//                 console.log(err);
//             } else {
//                 console.log(data);

// // 对象上传
// var fs = require('fs');
// var filePath = 'D://mj-project/server/data.json';
// var _params = {
//     Bucket: params.Bucket,    /* 必须 */
//     Region: params.Region,    /* 必须 */
//     Key: 'data.json',    /* 必须 */
//     Body: fs.createReadStream(filePath),
//     ContentLength: fs.statSync(filePath).size,
//     onHashProgress: function (progressData) {
//         console.log(JSON.stringify(progressData));
//     },
//     onProgress: function (progressData) {
//         console.log(JSON.stringify(progressData));
//     },
// };

// cos.putObject(_params, function(err, data) {
//     if(err) {
//         console.log(err);
//     } else {
//         console.log(data);
//     }
// });
//             }
//         });
//     }
// });

