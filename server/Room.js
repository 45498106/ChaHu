if(typeof module !== 'undefined')
    module.exports = Room;
    
var Player = require("./Player.js");
var Mahjong = require("./Mahjong.js");

var enum_Pass = 0;
var enum_Niu = 1;
var enum_Kan = 2;
var enum_Jiang = 3;
var enum_Peng = 4;
var enum_Gang = 5;
var enum_Hu = 6;

// 11-19 筒子
// 21-29 万子
// 31-39 条子
// 45 红中 46 发财 47 白板
// 30种牌, 每种4张 合计120张牌

// 初始化牌顺序
var staticCards = new Array(11,11,11,11, 12,12,12,12, 13,13,13,13, 14,14,14,14, 15,15,15,15, 16,16,16,16, 17,17,17,17, 18,18,18,18, 19,19,19,19, 
                            21,21,21,21, 22,22,22,22, 23,23,23,23, 24,24,24,24, 25,25,25,25, 26,26,26,26, 27,27,27,27, 28,28,28,28, 29,29,29,29,
                            31,31,31,31, 32,32,32,32, 33,33,33,33, 34,34,34,34, 35,35,35,35, 36,36,36,36, 37,37,37,37, 38,38,38,38, 39,39,39,39, 
                            45,45,45,45, 46,46,46,46, 47,47,47,47);

function Room()
{
    this.duration = 0;      // 持续时间
    this.players = [null, null, null, null]; // 玩家列表
    
    this.cards = null; 
    this.cardsIndex = 0;
    this.bankerPlace = 0;   // 庄家
    this.getCardPlace = 0;  // 摸牌人
    this.checks = new Array();
    this.lastThrowCard = 0;
    this.lastThrowPlace = 0;
    this.playing = false;
}

Room.prototype.Init = function(id)
{
    this.id = id;
    this.roomName = "room:"+this.id;
}

Room.prototype.GetFreePlace = function(id)
{
    for (var i = 0; i < this.players.length; ++i) {
        if (this.players[i] === null)
            return i;
    }
    return -1;
}

Room.prototype.GetPlayerCount = function(id)
{
    var count = 0;
    for (var i = 0; i < this.players.length; ++i) {
        if (this.players[i] !== null)
            ++count;
    }
    return count;
}

Room.prototype.CancelPlayerReady = function(id)
{
    for (var i = 0; i < this.players.length; ++i) {
        if (this.players[i] !== null)
            this.players[i].ready = false;
    }
}

Room.prototype.CheckAllReady = function(id) {
    var count = 0;
    for (var i = 0; i < this.players.length; ++i) {
        if (this.players[i] !== null && this.players[i].ready === true)
            ++count;
    }

    if (count === 4) {
        this.NewGame();
    }
}

Room.prototype.SendPlayerReady = function(){
    if (this.GetPlayerCount() === 4) {
        this.BroadcastPlayers(null, "ready");
    }
}

Room.prototype.PlayerPassOperate = function(player){
    var me = this;
    var process = false;
    var checkEvent;
    for (var i = 0; i < me.checks.length; ++i) {
        checkEvent = me.checks[i];
        if (checkEvent.place === player.place) {
            checkEvent['select'] = enum_Pass;
            process = true;
            break;
        }
    }

    if (process) me.ProcessCheck();
}


