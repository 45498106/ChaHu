cc.Class({
    extends: cc.Component,

    properties: {
        creatRoomPanel : cc.Node,
        joinRoomPanel : cc.Node,
        createRoomBtn : cc.Button,
        joinRoomBtn : cc.Button,
        
        descPanel : cc.Node,
        
        shareBtn : cc.Button,
        ruleBtn : cc.Button,
        historyBtn : cc.Button,
        settingBtn : cc.Button,
        
        notifyLayer :cc.Node,
        moneyLayer : cc.Node,
        
        
        nameLable : cc.Label,
        idLabel : cc.Label,
        cardLabel : cc.Label,
        headSprite : cc.Sprite,
    },

    // use this for initialization
    onLoad: function () {
        this.HideAllPnl();
        
        this.createRoomBtn.node.on('click', this.OnCreateRoom, this);
        this.joinRoomBtn.node.on('click', this.OnJoinRoom, this);
        
        this.nameLable.string = GameData.userName;
        this.idLabel.string = "ID:" + GameData.userId;
        this.cardLabel.string = GameData.userRoomCard;
        
        console.log("-------->", GameData.userHeadUrl);
        SetSpriteImage(this.headSprite, {url: GameData.userHeadUrl, type:'jpg'});
        
        
        // 获得buttons
        GameSocket().Send("homeButtons", { version : window.GameVersion });
        
        // 获得房间数据
        GameSocket().Send("getRoomRecord");
        // 注册事件
        GameEvent().OnEvent("HomeButtonsBack", this.OnHomeButtons, this);
        GameEvent().OnEvent("GetRoomRecordSuccess", this.OnGetRoomRecordSucces, this);
        GameEvent().OnEvent("CreateRoomSuccess", this.OnCreateRoomSuccess, this);
        GameEvent().OnEvent("JoinRoomSuccess", this.OnJoinRoomSucces, this);
        GameEvent().OnEvent("reconnectedServer", this.OnReconnectedServer, this);
        
        // 播放声音
        var audioMng = AudioMng();
        if (audioMng) audioMng.playHomeMusic();
    },
    
    HideAllPnl : function() {
        this.creatRoomPanel.getComponent("createRoom").OnHide();
        this.joinRoomPanel.getComponent("joinRoom").OnHide();
    },
    
    OnCreateRoom : function() {
        this.creatRoomPanel.getComponent("createRoom").OnShow();
    },
    
    OnJoinRoom : function() {
        this.joinRoomPanel.getComponent("joinRoom").OnShow();
    },
    
    OnShare : function() {
        Notify().Play("加班实现中，敬请期待");
    },
    
    OnRuleDesc : function() {
        //if (cc.sys.isNative) {
        //jsb.reflection.callStaticMethod("AppController", 'shareWithWeixinFriendTxt:txt:url:', '新沂查虎麻将', '房间ID:888888 http://mjcs.leanapp.cn. <a href="www.baidu.com">百度</a>', 'xinyichahu://?roomid=888888');
        //}
        //else
        //{
        this.descPanel.getComponent("description").OnShow();
        //}
    },
    
    OnHistory : function() {
        GameData.replayData = JSON.parse('{"roomInfo":{"id":989202,"createUserId":10224,"ruleId":11,"quanId":2,"hunCount":20,"playCount":0,"bankerCount":0},"players":[{"userId":10224,"userName":"10224","userHeadUrl":"https://wx.qlogo.cn/mmhead/Q3auHgzwzM5G2pXRJFPt9gt7gXw4VUgCV8FfibSiaN6z0Mic6sp80f7jg/96","cards":[11,11,11,12,13,14,15,16,17,18,19,19,19]},{"userId":10065,"userName":"robot6","userHeadUrl":"https://wx.qlogo.cn/mmhead/Q3auHgzwzM5G2pXRJFPt9gt7gXw4VUgCV8FfibSiaN6z0Mic6sp80f7jg/96","cards":[34,26,45,46,47,26,27,28,28,28,29,34,21]},{"userId":10060,"userName":"robot1","userHeadUrl":"https://wx.qlogo.cn/mmhead/Q3auHgzwzM5G2pXRJFPt9gt7gXw4VUgCV8FfibSiaN6z0Mic6sp80f7jg/96","cards":[39,17,38,15,38,18,32,27,14,38,24,21,13]},{"userId":10061,"userName":"robot2","userHeadUrl":"https://wx.qlogo.cn/mmhead/Q3auHgzwzM5G2pXRJFPt9gt7gXw4VUgCV8FfibSiaN6z0Mic6sp80f7jg/96","cards":[25,23,38,22,39,35,33,23,27,35,29,18,12]}],"actions":[{"action":"addCard","place":0,"data":46},{"action":"throwCard","place":0,"data":46},{"action":"addCard","place":1,"data":18},{"action":"throwCard","place":1,"data":18},{"action":"addCard","place":2,"data":36},{"action":"throwCard","place":2,"data":36},{"action":"addCard","place":3,"data":33},{"action":"throwCard","place":3,"data":33},{"action":"addCard","place":0,"data":25},{"action":"throwCard","place":0,"data":25},{"action":"addCard","place":1,"data":31},{"action":"throwCard","place":1,"data":31},{"action":"addCard","place":2,"data":32},{"action":"throwCard","place":2,"data":32},{"action":"addCard","place":3,"data":26},{"action":"throwCard","place":3,"data":26},{"action":"addCard","place":0,"data":23},{"action":"throwCard","place":0,"data":23},{"action":"addCard","place":1,"data":34},{"action":"throwCard","place":1,"data":34},{"action":"addCard","place":2,"data":29},{"action":"throwCard","place":2,"data":29},{"action":"addCard","place":3,"data":37},{"action":"throwCard","place":3,"data":37},{"action":"addCard","place":0,"data":46},{"action":"throwCard","place":0,"data":46},{"action":"addCard","place":1,"data":36},{"action":"throwCard","place":1,"data":36},{"action":"addCard","place":2,"data":11},{"action":"throwCard","place":2,"data":11},{"action":"huCards","place":0,"data":{"card":11,"throwPlace":2}}]}');
        if (typeof GameData.replayData !== 'undefined') {
            Replay.Start();

            cc.director.loadScene('game');
        }
        else {
            Notify().Play("加班实现中，敬请期待");
        }
    },
    
    OnSetting : function() {
        window.OpenSetting();
    },
    
    OnAddGold : function() {
        Notify().Play("加班实现中，敬请期待");
    },
    
    OnHomeButtons : function() {
        if (GameData.homeButtons.indexOf('share') < 0) {
            this.shareBtn.node.active = false;
        }else {
            this.shareBtn.node.active = true;
        }
        
        if (GameData.homeButtons.indexOf('rule') < 0) {
            this.ruleBtn.node.active = false;
        }else {
            this.ruleBtn.node.active = true;
        }
        
        if (GameData.homeButtons.indexOf('record') < 0) {
            this.historyBtn.node.active = false;
        }else {
            this.historyBtn.node.active = true;
        }
        
        if (GameData.homeButtons.indexOf('setting') < 0) {
            this.settingBtn.node.active = false;
        }else {
            this.settingBtn.node.active = true;
        }
        
        if (GameData.homeButtons.indexOf('money') < 0) {
            this.moneyLayer.active = false;
        }else {
            this.moneyLayer.active = true;
        }
        
        if (GameData.homeButtons.indexOf('notify') < 0) {
            this.notifyLayer.active = false;
        }else {
            this.notifyLayer.active = true;
        }
    },
    
    OnGetRoomRecordSucces : function() 
    {
        this.cardLabel.string = GameData.userRoomCard;
        var roomId = GameData.userRoomData.id;
        if (typeof roomId === 'number')
        {
            // 延迟1秒进入房间.
            this.scheduleOnce(function() {
                // 这里的 this 指向 component
                GameSocket().Send("joinRoom", {roomId : roomId});
            }, 1);
        }
        else {
            if (typeof window.schemeRoomId === 'number') {
                GameSocket().Send("joinRoom", {roomId : window.schemeRoomId});
                window.schemeRoomId = undefined;
            }
        }
    },
    
    OnJoinRoomSucces : function() {
        Notify().Continue();
        cc.director.loadScene('game');
    },
    
    OnCreateRoomSuccess : function() {
        Notify().Continue();
        cc.director.loadScene('game');
    },
    
    OnReconnectedServer : function() {
        if (typeof GameData.validUniqueID === 'undefined') {
            cc.director.loadScene('login');        
        }
        else 
        {
            GameSocket().Send("reconnect", {uniqueID : GameData.validUniqueID} );
        }
    },
    

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
