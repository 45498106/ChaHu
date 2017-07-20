var Setting = cc.Class({
    extends: cc.Component,

    properties: {
        musicSliderBar : cc.Slider,
        musicProgressBar : cc.ProgressBar,
        
        soundSliderBar : cc.Slider,
        soundProgressBar : cc.ProgressBar,

        exitBtn : cc.Button,

        _scenenid : null,
    },
    
    statics: {
            inst: null
    },

    // use this for initialization
    onLoad: function () {
        Setting.inst = this;
        
        var audioMng = AudioMng();
        if (audioMng) {
            var bgmVolume = audioMng.bgmVolume;
            
            this.musicSliderBar.progress = bgmVolume;
            this.musicProgressBar.progress = bgmVolume;
            
            var sfxVolume = audioMng.sfxVolume;
            
            this.soundSliderBar.progress = sfxVolume;
            this.soundProgressBar.progress = sfxVolume;
        }

        //注册BT点击事件
        this.exitBtn.node.on('click',this.callback,this);

    },

    callback:function(event)
    {
        var sceneid = this._scenenid;
        if (sceneid === 'home') {
            GameSocket().Disconnect();
            cc.director.loadScene('login');
        }else if (sceneid === 'game') {
            GameEvent().SendEvent('AutoExitRoom');
        }
        this.OnHide();
    },
    
    OnShow : function(sceneid) {
        this.node.active = true;
        this.node.zIndex = 999;

        this._scenenid = sceneid;       
        GameEvent().SendEvent('SettingButtonShow',  function(exitBtn) {
            return function(normalUrl, pressedUrl, hoverUrl, disableUrl){
                SetButtonImages(exitBtn, normalUrl, pressedUrl, hoverUrl, disableUrl);
            }
        }(this.exitBtn));
    },
    
    OnHide : function() {
        this.node.active = false;
        this.node.zIndex = -100;
    },
    
    
    OnSliderMusic : function (event) {
        var progress = event.progress;
        var newProgress = Math.ceil(progress * 10) / 10;


        this.musicSliderBar.progress = newProgress;
        this.musicProgressBar.progress = newProgress;
            
        if (this.musicSliderBar.value__ != newProgress) {
            this.musicSliderBar.value__ = newProgress;
            
            var audioMng = AudioMng();
            if (audioMng) {
                audioMng.bgmVolume = newProgress;
                //audioMng.playButton();
            }
        }
    },
    
    OnSliderSound : function (event) {
        var progress = event.progress;
        var newProgress = Math.ceil(progress * 10) / 10;

        this.soundSliderBar.progress = newProgress;
        this.soundProgressBar.progress = newProgress;
            
        if (this.soundSliderBar.value__ != newProgress) {
            this.soundSliderBar.value__ = newProgress;
            
            var audioMng = AudioMng();
            if (audioMng) {
                audioMng.sfxVolume = newProgress;
                audioMng.playButton();
            }
        }
    },
    
    OnLanguageRadioChange : function(toggle, data) {
        var audioMng = AudioMng();
        if (audioMng) audioMng.playButton();
    },
    
    OnClose : function() {
        this.OnHide();
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