Room.prototype.AddPlayer = function(player)
{
    var me = this;
    
    var data = { "roomId" : me.id };
    player.socket.emit('enterGameBack', data);
    
    
    player.socket.on('ready', function (data) {
        if (me.playing === true) { return; }
        player.ready = true;
        player.socket.emit('readyOk');
        
        me.CheckAllReady();
    });
    
    
    player.socket.on('unready', function (data) {
        if (me.playing === false) { return; }
        player.ready = false;
    });
    
    player.socket.on('needThrowCard', function(data) {
        if (me.playing === false) { return; }
        var card = data.card;
        if (me.getCardPlace === player.place && me.checks.length === 0) {
            if(player.ThrowCard(card)) {
                me.lastThrowCard = card;
                me.lastThrowPlace = player.place;
                me.BroadcastPlayers2(player, "throwCard", data.card);
                
                // 检测碰,杠,胡.
                //    如果有玩家碰,那么通知玩家,有玩家出牌,出现时间选择是否碰牌. 非碰牌玩家依然显示玩家尚未出牌.
                //        碰牌玩家选择碰牌, 通知非碰牌玩家有玩家出牌, 通知非碰牌玩家有人碰牌.

                if (false === me.ThrowCardCheck(player, card)) {
                    me.DoBackCardPlace();
                    me.PlayeAddCard();
                }
            }
        }
    });
    
    player.socket.on('pengCards', function(data) {
        if (me.playing === false) { return; }
        var process = false;
        var checkEvent;
        for (var i = 0; i < me.checks.length; ++i) {
            checkEvent = me.checks[i];
            if (checkEvent.place === player.place && typeof checkEvent.peng !== 'undefined') {
                checkEvent['select'] = enum_Peng;
                process = true;
                break;
            }
        }
        
        if (process) me.ProcessCheck();
    });
    
    player.socket.on('gangCards', function(data) {
        if (me.playing === false) { return; }
        var process = false;
        var checkEvent;
        for (var i = 0; i < me.checks.length; ++i) {
            checkEvent = me.checks[i];
            if (checkEvent.place === player.place && typeof checkEvent.gang !== 'undefined') {
                checkEvent['select'] = enum_Gang;
                process = true;
                break;
            }
        }
        
        if (process) me.ProcessCheck();
    });
    
    player.socket.on('huCards', function(data) {
        if (me.playing === false) { return; }
        var process = false;
        var checkEvent;
        for (var i = 0; i < me.checks.length; ++i) {
            checkEvent = me.checks[i];
            if (checkEvent.place === player.place && typeof checkEvent.hu !== 'undefined') {
                checkEvent['select'] = enum_Hu;
                process = true;
                break;
            }
        }
        
        if (process) me.ProcessCheck();
    });
    
    player.socket.on('kanCards', function(data) {
        if (me.playing === false) { return; }
        GameLog("kanCards");
        var process = false;
        var checkEvent;
        for (var i = 0; i < me.checks.length; ++i) {
            checkEvent = me.checks[i];
            if (checkEvent.place === player.place && typeof checkEvent.kan !== 'undefined') {
                checkEvent['select'] = enum_Kan;
                process = true;
                break;
            }
        }
        
        if (process) me.ProcessCheck();
    });
    
    player.socket.on('niuCards', function(data) {
        if (me.playing === false) { return; }
        var process = false;
        var checkEvent;
        for (var i = 0; i < me.checks.length; ++i) {
            checkEvent = me.checks[i];
            if (checkEvent.place === player.place && typeof checkEvent.niu !== 'undefined') {
                checkEvent['select'] = enum_Niu;
                process = true;
                break;
            }
        }
        
        if (process) me.ProcessCheck();
    });
    
    player.socket.on('jiangCards', function(data) {
        if (me.playing === false) { return; }
        var process = false;
        var checkEvent;
        for (var i = 0; i < me.checks.length; ++i) {
            checkEvent = me.checks[i];
            if (checkEvent.place === player.place && typeof checkEvent.jiang !== 'undefined') {
                checkEvent['select'] = enum_Jiang;
                process = true;
                break;
            }
        }
        
        if (process) me.ProcessCheck();
    });
    
    player.socket.on('piaoCards', function(data) {
        if (me.playing === false) { return; }
        
    });
    
    player.socket.on('passCards', function(data) {
        if (me.playing === false) { return; }
        me.PlayerPassOperate(player);
    });
    
    // 设置自己位子
    player.place = me.GetFreePlace();
    // 先通知自己创建自己的单位
    player.socket.emit("newPlayer", Player.prototype.SendNewPlayer(player, true));
    // 再通知其他玩家加入新玩家
    me.BroadcastPlayers(player, "newPlayer");  
    // 再自己创建其他玩家
    me.SendPlayersTo(player);

    player.socket.join(me.roomName);
    me.players[player.place] = player;
    
    // 新一局准备
    me.SendPlayerReady();
   
    GameLog(player.nickName + ' enter ' + me.roomName);
}

Room.prototype.RemovePlayer = function(player)
{
    var me = this;
    var place = player.place;
    if (place >= 0) {
        player.socket.leave(this.roomName);
        this.BroadcastPlayers(player, "losePlayer");
        this.players[place] = null;
        if (me.playing) {
            me.GameStop();
        }
        me.CancelPlayerReady();
        
        GameLog(player.nickName + ' leave ' + me.roomName);
        GameLog("number of " + this.roomName +"'s player :", this.players.length);
    }
}

