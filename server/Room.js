if(typeof module !== 'undefined')
    module.exports = Room;
    
var Player = require("./Player.js");
var Mahjong = require("./Mahjong.js");

var UserDB = require("./sql/userDB.js");
var GameDB = require("./sql/gameDB.js");

var MinuteToMicroSecond = 60000;

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

function PlayData()
{
    this.userId = 0;
    this.userName = this.name;
    this.userHeadUrl = this.headUrl;
    this.offline = true;            // 离线
    this.place = 0;
    this.cards = null;              // 手牌
    this.outputCards = new Array(); // 已经出的牌
    this.pengCards = new Array();   // 已碰的牌
    this.gangCards = new Array();   // 已杠的牌
    this.kanCards = new Array();    // 已砍的牌
    this.niuCards = new Array();    // 已牛的牌
    this.jiangCards = new Array();  // 已将的牌
    this.huCards = new Array();     // 可胡的牌
    this.updateHucards = true;
    this.isHuCards = false;
    this.canNiu = false;
    this.firstAdd = false;
    this.piao = false;
}

function Room()
{
    this.duration = 0;      // 持续时间
    this.players = [null, null, null, null]; // 玩家列表
    this.playData = null; // 游戏数据
    
    this.cards = null; 
    this.cardsIndex = 0;
    this.bankerPlace = 0;   // 庄家
    this.getCardPlace = 0;  // 摸牌人
    this.checks = new Array();
    this.lastThrowCard = 0;
    this.lastThrowPlace = 0;
    this.started = false;   // 游戏已经开始
    this.playing = false;   // 游戏中
    this.pause = false;     // 玩家离线,游戏暂停
    this.state = 1;         // (摸牌状态 1, 打牌状态2, 结算状态3)
}

Room.prototype.Init = function(id, createUserId, ruleId, quanId, hunCount, playCount, costMoney)
{
    this.id = id;
    this.roomName = "room:"+this.id;
    this.createUserId = createUserId;
    this.ruleId = ruleId;
    this.quanId = quanId;
    this.hunCount = hunCount;
    this.playCount = playCount;
    this.costMoney = costMoney;
    
    // 创建时间
    var now = (new Date()).getTime();
    var time = Math.ceil(now / MinuteToMicroSecond);
    this.time = time;
}

Room.prototype.RuleHasZhuangXian = function() {
    if ((this.ruleId & 1) === 1) {
        return true;
    }
    return false;
}

Room.prototype.RuleCanNiu = function() {
    if ((this.ruleId & 2) === 2) {
        return true;
    }
    return false;
}

