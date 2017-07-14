if(typeof module !== 'undefined')
    module.exports = Player;

var Mahjong = require("./Mahjong.js");

function Player()
{

}

Player.prototype.Init = function(uniqueID, id, name, headUrl, socket)
{
    this.uniqueID = uniqueID;
    this.id = id;
    this.name = name;
    this.headUrl = headUrl;
    this.socket = socket;
    this.data = null;
}

Player.prototype.AttachData = function(gameData)
{
    this.data = gameData;
    gameData.place = this.place;
    gameData.userId = this.id;
    gameData.userName = this.name;
    gameData.userHeadUrl = this.headUrl;
    gameData.offline = false;
}

Player.prototype.InitCards = function(cards)
{
    this.data.cards = cards.slice();
    this.data.outputCards.splice(0, this.data.outputCards.length);
    this.data.pengCards.splice(0, this.data.pengCards.length);
    this.data.gangCards.splice(0, this.data.gangCards.length);
    this.data.kanCards.splice(0, this.data.kanCards.length);
    this.data.niuCards.splice(0, this.data.niuCards.length);
    this.data.chiCards.splice(0, this.data.chiCards.length);
    this.data.jiangCards.splice(0, this.data.jiangCards.length);
    
    this.data.score = 0;
    this.data.singleScore = 0;
    this.data.firstAdd = true;
    this.data.canNiu = false;
    this.data.piao = false;
    this.data.piaoCard = 0;
    this.data.updateHucards = true;
}

Player.prototype.CalcHuCard = function(card)
{
    this.data.isHuCards = false;
    
    if (typeof card !== 'undefined') {
        var huCards = this.GetHuCards();
        for (var j = 0; j < huCards.length; ++j) {
            if (huCards[j] === card) {
                this.data.isHuCards = true;
                break;
            }
        }
    }
    else {
        var tempCards = this.data.cards.slice();
        var lastCard = tempCards.pop();
        var tempHuCards = [];
        var rs = (this.data.jiangCards.length === 0 ? 
                        Mahjong.GetHuCards(tempCards, tempHuCards) : 
                        Mahjong.GetJiangHuCards(tempCards, tempHuCards) );

        if(rs)
        {
            for (var j = 0; j < tempHuCards.length; ++j) {
                if (tempHuCards[j] === lastCard) {
                    this.data.isHuCards = true;
                    break;
                }
            }
        }
    }
}

Player.prototype.CanJiangCards = function(card) {
    if (this.data.jiangCards.length > 0) {
        return false;
    }

    return Mahjong.CanJiangCards(this.data.cards, card);
}

Player.prototype.CanPiao = function() {
    if (this.data.chiCards.length > 0) {
        return false;
    }

    if (this.data.cards.length === 1){
        return true;
    }
    else if (this.data.cards.length === 4) {
        if (this.data.cards[0] === this.data.cards[1] && 
            this.data.cards[2] === this.data.cards[3]) {
            return true;
        }
        
        if (this.data.cards[0] === this.data.cards[2] &&
            this.data.cards[1] === this.data.cards[3]) {
            return true;
        }
        
        if (this.data.cards[0] === this.data.cards[3] && 
            this.data.cards[2] === this.data.cards[1]) {
            return true;
        }
    }
    
    return false;
}

Player.prototype.HasCard = function(card) {
    for (var i = 0; i < this.data.cards.length; ++i) {
        if (this.data.cards[i] === card)
            return true;
    }
    return false;
}

Player.prototype.AddCard = function(card){
    this.CalcHuCard(card);
    
    this.data.cards.push(card);
    
    if (this.room.RuleCanNiu() && this.data.firstAdd && Mahjong.HasNiuCardsByHand(this.data.cards)) {
        this.data.canNiu = true;
    }
    
    this.data.firstAdd = false;
}

Player.prototype.AddNiuCard = function(card) {
    this.data.niuCards.push(card);
    this.data.score += 5;
}

Player.prototype.AddJiangCard = function(card) {
    this.data.jiangCards.push(card);
    this.data.jiangCards.push(card);
    
    Util.ArrayRemoveElemnt(this.data.cards, card);
}

Player.prototype.AddChiCard = function(card, array) {
    for (var i = 0; i < 3; ++i) {
        if (card !== array[i]) {
            Util.ArrayRemoveElemnt(this.data.cards, array[i]);
        }
        this.data.chiCards.push(array[i]);
    }

    this.data.updateHucards = true;
}

