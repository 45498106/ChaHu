//-------------------------------------------------------------
var WebAppID = "wxeafaeaed7398f8b5";
var NativeAppID = "wxdccb3ab1cddcf843";

function WebWeiXin(){
    this.access_token = "";
    this.refresh_token = "";
    this.openid = "";
    this.unionid = "";
    this.nickName  = "";
    this.sex = 2; //1.男 2.女
    this.headImgUrl = "";
    this.needCheckWebAuth = false;
    this.checkWebAuthBack = true;
}

WebWeiXin.prototype.Init = function() {
    
}

WebWeiXin.prototype.Installed = function() {
    if (!cc.sys.isNative) {
        return false;
    }
    else if (cc.sys.os === cc.sys.OS_ANDROID) {
        return false;
    }
    else if (cc.sys.os === cc.sys.OS_IOS) {
        return jsb.reflection.callStaticMethod("AppController", 'isWXAppInstalled');
    }
    
    return false;
}

WebWeiXin.prototype.AuthRequest = function() {
    if (!cc.sys.isNative) {
        this.WebAuthCode();
        return;
    }
    else if (cc.sys.os === cc.sys.OS_ANDROID) {
        return;
    }
    else if (cc.sys.os === cc.sys.OS_IOS) {
        
        this.access_token = cc.sys.localStorage.getItem("wx_access_token");
        this.refresh_token = cc.sys.localStorage.getItem("wx_refresh_token");
        this.openid = cc.sys.localStorage.getItem("wx_openid");
        this.unionid = cc.sys.localStorage.getItem("wx_unionid");
        
        if (this.access_token === null || this.refresh_token === null) {
            GameLog("重新微信授权")
            jsb.reflection.callStaticMethod("AppController", 'sendAuthRequest');
            return;
        }
        
        GameLog(this.access_token + " " + this.refresh_token);

        this.IsNeedRefreshAccessToken(function(success) {
            if (success) {
                GameLog("不需要新access_token")
                if (typeof this.callback === 'function')
                    this.callback(true);
            }
            else {
                this.RefreshAccessToken(cc.sys.isNative, function(success) {
                    if (success) {
                        GameLog("刷新access_token")
                        if (typeof this.callback === 'function') {
                            this.callback(true);
                        }
                    }
                    else {
                        GameLog("重新微信授权")
                        jsb.reflection.callStaticMethod("AppController", 'sendAuthRequest');
                    }
                }.bind(this));
            }
        }.bind(this));
    }
}

WebWeiXin.prototype.WebAuthCode = function() {
    this.sid = Math.random();
    var url = "https://open.weixin.qq.com/connect/qrconnect?appid=" +
              WebAppID  + "&redirect_uri=" +
              "http%3A%2F%2Fchahu.h5ii.com%3A18081%2FwebAuthCode" + 
              "&response_type=code&scope=snsapi_login&state=" + 
              this.sid + "#wechat_redirect";
    
    GameEvent().SendEvent('ShowWXQRCode', url);
    
    this.needCheckWebAuth = true;
}

WebWeiXin.prototype.CheckAuthCode = function() {
    
    if (this.needCheckWebAuth) {
        
        if (this.checkWebAuthBack === false) {
            return;
        }
        
        var url = "http://chahu.h5ii.com:18081/queryWebAuthCode?sid=" + this.sid;
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 400)) {
                var code = xhr.responseText;
                if(code.length > 0) {
                    this.needCheckWebAuth = false;
                    
                    var obj = JSON.parse(code);
                    if (typeof obj.errcode === 'undefined') {
                        // 取得useinfo成功
                        this.unionid = obj.unionid;
                        this.nickName = obj.nickname;
                        this.sex = obj.sex;
                        this.headImgUrl = obj.headimgurl;
                        if (typeof this.headImgUrl === 'string' && 
                            this.headImgUrl.length > 2 &&
                            this.headImgUrl[this.headImgUrl.length-1] === '0' &&
                            this.headImgUrl[this.headImgUrl.length-2] === '/')
                        {
                            this.headImgUrl = this.headImgUrl.substr(0, this.headImgUrl.length-1);
                            this.headImgUrl += "96";
                        }
                        GameEvent().SendEvent('WeiXinAuthBack');
                    }
                }
                this.checkWebAuthBack = true;
            }
        }.bind(this);
        xhr.open("GET", url, true);
        xhr.send();
        this.checkWebAuthBack = false;
    }
}


WebWeiXin.prototype.SetCallBack = function(callback) {
    this.callback = callback;
}

WebWeiXin.prototype.GetCallBack = function() {
    return this.callback;
}

WebWeiXin.prototype.CodeToAccessToken = function(native, code, callback) {
    var url = "http://chahu.h5ii.com:18081";
    if (native === true) {
        url += "/native/access_token?code=" + code;
    }else {
        url += "/web/access_token?code=" + code;
    }
    
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 400)) {
            var response = xhr.responseText;
            //GameLog(response);
            var obj = JSON.parse(response);
            if (typeof obj.errcode === 'undefined') {
                // 取得accessToken成功
                this.access_token = obj.access_token;
                this.refresh_token = obj.refresh_token;
                this.openid = obj.openid;
                this.unionid = obj.unionid;
                
                cc.sys.localStorage.setItem("wx_access_token", this.access_token);
                cc.sys.localStorage.setItem("wx_refresh_token", this.refresh_token);
                cc.sys.localStorage.setItem("wx_openid", this.openid);
                cc.sys.localStorage.setItem("wx_unionid", this.unionid);
            }
            
            if (typeof callback === 'function') {
                callback(typeof obj.errcode === 'undefined');
            }
            
        }
    }.bind(this);
    xhr.open("GET", url, true);
    xhr.send();
}

