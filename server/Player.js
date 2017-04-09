if(typeof module !== 'undefined')
    module.exports = Player;

var Mahjong = require("./Mahjong.js");

function Player()
{

}

Player.prototype.Init = function(id, nickName, socket)
{
    this.id = id;
    this.nickName = nickName;
    this.socket = socket;
    this.cards = null;              // 手牌
    this.pengCards = new Array();   // 以碰的牌
    this.gangCards = new Array();   // 以杠的牌
    this.huCards = new Array();
    this.updateHucards = true;
    this.ready = false;
    this.isHuCards = false; 
}

Player.prototype.InitCards = function(cards)
{
    this.cards = cards.slice();
    this.pengCards.splice(0, this.pengCards.length);
    this.gangCards.splice(0, this.gangCards.length); 
    
    this.updateHucards = true;
}

Player.prototype.AddCard = function(card){
    this.isHuCards = false;
    var huCards = this.GetHuCards();
    for (var j = 0; j < huCards.length; ++j) {
        if (huCards[j] === card) {
            this.isHuCards = true;
            break;
        }
    }

    this.cards.push(card);
}

Player.prototype.ThrowCard = function(card) {
    if (this.cards[this.cards.length-1] !== card) {
        this.updateHucards = true;
    }
    return Util.ArrayRemoveElemnt(this.cards, card);
}

Player.prototype.PengCards = function(card) {
    this.pengCards.push(card);
    this.pengCards.push(card);
    this.pengCards.push(card);
    
    Util.ArrayRemoveElemnt(this.cards, card);
    Util.ArrayRemoveElemnt(this.cards, card);
    
    this.updateHucards = true;
}

Player.prototype.GangCards = function(card, selfGang) {

    if (Mahjong.CanGangCards(this.cards, card) || Mahjong.HasGangCardsByHand(this.cards)) 
    {    
        this.gangCards.push(card);
        this.gangCards.push(card);
        this.gangCards.push(card);
        this.gangCards.push(card);
        
        Util.ArrayRemoveElemnt(this.cards, card);
        Util.ArrayRemoveElemnt(this.cards, card);
        Util.ArrayRemoveElemnt(this.cards, card);
    }
    else if (Mahjong.CanGangCards(this.pengCards, card)) {
    
        this.gangCards.push(card);
        this.gangCards.push(card);
        this.gangCards.push(card);
        this.gangCards.push(card);
        
        Util.ArrayRemoveElemnt(this.pengCards, card);
        Util.ArrayRemoveElemnt(this.pengCards, card);
        Util.ArrayRemoveElemnt(this.pengCards, card);
        
    }
    
    if (selfGang) {
        Util.ArrayRemoveElemnt(this.cards, card);
    }
}

Player.prototype.GetHuCards = function() {
    if (this.updateHucards) {
        this.updateHucards = false;
        this.huCards.splice(0, this.huCards.length);
        Mahjong.GetHuCards(this.cards, this.huCards);
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
            Mahjong.CanGangCards(self.pengCards, card) ) {
            data['gang'] = 1;
        }

        if (self.isHuCards === true) {
            data['hu'] = 1;
        }
    }

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
        
        if (Mahjong.CanGangCards(self.cards, card)) {
            data['gang'] = 1;
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