Room.prototype.ClearAllPlayers = function()
{
    this.players = [null, null, null, null];
}

Room.prototype.Update = function(dt)
{

}

Room.prototype.BroadcastPlayers = function(who, action, argument)
{
    if(action === "newPlayer") {
        IO.to(this.roomName).emit(action, Player.prototype.SendNewPlayer(who));
    }else if(action === "losePlayer") {
        IO.to(this.roomName).emit(action, Player.prototype.SendLosePlayer(who));
    }else if(action === "newGame") {
        IO.to(this.roomName).emit(action, argument);
    }else if(action === "ready") {
        IO.to(this.roomName).emit(action);
    }
}

Room.prototype.BroadcastPlayers2 = function(who, action, argument, argument2)
{
    var player = null;
    for (var i = 0; i < this.players.length; ++i){
    
        player = this.players[i];
        if (player === null) continue;
        
        if(action === "initCards") {
            player.socket.emit(action, Player.prototype.SendInitCards(who, player.place === who.place));
        }else if(action === "getCard") {
            player.socket.emit(action, Player.prototype.SendGetCard(who, argument, player));
        }else if(action === "throwCard") {
            player.socket.emit(action, Player.prototype.SendThrowCard(who, argument, player));
        }else if(action === "pengCards") {
            player.socket.emit(action, Player.prototype.SendPengCards(who, argument, player, argument2));
        }else if(action === "gangCards") {
            player.socket.emit(action, Player.prototype.SendGangCards(who, argument, player, argument2));
        }else if(action === "huCards") {
            player.socket.emit(action, Player.prototype.SendHuCards(who, argument, player, argument2));
        }else if(action === "kanCards") {
            player.socket.emit(action, Player.prototype.SendKanCards(who, argument, player));
        }else if(action === "niuCards") {
            player.socket.emit(action, Player.prototype.SendNiuCards(who, argument, player));
        }else if(action == "addNiuCard") {
            player.socket.emit(action, Player.prototype.SendAddNiuCard(who, argument, player));
        }else if(action === "jiangCards") {
            player.socket.emit(action, Player.prototype.SendJiangCards(who, argument, player, argument2));
        }
    }
}

Room.prototype.SendPlayersTo = function(who)
{
    var player = null;
    var datas = [];
    for (var i = 0; i < this.players.length; ++i){

        player = this.players[i];
        if (player === null) continue;
        
        datas.push(Player.prototype.SendPlayerInfo(player));
    }
    if (datas.length > 0) {
        who.socket.emit("playerList", datas);
    }
}

function RandomNumBoth(Min,Max){
    var Range = Max - Min;
    var Rand = Math.random();
    var num = Min + Math.round(Rand * Range); //四舍五入
    return num;
}

// 洗牌
Room.prototype.RandomCards = function() {    
    // 打乱牌
    var i, a, b, t;
    var cardsMaxIdx = this.cards.length - 1;
    
    for (i = 0; i < 120; ++i) {
        a = Util.RandomRange(0, cardsMaxIdx);
        b = Util.RandomRange(0, cardsMaxIdx);
        if (a !== b) {
            t = this.cards[b];
            this.cards[b] = this.cards[a];
            this.cards[a] = t;
        }
    }
}

// 定势洗牌
Room.prototype.FixCards = function() {
    // 先随机一下牌
    var i, a, b, t;
    var cardsMaxIdx = this.cards.length - 1;
    for (i = 0; i < 120; ++i) {
        a = Util.RandomRange(0, cardsMaxIdx);
        b = Util.RandomRange(0, cardsMaxIdx);
        if (a !== b) {
            t = this.cards[b];
            this.cards[b] = this.cards[a];
            this.cards[a] = t;
        }
    }
    
    var fixCards = [45,46,45,11,11,11,22,22,23,23,24,24,31,34,26,46,46,47,26,27,28,28,28];
    var t;
    for (var i = 0; i < fixCards.length; ++i) {
        for (var j = i; j < this.cards.length; ++j) {
            if (fixCards[i] == this.cards[j]) {
                if (i !== j) {
                    t = this.cards[i];
                    this.cards[i] = this.cards[j];
                    this.cards[j] = t;
                    break;
                }
            }
        }
    }
}


