window.GameHost = "192.168.1.222";
window.GamePort = 18080;
window.LogHost = "chahu.h5ii.com";
window.LogPort = 38086;
window.GameVersion = "1.1";


if (cc.sys.isNative) {
    if (cc.sys.os === cc.sys.OS_ANDROID) {
        window.GameVersion = "android" + window.GameVersion;
    }else if (cc.sys.os === cc.sys.OS_IOS) {
        window.GameVersion = "ios" + window.GameVersion;
    }
}
else {
    if (cc.sys.isMobile) {
        window.GameVersion =  "webMobile" + window.GameVersion;
    }else {
        window.GameVersion = "web" + window.GameVersion;
    }
}

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

window.Notify = function() {
    var notify = require("notifyAnim");
    return notify.inst;
}

window.OpenSetting = function(open) {
    var setting = require("setting")
    if (typeof open === 'boolean' && !open) {
        setting.inst.OnHide();
    }else {
        setting.inst.OnShow();
    }
}

window.GetUniqueID = function(callback) {
    if (!cc.sys.isNative) {
        var Fingerprint2 = require('fingerprint2.min');
        new Fingerprint2().get(function(fingerId, components){
            if (callback) {
                callback(fingerId);
            }
        });
    }
    
    else if (cc.sys.os === cc.sys.OS_ANDROID) {
        if (callback) {
            var androidUdid = jsb.reflection.callStaticMethod("org/openudid/OpenUDID_manager", "getOpenUDID", "()Ljava/lang/String;") 
            GameLog("Android UDID: "+androidUdid);
            callback(androidUdid);
        }
    }else if (cc.sys.os === cc.sys.OS_IOS) {
        if (callback) {
            var udid = jsb.reflection.callStaticMethod("OpenUDID", 'value');
            callback(udid);
        }
    }
}

window.Voice = function() {
    if (typeof window.gameVoice === 'undefined') {
        window.gameVoice = new (require("Voice"))();
    }
    return window.gameVoice;
}

window.UploadRecordedFileSuccess = function (fileID) {
    window.Voice().UploadCallback(fileID);
}

window.DownloadRecordedFileSuccess = function (fileID) {
    window.Voice().DownloadCallback(fileID);
}

window.PlayRecordedFileEnd = function(filePath) {
    window.Voice().PlayRecordedFileEnd(filePath);
}

window.WeiXin = function() {
    if (typeof window.weiXinModule === 'undefined') {
        window.weiXinModule = new (require("weiXin"))();
    }
    return window.weiXinModule;
}

window.WeiXinCodeToAccessToken = function(native, code) {
    var weiXin = window.WeiXin();
    weiXin.CodeToAccessToken(native, code, weiXin.GetCallBack());
}

window.SetRoomIdByUrlScheme = function(roomid) {
    window.schemeRoomId = parseInt(roomid);
}

window.SetSpriteImage = function(sprite, url, localRes) {
    var nowTime = new Date();
    sprite.lastSetSpriteImageTime = nowTime;
    if (typeof localRes !== 'undefined' && localRes !== false) {
        cc.loader.loadRes(url, cc.SpriteFrame, function(nowTime, sprite) {
            return function (err, spriteFrame) {
                if (sprite.lastSetSpriteImageTime > nowTime) { return }
                sprite.spriteFrame = spriteFrame;
            }
        }(nowTime, sprite));
    }
    else {
        /*
        if (!cc.sys.isNative) {
            var img = new Image();
            img.src = typeof url === 'object' ? url.url : url;
            img.onload = function(nowTime, sprite) {
                return function() {
                    GameLog(sprite.lastSetSpriteImageTime.getTime(), nowTime.getTime());
                    if (sprite.lastSetSpriteImageTime > nowTime) { return }
                    var texture = new cc.Texture2D();
                    texture.generateMipmaps = false;
                    texture.initWithElement(img);
                    texture.handleLoadedTexture();
                    var newFrame = new cc.SpriteFrame(texture);
                    sprite.spriteFrame = newFrame;
                }
            }(nowTime, sprite);
        }else {*/
            cc.loader.load(url, function(nowTime, sprite) {
                return function (err, tex) {
                    if (sprite.lastSetSpriteImageTime > nowTime) { return }
                    if (err) {
                        cc.error(err.messsgae || err);
                        return;
                    }
                    //console.log("typeof tex=", typeof tex, tex instanceof cc.Texture2D);
                    var success = (tex instanceof cc.Texture2D);
                    if(success){
                        var newFrame = new cc.SpriteFrame(tex);
                        sprite.spriteFrame = newFrame;
                    }
                }
            }(nowTime, sprite));
        //}
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
    if (typeof window.loadedAllCardSpriteFrame !== 'undefined') {
        return;
    }
    window.loadedAllCardSpriteFrame = true;
    
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

window.VoiceVolumeSriteFrameCache = new Array(7);
window.LoadAllVoiceVolumeSriteFrame = function() {
    
    if (typeof window.loadedAllVoiceVolumeSriteFrame !== 'undefined') {
        return;
    }
    window.loadedAllVoiceVolumeSriteFrame = true;
    
    var delegate = function(i) {
        return function (err, spriteFrame) {
            if (!err) {
                window.VoiceVolumeSriteFrameCache[i] = spriteFrame;
            }
        }
    }
    
    for (var d = 0; d < 7; ++d) {
        cc.loader.loadRes('game/v'+(d+1), cc.SpriteFrame, delegate(d));
    }
}


