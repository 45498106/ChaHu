var Util = require('Utility');
var Player = require('player');
var MessageHandler = require("msgHandler");


var getRoomRecordBack = {};
getRoomRecordBack['interest'] = "getRoomRecordBack";
getRoomRecordBack['Process'] = function (data) {
    GameLog(data);

    GameData.userRoomCard = data.roomCard;
    GameData.userRoomData = JSON.parse(data.roomData);
    
    // send event.
    GameEvent().SendEvent('GetRoomRecordSuccess');
};
MessageHandler.Add(getRoomRecordBack);

////////////////////////////////////////////////////////////////////////////////
var createRoomBack = {};
createRoomBack['interest'] = "createRoomBack";
createRoomBack['Process'] = function (data) {
    GameLog(data);

    GameData.userRoomData = JSON.parse(data);
    // 进入游戏
    GameEvent().SendEvent('CreateRoomSuccess');
};
MessageHandler.Add(createRoomBack);

////////////////////////////////////////////////////////////////////////////////
var exitRoomBack = {};
exitRoomBack['interest'] = "exitRoomBack";
exitRoomBack['Process'] = function (data) {
    var playerId = data;
    if (typeof GameData.userRoomData.id === 'number') {
        if (GameData.userRoomData.ownerId === playerId) {
            // 解散房间
            GameEvent().SendEvent('ExitRoom');
            GameData.selfPlace = -1;
            GameData.players = new Array(null,null,null,null);
        }else if (playerId === GameData.players[GameData.selfPlace].id) {
            GameEvent().SendEvent('ExitRoom');
            GameData.selfPlace = -1;
            GameData.players = new Array(null,null,null,null);
        }
    }
};
MessageHandler.Add(exitRoomBack);


////////////////////////////////////////////////////////////////////////////////
// 
var joinRoomBack = {};
joinRoomBack['interest'] = "joinRoomBack";
joinRoomBack['Process'] = function (data) {
    GameLog(data);
    
    GameData.userRoomData = JSON.parse(data);
    // 进入游戏
    GameEvent().SendEvent('JoinRoomSuccess');
};
MessageHandler.Add(joinRoomBack);

////////////////////////////////////////////////////////////////////////////////
var newPlayer = {};
newPlayer['interest'] = "newPlayer";
newPlayer['Process'] = function (data) {
    GameLog(data);
    
    var userPlace = data.place;
    var userId = data.id;
    var userName = data.name;
    var userHeadUrl = data.headUrl;
    
    var newPlayer = new Player();
    newPlayer.Init(userId, userPlace, userName, userHeadUrl);
    GameData.players[newPlayer.place] = newPlayer;
    
    if (GameData.selfPlace === -1) {
        GameData.selfPlace = userPlace;
    }
    
    GameEvent().SendEvent('JoinPlayer', userPlace);
    
};
MessageHandler.Add(newPlayer);

////////////////////////////////////////////////////////////////////////////////
var losePlayer = {};
losePlayer['interest'] = "losePlayer";
losePlayer['Process'] = function (data) {
    GameLog(data);
    
    var place = data.place;
    GameData.players[place] = null;
    
    GameEvent().SendEvent('LosePlayer', place);
};
MessageHandler.Add(losePlayer);

////////////////////////////////////////////////////////////////////////////////
var playerOffline = {};
playerOffline['interest'] = "playerOffline";
playerOffline['Process'] = function (data) {
    GameLog(data);
    
    var place = data;
    GameData.players[place].offline = true;
    
    GameEvent().SendEvent('PlayerOffline', place);
};
MessageHandler.Add(playerOffline);

////////////////////////////////////////////////////////////////////////////////
var playerList = {};
playerList['interest'] = "playerList";
playerList['Process'] = function (data) {
    GameLog(data);
    var newPlayer;
    var userPlace ,userId, userName, userHeadUrl;
    for (var i = 0; i < data.length; ++i) {
        userId = data[i].id;
        userPlace = data[i].place;
        userName = data[i].name;
        userHeadUrl = data[i].headUrl;
        newPlayer = new Player();
        newPlayer.Init(userId, userPlace, userName, userHeadUrl);
        GameData.players[newPlayer.place] = newPlayer;
        
        GameEvent().SendEvent('JoinPlayer', userPlace);
    }
};

