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
    this.cards = null;              // 手牌
    this.pengCards = new Array();   // 已碰的牌
    this.gangCards = new Array();   // 已杠的牌
    this.kanCards = new Array();    // 已砍的牌
    this.niuCards = new Array();    // 已牛的牌
    this.jiangCards = new Array();  // 已将的牌
    this.huCards = new Array();     // 可胡的牌
    this.updateHucards = true;
    this.ready = false;
    this.isHuCards = false;
    this.canNiu = false;
    this.firstAdd = false;
    this.piao = false;
}

Player.prototype.InitCards = function(cards)
{
    this.cards = cards.slice();
    this.pengCards.splice(0, this.pengCards.length);
    this.gangCards.splice(0, this.gangCards.length); 
    this.kanCards.splice(0, this.kanCards.length);
    this.niuCards.splice(0, this.niuCards.length);
    this.jiangCards.splice(0, this.jiangCards.length);
    
    this.firstAdd = true;
    this.piao = false;    
    this.updateHucards = true;
}

Player.prototype.CalcHuCard = function(card)
{
    this.isHuCards = false;
    
    if (typeof card !== 'undefined') {
        var huCards = this.GetHuCards();
        for (var j = 0; j < huCards.length; ++j) {
            if (huCards[j] === card) {
                this.isHuCards = true;
                break;
            }
        }
    }
    else {
        var tempCards = this.cards.slice();
        var lastCard = tempCards.pop();
        var tempHuCards = [];
        var rs = (this.jiangCards.length === 0 ? 
                        Mahjong.GetHuCards(tempCards, tempHuCards) : 
                        Mahjong.GetJiangHuCards(tempCards, tempHuCards) );

        if(rs)
        {
            for (var j = 0; j < tempHuCards.length; ++j) {
                if (tempHuCards[j] === lastCard) {
                    this.isHuCards = true;
                    break;
                }
            }
        }
    }
}

Player.prototype.CanJiangCards = function(card) {
    if (this.jiangCards.length > 0) {
        return false;
    }

    return Mahjong.CanJiangCards(this.cards, card);
}

Player.prototype.AddCard = function(card){
    this.CalcHuCard(card);
    
    if (this.firstAdd && Mahjong.HasNiuCardsByHand(this.cards)) {
        this.canNiu = true;
        this.firstAdd = false;
    }

    this.cards.push(card);
}

Player.prototype.AddNiuCard = function(card) {
    this.niuCards.push(card);
}

Player.prototype.AddJiangCard = function(card) {
    this.jiangCards.push(card);
    this.jiangCards.push(card);
    
    Util.ArrayRemoveElemnt(this.cards, card);
}

Player.prototype.ThrowCard = function(card) {
    if (this.cards[this.cards.length-1] !== card) {
        this.updateHucards = true;
    }
    
    this.canNiu = false;
    return Util.ArrayRemoveElemnt(this.cards, card);
}

Player.prototype.PengCards = function(card) {
    this.pengCards.push(card);
    this.pengCards.push(card);
    this.pengCards.push(card);
    
    Util.ArrayRemoveElemnt(this.cards, card);
    Util.ArrayRemoveElemnt(this.cards, card);
    
    this.updateHucards = true;
    
    // 碰牌过后,可能不能牛了
    if (true === this.canNiu && false === Mahjong.HasNiuCardsByHand(this.cards)) {
        this.canNiu = false;
    }
}