Player.prototype.ThrowCard = function(card) {
    if (this.data.cards[this.data.cards.length-1] !== card) {
        this.data.updateHucards = true;
    }
    
    this.data.canNiu = false;
    this.data.outputCards.push(card);
    return Util.ArrayRemoveElemnt(this.data.cards, card);
}

Player.prototype.PengCards = function(card) {

    // 计算分数
    if (Mahjong.IsFirstType(card)) {
        this.data.score += 2;
    }else {
        this.data.score += 1;
    }

    this.data.pengCards.push(card);
    this.data.pengCards.push(card);
    this.data.pengCards.push(card);
    
    Util.ArrayRemoveElemnt(this.data.cards, card);
    Util.ArrayRemoveElemnt(this.data.cards, card);
    
    this.data.updateHucards = true;
    
    // 碰牌过后,可能不能牛了
    if (true === this.data.canNiu && false === Mahjong.HasNiuCardsByHand(this.data.cards)) {
        this.data.canNiu = false;
    }
}

Player.prototype.GangCards = function(card, selfGang) {
    var gangCardArray = [], needRemove = selfGang;
    if (Mahjong.CanGangCards(this.data.cards, card) || Mahjong.HasGangCardsByHand(this.data.cards, gangCardArray)) 
    {
        if (gangCardArray.length > 0) {
            this.data.gangCards.push(gangCardArray[0]);
            this.data.gangCards.push(gangCardArray[0]);
            this.data.gangCards.push(gangCardArray[0]);
            this.data.gangCards.push(gangCardArray[0]);
            
            Util.ArrayRemoveElemnt(this.data.cards, gangCardArray[0]);
            Util.ArrayRemoveElemnt(this.data.cards, gangCardArray[0]);
            Util.ArrayRemoveElemnt(this.data.cards, gangCardArray[0]);
            Util.ArrayRemoveElemnt(this.data.cards, gangCardArray[0]);
            needRemove = false;
        }else {
            this.data.gangCards.push(card);
            this.data.gangCards.push(card);
            this.data.gangCards.push(card);
            this.data.gangCards.push(card);
            
            Util.ArrayRemoveElemnt(this.data.cards, card);
            Util.ArrayRemoveElemnt(this.data.cards, card);
            Util.ArrayRemoveElemnt(this.data.cards, card);
        }
        
        // 计算分数
        if (Mahjong.IsFirstType(card)) {
            if (selfGang) {
                this.data.score += 30;
            } else {
                this.data.score += 20;
            }
        }else {
            if (selfGang) {
                this.data.score += 6;
            } else {
                this.data.score += 4;
            }
        }
    }
    /* 查胡麻将,碰了不能杠
    else if (Mahjong.CanGangCards(this.pengCards, card)) {
    
        this.gangCards.push(card);
        this.gangCards.push(card);
        this.gangCards.push(card);
        this.gangCards.push(card);
        
        Util.ArrayRemoveElemnt(this.pengCards, card);
        Util.ArrayRemoveElemnt(this.pengCards, card);
        Util.ArrayRemoveElemnt(this.pengCards, card);
        
    }*/
    else if (Mahjong.CanGangCards(this.data.kanCards, card)) {
        this.data.gangCards.push(card);
        this.data.gangCards.push(card);
        this.data.gangCards.push(card);
        this.data.gangCards.push(card);
        
        Util.ArrayRemoveElemnt(this.data.kanCards, card);
        Util.ArrayRemoveElemnt(this.data.kanCards, card);
        Util.ArrayRemoveElemnt(this.data.kanCards, card);
        
        // 计算分数
        if (Mahjong.IsFirstType(card)) {
            if (selfGang) {
                this.data.score += 20;
            } else {
                this.data.score += 18;
            }
        }else {
            if (selfGang) {
                this.data.score += 4;
            } else {
                this.data.score += 2;
            }
        }
    }
    
    this.data.updateHucards = true;
    
    if (needRemove) {
        Util.ArrayRemoveElemnt(this.data.cards, card);
    }
    // 杠牌过后,可能不能牛了
    if (true === this.data.canNiu && false === Mahjong.HasNiuCardsByHand(this.data.cards)) {
        this.data.canNiu = false;
    }
}

