/*
    server websocket framework.
*/

var express = require('express');
var app = express();
var http = require('http').Server(app);
IO = require('socket.io')(http);

Util = require("./common/Utility.js");
GameLog = require('./common/Logger.js');

var gameServer = new (require('./server/GameServer.js'))();
gameServer.Init();

// 设置客户端根目录
app.use(express.static(__dirname + "/client"));
// 监听端口
var port = process.env.LEANCLOUD_APP_PORT || 80
http.listen( port, function() {
    console.log('[DEBUG] Listening on *:' + port);
});

//--------------------------------------------------
// 常量
//--------------------------------------------------
var c_HeartbeatCheckMS = 60*1000;          //心跳检测毫秒数
var c_HeartbeatCheckTimeoutCount = 2;   //心跳检测超时数量

//--------------------------------------------------
// 全局变量
//--------------------------------------------------
var clients = [];

IO.on('connection', function (socket) {
    GameLog('Client [' + socket.id + '] connected!');
    
    // 创建一个客户链接信息.
    var client = { 
                    id: socket.id, 
                    socket : socket,
                    timeoutCount : 0,
                    heartbeatTime : new Date().getTime(), 
                    SetHeartbeatTime : function() { this.heartbeatTime = new Date().getTime() },
                };

    clients.push(client);
    
    IO.emit('clientJoin', { name: client.id });
    
    GameLog('Total client: ' + clients.length);
    
    // 心跳响应
    socket.on('heartbeat', function () {
        client.SetHeartbeatTime();
        socket.emit('heartbeatBack');
    });
    
    // 断开链接
    socket.on('disconnect', function () {
        GameLog('Client [' + client.id + '] disconnected!');

        // 通知gameServer 删除client
        gameServer.DeleteClient(client);
        
        client.socket.broadcast.emit('clientDisconnect', { name: client.id  });
            
        var idx = Util.FindIndexById(clients, client.id);
        if ( idx >= 0 ) {
            clients.splice(idx, 1);
        }
            
        GameLog('Total client: ' + clients.length);
    });
    
    // 通知gameServer 进入新client
    gameServer.NewClient(client);
});

// 检测客户心跳
function CheckClientHeartbeat()
{
    var now = new Date().getTime();
    
    for (var i = clients.length - 1; i >=0; --i) {
        var client = clients[i];
        if (now - client.heartbeatTime > c_HeartbeatCheckMS) {
            ++client.timeoutCount;
            if (client.timeoutCount > c_HeartbeatCheckTimeoutCount) {
                // 超过超时次数,断开客户链接
                client.socket.disconnect();
            }
        }else {
            client.timeoutCount = 0;
        }
    }
}

setInterval(CheckClientHeartbeat, c_HeartbeatCheckMS);