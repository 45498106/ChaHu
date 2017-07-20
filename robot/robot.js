

Util = require("./../common/Utility.js");
const WebSocket = require('ws');

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
                    
                        if (typeof event.data === 'string') {
                            if (event.data === '{"event":"heartbeat"}') {
                            }
                            else {
                                console.log(event.data, typeof event.data);
                            }
                            var obj = JSON.parse(event.data);
                            if (typeof obj.event === 'string' && typeof self.interest[obj.event] === 'function'){
                                self.interest[obj.event](obj.data);
                            }
                        }else {
                            console.log(event.data, typeof event.data);
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
    if (this.ws.readyState === WebSocket.OPEN)
        this.ws.send(JSON.stringify(pack));
}

SocketProxy.prototype.send = function(event) {
    if (typeof event === 'string') {
        if (this.ws.readyState === WebSocket.OPEN)
            this.ws.send(event);
    }
}

GameLog = require('./../common/Logger.js');

var RobotUniqueIDs = [
    "rb8e92ac193a2d2994ef3ebaf79218d277",
    "rb7307aa964c82f980b24de6367bec471f",
    "rb73fa0adf6d85d35ade3bee71b51a3f9c",
    "rbab4575268f3b70912db394320ae27da6",
    "rb58e72183d15801ca7426f4a0507d9ea7",
    "rb7950c84acf574502a19ddade81fde96d",
    "rb9e1068ef1f9be75d56b0277f7dc29a27",
    "rbbdf58cfa8072dc7a8b01906c7747165a",
    "rbed11d09e6df14df276b80ad0401de3f6",
    "rb2c8822fb873a41f64f148d91437dc55c",
    "rbe0823d475f1009693759ef70c64e8c2e",
    "rbd1b3507fdc5a41c7bb82dc280939090d",
    "rb89dfffb547ccce5fadea52d82f32484a",
    "rb909f98a5f7475152972e9197f038a22b",
    "rb240c335f889e027ba4737ef239ba3086",
    "rb84f61a1fc2e60dd05855fc4faf73c3b1",
    "rbcd43d3219f38840c6a04d0be675c7a8a",
    "rb4891b1f8bd8a8f25e29955aeb1a06090",
    "rb30633ce4457aed4a0b5aae0636c25708",
    "rb630c23a1144bfd6451bcc1a2689038af",
];

var RobotNames = [
    "robot1",
    "robot2",
    "robot3",
    "robot4",
    "robot5",
    "robot6",
    "robot7",
    "robot8",
    "robot9",
    "robot10",
    "robot11",
    "robot12",
    "robot13",
    "robot14",
    "robot15",
    "robot16",
    "robot17",
    "robot18",
    "robot19",
    "robot20",
];

function Player(id, name) {
    this.id = id;
    this.name = name;
    this.cards = null;
}

function Boot(robotId) {

    try
    {
        const ws = new WebSocket('ws://localhost:18080');
        var socket = new SocketProxy(ws);
        socket.Init(); 
        socket.robotId = robotId;

        var heartbeatTime = new Date().getTime();
        var heartbeatHandler = setInterval(function() {
            heartbeatTime = new Date().getTime();
            if (socket && socket.connected === true) {
                socket.emit('heartbeat');
            }
        }, 100000);

        socket.on('heartbeatBack', function() {
            var interval = new Date().getTime() - heartbeatTime;
            socket.pingInterval = interval;
            //console.log("ping : " + interval + " MS");
        });

        socket.on('connect', function() {
            socket.connected = true;
            GameLog(socket.robotId+"连接成功");
            
            
            Start(socket);
        });

        socket.on('disconnect', function() {
            socket.connected = false;
            delete socket.player;
            GameLog(socket.robotId+"已经断开链接.");
            if (heartbeatHandler) {
                clearInterval(heartbeatHandler);
                heartbeatHandler = null;
            }
            //socket.Connect(address, port, router);
        });

        socket.on('error', function(event) {
           socket.connected = false;
           GameLog("webSocket throw a error"+event);
        });
        
        Register(socket);
        
    } catch (e) {
        GameLog(e);
    }
}