MessageHandler.Add(playerList);

////////////////////////////////////////////////////////////////////////////////
var playerReady = {};
playerReady['interest'] = "ready";
playerReady['Process'] = function (data) {
    for (var i = 0; i < GameData.players.length; ++i) {
        if (GameData.players[i]) {
            GameData.players[i].ready = false;
        }
    }
};

MessageHandler.Add(playerReady);

////////////////////////////////////////////////////////////////////////////////
var readyOk = {};
readyOk['interest'] = "readyOk";
readyOk['Process'] = function (data) {
    GameLog(data);
    var place = data;
    if (GameData.players[place]) {
        GameData.players[place].ready = true;
    }
    
    GameEvent().SendEvent('PlayerReady', data);
};

MessageHandler.Add(readyOk);

////////////////////////////////////////////////////////////////////////////////
var newGame = {};
newGame['interest'] = "newGame";
newGame['Process'] = function (data) {
    GameLog(data);
    
    GameData.userRoomData.bankerPlace = data.bankerPlace;
    GameData.userRoomData.playCount = data.playCount;
    GameData.userRoomData.played = data.played;
    
    if (typeof data.totalScore === 'object') {
        for (var i = 0; i < GameData.players.length; ++i) {
            GameData.players[i].totalScore = data.totalScore[i];
        }
    }
    
    GameData.huPlace = -1;
    GameData.huCard = 0;
    GameData.huCards = new Array();
    
    GameEvent().SendEvent('NewGame');
};

MessageHandler.Add(newGame);

////////////////////////////////////////////////////////////////////////////////
var initCards = {};
initCards['interest'] = "initCards";
initCards['Process'] = function (data) {
    GameLog(data);

    var place = data.place;
    var palyer = GameData.players[place];
    palyer.Clear();
    palyer.cards = data.cards.slice();
    palyer.cards.sort();
    
    GameEvent().SendEvent('InitCards', data);
};

MessageHandler.Add(initCards);

////////////////////////////////////////////////////////////////////////////////
var getCard = {};
getCard['interest'] = "getCard";
getCard['Process'] = function (data) {
    GameLog(data);

    var place = data.place;
    var card = data.card;
    var player = GameData.players[place];
    // 添加摸牌
    player.cards.push(card);
    GameData.getCardPlace = place;
    // 剩余牌数
    GameData.userRoomData.remainNum = data.remainNum;
    
    // 通知
    GameEvent().SendEvent('GetCard', data);
};

MessageHandler.Add(getCard);

////////////////////////////////////////////////////////////////////////////////
var throwCard = {};
throwCard['interest'] = "throwCard";
throwCard['Process'] = function (data) {
    GameLog(data);

    var place = data.place;
    var card = data.card;
        
    var player = GameData.players[place];
    if (GameData.selfPlace === place) {
        Util.ArrayRemoveElemnt(player.cards, card);
        player.cards.sort();
    }else {
        player.cards.pop();
    }
    
    if (typeof data.huCards !== 'undefined') {
        GameData.huCards = data.huCards.slice();
    }
    
    // 通知
    GameEvent().SendEvent('ThrowCard', data);
};

MessageHandler.Add(throwCard);

////////////////////////////////////////////////////////////////////////////////
var pengCards = {};
pengCards['interest'] = "pengCards";
pengCards['Process'] = function (data) {
    GameLog(data);

    var place = data.place;
    var card = data.card;
        
    var player = GameData.players[place];
        
    player.cards = data.cards.slice();
    player.cards.sort();
    player.pengCards = data.pengCards.slice();
    GameData.getCardPlace = place;
   
    // 通知
    GameEvent().SendEvent('PengCards', data);
};

MessageHandler.Add(pengCards);

