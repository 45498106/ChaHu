cc.Class({
    extends: cc.Component,

    properties: {
        creatRoomPanel : cc.Node,
        joinRoomPanel : cc.Node,
        createRoomBtn : cc.Button,
        joinRoomBtn : cc.Button,
        
        shareBtn : cc.Button,
        ruleBtn : cc.Button,
        historyBtn : cc.Button,
        settingBtn : cc.Button,
        
        
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
        
        
        SetSpriteImage(this.headSprite, GameData.userHeadUrl);
        
        // 获得房间数据
        GameSocket().Send("getRoomRecord");
        // 注册事件
        GameEvent().OnEvent("GetRoomRecordSuccess", this.OnGetRoomRecordSucces, this);
        GameEvent().OnEvent("CreateRoomSuccess", this.OnCreateRoomSuccess, this);
        GameEvent().OnEvent("JoinRoomSuccess", this.OnJoinRoomSucces, this);
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
        
    },
    
    OnRuleDesc : function() {
        
    },
    
    OnHistory : function() {
        
    },
    
    OnSetting : function() {
        
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
        cc.director.loadScene('game');        
    },
    
    OnCreateRoomSuccess : function() {
        cc.director.loadScene('game');        
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