Player.prototype.KanCards = function() {
    var cardArray = [];
    if (Mahjong.HasKanCardsByHand(this.data.cards, cardArray))
    {
        var card = cardArray[0];
        
        // 计算分数
        if (Mahjong.IsFirstType(card)) {
            this.data.score += 10;
        } else {
            this.data.score += 2;
        }

        this.data.kanCards.push(card);
        this.data.kanCards.push(card);
        this.data.kanCards.push(card);
        
        Util.ArrayRemoveElemnt(this.data.cards, card);
        Util.ArrayRemoveElemnt(this.data.cards, card);
        Util.ArrayRemoveElemnt(this.data.cards, card);
        
        this.data.updateHucards = true;
        
        // 坎牌过后,可能不能牛了
        if (true === this.data.canNiu && false === Mahjong.HasNiuCardsByHand(this.data.cards)) {
            this.data.canNiu = false;
        }
        // 也可能不胡了,重新计算下
        this.CalcHuCard();

        return card;
    }
}

Player.prototype.NiuCards = function(countArray, addCards) {
    var niuArray = [45, 46, 47];   
    for (var i = 0; i < countArray.length; ++i) {
        for (var j = 0; j < countArray[i]; ++j) {
            this.data.niuCards.push(niuArray[i]);
            Util.ArrayRemoveElemnt(this.data.cards, niuArray[i]);
        }
    }
    
    // 牛牌10分
    this.data.score += 10;
    
    if (typeof addCards !== 'undefined') {
        for (var k = 0; k < addCards.length; ++k) {
            this.AddCard(addCards[k]);
            // 补牛5分
            this.data.score += 5;
        }
    }
    
    this.data.canNiu = false;
    this.data.updateHucards = true;
}

Player.prototype.HuCards = function() {
    this.data.score += 10;
}

Player.prototype.GetHuCards = function() {
    if (this.data.updateHucards) {
        this.data.updateHucards = false;
        
        this.data.huCards.splice(0, this.data.huCards.length);
        if (this.data.jiangCards.length === 0) {
            Mahjong.GetHuCards(this.data.cards, this.data.huCards);
        }else {
            Mahjong.GetJiangHuCards(this.data.cards, this.data.huCards);
        }
    }
    
    return this.data.huCards;
}


Player.prototype.CalcGetCradOperation = function(data, card) {
    var self = this;
    
    // 检测是否胡牌,是否杠牌
    if (self.data.piao === false && (Mahjong.HasGangCardsByHand(self.data.cards) ||
        Mahjong.HasGangCards(self.data.cards, card) || 
        Mahjong.CanGangCards(self.data.kanCards, card)) ) {
        data['gang'] = 1;
    }
    
    if (self.data.piao === false && (Mahjong.HasKanCardsByHand(self.data.cards) || 
        Mahjong.HasKanCards(self.data.cards, card)) ){
        data['kan'] = 1;
    } 
    
    if (self.data.canNiu) {
        data['niu'] = 1;
    }

    if (self.data.isHuCards === true) {
        data['hu'] = 1;
    }
        
    return data;
}


Player.prototype.CalcThrowCradOperation = function(data, card, throwCardPlace) {

    function BIsANextPlace(placeA, placeB) {
        var nextPlace = placeA + 1;
        if (nextPlace === 4) { 
            nextPlace = 0; 
        }

        return nextPlace === placeB;
    }
    
    var self = this;
    if (self.data.piao === false && Mahjong.CanPengCards(self.data.cards, card)) {
        data['peng'] = 1;
    }
    
    if (self.data.piao === false && (Mahjong.CanGangCards(self.data.cards, card) ||
        Mahjong.CanGangCards(self.data.kanCards, card))) {
        data['gang'] = 1;
    }

    if (self.room.RuleCanJiang() && self.data.piao === false) {
        if(BIsANextPlace(throwCardPlace, self.data.place) &&
           self.CanJiangCards(card)) {
            data['jiang'] = 1;
        }
    }

    if (self.room.RuleCanChi() &&
        BIsANextPlace(throwCardPlace, self.data.place))
    {
        var arr = Mahjong.GetChiCards(self.data.cards, card);
        if (arr.length > 0) {
            if(arr.length > 1) {
                data['chi'] = arr;
            }else {
                data['chi'] = 1;
            }
        }
    }

    var huCards = self.GetHuCards();
    for (var j = 0; j < huCards.length; ++j) {
        if (huCards[j] === card) {
            data['hu'] = 1;
            break;
        }
    }
    return data;
}