////////////////////////////////////////////////////////////////////////////////
var gangCards = {};
gangCards['interest'] = "gangCards";
gangCards['Process'] = function (data) {
    GameLog(data);

    var place = data.place;
    var card = data.card;
        
    var player = GameData.players[place];
        
    player.cards = data.cards.slice();
    player.cards.sort();
    player.gangCards = data.gangCards.slice();
    player.kanCards = data.kanCards.slice();
    GameData.getCardPlace = place;
   
    // 通知
    GameEvent().SendEvent('GangCards', data);
};

MessageHandler.Add(gangCards);

////////////////////////////////////////////////////////////////////////////////
var kanCards = {};
kanCards['interest'] = "kanCards";
kanCards['Process'] = function (data) {
    GameLog(data);

    var place = data.place;
    var card = data.card;
        
    var player = GameData.players[place];
        
    player.cards = data.cards.slice();
    player.cards.sort();
    player.kanCards = data.kanCards.slice();
    GameData.getCardPlace = place;
   
    // 通知
    GameEvent().SendEvent('KanCards', data);
};

MessageHandler.Add(kanCards);

////////////////////////////////////////////////////////////////////////////////
var niuCards = {};
niuCards['interest'] = "niuCards";
niuCards['Process'] = function (data) {
    GameLog(data);

    var place = data.place;
    var card = data.card;
        
    var player = GameData.players[place];
        
    player.cards = data.cards.slice();
    player.cards.sort();
    player.niuCards = data.niuCards.slice();
    GameData.getCardPlace = place;
   
    // 通知
    GameEvent().SendEvent('NiuCards', data);
};

MessageHandler.Add(niuCards);

////////////////////////////////////////////////////////////////////////////////
var jiangCards = {};
jiangCards['interest'] = "jiangCards";
jiangCards['Process'] = function (data) {
    GameLog(data);

    var place = data.place;
    var card = data.card;
        
    var player = GameData.players[place];
        
    player.cards = data.cards.slice();
    player.cards.sort();
    player.jiangCards = data.jiangCards.slice();
    GameData.getCardPlace = place;
   
    // 通知
    GameEvent().SendEvent('JiangCards', data);
};

MessageHandler.Add(jiangCards);


////////////////////////////////////////////////////////////////////////////////
var piaoCards = {};
piaoCards['interest'] = "piaoCards";
piaoCards['Process'] = function (data) {
    GameLog(data);
    //var place = data;
    // 通知
    GameEvent().SendEvent('PiaoCards', data);
};

MessageHandler.Add(piaoCards);

////////////////////////////////////////////////////////////////////////////////
var huCards = {};
huCards['interest'] = "huCards";
huCards['Process'] = function (data) {
    // 玩家胡牌
    GameLog(data);

    var place = data.place;
    var card = data.card;
        
    var player = GameData.players[place];
        
    player.cards = data.cards.slice();
    //player.cards.sort();

    if (typeof data.pengCards !== 'undefined') {
        player.pengCards = data.pengCards.slice();
    }
    
    if (typeof data.gangCards !== 'undefined') {
        player.gangCards = data.gangCards.slice();
    }
    
    if (typeof data.kanCards !== 'undefined') {
        player.kanCards = data.kanCards.slice();
    }
    
    if (typeof data.niuCards !== 'undefined') {
        player.niuCards = data.niuCards.slice();
    }
    
    if (typeof data.jiangCards !== 'undefined') {
        player.jiangCards = data.jiangCards.slice();
    }

    
    GameData.getCardPlace = -1;
    GameData.huPlace = place;
    GameData.huCard = card;
    
    // 通知
    GameEvent().SendEvent('HuCards', data);
};

MessageHandler.Add(huCards);


////////////////////////////////////////////////////////////////////////////////
var addNiuCard = {};
addNiuCard['interest'] = "addNiuCard";
addNiuCard['Process'] = function (data) {
    GameLog(data);
    var place = data.place;
    
    var addNiuCard = data.addNiuCard;
    var player = GameData.players[place];
    
    // 添加牛牌
    player.niuCards.push(addNiuCard);
    GameData.getCardPlace = place;
   
    // 通知
    GameEvent().SendEvent('AddNiuCard', data);
};

MessageHandler.Add(addNiuCard);