WebWeiXin.prototype.IsNeedRefreshAccessToken = function(callback) {
    var url = "https://api.weixin.qq.com/sns/auth?access_token="
              + this.access_token 
              + "&openid="
              + this.openid;
              
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        //GameLog(xhr.readyState+" IsNeedRefreshAccessToken "+xhr.status)
        if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 400)) {
            var response = xhr.responseText;
            GameLog(response);
            var obj = JSON.parse(response);
            if (typeof callback === 'function') {
                callback(obj.errcode === 0);
            }
        }
    };
    xhr.open("GET", url, true);
    xhr.send();
}

WebWeiXin.prototype.RefreshAccessToken = function(native, callback) {
    var url = "https://api.weixin.qq.com/sns/oauth2/refresh_token?appid="
              + (native === true ? NativeAppID : WebAppID)
              + "&grant_type=refresh_token&refresh_token="
              + this.refresh_token;
              
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        //GameLog(xhr.readyState+" RefreshAccessToken " + xhr.status);
        if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 400)) {
            var response = xhr.responseText;
            var obj = JSON.parse(response);
            if (typeof obj.errcode === 'undefined') {
                // 取得accessToken成功
                this.access_token = obj.access_token;
                this.refresh_token = obj.refresh_token;
                this.openid = obj.openid;
                this.unionid = obj.unionid;
                
                cc.sys.localStorage.setItem("wx_access_token", this.access_token);
                cc.sys.localStorage.setItem("wx_refresh_token", this.refresh_token);
                cc.sys.localStorage.setItem("wx_openid", this.openid);
                cc.sys.localStorage.setItem("wx_unionid", this.unionid);
            }

            if (typeof callback === 'function') {
                callback(typeof obj.errcode === 'undefined');
            }
        }
    }.bind(this);
    xhr.open("GET", url, true);
    xhr.send();
}

WebWeiXin.prototype.GetUserInfo = function(callback) {
    var url = "https://api.weixin.qq.com/sns/userinfo?access_token=" 
              + this.access_token 
              + "&openid="
              + this.openid;
    
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 400)) {
            var response = xhr.responseText;
            GameLog(response);
         
            var obj = JSON.parse(response);
            if (typeof obj.errcode === 'undefined') {
                // 取得useinfo成功
                this.unionid = obj.unionid;
                this.nickName = obj.nickname;
                this.sex = obj.sex;
                this.headImgUrl = obj.headimgurl;
                if (typeof this.headImgUrl === 'string' && 
                    this.headImgUrl.length > 2 &&
                    this.headImgUrl[this.headImgUrl.length-1] === '0' &&
                    this.headImgUrl[this.headImgUrl.length-2] === '/')
                {
                    this.headImgUrl = this.headImgUrl.substr(0, this.headImgUrl.length-1);
                    this.headImgUrl += "96";
                }
            }
            
            if (typeof callback === 'function') {
                callback(typeof obj.errcode === 'undefined');
            }
        }
    }.bind(this);
    xhr.open("GET", url, true);
    xhr.send();
}

WebWeiXin.prototype.InviteFriend = function() {
    if (!cc.sys.isNative) {
        Notify().Play("抱歉，此功能不对网页版开放!");
        return;
    }
    
    if (GameData.loginType !== "weixin") {
        Notify().Play("此功能需要微信登录!");
        return;
    } 
    
    if (cc.sys.os === cc.sys.OS_ANDROID) {
        Notify().Play("加班实现中，敬请期待");
        return;
    }
    
    if (cc.sys.os === cc.sys.OS_IOS) {
        if (typeof GameData.userRoomData.id !== 'undefined') {
            var roomid = GameData.userRoomData.id;
            var rule = "";
            if ((GameData.userRoomData.ruleId & 1) === 1) {
                rule += " 庄闲算分"
            }
            if ((GameData.userRoomData.ruleId & 2) === 2) {
                rule += " 砸头"
            }
            if ((GameData.userRoomData.ruleId & 4) === 4) {
                rule += " 牛"
            }
            if ((GameData.userRoomData.ruleId & 8) === 8) {
                rule += " 吃"
            }
            var quan = (GameData.userRoomData.quanId === 1) ? 1 : 4;
            var hundi = GameData.userRoomData.hunCount;
            
            jsb.reflection.callStaticMethod("AppController", 
                                            'shareWithWeixinFriendTxt:txt:url:', 
                                            '查虎麻将[房号:'+roomid+']', 
                                            '规则:' + rule + '\n圈数:' + quan + '圈\n荤底:' + hundi, 
                                            'http://download.xychahu.com/index.html?scheme=xinyichahu&roomid='+roomid);
        }
    }
}

if(typeof module !== 'undefined')
    module.exports = WebWeiXin;