Player.prototype.Update = function(dt)
{

}

Player.prototype.SendNewPlayer = function(player, toSelf)
{
    var data = { "id"                : player.id,
                 "name"              : player.name,
                 "headUrl"           : player.headUrl,
                 "place"             : player.data ? player.data.place : player.place };

    if (toSelf) {
        // 发送给自己必要的数据.
    }

    return data;
}

Player.prototype.SendPlayerInfo = function(player) 
{
    var data = {    "id"                : player.id,
                    "name"              : player.name,
                    "headUrl"           : player.headUrl,
                    "place"             : player.data ? player.data.place : player.place };
    
    return data;
}

Player.prototype.SendLosePlayer = function(player) 
{
    var data = { "id"       : player.socket.id,
                 "place"    : player.data ? player.data.place : player.place };
    return data;
}

Player.prototype.SendInitCards = function(player, toSelf) 
{
    var data = {    "place" : player.data.place };
    
    if (toSelf) {
        data.cards = player.data.cards;
    }
    else {
        var cards = new Array(player.data.cards.length);
        for (var i = 0; i < cards.length; ++i) {
            cards[i] = 0;
        }
        data.cards = cards;
    }
    
    return data;
}

Player.prototype.SendGetCard = function(player, card, self, remainNumber) 
{
    var  toSelf = self.data.place === player.data.place;
    var data = {    "place"             : player.data.place,
                    "card"              : toSelf ? card : 0,
                    "remainNum"         : remainNumber };
    
    if (toSelf) {
        self.CalcGetCradOperation(data, card);
    }

    return data;
}

Player.prototype.SendAddNiuCard = function(player, card, self)
{
    var  toSelf = self.data.place === player.data.place;
    var data = {    "place"             : player.data.place,
                    "addNiuCard"        : card };

    return data;
}

Player.prototype.SendThrowCard = function(player, card, self) 
{
    var data = {    "place"             : player.data.place,
                    "card"              : card };

    if (self.data.place !== player.data.place) {
        self.CalcThrowCradOperation(data, card, player.data.place);
    }else {
        var huCards = self.GetHuCards();
        if (huCards.length > 0) {
            data['huCards'] = huCards;
        }
    }

    return data;
}

Player.prototype.SendPengCards = function(player, card, self, throwCardPlace) 
{
    var  toSelf = self.data.place === player.data.place;
    var data = {    "place"             : player.data.place,
                    "card"              : card,
                    "pengCards"         : player.data.pengCards };
    if (toSelf) {
        data.cards = player.data.cards;
        
        // 是否杠牌 
        if (Mahjong.HasGangCardsByHand(self.data.cards)) {
            data['gang'] = 1;
        }
        
        if (Mahjong.HasKanCardsByHand(self.data.cards)) {
            data['kan'] = 1;
        }
        
        if (self.data.canNiu) {
            data['niu'] = 1;
        }
    }
    else {
        var cards = new Array(player.data.cards.length);
        for (var i = 0; i < cards.length; ++i) {
            cards[i] = 0;
        }
        data.cards = cards;
    }
    
    if (typeof throwCardPlace !== 'undefined') {
        data.throwCardPlace = throwCardPlace;
    }

    return data;
}

Player.prototype.SendGangCards = function(player, card, self, throwCardPlace) 
{
    var  toSelf = self.data.place === player.data.place;
    var data = {    "place"             : player.data.place,
                    "card"              : card,
                    "gangCards"         : player.data.gangCards };

    if (toSelf) {
        data.cards = player.data.cards;
        data.kanCards = player.data.kanCards;
        
        // 是否杠牌 
        if (Mahjong.HasGangCardsByHand(self.data.cards)) {
            data['gang'] = 1;
        }
        
        if (Mahjong.HasKanCardsByHand(self.data.cards)) {
            data['kan'] = 1;
        }
        
        if (self.data.canNiu) {
            data['niu'] = 1;
        }
    }
    else {
        var cards = new Array(player.data.cards.length);
        for (var i = 0; i < cards.length; ++i) {
            cards[i] = 0;
        }
        data.cards = cards;
        
        var kanCards = new Array(player.data.kanCards.length);
        for (var i = 0; i < kanCards.length; ++i) {
            kanCards[i] = 0;
        }
        data.kanCards = kanCards;
    }
    
    if (typeof throwCardPlace !== 'undefined') {
        data.throwCardPlace = throwCardPlace;
    }

    return data;
}

