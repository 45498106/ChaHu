if(typeof module !== 'undefined')
    module.exports = GameServer;

var Room = require("./Room.js");
var Player = require("./Player.js");

var UserDB = require("./sql/userDB.js");
var GameDB = require("./sql/gameDB.js");

var MinuteToMicroSecond = 60000;


PROCESS_COCOS_SOCKETIO = function(socket, eventName, func) {
    socket.on(eventName, function(data){
        if (typeof data === "object" || typeof data === 'undefined') {
            func(data);
        }else if (typeof data === "string") {
            try {
                if (data !== "") {
                    var dataObj = JSON.parse(data);
                    func(dataObj);
                }
                else {
                    func();
                }
            }catch(e) {
                GameLog("解析soocket.io 数据错误" + e + " eventName:" + eventName + " data:", data);
            }
        }else {
            GameLog("invlid soocket.io data:", data);
        }
    });
}

function GameServer()
{
    this.rooms = {};
    this._pdte = new Date().getTime();
    this._playerCache = {}; // 缓存玩家重复登录
    this._robots = {};
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
    
    PROCESS_COCOS_SOCKETIO(socket, 'loginMenu', function (data) {
        var ver = (typeof data === 'undefined' || typeof data.version === 'undefined') ? "1.0" : data.version;
        socket.emit('loginMenuBack', Config.GetBranch(ver).loginMenu);
    });
    
    PROCESS_COCOS_SOCKETIO(socket, 'homeButtons', function (data) {
        var ver = (typeof data === 'undefined' || typeof data.version === 'undefined') ? "1.0" : data.version;
        socket.emit('homeButtonsBack', Config.GetBranch(ver).homeButtons);
    });
    
    PROCESS_COCOS_SOCKETIO(socket, 'enterGame', function (data) {
        // 登录游戏
        if (typeof client.player !== 'undefined') {
            GameLog(socket.id + "repeat enterGame");
            return;
        }
        
        var loginType = data.loginType;
        var uniqueID = data.uniqueID;
        var name = data.name;
        var headUrl = data.headUrl;
        
        if (typeof uniqueID !== 'string' || uniqueID.length > 63) {
            GameLog("非法uniqueID.");
            return;
        }
        
        if (typeof server._playerCache[uniqueID] !== 'undefined') {
            GameLog("账号多次登录.");
            socket.emit("gameError", { msg : "账号已登录!"});
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
                else if (loginType === 'robot') {
                    data.name = userName;
                    data.headUrl = userHeadHurl;
                }
                
                // TODO:测试用的. 正式版不用
                GameDB.GetUserData(userId, function(result, dbData){
                    if (result === false) {
                        GameDB.InitForNewUser(userId);
                    }
                });
                
                socket.emit('enterGameBack', data);
                
                // 创建新用户
                var newPlayer = new Player();
                newPlayer.Init(uniqueID, userId, userName, userHeadHurl, socket);
                client.player = newPlayer;
                // 缓存玩家重复登录
                server._playerCache[uniqueID] = newPlayer;
                
                if (loginType === 'robot') {
                    GameLog("添加机器人:"+ userName);
                    server._robots[uniqueID] = newPlayer;
                    newPlayer.socket.join("robotChannel"); // 加入机器人频道
                }
            }
            else {
                UserDB.RegisterByUniqueID(uniqueID, loginType, function(success, insertId) {
                    var userId = insertId;
                    var userName = "unknow name";
                    var defaultHeadUrl = "https://wx.qlogo.cn/mmhead/Q3auHgzwzM5G2pXRJFPt9gt7gXw4VUgCV8FfibSiaN6z0Mic6sp80f7jg/96";
                    var userHeadHurl = "";
                    if (loginType === 'guest') {
                        //userName = "游客"+userId;
                        userName = ""+userId;
                        userHeadHurl = defaultHeadUrl;
                    }else if (loginType === 'weixin') {
                        userName = name;
                        userHeadHurl = headUrl;
                    }else if (loginType === 'robot') {
                        userName = name;
                        userHeadHurl = defaultHeadUrl;
                    }
                    
                    // 响应请求
                    var data = { userId : userId, loginType : loginType };
                    if (loginType === 'guest' || loginType === 'robot') {
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
                    
                    if (loginType === 'robot') {
                        GameLog("添加机器人:"+ userName);
                        server._robots[uniqueID] = newPlayer;
                        newPlayer.socket.join("robotChannel"); // 加入机器人频道
                    }
                });
            }
        });
    });
    
    PROCESS_COCOS_SOCKETIO(socket, 'reconnect', function (data) {
        var uniqueID = data.uniqueID;
        UserDB.GetUserInfo(uniqueID, function(success, results) {
            var userId = results[0].id;
            var userName = results[0].name;
            var userHeadHurl = results[0].headUrl;
            // 创建新用户
            var newPlayer = new Player();
            newPlayer.Init(uniqueID, userId, userName, userHeadHurl, socket);
            client.player = newPlayer;
            // 缓存玩家重复登录
            server._playerCache[uniqueID] = newPlayer;
            socket.emit('reconnectBack');
        });
    });
    
    PROCESS_COCOS_SOCKETIO(socket, 'createRoom', function (data) {
        // 创建房间
        if (typeof client.player === 'undefined') {
            return;
        }
        
        var player = client.player;
        var userId = player.id;
        var ruleId = data.ruleId & 0x7;
        var quanId = data.quanId;
        var hunCount = data.hunCount;
        var version = data.version;
        
        GameDB.GetUserData(userId, function(result, dbData){
            if (result === false) {
                GameLog("不合法的消息请求");
                return;
            }
            
            var roomCard = dbData.roomCard;
            var roomData = JSON.parse(dbData.roomData);
            
            if (typeof roomData.id !== 'undefined') {
                var now = new Date(roomData.time * MinuteToMicroSecond);
                GameLog("重复创建房间, 已有roomId=", roomData.id);
                GameLog("已创建房间时间", now);
                player.socket.emit("gameError", { msg : "重复创建房间, 已有roomId="+roomData.id});
                return;
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

            var rs =  server.CreateRoom(player, ruleId, quanId, hunCount);
            if (rs) {
                GameDB.UpdateRoomData(userId, Room.prototype.DBSaveRoomInfo(player.room));
                
                
                var ver = typeof version === 'undefined' ? "1.0" : version;
                if (Config.GetBranch(ver).createRoomAutoInviteRobot === true) {
                    server.InviteRobot(player.room.id);
                }
            }
        });
    });
    
    PROCESS_COCOS_SOCKETIO(socket, 'joinRoom', function (data) {
        GameLog('joinRoom');
        // 加入房间
        if (typeof client.player === 'undefined') {
            GameLog("不合法的消息请求");
            return;
        }
        
        var roomId = data.roomId;
        server.JoinRoom(client.player, roomId);
    });
    
    PROCESS_COCOS_SOCKETIO(socket, 'getRoomRecord', function (data) {
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
            var roomDataJSON = dbData.roomData;
            
            socket.emit('getRoomRecordBack', { roomCard : roomCard, roomData : roomDataJSON } );
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
        
        if (typeof this._robots[player.uniqueID] !== 'undefined') {
            player.socket.leave("robotChannel"); // 离开机器人频道
            GameLog("删除机器人:"+player.name);
            delete this._robots[player.uniqueID];
        }
        
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
    
    var userId = player.id;
    var room = new Room();
    room.Init(roomId, userId, ruleId, quanId, hunCount, 0, 0, 0);
    this.rooms[roomId] = room;
   
    // 发送创建成功.
    player.socket.emit('createRoomBack', Room.prototype.SendRoomInfo(room));
   
    // 添加玩家
    room.AddPlayer(player);
    player.room = room;
    
    return true;
}

GameServer.prototype.JoinRoom = function(player, roomId)
{
    GameLog(roomId);
    var room = null;
    var self = this;
    var userId = player.id;
    if (typeof this.rooms[roomId] === 'undefined' ||
        this.rooms[roomId] === null) {
        GameDB.GetUserData(userId, function(result, dbData){
            if (result === false) {
                return;
            }
            
            var roomData = JSON.parse(dbData.roomData);
            if (typeof roomData.id === 'number' &&
                roomData.id === roomId) {
                
                var ownerId = roomData.ownerId;
                var ruleId = roomData.ruleId;
                var quanId = roomData.quanId;
                var hunCount = roomData.hunCount;
                var playCount = roomData.playCount;
                var costMoney = roomData.costMoney;
                var bankerCount = roomData.bankerCount;
                
                room = new Room();
                room.Init(roomId, ownerId, ruleId, quanId, hunCount, playCount, costMoney, bankerCount);
                room.time = roomData.time;
                self.rooms[roomId] = room;
                
                // 响应消息
                player.socket.emit('joinRoomBack', Room.prototype.SendRoomInfo(room));
                
                // 添加玩家
                player.room = room;
                room.AddPlayer(player);
            }
            else {
                player.socket.emit("gameError", { msg : "房间不存在!"});
                return;
            }
        });
        return;
    }
    else {
        room = this.rooms[roomId];
        
        if (room.HasPlayer(player)){
            GameLog("重复加入房间!");
            return;
        }
        
        if (room.GetPlayerCount() === room.players.length || room.PlayerCanEnter(player) === false) {
            if (room.GetPlayerCount() === room.players.length) {
                // 人数已满!
                GameLog("房间人数已满!");
                player.socket.emit("gameError", { msg : "房间人数已满!"});
            }else {
                GameLog("并非原房间开局时参与的玩家!");
                player.socket.emit("gameError", { msg : "并非原房间开局时参与的玩家!"});
            }
            
            if (typeof this._robots[player.uniqueID] !== 'undefined') {
                // 机器人不写数据库
                return;
            }
            
            GameDB.GetUserData(userId, function(result, dbData){
                if (result === false) {
                    return;
                }
            
                var roomData = JSON.parse(dbData.roomData);
                if (typeof roomData.id === 'number' &&
                    roomData.id === roomId) 
                {
                    GameDB.UpdateRoomData(userId, {});
                    GameLog("清空玩家数据记录");
                }
            });
            return;
        }
        
        // 响应消息
        player.socket.emit('joinRoomBack', Room.prototype.SendRoomInfo(room));
        
        // 添加玩家
        player.room = room;
        room.AddPlayer(player);
        
        
        if (typeof this._robots[player.uniqueID] !== 'undefined') {
            // 机器人不写数据库
            return;
        }
        
        // 写入记录到数据库
        GameDB.UpdateRoomData(userId, Room.prototype.DBSaveRoomInfo(room));
    }
}

// 邀请机器人
GameServer.prototype.InviteRobot = function(roomId) {
    IO.to("robotChannel").emit('inviteJionRoom', { roomId : roomId} );
}

// 显示所有房间
GameServer.prototype.ShowRooms = function() {
    var count = 0;
    var playerCount = 0;
    var room;
    for (key in this.rooms) {
        room = this.rooms[key];
        if (room) {
        
            GameLog(room.roomName, "房间有" + room.GetPlayerCount() + "个在线玩家");
            ++count;
            playerCount += room.GetPlayerCount();
        }
    }
    GameLog("总共有["+count+"]个房间,游戏中玩家[" +playerCount+ "]个");
}