function SimpleClone(src) {
    var dst = {}
    for (var key in src) {
        dst[key] = src[key]
    }
    return dst;
}

function Register(socket) {

    
    //socket.on('loginMenuBack', function(msg) {
    //    GameLog("loginMenuBack",msg);
    //});
    
    //socket.on('homeButtonsBack', function(msg) {
    //    GameLog("homeButtons",msg);
    //});
    
    socket.on('enterGameBack', function(msg) {
        //GameLog("enterGameBack",msg);
        socket.player = new Player(msg.userId, msg.name);
    });
    
    socket.on('inviteJionRoom', function(msg) {
        //GameLog("inviteJionRoom",msg);
        if (typeof socket.player.roomData === 'undefined') {
            var roomId = msg.roomId;
            var data = {
                roomId : roomId,
            };
            
            socket.emit('joinRoom', data);
        }
    });
    
    socket.on('joinRoomBack', function(msg) {
        socket.player.roomData = JSON.parse(msg);
        GameLog(socket.robotId+"加入房间:"+socket.player.roomData.id);
    });
    
    socket.on('exitRoomBack', function(msg) {
        GameLog("exitRoomBack",msg);
        var playerId = msg;
        if (socket.player.roomData.ownerId === playerId) {
            GameLog(socket.robotId+"离开房间:"+socket.player.roomData.id);
            delete socket.player.roomData;
        }
    });
    
    socket.on('accounts', function(msg) {
        GameLog("accounts", msg);
        if (typeof msg.gameEnd !== 'undefined') {
            GameLog(socket.robotId+"离开房间:"+socket.player.roomData.id);
            delete socket.player.roomData;
        }
    });
    
    socket.on('ready', function(msg) {
        socket.emit('ready');
    });
    

    socket.on('newGame', function(msg) {
        //GameLog("newGame", msg);
    });
    
    socket.on('newPlayer', function(msg) {
        //GameLog("newPlayer", msg);
        if (msg.id === socket.player.id) {
            socket.player.place = msg.place;
        }
    });
    
    socket.on('initCards', function(msg) {
        //GameLog("initCards", msg);
        if (msg.place === socket.player.place) {
            socket.player.cards = msg.cards.slice();
            GameLog("initCards", msg.cards);
        }
    });
    
    socket.on('getCard', function(msg) {
        //GameLog("getCard", msg);
        var place = msg.place;
        var card = msg.card;
        if (place === socket.player.place) {
            PassOperation(socket, msg);
            socket.player.cards.push(card);
            setTimeout(function(socket, card){
                return function() {
                     socket.emit('needThrowCard', { card : card});
                }
            }(socket, card), 1000);
        }
    });
    
    socket.on('throwCard', function(msg) {
        //GameLog("throwCard", msg);
        var place = msg.palce;
        var card = msg.card;
        if (place === socket.player.place) {
            Util.ArrayRemoveElement(socket.player.cards, card)
        }
        
        PassOperation(socket, msg);
    });
}

function PassOperation(socket, data) {
    if (typeof data.jiang !== 'undefined' || typeof data.niu !== 'undefined' ||
        typeof data.kan !== 'undefined' || typeof data.peng !== 'undefined' ||
        typeof data.gang !== 'undefined' || typeof data.hu !== 'undefined' ||
        typeof data.zha !== 'undefined' || typeof data.chi !== 'undefined')
    {
        GameLog('passCards');
        socket.emit('passCards');
    }
}

function Start(socket) {
    
    var data = {
        loginType : "robot",
        uniqueID : RobotUniqueIDs[socket.robotId],
        name : RobotNames[socket.robotId],
    }
   
    socket.emit('enterGame', data);
}

if(typeof module !== 'undefined')
    module.exports.Boot = Boot;
