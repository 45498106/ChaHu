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
    this.ws.close();
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
    
    this.doReconnect = false;
    this.connected = false;
    this.socket = null;
    this.pingInterval = 0;
    this.firstConnected = true;
    this.manualDisconnect = false;  // 主动断开链接
}
    
Socket.prototype.Connect =  function (address, port, router) 
{
    var self = this;
    if (self.connected)
        return;
    
    self.address = address;
    self.port = port;
    self.router = router;

    self.manualDisconnect = false;
    
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
            Notify().Continue();
            if (self.firstConnected === false) {
                GameEvent().SendEvent('reconnectedServer');    
            }else {
                GameEvent().SendEvent('connectedServer');
            }
            self.firstConnected = false;
        });

        socket.on('disconnect', function() {
            GameEvent().SendEvent('disconnectedServer');
            GameLog("你已和服务器断开链接.");
            var connected = self.connected;
            self.connected = false;

            if (self.manualDisconnect === true) {
                return; // 如果手动断开，不尝试重新连接服务器
            }

            if (self.firstConnected === false || self.doReconnect) {
                Notify().Play("与服务器断开链接,努力重连接中!", true);
            }else {
                Notify().Play("请检查网络链接状态!", true);
            }

            if (heartbeatHandler) {
                clearInterval(heartbeatHandler);
                heartbeatHandler = null;
            }

            self.Reconnect();         
        });
        
        socket.on('error', function(event) {
           GameEvent().SendEvent('socket throw error');
           GameLog("webSocket throw a error"+event);
        });
        
        // 注册handle
        MessageHandler.SocketRegister(socket);
    } catch (e) {
        GameLog(e);
    }
}

Socket.prototype.Reconnect = function() {
    setTimeout(function() {
        Notify().PlayWaitSrv();
        this.doReconnect = true;
        this.Connect(this.address, this.port, this.router);
    }.bind(this), 5000);
}
    
Socket.prototype.IsConnected = function() {
    return this.connected;
}

Socket.prototype.Disconnect = function() {
    this.manualDisconnect = true;
    this.firstConnected = true;
    this.socket.disconnect();
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