////////////////////////////////////////////////////////////////////////////////
var resumeGame = {};
resumeGame['interest'] = "resumeGame";
resumeGame['Process'] = function (data) {
    
    
    function SimpleClone(src) {
        var dst = {}
        for (var key in src) {
            dst[key] = src[key]
        }
        return dst;
    }
    
    GameLog(data);
    
    var roomInfo = data.roomInfo;
    var playerList = data.playerList;
    
    GameData.userRoomData.bankerPlace = roomInfo.bankerPlace;
    GameData.userRoomData.playCount = roomInfo.playCount;
    GameData.getCardPlace = roomInfo.getCardPlace;
    
    var playData, userId, userPlace, userName, userHeadUrl, newPlayer;
    for (var i = 0; i < playerList.length; ++i) {
        playData = playerList[i];
        userId = playData.id;
        userPlace = playData.place;
        userName = playData.name;
        userHeadUrl = playData.headUrl;
        
        if (userId === GameData.userId) {
            GameData.selfPlace = userPlace;
            GameData.selfOperation = SimpleClone(playerList[i].op);
        }
        
        newPlayer = new Player();
        newPlayer.Init(userId, userPlace, userName, userHeadUrl);
        
        if (playData.offline === 1) {
            newPlayer.offline = true;
        }

        newPlayer.cards = playData.cards.slice();
        newPlayer.cards.sort();
        if (typeof playerList[i].pengCards !== 'undefined') {
            newPlayer.pengCards = playData.pengCards.slice();
        }
        
        if (typeof playerList[i].gangCards !== 'undefined') {
            newPlayer.gangCards = playData.gangCards.slice();
        }
        
        if (typeof playerList[i].kanCards !== 'undefined') {
            newPlayer.kanCards = playData.kanCards.slice();
        }
        
        if (typeof playerList[i].niuCards !== 'undefined') {
            newPlayer.niuCards = playData.niuCards.slice();
        }
        
        if (typeof playerList[i].jiangCards !== 'undefined') {
            newPlayer.jiangCards = playData.jiangCards.slice();
        }
        
        if (typeof playerList[i].outputCards !== 'undefined') {
            newPlayer.outputCards = playData.outputCards.slice();
        }
        
        GameData.players[newPlayer.place] = newPlayer;
    }
    
    if (typeof roomInfo.totalScore === 'object') {
        for (var i = 0; i < GameData.players.length; ++i) {
            GameData.players[i].totalScore = roomInfo.totalScore[i];
        }
    }
    
    GameData.resumeGame = true;
};

MessageHandler.Add(resumeGame);


////////////////////////////////////////////////////////////////////////////////
var playerReconnection = {};
playerReconnection['interest'] = "playerReconnection";
playerReconnection['Process'] = function (data) {
    GameLog(data);

    var place = data;
    delete GameData.players[place].offline;
    // 通知
    GameEvent().SendEvent('PlayerReconnection', data);
};

MessageHandler.Add(playerReconnection);

////////////////////////////////////////////////////////////////////////////////
var accounts = {};
accounts['interest'] = "accounts";
accounts['Process'] = function (datas) {
    GameLog(datas);

    var place, data;
    for (var i = 0; i < datas.playData.length; ++i) {
        data = datas.playData[i];
        place = data.place;
        
        
        var player = GameData.players[place];
        
        player.score = data.score;
        player.singleScore = data.singleScore;
        
        player.cards = data.cards.slice();
        player.cards.sort();

        if (typeof data.pengCards !== 'undefined') {
            player.pengCards = data.pengCards.slice();
        }
    
        if (typeof data.gangCards !== 'undefined') {
            player.gangCards = data.gangCards.slice();
        }
        
        if (typeof data.kanCards !== 'undefined') {
            player.kanCards = data.kanCards.slice();
        }
        
        if (typeof data.niuCards !== 'undefined') {
            player.niuCards = data.niuCards.slice();
        }
        
        if (typeof data.jiangCards !== 'undefined') {
            player.jiangCards = data.jiangCards.slice();
        }
    }
    
    GameData.getCardPlace = -1;
    // 通知
    GameEvent().SendEvent('Accounts', datas);
};

MessageHandler.Add(accounts);




