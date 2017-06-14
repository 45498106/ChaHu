cc.Class({
    extends: cc.Component,

    properties: {
        closeBtn : cc.Button,
        createRoomBtn : cc.Button,
        
        ruleRadioButton: {
            default: [],
            type: cc.Toggle
        },
        
        juRadioButton: {
            default: [],
            type: cc.Toggle
        },
        
        _juCurrentToggle : cc.Toggle,
        _juToggleId : cc.Integer,
        
        sliderBar : cc.Slider,
        progressBar : cc.ProgressBar,
        hunCount : cc.Label,
    },

    // use this for initialization
    onLoad: function () {

        this.closeBtn.node.on('click', this.OnHide, this);
        this.createRoomBtn.node.on('click', this.OnCreateRoom, this);
        
        this.sliderBar.progress = 0.2;
        this.hunCount.string = '20';
        this.progressBar.progress = this.sliderBar.progress;
        this.createRoomBtn.interactable = true;
        
        this.juRadioButton[1].check();
        this._juToggleId = 2;
    },
    
    OnShow : function() {
       this.node.active = true;
       this.createRoomBtn.interactable = true;
    },
    
    OnHide : function() {
        this.node.active = false;
    },
    
    OnCreateRoom : function() {
        
        this.createRoomBtn.interactable = false;
        
        var ruleId = 0;
        for (var i = 0; i < this.ruleRadioButton.length; ++i) {
            if (this.ruleRadioButton[i].isChecked) {
                ruleId |= (1 << i);
            }
        }
        
        var quanId = this._juToggleId;
        var hunCount = (Math.ceil(this.progressBar.progress * 10) / 10) * 100;
        
        GameSocket().Send("createRoom", {ruleId:ruleId, quanId:quanId, hunCount:hunCount});
        
        Notify().PlayWaitSrv();
    },
    
    OnSlider : function (event) {
        var progress = event.progress;
        
        var newProgress = Math.ceil(progress * 10) / 10;
        this.sliderBar.progress = newProgress;
        this.progressBar.progress = newProgress;
        this.hunCount.string = "" + newProgress * 100;
    },
    
    OnRuleRadioChange : function(toggle, data) {
        var audioMng = AudioMng();
        if (audioMng) audioMng.playButton();
    },
    
    OnJuRadioChange : function(toggle, data) {
        if (this._juCurrentToggle !== toggle) {
            this._juCurrentToggle = toggle;
            this._juToggleId = parseInt(data);
        }
        
        var audioMng = AudioMng();
        if (audioMng) audioMng.playButton();
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
