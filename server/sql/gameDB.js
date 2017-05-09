// 16:26 2017/5/7

function GameDB()
{

}

// 初始化为用户
GameDB.prototype.InitForNewUser = function(userId, callbck) {
    var initRoomCard = 100;
    var initRoomData = {};
    var initRoomDataJson = JSON.stringify(initRoomData);
    var cmd = "INSERT INTO `game` VALUES (?, ?, ?);"
    mysql.Query2(cmd, [userId, initRoomCard, initRoomDataJson], function (results, fields) {
        if (typeof callbck === 'function') { callbck(true, initRoomCard, initRoomData); }
    });
}

// 获得游戏数据
GameDB.prototype.GetUserData = function(userId, callbck) {
    var cmd = "SELECT `roomCard`,`roomData` FROM `game` where `userId`=?;";
    mysql.Query2(cmd, [userId], function (results, fields) {
        if (results.length === 0) {
            GameLog("玩家的游戏数据不存在! userId=", userId);
            if (typeof callbck === 'function')  { callbck(false, null); }
        }
        else {
            if (typeof callbck === 'function') { callbck(true, { roomCard : results[0].roomCard,  roomData : results[0].roomData }) };
        }
    });
}

// 更新房卡
GameDB.prototype.UpdateRoomCard = function(userId, roomCard, callbck)
{
    var cmd = "UPDATE `game` SET `roomCard` WHERE `userId`=?";
    mysql.Query2(cmd, [roomCard, userId], function (results, fields) {  
        if (typeof callbck === 'function') { callbck(true, results); }
    });
}

// 更新房间数据
GameDB.prototype.UpdateRoomData = function(userId, roomData, callbck) {
    var roomDataJson = JSON.stringify(roomData);
    var cmd = "UPDATE `game` SET `roomData`=? WHERE `userId`=?";
    mysql.Query2(cmd, [roomDataJson, userId], function (results, fields) {  
        if (typeof callbck === 'function') { callbck(true, results); }
    });
}

// 更新游戏数据
GameDB.prototype.Update = function(userId, roomCard, roomData, callbck) {
    var roomDataJson = JSON.stringify(roomData);
    var cmd = "UPDATE `game` SET `roomCard`=?,`roomData`=? where `userId`=?;";
    mysql.Query2(cmd, [roomCard, roomDataJson, userId], function (results, fields) {  
        if (typeof callbck === 'function') { callbck(true, results); }
    });
}

if(typeof module !== 'undefined')
    module.exports = new GameDB();