Player.prototype.SendJiangCards = function(player, card, self, throwCardPlace)
{
    var  toSelf = self.data.place === player.data.place;
    var data = {    "place"             : player.data.place,
                    "card"              : card,
                    "jiangCards"        : player.data.jiangCards };
                    
    if (toSelf) {
        data.cards = player.data.cards;
        
        // 是否杠牌 
        if (Mahjong.HasGangCardsByHand(self.data.cards)) {
            data['gang'] = 1;
        }
        
        if (Mahjong.HasKanCardsByHand(self.data.cards)) {
            data['kan'] = 1;
        }
        
        if (self.data.canNiu) {
            data['niu'] = 1;
        }
    }else {
        var cards = new Array(player.data.cards.length);
        for (var i = 0; i < cards.length; ++i) {
            cards[i] = 0;
        }
        data.cards = cards;
    }

    if (typeof throwCardPlace !== 'undefined') {
        data.throwCardPlace = throwCardPlace;
    }

    return data;
}

Player.prototype.SendChiCards = function(player, card, self, throwCardPlace) {

    var  toSelf = self.data.place === player.data.place;
    var data = {    "place"             : player.data.place,
                    "card"              : card,
                    "chiCards"          : player.data.chiCards };

    if (toSelf) {
        data.cards = player.data.cards;
        
        // 是否杠牌
        if (Mahjong.HasGangCardsByHand(self.data.cards)) {
            data['gang'] = 1;
        }
        
        if (Mahjong.HasKanCardsByHand(self.data.cards)) {
            data['kan'] = 1;
        }
        
        if (self.data.canNiu) {
            data['niu'] = 1;
        }
    }else {
        var cards = new Array(player.data.cards.length);
        for (var i = 0; i < cards.length; ++i) {
            cards[i] = 0;
        }
        data.cards = cards;
    }

    if (typeof throwCardPlace !== 'undefined') {
        data.throwCardPlace = throwCardPlace;
    }

    return data;
}

Player.prototype.SendHuCards = function(player, card, self, throwCardPlace) 
{
    var data = {    "place"             : player.data.place,
                    "card"              : card,
                    "cards"             : player.data.cards }
    
    if (player.data.pengCards.length > 0) {
        data.pengCards = player.data.pengCards;
    }
    
    if (player.data.gangCards.length > 0) {
        data.gangCards = player.data.gangCards;
    }
    
    if (player.data.kanCards.length > 0) {
        data.kanCards = player.data.kanCards;
    }
    
    if (player.data.niuCards.length > 0) {
        data.niuCards = player.data.niuCards;
    }

    if (player.data.chiCards.length > 0) {
        data.chiCards = player.data.chiCards;
    }
    
    if (player.data.jiangCards.length > 0) {
        data.jiangCards = player.data.jiangCards;
    }
    
    if (typeof throwCardPlace !== 'undefined') {
        data.throwCardPlace = throwCardPlace;
    }

    return data;
}

Player.prototype.SendKanCards = function(player, card, self) 
{
    var  toSelf = self.data.place === player.data.place;
    
    var data = {    "place"             : player.data.place };
    
    if (toSelf) {
        data.cards = player.data.cards;
        data.kanCards = player.data.kanCards;
        
        // 是否杠牌 
        if (Mahjong.HasGangCardsByHand(self.data.cards)) {
            data['gang'] = 1;
        }
        
        if (Mahjong.HasKanCardsByHand(self.data.cards)) {
            data['kan'] = 1;
        }
        
        if (self.data.canNiu) {
            data['niu'] = 1;
        }

        if (self.data.isHuCards === true) {
            data['hu'] = 1;
        }
    }
    else {
        var cards = new Array(player.data.cards.length);
        for (var i = 0; i < cards.length; ++i) {
            cards[i] = 0;
        }
        data.cards = cards;
        
        var kanCards = new Array(player.data.kanCards.length);
        for (var i = 0; i < kanCards.length; ++i) {
            kanCards[i] = 0;
        }
        data.kanCards = kanCards;
    }
    
    return data;
}

