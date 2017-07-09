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
        
        wxWebView : cc.WebView,
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
        
        GameEvent().OnEvent("ShowWXQRCode", this.OnShowWXQRCode, this);
        GameEvent().OnEvent("HideWXQRCode", this.OnHideWXQRCode, this);
        GameEvent().OnEvent("WeiXinAuthBack", this._WeiXinLogin, this);
        
        this.weixinBtn.node.active = false;
        this.guestBtn.node.active = false;
        this.wxWebView.node.actvie = false;
        
        // 关闭设置
        window.OpenSetting(false);
        
        // 播放声音
        var audioMng = AudioMng();
        if (audioMng) audioMng.playLoginMusic();
    },
    
    OnConnectedServer : function() {
        if (GameSocket().IsConnected()) {
            GameSocket().Send("loginMenu", { version : window.GameVersion });   
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
    },
    
    _WeiXinLogin : function() {
        var uniqueId = WeiXin().unionid;
        var name = WeiXin().nickName;
        var headUrl = WeiXin().headImgUrl;
        
        GameData.userName = name;
        GameData.userHeadUrl = headUrl;
        
        GameData.uniqueID = uniqueId;
        GameSocket().Send("enterGame", {loginType:"weixin", uniqueID:uniqueId, name : name, headUrl : headUrl} );
        
        GameData.loginType = "weixin";
    },
    
    onWeiXinLogin : function() {
        if (GameSocket().IsConnected()) {
            if (cc.sys.isNative) {
                
                if (WeiXin().Installed() === false) {
                    Notify().Play("请先安装微信!");
                    return;
                }
                
                WeiXin().SetCallBack(function(result) {
                    if (result === false)
                    {
                        Notify().Play("微信授权失败!");
                        return;    
                    }
    
                    WeiXin().GetUserInfo(function(result){
                        if (result === false) {
                            Notify().Play("获取用户微信数据失败!");
                            return;
                        }
                        
                        this._WeiXinLogin();
                    }.bind(this))
                }.bind(this));
            }else {
                if (cc.sys.isMobile) {
                    Notify().Play("手机版微信登录功能请在APP中使用!", true);
                    
                    if (typeof this.openDownloadHandle !== 'undefined') {
                        clearTimeout(this.openDownloadHandle);
                    }
                    
                    this.openDownloadHandle = setTimeout(function() {
                        window.open("http://download.xychahu.com");
                    }, 1000); // 大于1000毫秒时,open操作会被拦截,估计是被认为非玩家行为所触发。 
                    return;
                }
            }
            
            WeiXin().AuthRequest();
            Notify().PlayWaitSrv();
        }
    },
    
    onGuestLogin : function() {
        if (GameSocket().IsConnected()) {
            window.GetUniqueID(function(uniqueId){
                GameData.uniqueID = uniqueId;
                GameSocket().Send("enterGame", {loginType:"guest", uniqueID:uniqueId});
                GameData.loginType = "guest";
            });

            Notify().PlayWaitSrv();
        }
    },
    
    
    OnLoginSuccess : function() {
        cc.director.loadScene('home');
        Notify().Continue();
    },
    
    OnShowWXQRCode : function(event) {
        if (!cc.sys.isNative) {
            window.open(event.detail);
        }
    },
    
    OnHideWXQRCode : function() {
        //this.wxWebView.node.active = false;
    },
    

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        WeiXin().CheckAuthCode();
    },
});
