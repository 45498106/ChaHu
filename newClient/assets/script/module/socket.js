// 18:30 2017/3/22
// create by lsh

var Socket = function() {
    this.init = false;
}
  
Socket.prototype.Init = function() {
    this.init = true;
    
    this.connected = false;
    this.socket = null;
    this.pingInterval = 0;
    this.connected = false;
}
    
Socket.prototype.Connect =  function (address, port, router) 
{
    var self = this;
    if (self.connected) 
        return;
    
    if (typeof io === 'undefined') {
        GameLog("SocketIO unable to loaded !!!");
        return;
    }
    
    try {
        
        var socket = io.connect("http://" + address + ":" + port + "/" + (typeof router !== "undefined" ? router : ""));
        self.socket = socket;
        
        var heartbeatTime = new Date().getTime();
        var heartbeatHandler = setInterval(function() {
            heartbeatTime = new Date().getTime();
            if (self.socket && self.connected === true) {
                self.socket.emit('heartbeat');
            }
        }, 1000);

        socket.on('clientJoin', function(data) {
            //AppendText(data.name + " client 加入.");
        });

        socket.on('clientDisconnect', function(data) {
            //AppendText(data.name + " client 离开.");
        });

        socket.on('heartbeatBack', function() {
            var interval = new Date().getTime() - heartbeatTime;
            self.pingInterval = interval;
            //console.log("ping : " + interval + " MS");
        });

        socket.on('connect', function() {
            self.connected = true;
            GameLog("连接成功");
            GameEvent().SendEvent('connectedServer');
        });

        socket.on('disconnect', function() {
            self.connected = false;
            GameEvent().SendEvent('disconnectedServer');
            GameLog("你已经断开链接. 请刷新页面.");
            if (heartbeatHandler) {
                clearInterval(heartbeatHandler);
                heartbeatHandler = null;
            }
        });
        
        // 注册handle
        MessageHandler.SocketRegister(socket);
    } catch (e) {
        GameLog(e);
    }
}
    
Socket.prototype.IsConnected = function() {
    return this.connected;
}
    
Socket.prototype.OnReceiveMessage = function (e) {
    var msg = e.data;
    console.log("Receive data:" + msg);
    try {
        var msgObj = JSON.parse(msg);
        MessageHandler.Process(msgObj);
    }
    catch (e) {
        GameLog(e);
    }
}
    
Socket.prototype.Send = function (protocol, msg) {
    if (this.connected) {
        this.socket.emit(protocol, msg);
    }
}

if(typeof module !== 'undefined')
    module.exports = new Socket();