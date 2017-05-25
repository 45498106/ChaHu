cc.Class({
    extends: cc.Component,

    properties: {
        
        persistNodes : {
            default : [],
            type : [cc.Node]
        },
        
        buttonsPnl : cc.Node,
        weixinBtn : cc.Button,
        guestBtn : cc.Button,
    },

    // use this for initialization
    onLoad: function () {
        
        // 注册常驻节点 
        if (typeof window.addPersistRootNode === 'undefined') {
            for (var i = 0; i < this.persistNodes.length; ++i) {
                cc.game.addPersistRootNode(this.persistNodes[i]);
            }
            window.addPersistRootNode = true;
        }
        
        // 开启网络连接  
        GameSocket().Connect(window.GameHost, window.GamePort);
        // 注册事件
        GameEvent().OnEvent("connectedServer", this.OnConnectedServer, this);
        GameEvent().OnEvent("LoginMenuBack", this.OnLoginMenu, this);
        GameEvent().OnEvent("LoginSuccess", this.OnLoginSuccess, this);
        
        this.buttonsPnl.active = false;
        
        // 播放声音
        var audioMng = AudioMng();
        if (audioMng) audioMng.playLoginMusic();
    },
    
    OnConnectedServer : function() {
        if (GameSocket().IsConnected()) {
            GameSocket().Send("loginMenu");   
        }
    },
    
    OnLoginMenu : function() {
        
        if (GameData.loginMenu.indexOf("weixin") >= 0) {
            this.weixinBtn.node.active = true;
        }else {
            this.weixinBtn.node.active = false;
        }
        
        if (GameData.loginMenu.indexOf("guest") >= 0) {
            this.guestBtn.node.active = true;
        }else {
            this.guestBtn.node.active = false;
        }
        
        this.buttonsPnl.active = true;
    },
    
    onWeiXinLogin : function() {
        if (GameSocket().IsConnected()) {
            
        }
    },
    
    onGuestLogin : function() {
        if (GameSocket().IsConnected()) {
            this.GetUniqueID(function(uniqueId){
                GameSocket().Send("enterGame", {loginType:"guest", uniqueID:uniqueId});
            });

            Notify().PlayWaitSrv();
        }
    },
    
    
    OnLoginSuccess : function() {
        cc.director.loadScene('home');
        Notify().Continue();
    },
    
    GetUniqueID : function(callback) {
        GameLog("GetUniqueID");
        if (!cc.sys.isNative) {
            var Fingerprint2 = require('fingerprint2.min');
            new Fingerprint2().get(function(result, components){
                if (callback) {
                    callback(result);
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
        
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
    },
});
