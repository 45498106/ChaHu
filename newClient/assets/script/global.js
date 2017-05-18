window.GameHost = "chahu.h5ii.com";
window.GamePort = 18080;
window.LogHost = "chahu.h5ii.com";
window.LogPort = 38086;

/*
if (!cc.sys.isNative) {
    cc.loader.load("http://" + window.GameHost+':' + window.GamePort + '/socket.io/socket.io.js', 
        function (err, tex) {
            if (err) {
                
                alert("无法连接服务器,请检查网络是否正常!");
                return;
            }
        }
    );
} else {
    window.io = SocketIO;
}*/

function CreateLogger(useNet) {
    if (typeof window.logger === "undefined") {
        window.logger = require("logger");
        if (useNet === true) {
            window.logger.socket = new WebSocket("ws://" + window.LogHost+':' + window.LogPort);
            window.logger.socket.onopen = function() {
                if (typeof window.logger.socket.connected === 'undefined') {
                    window.logger.socket.connected = true;
                }
            };
        }
    }
}

window.GameLog = function(msg) {

    if (typeof window.logger === "undefined") {
        cc.log(msg);
        return;
    }

    var args = Array.prototype.slice.call(arguments);
    window.logger.apply(logger, args);
}

window.GameEvent = function() { 
    var gameEvent = require("gameEvent"); 
    return gameEvent.inst;
}

window.GameSocket = function() { 
    var gameSocket = require("socket");
    return  gameSocket; 
}

window.AudioMng = function() {
    var audioMng = require("AudioMng");
    return audioMng.inst;
}


window.SetSpriteImage = function(sprite, url, localRes) {
    
    if (typeof localRes !== 'undefined' && localRes !== false) {
        cc.loader.loadRes(url, cc.SpriteFrame, function (err, spriteFrame) {
            sprite.spriteFrame = spriteFrame;
        });
    }
    else {
        if (!cc.sys.isNative) {
            var img = new Image();
            img.src = typeof url === 'object' ? url.url : url;
            img.onload = function() {
                var texture = new cc.Texture2D();
                texture.generateMipmaps = false;
                texture.initWithElement(img);
                texture.handleLoadedTexture();
                var newFrame = new cc.SpriteFrame(texture);
                sprite.spriteFrame = newFrame;
            }
        }else {
            cc.loader.load(url, function (err, tex) {
                var success = (tex instanceof cc.Texture2D);
                GameLog("err: " + err + " load a texture from external url: " + url + " status: " + success);
                if(success){
                    var newFrame = new cc.SpriteFrame(tex);
                    sprite.spriteFrame = newFrame;
                }
            });
        }
    }
}


window.CardSpriteFrameCache = new Array(5);

for (var l = 0; l < 5; ++l) {
    CardSpriteFrameCache[l] = new Array(50);
    for (var i = 0; i < 50; ++i) {
        CardSpriteFrameCache[l].push(null);
    }
}

window.LoadAllCardSpriteFrame = function() {
    var nameArry = [null,'left', 'down', 'right', 'up'];
    
    var delegate = function(d, i) {
        return function (err, spriteFrame) {
            if (!err) {
                window.CardSpriteFrameCache[d-1][i] = spriteFrame;
            }
            //else {
            //    GameLog(err+d+'-'+i);
            //}
        }
    } 
    
    for (var d = 1; d <= 4; ++d) {
        for (var i = 0; i < 50; ++i) {
            cc.loader.loadRes(d+'/'+nameArry[d]+i, cc.SpriteFrame, delegate(d,i));
        }
    }
    
    for (var ii = 0; ii < 50; ++ii) {
        cc.loader.loadRes('2/sdown'+ii, cc.SpriteFrame, delegate(5,ii));
    }
}
