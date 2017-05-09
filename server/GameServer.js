if(typeof module !== 'undefined')
    module.exports = GameServer;

var Room = require("./Room.js");
var Player = require("./Player.js");

var UserDB = require("./sql/userDB.js");
var GameDB = require("./sql/gameDB.js");

var MinuteToMicroSecond = 60000;

function GameServer()
{
    this.rooms = {};
    this._pdte = new Date().getTime();
    this._playerCache = {}; // 缓存玩家重复登录
}

GameServer.prototype.Init = function()
{
    // 设置更新
    setInterval(function(){
        this._pdt = (new Date().getTime() - this._pdte) / 1000.0;
        this._pdte = new Date().getTime();
        //if (this._pdt > 0.04) {
        //    GameLog("!!!###########this._pdt=", this._pdt);
        //}
        this.Update(this._pdt);
    }.bind(this), 1000.0/30.0);
}

GameServer.prototype.Update = function(dt)
{

}

GameServer.prototype.GenRoomId = function()
{
    return  Util.RandomRange(100000, 999999);
}

GameServer.prototype.NewClient = function(client)
{
    var socket = client.socket;
    var server = this;
    
    socket.on('enterGame', function (data) {
        // 登录游戏
        if (typeof client.player !== 'undefined') {
            GameLog(socket.id + "repeat enterGame");
            return;
        }
        
        var loginType = data.loginType;
        var uniqueID = data.uniqueID;
        var name = data.name;
        var headUrl = data.headUrl;
        
        if (typeof server._playerCache[uniqueID] !== 'undefined') {
            GameLog("账号多次登录.");
            return;
        }
        
        UserDB.GetUserInfo(uniqueID, function(success, results) {
            if (success) {
                // GameLog(results[0].id, results[0].source, results[0].name, results[0].headUrl);
                // 响应请求
                var userId = results[0].id;
                var userName = results[0].name;
                var userHeadHurl = results[0].headUrl;
                var data = { userId : userId, loginType : loginType };
                if (results[0].source === 'guest') {
                    data.name = userName;
                    data.headUrl = userHeadHurl;
                }
                else if (results[0].source === 'weixin') {
                    // 如果是微信更新名字和头像
                    userName = name;
                    userHeadHurl = headUrl;
                    UserDB.UpdateUserInfo(uniqueID, userName, userHeadHurl);
                }
                
                socket.emit('enterGameBack',  data);
                
                // 创建新用户
                var newPlayer = new Player();
                newPlayer.Init(uniqueID, userId, userName, userHeadHurl, socket);
                client.player = newPlayer;
                // 缓存玩家重复登录
                server._playerCache[uniqueID] = newPlayer;
            }
            else {
                UserDB.RegisterByUniqueID(uniqueID, loginType, function(success, insertId) {
                    var userId = insertId;
                    var userName = "unknow name";
                    var defaultHeadUrl = "https://wx.qlogo.cn/mmhead/Q3auHgzwzM5G2pXRJFPt9gt7gXw4VUgCV8FfibSiaN6z0Mic6sp80f7jg/0";
                    var userHeadHurl = "";
                    if (loginType === 'guest') {
                        userName = "游客"+userId;
                        userHeadHurl = defaultHeadUrl;
                    }else if (loginType === 'weixin') {
                        userName = name;
                        userHeadHurl = headUrl;
                    }
                    
                    // 响应请求
                    var data = { userId : userId, loginType : loginType };
                    if (loginType === 'guest') {
                        data.name = userName;
                        data.headUrl = userHeadHurl;
                    }
                    
                    UserDB.UpdateUserInfo(uniqueID, userName, userHeadHurl);
                    GameDB.InitForNewUser(userId);
                   
                    socket.emit('enterGameBack', data);
                    
                    // 创建新用户
                    var newPlayer = new Player();
                    newPlayer.Init(uniqueID, userId, userName, userHeadHurl, socket);
                    client.player = newPlayer;
                    
                    // 缓存玩家重复登录
                    server._playerCache[uniqueID] = newPlayer;
                });
            }
        });
    });
    
    socket.on('createRoom', function (data) {
        // 创建房间
        if (typeof client.player === 'undefined') {
            return;
        }
        
        var userId = client.player.id;
        var ruleId = data.ruleId;
        var quanId = data.quanId;
        var hunCount = data.hunCount;
        
        GameDB.GetUserData(userId, function(result, dbData){
            if (result === false) {
                return;
            }
            
            var roomCard = dbData.roomCard;
            var roomData = dbData.roomData;
            
            if (typeof roomData.roomId !== 'undefined') {
                var now = new Date(roomData.time * MinuteToMicroSecond);
                GameLog("重复创建房间, 已有roomId=", roomData.roomId);
                GameLog("已创建房间时间", now);
                return;
            }

            if ( !(ruleId === 1 || 
                   ruleId === 2 ||
                   ruleId === 3 ) ) {
                GameLog("错误的规则选项", ruleId);
                return 
            }
            
            var cast = 0;
            if (quanId === 1) {
                // 4张房卡
                cast = 4;
                if (roomCard < cast) {
                    GameLog("房卡不足,创建失败!");
                    return;
                }
            }
            else if (quanId === 2) {
                // 15张房卡
                cast = 15;
                if (roomCard < cast) {
                    GameLog("房卡不足,创建失败!");
                    return;
                }
            }
            else {
                GameLog("错误的局数选项", quanId);
                return;
            }
            
            if (!(hunCount >= 0 && hunCount <= 100)) {
                GameLog("错误的荤低", hunCount);
                return;
            }
            // 修正荤低
            hunCount = Math.floor(hunCount / 10) * 10;

            var rs =  server.CreateRoom(client.player, ruleId, quanId, hunCount);
            if (rs) {
                var roomId = client.player.room.id;
                var time = client.player.room.time;
                GameDB.UpdateRoomData(userId, {roomId : roomId, time:time, ruleId : ruleId, quanId : quanId, hunCount : hunCount});
            }
        });
    });
    
    socket.on('joinRoom', function (data) {
        // 加入房间
        if (typeof client.player === 'undefined') {
            GameLog("不合法的消息请求");
            return;
        }
        
        var roomId = data.roomId;
        server.AddToRoom(client.player, roomId);
    });
    
    socket.on('getRoomRecord', function (data) {
        // 加入房间
        if (typeof client.player === 'undefined') {
            GameLog("不合法的消息请求");
            return;
        }
        
        var userId = client.player.id;
        
        GameDB.GetUserData(userId, function(result, dbData){
            if (result === false) {
                return;
            }
            
            var roomCard = dbData.roomCard;
            var roomData = JSON.parse(dbData.roomData);
            
            socket.emit('getRoomRecordBack', { roomCard : roomCard, roomData : roomData});
        });
    });
}

