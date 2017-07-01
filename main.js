/*
    server websocket framework.
*/

var express = require('express');
var app = express();
var expressWs = require('express-ws')(app);
//IO = require('socket.io')(http);

Config = require('./config.js');
Util = require("./common/Utility.js");
GameLog = require('./common/Logger.js');

GameServer = new (require('./server/GameServer.js'))();
GameServer.Init();

// 设置客户端根目录
app.use(express.static(__dirname + "/client"));
// 监听端口
var listenPort = Config.listenPort;
app.listen( listenPort, function() {
    console.log('[DEBUG] Listening on *:' + listenPort);
});

mysql = new (require("./mysql.js"))();
var host = Config.db_host;
var port = Config.db_port;
var database = Config.db_database;
var user = Config.db_user;
var password = Config.db_password;
mysql.Init(host, port, database, user, password);

//--------------------------------------------------
// 常量
//--------------------------------------------------
var c_HeartbeatCheckMS = 100000;          //心跳检测毫秒数
var c_HeartbeatCheckTimeoutCount = 3;   //心跳检测超时数量

//--------------------------------------------------
// 全局变量
//--------------------------------------------------
var clients = [];

IO = new (require('./common/MySocket.js'));
IO.Init(app, expressWs);

IO.on('connection', function (socket) {
    GameLog('Client [ ' + socket.ws._ultron.id + ' (' + socket.ip + ')] connected!');
    
    // 创建一个客户链接信息.
    var client = { 
                    id: socket.ws._ultron.id, 
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
        GameLog('Client [ ' + client.id + ' (' + client.socket.ip + ')] disconnected!');

        // 通知gameServer 删除client
        GameServer.DeleteClient(client);
        
        IO.emit('clientDisconnect', { name: client.id  });
            
        var idx = Util.FindIndexById(clients, client.id);
        if ( idx >= 0 ) {
            clients.splice(idx, 1);
        }
            
        GameLog('Total client: ' + clients.length);
    });
    
    // 通知gameServer 进入新client
    GameServer.NewClient(client);
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


// 间隔输出内存使用情况
var c_IntervalShowMemoryUsage = 24 * 60 * 60 * 1000;

function ShowMemoryUsage() {
    var usage =  process.memoryUsage();
    GameLog( "rss:"+(usage.rss / 1048576).toFixed(2)+"mb\t" +
             "heapTotal:"+(usage.heapTotal / 1048576).toFixed(2)+ "mb\t" +
             "heapUsed:"+(usage.heapUsed / 1048576).toFixed(2)+"mb");
}

app.get('/ShowMemoryUsage', function(req, res){
    ShowMemoryUsage();
    res.statusCode = 200;
    res.end();
});

app.get('/ShowRooms', function(req, res){
    GameServer.ShowRooms();
    res.statusCode = 200;
    res.end();
});
// 内存使用情况
setInterval(ShowMemoryUsage, c_IntervalShowMemoryUsage);
