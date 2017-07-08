var Setting = cc.Class({
    extends: cc.Component,

    properties: {
        musicSliderBar : cc.Slider,
        musicProgressBar : cc.ProgressBar,
        
        soundSliderBar : cc.Slider,
        soundProgressBar : cc.ProgressBar,
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
    },
    
    
    OnShow : function() {
        this.node.active = true;
        this.node.zIndex = 999;
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
            
            /*var audioMng = AudioMng();
            if (audioMng) {
                audioMng.bgmVolume = newProgress;
                audioMng.playButton();
            }*/
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