GameServer.prototype.DeleteClient = function(client)
{
    var player = client.player;
    if (player) {
        client.player = null;
        
        // 缓存玩家重复登录
        delete this._playerCache[player.uniqueID];
        
        if (player.room) {
            player.room.RemovePlayer(player);
        }
    }
}

GameServer.prototype.CreateRoom = function(player, ruleId, quanId, hunCount)
{
    var roomId = this.GenRoomId();
    
    var loop = 100;
    while(--loop) {
        if (typeof this.rooms[roomId] === 'undefined' ||
            this.rooms[roomId] === null) {
            break;
        }
        roomId = this.GenRoomId();
    }
    
    if (loop === 0) {
        GameLog("房间id资源已经耗尽!");
        return false;
    }
    
    var room = new Room();
    room.Init(roomId, ruleId, quanId, hunCount);
    this.rooms[roomId] = room;
    
    var time = room.time;
    // 发送创建成功.
    player.socket.emit('createRoomBack', {roomId : roomId, time:time, ruleId : ruleId, quanId : quanId, hunCount : hunCount});
   
    // 添加玩家
    room.AddPlayer(player);
    player.room = room;
    
    return true;
}

GameServer.prototype.AddToRoom = function(player, roomId)
{
    var room = null;
    if (typeof this.rooms[roomId] === 'undefined' ||
        this.rooms[roomId] === null) {
        GameLog("加入房间失败.找不到roomId", roomId);
        return;
    }  
    room = this.rooms[roomId];
    // 添加玩家
    room.AddPlayer(player);
    player.room = room;
}