// 新一局游戏
Room.prototype.NewGame = function() 
{
    this.cards = staticCards.slice();
    this.cardsIndex = 0;
    this.playing = true;
    this.checks.splice(0, this.checks.length);
    
    this.RandomCards();
    //this.FixCards();
    
    this.bankerPlace = 0;
    //this.bankerPlace = Util.RandomRange(0, 3);
    this.BroadcastPlayers(null, "newGame", { "bankerPlace" : this.bankerPlace });
    
    // 发牌
    var initCards = new Array(13);
    var i,j;
    for (i = 0; i < 4; ++i) {
        for (j = 0; j < 13; ++j, ++this.cardsIndex) {
            initCards[j] = this.cards[this.cardsIndex];
        }
        
        this.players[i].InitCards(initCards);
        //GameLog(initCards, i);
    }
    
    var player;
    for (i = 0; i < 4; ++i) {
        player = this.players[i];
        this.BroadcastPlayers2(player, "initCards");
    }
    
    // 庄家先摸牌
    this.getCardPlace = this.bankerPlace;
    this.PlayeAddCard();
}

Room.prototype.DoBackCardPlace = function() {
    this.getCardPlace = this.getCardPlace + 1;
    if (this.getCardPlace === 4) { 
        this.getCardPlace = 0; 
    }
}

Room.prototype.PlayeAddCard = function() {
    if (this.cardsIndex + 1 == this.cards.length) {
        // 流局
        Room.GameStop();
    }else {
        var player = this.players[this.getCardPlace];
        var card = this.cards[this.cardsIndex++];

        if (player.niuCards.length > 0 && 
           (card === 45 || card === 46 || card === 47))
        {
            // 补牛
            player.AddNiuCard(card);
            this.BroadcastPlayers2(player, "addNiuCard", card);
            
            // 等待一秒继续补牌
            var getCardPlace = this.getCardPlace;
            this.getCardPlace = -1;
            function AddCardNextSecond(room, getCardPlace) {
                return function () {
                    room.getCardPlace = getCardPlace;
                    room.PlayeAddCard();
                };
            }
            setTimeout(AddCardNextSecond(this, getCardPlace), 1000);
        }
        else {
            
            player.AddCard(card);
            var checkEvent = null;
            if (Mahjong.HasGangCardsByHand(player.cards) ||
                Mahjong.HasGangCards(player.cards, card) || 
                Mahjong.CanGangCards(player.kanCards, card)) {
                if (checkEvent === null) {
                    checkEvent = { 'place' : player.place, 'selfCheck' : 1 };
                }
                checkEvent.gang = 1;
            }
            
            if (Mahjong.HasKanCardsByHand(player.cards) || 
                Mahjong.HasKanCards(player.cards, card) ) {
                if (checkEvent === null) {
                    checkEvent = { 'place' : player.place, 'selfCheck' : 1 };
                }
                checkEvent.kan = 1;
            }
            
            if (player.canNiu) {
                if (checkEvent === null) {
                    checkEvent = { 'place' : player.place, 'selfCheck' : 1 };
                }
                checkEvent.niu = 1;
            }
            
            if (player.isHuCards) {
                if (checkEvent === null) {
                    checkEvent = { 'place' : player.place, 'selfCheck' : 1 };
                }
                checkEvent.hu = 1;
            }
            
            if (checkEvent !== null) {
                this.checks.push(checkEvent);
                GameLog("trigger checkEvent(add card)---------------->");
            }
            
            this.BroadcastPlayers2(player, "getCard", card);
        }
    }
}

Room.prototype.ThrowCardCheck = function(player, card) {
    var otherPlayer;
    var huCards;
    var checkEvent;
    for (var i = 0; i < 4; ++i) {
        otherPlayer = this.players[i];
        if (otherPlayer.place === player.place)
            continue;
            
        checkEvent = null;
        if (Mahjong.CanPengCards(otherPlayer.cards, card)) {
            if (checkEvent === null) {
                checkEvent = { 'place' : otherPlayer.place, 'throwCheck' : 1};
            }
            checkEvent.peng = 1;
        }
        
        if (Mahjong.CanGangCards(otherPlayer.cards, card) ||
            Mahjong.CanGangCards(player.kanCards, card)) {
            if (checkEvent === null) {
                checkEvent = { 'place' : otherPlayer.place, 'throwCheck' : 1};
            }
            checkEvent.gang = 1;
        }
        
        // 将牌
        if (1) {
            var nextPlace = player.place + 1;
            if (nextPlace === 4) { 
                nextPlace = 0; 
            }
            
            if (otherPlayer.place === nextPlace && otherPlayer.CanJiangCards(card)) {
                if (checkEvent === null) {
                    checkEvent = { 'place' : otherPlayer.place, 'throwCheck' : 1};
                }
                checkEvent.jiang = 1;
            }
        }
        
        huCards = otherPlayer.GetHuCards();
        for (var j = 0; j < huCards.length; ++j) {
            if (huCards[j] === card) {
                if (checkEvent === null) {
                    checkEvent = { 'place' : otherPlayer.place, 'throwCheck' : 1};
                }
                checkEvent.hu = 1;
                break;
            }
        }
        
        if (checkEvent !== null) {
            this.checks.push(checkEvent);
            GameLog("trigger checkEvent(throw card)---------------->");
        }
    }
    
    return this.checks.length > 0;
}

