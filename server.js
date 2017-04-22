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

// ���ÿͻ��˸�Ŀ¼
app.use(express.static(__dirname + "/client"));
// �����˿�
var port = process.env.LEANCLOUD_APP_PORT || 80
http.listen( port, function() {
    console.log('[DEBUG] Listening on *:' + port);
});

//--------------------------------------------------
// ����
//--------------------------------------------------
var c_HeartbeatCheckMS = 60*1000;          //������������
var c_HeartbeatCheckTimeoutCount = 2;   //������ⳬʱ����

//--------------------------------------------------
// ȫ�ֱ���
//--------------------------------------------------
var clients = [];

IO.on('connection', function (socket) {
    GameLog('Client [' + socket.id + '] connected!');
    
    // ����һ���ͻ�������Ϣ.
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
    
    // ������Ӧ
    socket.on('heartbeat', function () {
        client.SetHeartbeatTime();
        socket.emit('heartbeatBack');
    });
    
    // �Ͽ�����
    socket.on('disconnect', function () {
        GameLog('Client [' + client.id + '] disconnected!');

        // ֪ͨgameServer ɾ��client
        gameServer.DeleteClient(client);
        
        client.socket.broadcast.emit('clientDisconnect', { name: client.id  });
            
        var idx = Util.FindIndexById(clients, client.id);
        if ( idx >= 0 ) {
            clients.splice(idx, 1);
        }
            
        GameLog('Total client: ' + clients.length);
    });
    
    // ֪ͨgameServer ������client
    gameServer.NewClient(client);
});

// ���ͻ�����
function CheckClientHeartbeat()
{
    var now = new Date().getTime();
    
    for (var i = clients.length - 1; i >=0; --i) {
        var client = clients[i];
        if (now - client.heartbeatTime > c_HeartbeatCheckMS) {
            ++client.timeoutCount;
            if (client.timeoutCount > c_HeartbeatCheckTimeoutCount) {
                // ������ʱ����,�Ͽ��ͻ�����
                client.socket.disconnect();
            }
        }else {
            client.timeoutCount = 0;
        }
    }
}

setInterval(CheckClientHeartbeat, c_HeartbeatCheckMS);