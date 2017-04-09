var Mahjong = require("./Mahjong.js");

Util = require("../common/Utility.js");

//var handCards = [21,22,22,23,24,24,25,26,26,27,28,28,28];
var handCards = [22,23,24,25,26,27,28];
var huCards = new Array();

function comp(a , b) {
    return b - a;
}

//handCards.sort(comp);
console.log(handCards);

console.time('GetHuCards');
var rs = Mahjong.GetHuCards(handCards, huCards);
console.timeEnd('GetHuCards');
if (rs) 
    console.log("胡牌", huCards);
else
    console.log("没有可胡的牌!");