function RuleSort(room) {
    // return < 0  排序后a在b前面
    // return === 0  排序后a,b位置不变
    // return > 0  排序后b在a前面

    return function CheckSort(a, b) {
        if (a.select === b.select) {
            var i = 0;
            var mod4;
            while (++i < 10) {
                mod4 = (room.getCardPlace + i) % 4;
                if (mod4 === a.place) {
                    return -1;
                }
                if (mod4 === b.place) {
                    return 1;
                }
            }
            return 0;
        }
        else {
            return b.select - a.select;
        }
    }
}

Room.prototype.ProcessEvent = function(place, select, selfCheck) {
    GameLog("---------------->ProcessCheck:" + select);
    var me = this;
    var player = me.players[place];
    switch(select) {
        case enum_Hu: {
            GameLog("玩家" + player.nickName + "胡牌了");
            if (selfCheck) {
                me.BroadcastPlayers2(player, "huCards", me.cards[me.cardsIndex - 1]);
            }else {
                me.BroadcastPlayers2(player, "huCards", me.lastThrowCard, me.lastThrowPlace);
            }
            // 新一局准备.
            me.GameEnd();
            me.CancelPlayerReady();
            me.SendPlayerReady();
        }break;
        case enum_Gang: {
            if (selfCheck) {
                player.GangCards(me.cards[me.cardsIndex - 1], true);
                me.BroadcastPlayers2(player, "gangCards", me.cards[me.cardsIndex - 1]);
            }else {
                player.GangCards(me.lastThrowCard, false);
                me.BroadcastPlayers2(player, "gangCards", me.lastThrowCard, me.lastThrowPlace);
            }
            me.getCardPlace = player.place;
            me.PlayeAddCard();
        }break;
        case enum_Peng: {
            me.PlayerPengCards(player);
        }break;
        case enum_Niu: {
            me.PlayerNiuCards(player);
        }break;
        case enum_Kan: {
            me.PlayerKanCards(player);
        }break;
        case enum_Jiang : {
            me.PlayerJiangCards(player);
        }break;
        case enum_Pass: {
            if (selfCheck === false ) {
                me.DoBackCardPlace();
                me.PlayeAddCard();
            }
        }break;
    }
}

/*
Room.prototype.ProcessCheck = function() {
    var me = this;
    var checkCount = 0;
    var checkEvent;
    for (var i = 0; i < me.checks.length; ++i) {
        checkEvent = me.checks[i];
        if (typeof checkEvent.select !== 'undefined') {
            ++checkCount;
        }
    }
    
    if (checkCount === me.checks.length) {
        // 客户全部选择完毕,此刻处理
        if (me.checks.length > 1) {
            me.checks.sort(RuleSort(me));
            GameLog("事件检测排序!", me.checks);
        }
        
        checkEvent = me.checks[0];
        var select = checkEvent.select;
        var place = checkEvent.place;
        var selfCheck = typeof checkEvent.selfCheck !== 'undefined'
        // 清除事件
        me.checks.splice(0, me.checks.length);
        // 处理事件
        me.ProcessEvent(place, select, selfCheck);
    }
}
*/