Player.prototype.GangCards = function(card, selfGang) {

    var gangCardArray = [];
    if (Mahjong.CanGangCards(this.cards, card) || Mahjong.HasGangCardsByHand(this.cards, gangCardArray)) 
    {
        if (gangCardArray.length > 0) {
            this.gangCards.push(gangCardArray[0]);
            this.gangCards.push(gangCardArray[0]);
            this.gangCards.push(gangCardArray[0]);
            this.gangCards.push(gangCardArray[0]);
            
            Util.ArrayRemoveElemnt(this.cards, gangCardArray[0]);
            Util.ArrayRemoveElemnt(this.cards, gangCardArray[0]);
            Util.ArrayRemoveElemnt(this.cards, gangCardArray[0]);
            Util.ArrayRemoveElemnt(this.cards, gangCardArray[0]);
            selfGang = false;
        }else {
            this.gangCards.push(card);
            this.gangCards.push(card);
            this.gangCards.push(card);
            this.gangCards.push(card);
            
            Util.ArrayRemoveElemnt(this.cards, card);
            Util.ArrayRemoveElemnt(this.cards, card);
            Util.ArrayRemoveElemnt(this.cards, card);
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
    else if (Mahjong.CanGangCards(this.kanCards, card)) {
        this.gangCards.push(card);
        this.gangCards.push(card);
        this.gangCards.push(card);
        this.gangCards.push(card);
        
        Util.ArrayRemoveElemnt(this.kanCards, card);
        Util.ArrayRemoveElemnt(this.kanCards, card);
        Util.ArrayRemoveElemnt(this.kanCards, card);
    }
    
    this.updateHucards = true;
    
    if (selfGang) {
        Util.ArrayRemoveElemnt(this.cards, card);
    }
    // 杠牌过后,可能不能牛了
    if (true === this.canNiu && false === Mahjong.HasNiuCardsByHand(this.cards)) {
        this.canNiu = false;
    }
}

Player.prototype.KanCards = function() {
    var cardArray = [];
    if (Mahjong.HasKanCardsByHand(this.cards, cardArray))
    {
        var card = cardArray[0];

        this.kanCards.push(card);
        this.kanCards.push(card);
        this.kanCards.push(card);
        
        Util.ArrayRemoveElemnt(this.cards, card);
        Util.ArrayRemoveElemnt(this.cards, card);
        Util.ArrayRemoveElemnt(this.cards, card);
        
        this.updateHucards = true;
        
        // 坎牌过后,可能不能牛了
        if (true === this.canNiu && false === Mahjong.HasNiuCardsByHand(this.cards)) {
            this.canNiu = false;
        }
        // 也可能不胡了,重新计算下
        this.CalcHuCard();
    }
}

Player.prototype.NiuCards = function(countArray, addCards) {
    var niuArray = [45, 46, 47];   
    for (var i = 0; i < countArray.length; ++i) {
        for (var j = 0; j < countArray[i]; ++j) {
            this.niuCards.push(niuArray[i]);
            Util.ArrayRemoveElemnt(this.cards, niuArray[i]);
        }
    }
    
    if (typeof addCards !== 'undefined') {
        for (var k = 0; k < addCards.length; ++k) {
            this.AddCard(addCards[k]);
        }
    }
    
    this.canNiu = false;
    this.updateHucards = true;
}

Player.prototype.GetHuCards = function() {
    if (this.updateHucards) {
        this.updateHucards = false;
        
        this.huCards.splice(0, this.huCards.length);
        if (this.jiangCards.length === 0) {
            Mahjong.GetHuCards(this.cards, this.huCards);
        }else {
            Mahjong.GetJiangHuCards(this.cards, this.huCards);
        }
    }
    
    return this.huCards;
}

Player.prototype.Update = function(dt)
{

}

Player.prototype.SendNewPlayer = function(player, toSelf)
{
    var data = { "id"                : player.socket.id,
                 "nickName"          : player.nickName,
                 "place"             : player.place };

    if (toSelf) {
        // 发送给自己必要的数据.
    }

    return data;
}

Player.prototype.SendPlayerInfo = function(player) 
{
    var data = {    "id"                : player.socket.id,
                    "nickName"          : player.nickName,
                    "place"             : player.place };
    
    return data;
}

Player.prototype.SendLosePlayer = function(player) 
{
    var data = { "id"       : player.socket.id,
                 "place"    : player.place };
    return data;
}

Player.prototype.SendInitCards = function(player, toSelf) 
{
    var data = {    "place" : player.place };
    
    if (toSelf) {
        data.cards = player.cards;
    }
    else {
        var cards = new Array(player.cards.length);
        for (var i = 0; i < cards.length; ++i) {
            cards[i] = 0;
        }
        data.cards = cards;
    }
    
    return data;
}

Player.prototype.SendGetCard = function(player, card, self) 
{
    var  toSelf = self.place === player.place;
    var data = {    "place"             : player.place,
                    "card"              : toSelf ? card : 0 };
    
    if (toSelf) {
    
        // 检测是否胡牌,是否杠牌    
        if (Mahjong.HasGangCardsByHand(self.cards) ||
            Mahjong.HasGangCards(self.cards, card) || 
            Mahjong.CanGangCards(self.kanCards, card) ) {
            data['gang'] = 1;
        }
        
        if (Mahjong.HasKanCardsByHand(self.cards) || 
            Mahjong.HasKanCards(self.cards, card) ){
            data['kan'] = 1;
        } 
        
        if (self.canNiu) {
            data['niu'] = 1;
        }

        if (self.isHuCards === true) {
            data['hu'] = 1;
        }
    }

    return data;
}

Player.prototype.SendAddNiuCard = function(player, card, self)
{
    var  toSelf = self.place === player.place;
    var data = {    "place"             : player.place,
                    "addNiuCard"        : card };

    return data;
}

Player.prototype.SendThrowCard = function(player, card, self) 
{
    var data = {    "place"             : player.place,
                    "card"              : card };

    if (self.place !== player.place) {
        if (Mahjong.CanPengCards(self.cards, card)) {
            data['peng'] = 1;
        }
        
        if (Mahjong.CanGangCards(self.cards, card) ||
            Mahjong.CanGangCards(self.kanCards, card)) {
            data['gang'] = 1;
        }

        if (1) {
            var nextPlace = player.place + 1;
            if (nextPlace === 4) { 
                nextPlace = 0; 
            }
            
            if (nextPlace === self.place && self.CanJiangCards(card)) {
                data['jiang'] = 1;
            }
        }

        var huCards = self.GetHuCards();
        for (var j = 0; j < huCards.length; ++j) {
            if (huCards[j] === card) {
                data['hu'] = 1;
                break;
            }
        }
    }

    return data;
}

Player.prototype.SendPengCards = function(player, card, self, throwCardPlace) 
{
    var  toSelf = self.place === player.place;
    var data = {    "place"             : player.place,
                    "card"              : card,
                    "pengCards"         : player.pengCards };
    if (toSelf) {
        data.cards = player.cards;
    }
    else {
        var cards = new Array(player.cards.length);
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
    var  toSelf = self.place === player.place;
    var data = {    "place"             : player.place,
                    "card"              : card,
                    "gangCards"         : player.gangCards };

    if (toSelf) {
        data.cards = player.cards;
    }
    else {
        var cards = new Array(player.cards.length);
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

Player.prototype.SendJiangCards = function(player, card, self, throwCardPlace)
{
    var  toSelf = self.place === player.place;
    var data = {    "place"             : player.place,
                    "card"              : card,
                    "jiangCards"        : player.jiangCards };
                    
    if (toSelf) {
        data.cards = player.cards;
    }else {
        var cards = new Array(player.cards.length);
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
    var data = {    "place"             : player.place,
                    "card"              : card,
                    "cards"             : player.cards,
                    "pengCards"         : player.pengCards,
                    "gangCards"         : player.gangCards };
    
    if (player.pengCards.length > 0) {
        data.pengCards = player.pengCards;
    }
    
    if (player.gangCards.length > 0) {
        data.gangCards = player.gangCards;
    }
    
    if (typeof throwCardPlace !== 'undefined') {
        data.throwCardPlace = throwCardPlace;
    }

    return data;
}

Player.prototype.SendKanCards = function(player, card, self) 
{
    var  toSelf = self.place === player.place;
    
    var data = {    "place"             : player.place };
    
    if (toSelf) {
        data.cards = player.cards;
        data.kanCards = player.kanCards;
        
        // 检测是否胡牌,是否杠牌 
        if (Mahjong.HasGangCardsByHand(self.cards)) {
            data['gang'] = 1;
        }
        
        if (Mahjong.HasKanCardsByHand(self.cards)) {
            data['kan'] = 1;
        }
        
        if (self.canNiu) {
            data['niu'] = 1;
        }

        if (self.isHuCards === true) {
            data['hu'] = 1;
        }
    }
    else {
        var cards = new Array(player.cards.length);
        for (var i = 0; i < cards.length; ++i) {
            cards[i] = 0;
        }
        data.cards = cards;
        
        var kanCards = new Array(player.kanCards.length);
        for (var i = 0; i < kanCards.length; ++i) {
            kanCards[i] = 0;
        }
        data.kanCards = kanCards;
    }
    
    return data;
}

Player.prototype.SendNiuCards = function(player, addCards, self) 
{
    var  toSelf = self.place === player.place;
    
    var hideCards = [];
    if (false === toSelf) {
        for (var i = 0; i < addCards.length; ++i) {
            hideCards.push(0);
        }
    }
    
    var data = {    "place"             : player.place,
                    "niuCards"          : player.niuCards };
                    
    if (toSelf) {
         data.cards = player.cards;
         
        // 检测是否胡牌,是否杠牌 
        if (Mahjong.HasGangCardsByHand(self.cards)) {
            data['gang'] = 1;
        }
        
        if (Mahjong.HasKanCardsByHand(self.cards)) {
            data['kan'] = 1;
        }

        if (self.isHuCards === true) {
            data['hu'] = 1;
        }
    }else {
        var cards = new Array(player.cards.length);
        for (var i = 0; i < cards.length; ++i) {
            cards[i] = 0;
        }
        data.cards = cards;
    }
    
    return data;
}
