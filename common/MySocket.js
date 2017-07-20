
/**
 * Module exports.
 */

 var WebSocket = require('ws');

if(typeof module !== 'undefined')
    module.exports = MySocket;

function SocketProxy(mng, ws, ip) {
    this.interest = {};
    this.mng = mng;
    this.ws = ws;
    this.ip = ip;
}

SocketProxy.prototype.Init = function() {

    this.ws.on('close', function(self){
        return function(event) {
            if (typeof self.interest === 'object' && typeof self.interest['disconnect'] === 'function') {
                self.interest['disconnect'](event);
            }
        }
    }(this));
    
    this.ws.on('message', function(self) {
        return function(message) {
            if (typeof self.interest === 'object' && typeof message === 'string') {
                if (typeof self.interest[message] === 'function') {
                    self.interest[message]();
                }
                else {
                    try {
                        
                        if (typeof message === 'string') {
                            if (message === '{"event":"heartbeat"}') {
                            
                            }
                            else {
                                // console.log(message, typeof message);
                            }
                            var obj = JSON.parse(message);
                            if (typeof obj.event === 'string' && typeof self.interest[obj.event] === 'function'){
                                self.interest[obj.event](obj.data);
                            }
                        }else {
                            console.log(message, typeof message);
                        }
                    } catch (e) {
                        console.log(e);
                    }
                }
            }
            
        }
    }(this));
}

SocketProxy.prototype.on = function(event, func) {
    this.interest[event] = func;
}

SocketProxy.prototype.join = function(roomName) {
    if (typeof roomName === 'string') {
        if (typeof this.mng.rooms[roomName] === 'undefined') {
            this.mng.rooms[roomName] = new Array();
        }
        this.mng.rooms[roomName].push(this);
        // console.log('join ' + roomName);
    }else {
        console.log('roonName mu be string type');
    }
}

SocketProxy.prototype.leave = function(roomName) {
    if (typeof roomName === 'string') {
        var room = this.mng.rooms[roomName];
        if (typeof room === 'object') {
            var index = room.indexOf(this);
            if (index > -1) {
                room.splice(index, 1);
                // console.log('leave ' + roomName);
            }
        }
    }else {
        console.log('roonName mu be string type');
    }
}


SocketProxy.prototype.disconnect = function() {
    this.ws.close();
}

SocketProxy.prototype.emit = function(event, data) {
    var pack = { event : event };
    if (typeof data !== 'undefined' && data !== null) pack.data = data;
    if (this.ws.readyState === WebSocket.OPEN)
        this.ws.send(JSON.stringify(pack));
}

function MySocket()
{
    this.interest = {};
    this.rooms = {};
}

MySocket.prototype.Init = function(websocketSrv, expressWs) {
    var self = this;
    var wss = websocketSrv;
    
    wss.ws('/', function(newSocket, req) {
        if (typeof self.interest['connection'] === 'function') {
            var proxy = new SocketProxy(self, newSocket, req.connection.remoteAddress);
            proxy.Init();
            self.interest['connection'](proxy);
        }
    });
    
    this.wss = wss;
    this.expressWs = expressWs;
}

MySocket.prototype.on = function(event, func) {
    this.interest[event] = func;
}

MySocket.prototype.emit = function(event, data) {
    var aWss = this.expressWs.getWss('/');
    aWss.clients.forEach(function (socket) {
        var pack = { event : event };
        if (typeof data !== 'undefined' && data !== null) pack.data = data;
        if (socket.readyState === WebSocket.OPEN)
            socket.send(JSON.stringify(pack));
    });
}

MySocket.prototype.to = function(roomName) {

    if (typeof roomName === 'string') {
        var room = this.rooms[roomName];
        if (typeof room === 'object') {
            return new function() {
                this.emit = function (event, data) {
                    for (var r = 0; r < room.length; ++r) {
                        if (room[r] instanceof SocketProxy) {
                            room[r].emit(event, data);
                        }
                    }
                }
            }
        }else {
            return new function() { 
                this.emit = function () {}
            }
        }
    }else {
        console.log('roonName mu be string type');
    }
}