Player.prototype.SendNiuCards = function(player, addCards, self) 
{
    var  toSelf = self.data.place === player.data.place;
    
    var hideCards = [];
    if (false === toSelf) {
        for (var i = 0; i < addCards.length; ++i) {
            hideCards.push(0);
        }
    }
    
    var data = {    "place"             : player.data.place,
                    "niuCards"          : player.data.niuCards };
                    
    if (toSelf) {
         data.cards = player.data.cards;
         
        // 检测是否胡牌,是否杠牌 
        if (Mahjong.HasGangCardsByHand(self.data.cards)) {
            data['gang'] = 1;
        }
        
        if (Mahjong.HasKanCardsByHand(self.data.cards)) {
            data['kan'] = 1;
        }

        if (self.data.isHuCards === true) {
            data['hu'] = 1;
        }
    }else {
        var cards = new Array(player.data.cards.length);
        for (var i = 0; i < cards.length; ++i) {
            cards[i] = 0;
        }
        data.cards = cards;
    }
    
    return data;
}

// 断线连接
Player.prototype.SendPlayerInfoByReconnection = function(playerData, status, self) 
{
    var  toSelf = self.data.place === playerData.place;
    var data =  {  "id"                : playerData.userId,
                   "name"              : playerData.userName,
                   "headUrl"           : playerData.userHeadUrl,
                   "place"             : playerData.place,
                   "offline"           : playerData.offline ? 1 : 0 };

    if (toSelf) {
        data.cards = playerData.cards;
    }else {
        var cards = new Array(playerData.cards.length);
        for (var i = 0; i < cards.length; ++i) {
            cards[i] = 0;
        }
        data.cards = cards;
    }

    if (playerData.pengCards.length > 0) {
        data.pengCards = playerData.pengCards;   // 已碰的牌
    }
    
    if (playerData.gangCards.length > 0) {
        data.gangCards = playerData.gangCards;   // 已杠的牌
    }
    
    if (playerData.kanCards.length > 0) {
        if (toSelf) {
            data.kanCards = playerData.kanCards;     // 已砍的牌
        }else {
            var kanCards = new Array(playerData.kanCards.length);
            for (var ki = 0; ki < kanCards.length; ++ki) {
                kanCards[ki] = 0;
            }
            data.kanCards = kanCards;
        }
    }
    
    if (playerData.niuCards.length > 0) {
        data.niuCards = playerData.niuCards;     // 已牛的牌
    }
    if (playerData.chiCards.length > 0) {
        data.chiCards = playerData.chiCards;     // 已吃的牌
    }
    if (playerData.jiangCards.length > 0) {
        data.jiangCards = playerData.jiangCards; // 已将的牌
    }
    if (playerData.outputCards.length > 0) {
        data.outputCards = playerData.outputCards; // 已打出的牌
    }
    
    if (toSelf) {
        data.op = {};
        if (status.type === 1) {
            //摸牌阶段,待出牌
            if (toSelf && self.data.place === status.getCardPlace) {
                data.op.getCard = status.getCard;
                self.CalcGetCradOperation(data.op, status.getCard);
            }
        }else if (status.type === 2) {
            // 出牌阶段.待操作.
            if (toSelf && self.data.place !== status.lastThrowPlace) {
                self.CalcThrowCradOperation(data.op, status.lastThrowCard, status.lastThrowPlace);
            }
        }
    }

    return data;
}


Player.prototype.SendAllCards = function(playerData) 
{
    var data = {    "place"             : playerData.place,
                    "score"             : playerData.score,
                    "singleScore"       : playerData.singleScore,
                    "cards"             : playerData.cards, };
    
    if (playerData.pengCards.length > 0) {
        data.pengCards = playerData.pengCards;
    }
    
    if (playerData.gangCards.length > 0) {
        data.gangCards = playerData.gangCards;
    }
    
    if (playerData.kanCards.length > 0) {
        data.kanCards = playerData.kanCards;
    }
    
    if (playerData.niuCards.length > 0) {
        data.niuCards = playerData.niuCards;
    }

    if (playerData.chiCards.length > 0) {
        data.chiCards = playerData.chiCards;
    }
    
    if (playerData.jiangCards.length > 0) {
        data.jiangCards = playerData.jiangCards;
    }

    return data;
}