Room.prototype.RuleCanJiang = function() {
    if ((this.ruleId & 4) === 4) {
        return true;
    }
    return false;
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

Room.prototype.PlayerCanEnter = function(player)
{
    if (this.playData === null) {
        return true;
    }
    else {
        for (var i = 0; i < 4; ++i) {
            if (this.playData[i].userId === player.id) {
                return true;
            }
        }
    }
    return false
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
        if (checkEvent.place === player.data.place) {
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

    PROCESS_COCOS_SOCKETIO(player.socket, 'exitRoom', function (data) {
        GameLog('exitRoom');
        
        if (typeof player.room === 'undefined') {
            GameLog("没有加入房间");
            return;
        }
        
        me.BroadcastPlayers(null, "exitRoomBack", player.id);
        
        var clearRoom = false; 
        if (me.createUserId === player.id) {
            for (var i = 0; i < me.players.length; ++i) {
                if (me.players[i]) {
                    GameDB.UpdateRoomData(me.players[i].id, {});
                    me.RemovePlayer(me.players[i], false);
                }
            }
            clearRoom = true;
        }
        else {
            GameDB.UpdateRoomData(player.id, {});
            me.RemovePlayer(player);
        }
        
        if (clearRoom) {
            delete GameServer[me.id];
        }
    });
    
    PROCESS_COCOS_SOCKETIO(player.socket, 'ready', function (data) {
        GameLog('ready');
        if (me.playing === true) { GameLog("不合法的消息请求"); return; }
        player.ready = true;
        me.BroadcastPlayers(null, "readyOk", player.place);
        
        me.CheckAllReady();
    });
    
    
    PROCESS_COCOS_SOCKETIO(player.socket, 'unready', function (data) {
        if (me.playing === true) { GameLog("不合法的消息请求"); return; }
        player.ready = false;
    });
    
    PROCESS_COCOS_SOCKETIO(player.socket, 'needThrowCard', function(data) {
        if (me.playing === false || me.pause === true) { GameLog("不合法的消息请求"); return; }
        var card = data.card;
        if (me.getCardPlace === player.data.place && me.checks.length === 0) {
            if(player.ThrowCard(card)) {
                // 打牌状态
                me.state = 2;

                me.lastThrowCard = card;
                me.lastThrowPlace = player.data.place;
                me.BroadcastPlayers2(player, "throwCard", data.card);
                
                // 检测碰,杠,胡.
                //    如果有玩家碰,那么通知玩家,有玩家出牌,出现时间选择是否碰牌. 非碰牌玩家依然显示玩家尚未出牌.
                //        碰牌玩家选择碰牌, 通知非碰牌玩家有玩家出牌, 通知非碰牌玩家有人碰牌.

                if (false === me.ThrowCardCheck(player, card)) {
                    me.DoBackCardPlace();
                    me.PlayerAddCard();
                }
            }
        }
    });
    
    PROCESS_COCOS_SOCKETIO(player.socket, 'pengCards', function(data) {
        if (me.playing === false || me.pause === true) { GameLog("不合法的消息请求"); return; }
        var process = false;
        var checkEvent;
        for (var i = 0; i < me.checks.length; ++i) {
            checkEvent = me.checks[i];
            if (checkEvent.place === player.data.place && typeof checkEvent.peng !== 'undefined') {
                checkEvent['select'] = enum_Peng;
                process = true;
                break;
            }
        }
        
        if (process) me.ProcessCheck();
    });
    
    PROCESS_COCOS_SOCKETIO(player.socket, 'gangCards', function(data) {
        if (me.playing === false || me.pause === true) { GameLog("不合法的消息请求"); return; }
        var process = false;
        var checkEvent;
        for (var i = 0; i < me.checks.length; ++i) {
            checkEvent = me.checks[i];
            if (checkEvent.place === player.data.place && typeof checkEvent.gang !== 'undefined') {
                checkEvent['select'] = enum_Gang;
                process = true;
                break;
            }
        }
        
        if (process) me.ProcessCheck();
    });
    
    PROCESS_COCOS_SOCKETIO(player.socket, 'huCards', function(data) {
        if (me.playing === false || me.pause === true) { GameLog("不合法的消息请求"); return; }
        var process = false;
        var checkEvent;
        for (var i = 0; i < me.checks.length; ++i) {
            checkEvent = me.checks[i];
            if (checkEvent.place === player.data.place && typeof checkEvent.hu !== 'undefined') {
                checkEvent['select'] = enum_Hu;
                process = true;
                break;
            }
        }
        
        if (process) me.ProcessCheck();
    });
    
    PROCESS_COCOS_SOCKETIO(player.socket, 'kanCards', function(data) {
        if (me.playing === false || me.pause === true) { GameLog("不合法的消息请求"); return; }
        GameLog("kanCards");
        var process = false;
        var checkEvent;
        for (var i = 0; i < me.checks.length; ++i) {
            checkEvent = me.checks[i];
            if (checkEvent.place === player.data.place && typeof checkEvent.kan !== 'undefined') {
                checkEvent['select'] = enum_Kan;
                process = true;
                break;
            }
        }
        
        if (process) me.ProcessCheck();
    });
    
    PROCESS_COCOS_SOCKETIO(player.socket, 'niuCards', function(data) {
        if (me.playing === false || me.pause === true) { GameLog("不合法的消息请求"); return; }
        if (me.RuleCanNiu() === false) { GameLog("房间规则不能牛牌"); return; };
        var process = false;
        var checkEvent;
        for (var i = 0; i < me.checks.length; ++i) {
            checkEvent = me.checks[i];
            if (checkEvent.place === player.data.place && typeof checkEvent.niu !== 'undefined') {
                checkEvent['select'] = enum_Niu;
                process = true;
                break;
            }
        }
        
        if (process) me.ProcessCheck();
    });
    
    PROCESS_COCOS_SOCKETIO(player.socket, 'jiangCards', function(data) {
        if (me.playing === false || me.pause === true) { GameLog("不合法的消息请求"); return; }
        if (me.RuleCanJiang() === false) { GameLog("房间规则不能将牌"); return; };
        var process = false;
        var checkEvent;
        for (var i = 0; i < me.checks.length; ++i) {
            checkEvent = me.checks[i];
            if (checkEvent.place === player.data.place && typeof checkEvent.jiang !== 'undefined') {
                checkEvent['select'] = enum_Jiang;
                process = true;
                break;
            }
        }
        
        if (process) me.ProcessCheck();
    });
    
    PROCESS_COCOS_SOCKETIO(player.socket, 'piaoCards', function(data) {
        if (me.playing === false || me.pause === true) { GameLog("不合法的消息请求"); return; }
        
    });
    
    PROCESS_COCOS_SOCKETIO(player.socket, 'passCards', function(data) {
        if (me.playing === false || me.pause === true) { GameLog("不合法的消息请求"); return; }
        me.PlayerPassOperate(player);
    });
    
    if (false === me.started) {
        // 设置自己位子
        player.place = me.GetFreePlace();
        // 先通知自己创建自己的单位
        player.socket.emit("newPlayer", Player.prototype.SendNewPlayer(player, true));
        // 再通知其他玩家加入新玩家
        me.BroadcastPlayers(player, "newPlayer");  
        // 再自己创建其他玩家
        me.SendPlayersTo(player);
    }
    else {
       for (var pi = 0; pi < 4; ++pi) {
            if (this.playData[pi].userId === player.id) {
                player.place = this.playData[pi].place;
                player.AttachData(this.playData[pi]);
                break;
            }
        }

        // 发送牌数据.
        me.SendSendPlayersByReconnection(player);
        // 广播玩家上线.
        me.BroadcastPlayers(null, "playerReconnection", player.place);  

        var allOnline = true;
        for (var gi = 0; gi < 4; ++gi) {
            if (this.playData[gi].offline === true) {
                allOnline = false;
                break;
            }
        }
        
        if (allOnline) {
            me.pause = false;
            GameLog(player.name + "重新加入,游戏开始!");
        }
    }

    player.socket.join(me.roomName);
    me.players[player.place] = player;
    
    if (false === me.playing) {
        // 新一局准备
        me.SendPlayerReady();
    }
   
    GameLog(player.name + ' enter ' + me.roomName);
}

Room.prototype.RemovePlayer = function(player, noBroadcast)
{
    var me = this;
    var place = player.place;
    if (place >= 0) {
        player.socket.leave(this.roomName);
        
        if (typeof noBroadcast === 'undefined') {
            if (me.started) {
                this.BroadcastPlayers(player, "playerOffline", player.place);
            }else {
                this.BroadcastPlayers(player, "losePlayer");
            }
        }

        this.players[place] = null;
        player.room = null;
        if (me.started) {
            me.playData[place].offline = true;
            me.pause = true;
        }
        else {
            me.CancelPlayerReady();
        }
        
        GameLog(player.name + ' leave ' + me.roomName);
        GameLog("number of " + this.roomName +"'s player :", this.GetPlayerCount());
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
    }else if(action === 'exitRoomBack') {
        IO.to(this.roomName).emit(action, argument);
    }else if (action === 'readyOk') {
        IO.to(this.roomName).emit(action, argument);
    }else if (action === 'playerReconnection') {
        IO.to(this.roomName).emit(action, argument);
    }else if (action === 'playerOffline') {
        IO.to(this.roomName).emit(action, argument);
    }
}

Room.prototype.BroadcastPlayers2 = function(who, action, argument, argument2)
{
    var player = null;
    for (var i = 0; i < this.players.length; ++i){
    
        player = this.players[i];
        if (player === null) continue;
        
        if(action === "initCards") {
            player.socket.emit(action, Player.prototype.SendInitCards(who, player.data.place === who.data.place));
        }else if(action === "getCard") {
            player.socket.emit(action, Player.prototype.SendGetCard(who, argument, player, argument2));
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
        }else if(action === "liuJu") {
            player.socket.emit(action, Player.prototype.SendLiuJuCards(who, argument, player));
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

Room.prototype.SendSendPlayersByReconnection = function(who)
{
    var roomInfo = {
        "bankerPlace" : this.bankerPlace, 
        "playCount" : this.playCount,
        "getCardPlace" : this.getCardPlace
    }
   
    var state = {};    
    if (this.state === 1) {
        state.type = 1;
        state.getCardPlace = this.getCardPlace;
        state.getCard = this.cards[this.cardsIndex - 1];
    }else if (this.state === 2){
        state.type = 2;
        state.lastThrowPlace = this.lastThrowPlace;
        state.lastThrowCard = this.lastThrowCard;
    }else if (state.type === 3) {
        roomInfo.accounts = 1;
    }
    
    var playerData = null;
    var datas = [];
    for (var i = 0; i < this.playData.length; ++i) {
        playerData = this.playData[i];
        datas.push(Player.prototype.SendPlayerInfoByReconnection(playerData, state, who));
    }
    if (datas.length > 0) {
        who.socket.emit("resumeGame", { roomInfo : roomInfo, playerList : datas });
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
    this.started = true;
    this.playing = true;
    this.pause = false;
    this.checks.splice(0, this.checks.length);
    
    // 生成游戏数据
    if (this.playData === null) {
        this.playData = new Array(null,null,null,null);
        for (var pi = 0; pi < 4; ++pi) {
            this.playData[pi] = new PlayData();
            this.players[pi].AttachData(this.playData[pi]);
        }
    }
 
    if (this.costMoney === 0) {
        // 如果没有扣钱,在这里扣钱
        this.costMoney = 1;
    }
    
    this.RandomCards();
    //this.FixCards();
    
    this.bankerPlace = 0;
    // 测试
    /*for (var p = 0; p < 4; ++p) {
        if (this.players[p].id === this.createUserId) {
            if (p === 0) {
                this.bankerPlace = 3;
            }else {
                this.bankerPlace = p - 1;
            }
            break;
        }
    }*/
    
    //this.bankerPlace = Util.RandomRange(0, 3);
    this.BroadcastPlayers(null, "newGame", { "bankerPlace" : this.bankerPlace, 
                    "playCount" : this.playCount, "played" : 1 });
    
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
    this.PlayerAddCard();
}

Room.prototype.DoBackCardPlace = function() {
    this.getCardPlace = this.getCardPlace + 1;
    if (this.getCardPlace === 4) { 
        this.getCardPlace = 0; 
    }
}

Room.prototype.PlayerAddCard = function() {
    // 摸牌状态
    this.state = 1;
    if (this.cardsIndex + 1 == this.cards.length) {
        // 流局
        Room.prototype.SendLiuJuCards(this);
        this.GameEnd();
        // 新一局准备.
        this.CancelPlayerReady();
        this.SendPlayerReady();
    }else {
        var player = this.players[this.getCardPlace];
        var card = this.cards[this.cardsIndex++];
        
        GameLog("cardsIndex=", this.cardsIndex);

        if (player.data.niuCards.length > 0 && 
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
                    room.PlayerAddCard();
                };
            }
            setTimeout(AddCardNextSecond(this, getCardPlace), 1000);
        }
        else {
            
            player.AddCard(card);
            var checkEvent = null;
            if (Mahjong.HasGangCardsByHand(player.data.cards) ||
                Mahjong.HasGangCards(player.data.cards, card) || 
                Mahjong.CanGangCards(player.data.kanCards, card)) {
                if (checkEvent === null) {
                    checkEvent = { 'place' : player.data.place, 'selfCheck' : 1 };
                }
                checkEvent.gang = 1;
            }
            
            if (Mahjong.HasKanCardsByHand(player.data.cards) || 
                Mahjong.HasKanCards(player.data.cards, card) ) {
                if (checkEvent === null) {
                    checkEvent = { 'place' : player.data.place, 'selfCheck' : 1 };
                }
                checkEvent.kan = 1;
            }
            
            if (this.RuleCanNiu() && player.data.canNiu) {
                if (checkEvent === null) {
                    checkEvent = { 'place' : player.data.place, 'selfCheck' : 1 };
                }
                checkEvent.niu = 1;
            }
            
            if (player.data.isHuCards) {
                if (checkEvent === null) {
                    checkEvent = { 'place' : player.data.place, 'selfCheck' : 1 };
                }
                checkEvent.hu = 1;
            }
            
            if (checkEvent !== null) {
                this.checks.push(checkEvent);
                GameLog("trigger checkEvent(add card)---------------->");
            }
            
            var remainNumber = (this.cards.length - 1) - this.cardsIndex;
            this.BroadcastPlayers2(player, "getCard", card, remainNumber);
        }
    }
}

Room.prototype.ThrowCardCheck = function(player, card) {
    var otherPlayer;
    var huCards;
    var checkEvent;
    for (var i = 0; i < 4; ++i) {
        otherPlayer = this.players[i];
        if (otherPlayer.data.place === player.data.place)
            continue;
            
        checkEvent = null;
        if (Mahjong.CanPengCards(otherPlayer.data.cards, card)) {
            if (checkEvent === null) {
                checkEvent = { 'place' : otherPlayer.data.place, 'throwCheck' : 1};
            }
            checkEvent.peng = 1;
        }
        
        if (Mahjong.CanGangCards(otherPlayer.data.cards, card) ||
            Mahjong.CanGangCards(player.data.kanCards, card)) {
            if (checkEvent === null) {
                checkEvent = { 'place' : otherPlayer.data.place, 'throwCheck' : 1};
            }
            checkEvent.gang = 1;
        }
        
        // 将牌
        if (this.RuleCanJiang()) {
            var nextPlace = player.data.place + 1;
            if (nextPlace === 4) { 
                nextPlace = 0; 
            }
            
            if (otherPlayer.data.place === nextPlace && otherPlayer.CanJiangCards(card)) {
                if (checkEvent === null) {
                    checkEvent = { 'place' : otherPlayer.data.place, 'throwCheck' : 1};
                }
                checkEvent.jiang = 1;
            }
        }
        
        huCards = otherPlayer.GetHuCards();
        for (var j = 0; j < huCards.length; ++j) {
            if (huCards[j] === card) {
                if (checkEvent === null) {
                    checkEvent = { 'place' : otherPlayer.data.place, 'throwCheck' : 1};
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
            GameLog("玩家" + player.name + "胡牌了");
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
            me.getCardPlace = player.data.place;
            me.PlayerAddCard();
            me.RemoveLastOneInPlayerOutputCards();
        }break;
        case enum_Peng: {
            me.PlayerPengCards(player);
            me.RemoveLastOneInPlayerOutputCards();
        }break;
        case enum_Niu: {
            me.PlayerNiuCards(player);
        }break;
        case enum_Kan: {
            me.PlayerKanCards(player);
        }break;
        case enum_Jiang : {
            me.PlayerJiangCards(player);
            me.RemoveLastOneInPlayerOutputCards();
        }break;
        case enum_Pass: {
            if (selfCheck === false ) {
                me.DoBackCardPlace();
                me.PlayerAddCard();
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

Room.prototype.TriggerSelfCheck = function(player)
{
    var checkEvent = null;
    if (Mahjong.HasGangCardsByHand(player.data.cards)) {
        if (checkEvent === null) {
            checkEvent = { 'place' : player.data.place, 'selfCheck' : 1 };
        }
        checkEvent.gang = 1;
    }
    
    if (Mahjong.HasKanCardsByHand(player.data.cards)) {
        if (checkEvent === null) {
            checkEvent = { 'place' : player.data.place, 'selfCheck' : 1 };
        }
        checkEvent.kan = 1;
    }
    
    if (this.RuleCanNiu() && player.data.canNiu) {
        if (checkEvent === null) {
            checkEvent = { 'place' : player.data.place, 'selfCheck' : 1 };
        }
        checkEvent.niu = 1;
    }

    if (player.data.isHuCards) {
        if (checkEvent === null) {
            checkEvent = { 'place' : player.data.place, 'selfCheck' : 1 };
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
    // this.TriggerSelfCheck(player);
    // 通知
    this.BroadcastPlayers2(player, "pengCards", this.lastThrowCard, this.lastThrowPlace);
    // 改变出牌位置
    this.getCardPlace = player.data.place;
}

Room.prototype.PlayerJiangCards = function (player) {
    // 玩家将牌
    player.AddJiangCard(this.lastThrowCard);
    // 通知
    this.BroadcastPlayers2(player, "jiangCards", this.lastThrowCard, this.lastThrowPlace);
    // 改变出牌位置
    this.getCardPlace = player.data.place;
}

Room.prototype.PlayerKanCards = function (player) {
    // 玩家坎牌
    player.KanCards();
    // 触发检测
    this.TriggerSelfCheck(player);
    // 通知
    this.BroadcastPlayers2(player, "kanCards");
}

Room.prototype.PlayerNiuCards = function (player) {
    // 玩家碰牌
    var countArray = [];
    var c = 0;
    Mahjong.HasNiuCardsByHand(player.data.cards, countArray);
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
    this.TriggerSelfCheck(player);
    // 通知
    this.BroadcastPlayers2(player, "niuCards", addCards);
}

Room.prototype.RemoveLastOneInPlayerOutputCards = function() {
    var card = this.lastThrowCard;
    var place = this.lastThrowPlace;
    var me = this;
    var player = me.players[place];
    player.data.outputCards.pop();
}

Room.prototype.GameEnd = function() {
    this.state = 3; // 结算状态
    this.playing = false;
    ++this.playCount;
    
    // 写入记录到数据库
    GameDB.UpdateRoomData(this.createUserId, Room.prototype.DBSaveRoomInfo(this));
}

Room.prototype.SendRoomInfo = function(room) {
    
    var data = {    "id"                : room.id,
                    "ownerId"           : room.createUserId,
                    "time"              : room.time,
                    "ruleId"            : room.ruleId,
                    "quanId"            : room.quanId,
                    "hunCount"          : room.hunCount,
                    "playCount"         : room.playCount,
                    "played"            : room.playing ? 1 : 0 };
                    
    if (room.playing) {
        var remainNumber = (room.cards.length - 1) - room.cardsIndex;
        data.remainNum = remainNumber;
    }
    
    return JSON.stringify(data);
}

Room.prototype.SendLiuJuCards = function(room) {
    
    var datas = [];
    var player = null;
    for (var i = 0; i < room.players.length; ++i){
        player = room.players[i];
        datas.push(Player.prototype.SendLiuJuCards(player));
    }

    for (var j = 0; j < room.players.length; ++j){
        player = room.players[j];
        player.socket.emit("liuJu", datas);
    }
}

Room.prototype.DBSaveRoomInfo = function(room) {
    
    var data = {    "id"                : room.id,
                    "ownerId"           : room.createUserId,
                    "time"              : room.time,
                    "ruleId"            : room.ruleId,
                    "quanId"            : room.quanId,
                    "hunCount"          : room.hunCount,
                    "playCount"         : room.playCount,
                    "costMoney"         : room.costMoney};
    
    return data;
}