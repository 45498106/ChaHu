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
        
        
        SetSpriteImage(this.headSprite, {url: GameData.userHeadUrl, type:'jpg'});
        
        
        // 获得buttons
        GameSocket().Send("homeButtons", window.GameVersion);
        
        // 获得房间数据
        GameSocket().Send("getRoomRecord");
        // 注册事件
        GameEvent().OnEvent("HomeButtonsBack", this.OnHomeButtons, this);
        GameEvent().OnEvent("GetRoomRecordSuccess", this.OnGetRoomRecordSucces, this);
        GameEvent().OnEvent("CreateRoomSuccess", this.OnCreateRoomSuccess, this);
        GameEvent().OnEvent("JoinRoomSuccess", this.OnJoinRoomSucces, this);
        
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
        this.descPanel.getComponent("description").OnShow();
        //Notify().Play("加班实现中，敬请期待");
    },
    
    OnHistory : function() {
        Notify().Play("加班实现中，敬请期待");
    },
    
    OnSetting : function() {
        Notify().Play("加班实现中，敬请期待");
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
            // 延迟3秒进入房间.
            this.scheduleOnce(function() {
                // 这里的 this 指向 component
                GameSocket().Send("joinRoom", {roomId : roomId});
             }, 3);
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
    

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