Room.prototype.ProcessCheck = function() {

    function SimpleClone(src) {
        var dst = {}
        for (var key in src) {
            dst[key] = src[key]
        }
        return dst;
    }

    function SelectMaxCheckEvent(checkEvent)
    {
        if (typeof checkEvent.select !== "undefined") {
            return checkEvent.select;
        }

        if (typeof checkEvent.hu !== 'undefined') 
            return enum_Hu;

        if (typeof checkEvent.gang !== 'undefined') 
            return enum_Gang;

        if (typeof checkEvent.peng !== 'undefined') 
            return enum_Peng;

        if (typeof checkEvent.jiang !== 'undefined') 
            return enum_Jiang;

        if (typeof checkEvent.kan !== 'undefined') 
            return enum_Kan;

        if (typeof checkEvent.niu !== 'undefined') 
            return enum_Niu;

        return enum_Pass;
    }

    var me = this;
    var cloneChecks = new Array();
    var cloneCheckEvent = SimpleClone(me.checks);
    var checkEvent;
    for (var i = 0; i < me.checks.length; ++i) {
        checkEvent = SimpleClone(me.checks[i]);
        cloneChecks.push(checkEvent);
        checkEvent.select = SelectMaxCheckEvent(checkEvent);
    }
    
    // 客户全部选择完毕,此刻处理
    if (cloneChecks.length > 0) {
        cloneChecks.sort(RuleSort(me));
        checkEvent = cloneChecks[0];
        
        for (var i = 0; i < me.checks.length; ++i) {
            if (checkEvent.place === me.checks[i].place) {
                if (typeof me.checks[i].select !== 'undefined')
                {
                    var checkEvent = me.checks[i];
                    var select = checkEvent.select;
                    var place = checkEvent.place;
                    var selfCheck = typeof checkEvent.selfCheck !== 'undefined'
                    // 清除事件
                    me.checks.splice(0, me.checks.length);
                    // 处理事件
                    me.ProcessEvent(place, select, selfCheck);
                }
                break;
            }
        }
    }
}

Room.prototype.TriggerSelfChack = function(player)
{
    var checkEvent = null;
    if (Mahjong.HasGangCardsByHand(player.cards)) {
        if (checkEvent === null) {
            checkEvent = { 'place' : player.place, 'selfCheck' : 1 };
        }
        checkEvent.gang = 1;
    }
    
    if (Mahjong.HasKanCardsByHand(player.cards)) {
        if (checkEvent === null) {
            checkEvent = { 'place' : player.place, 'selfCheck' : 1 };
        }
        checkEvent.kan = 1;
    }
    
    if (player.canNiu) {
        if (checkEvent === null) {
            checkEvent = { 'place' : player.place, 'selfCheck' : 1 };
        }
        checkEvent.niu = 1;
    }

    if (player.isHuCards) {
        if (checkEvent === null) {
            checkEvent = { 'place' : player.place, 'selfCheck' : 1 };
        }
        checkEvent.hu = 1;
    }
    
    if (checkEvent !== null) {
        this.checks.push(checkEvent);
        GameLog("trigger checkEvent(self check)---------------->");
    }
}


Room.prototype.PlayerPengCards = function (player) {
    // 玩家碰牌
    player.PengCards(this.lastThrowCard);
    // 触发检测
    // this.TriggerSelfChack(player);
    // 通知
    this.BroadcastPlayers2(player, "pengCards", this.lastThrowCard, this.lastThrowPlace);
    // 改变出牌位置
    this.getCardPlace = player.place;
}

Room.prototype.PlayerJiangCards = function (player) {
    // 玩家将牌
    player.AddJiangCard(this.lastThrowCard);
    // 通知
    this.BroadcastPlayers2(player, "jiangCards", this.lastThrowCard, this.lastThrowPlace);
    // 改变出牌位置
    this.getCardPlace = player.place;
}

Room.prototype.PlayerKanCards = function (player) {
    // 玩家坎牌
    player.KanCards();
    // 触发检测
    this.TriggerSelfChack(player);
    // 通知
    this.BroadcastPlayers2(player, "kanCards");
}

Room.prototype.PlayerNiuCards = function (player) {
    // 玩家碰牌
    var countArray = [];
    var c = 0;
    Mahjong.HasNiuCardsByHand(player.cards, countArray);
    var i;
    for (i = 0; i < countArray.length; ++i) {
        c += countArray[i];
    }
    
    var addNum = c - 3;
    var addCards = [];
    for (i = 0; i < addNum; ++i) {
        addCards.push(this.cards[this.cardsIndex++]);
    }
    player.NiuCards(countArray, addCards);
    
    // 触发检测
    this.TriggerSelfChack(player);
    // 通知
    this.BroadcastPlayers2(player, "niuCards", addCards);
}

Room.prototype.GameEnd = function() {
    this.playing = false;
}

Room.prototype.GameStop = function() {
    this.playing = false;
}
