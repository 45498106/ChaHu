// 18:30 2017/3/22
// create by lsh


function SocketProxy(ws) {
    this.interest = {};
    this.ws = ws;
}

SocketProxy.prototype.Init = function() {
    
    // 连接成功建立的回调方法
    this.ws.onopen = function(self){
        return function(event) {
            if (typeof self.interest === 'object' && typeof self.interest['connect'] === 'function') {
                self.interest['connect'](event);
            }
        }
    }(this);
    
    // 连接发生错误的回调方法
    this.ws.onerror = function(self){
        return function(event) {
            if (typeof self.interest === 'object' && typeof self.interest['error'] === 'function') {
                self.interest['error'](event);
            }
        }
    }(this);
    
    // 连接关闭的回调方法
    this.ws.onclose = function(self){
        return function(event) {
            if (typeof self.interest === 'object' && typeof self.interest['disconnect'] === 'function') {
                self.interest['disconnect'](event);
            }
        }
    }(this);
    
    // 接收到消息的回调方法
    this.ws.onmessage = function(self) {
        return function(event) {
            if (typeof self.interest === 'object' && typeof event.data === 'string') {
                if (typeof self.interest[event.data] === 'function') {
                    self.interest[event.data]();
                }
                else {
                    try {
                        console.log(event.data);
                        var obj = JSON.parse(event.data);
                        if (typeof obj.event === 'string' && typeof self.interest[obj.event] === 'function'){
                            self.interest[obj.event](obj.data);
                        }
                    } catch (e) {
                        console.log(e);
                    }
                }
            }
            
        }
    }(this);
}

SocketProxy.prototype.on = function(event, func) {
    this.interest[event] = func;
}

SocketProxy.prototype.disconnect = function() {
    this.ws.terminate();
}

SocketProxy.prototype.emit = function(event, data) {
    var pack = { event : event };
    if (typeof data !== 'undefined' && data !== null) pack.data = data;
    this.ws.send(JSON.stringify(pack));
}

SocketProxy.prototype.send = function(event) {
    if (typeof event === 'string') {
        this.ws.send(event);
    }
}

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
        
        var webSocket = new WebSocket("ws://" + address + ":" + port + "/" + (typeof router !== "undefined" ? router : ""));
        //var socket = io.connect("http://" + address + ":" + port + "/" + (typeof router !== "undefined" ? router : ""));
        self.socket = new SocketProxy(webSocket);
        var socket = self.socket;
        socket.Init();
    
        var heartbeatTime = new Date().getTime();
        var heartbeatHandler = setInterval(function() {
            heartbeatTime = new Date().getTime();
            if (self.socket && self.connected === true) {
                self.socket.emit('heartbeat');
            }
        }, 100000);

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