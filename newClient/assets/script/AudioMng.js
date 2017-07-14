var AudioMng = cc.Class({
    extends: cc.Component,

    properties: {
        winAudio: {
            default: null,
            url: cc.AudioClip
        },

        loseAudio: {
            default: null,
            url: cc.AudioClip
        },
        
        gangAudio: {
            default: null,
            url: cc.AudioClip
        },

        pengAudio: {
            default: null,
            url: cc.AudioClip
        },
        
        kanAudio: {
            default: null,
            url: cc.AudioClip
        },
        
        jiangAudio: {
            default: null,
            url: cc.AudioClip
        },

        chiAudio : {
            default : null,
            url: cc.AudioClip
        },
        
        niuAudio: {
            default: null,
            url: cc.AudioClip
        },
        
        addNiuAudio: {
            default: null,
            url: cc.AudioClip
        },

        tingAudio : {
            default: null,
            url : cc.AudioClip
        },
        
        huAudio: {
            default: null,
            url: cc.AudioClip
        },
        
        cardsAudio : {
            default : [],
            type : [cc.AudioClip]
        },

        buttonAudio: {
            default: null,
            url: cc.AudioClip
        },
        
        login : {
            default: null,
            url: cc.AudioClip
        },

        home: {
            default: null,
            url: cc.AudioClip
        },
        
        game : {
            default: null,
            url: cc.AudioClip
        },
        
        _bgmVolume : 1.0,
        _sfxVolume : 1.0,
        
        bgmVolume : {
            get : function() {
                return this._bgmVolume;
            },
            
            set : function(value) {
                if (this._bgmVolume != value) {
                    if (this.bgmId >= 0) {
                        if (value > 0) {
                            if (this._bgmVolume == 0) {
                                cc.audioEngine.resume(this.bgmId);
                            }
                            cc.audioEngine.setVolume(this.bgmId, value);
                        }
                        else {
                            cc.audioEngine.pause(this.bgmId);
                        }
                    }
                    
                    this._bgmVolume = value;
                    cc.sys.localStorage.setItem("bgmVolume", this._bgmVolume);
                }
            }
        },
        
        sfxVolume : {
            get : function() {
                return this._sfxVolume;
            },
            
            set :function(value) {
                if (this._sfxVolume != value) {
                    this._sfxVolume = value;
                    cc.sys.localStorage.setItem("sfxVolume", this._sfxVolume);
                }
            }
        }
        
    },
    
    statics: {
        inst: null
    },
    
    // use this for initialization
    onLoad: function () {
        AudioMng.inst = this;
        
        var t = cc.sys.localStorage.getItem('bgmVolume');
        if (t !== null) {
            this.bgmVolume = parseFloat(t);
        }
        
        t = cc.sys.localStorage.getItem('sfxVolume');
        if (t !== null) {
            this.sfxVolume = parseFloat(t);
        }
    },
    
    
    
    pauseAll : function() {
        cc.audioEngine.pauseAll();
    },
    
    resumeAll : function() {
        cc.audioEngine.resumeAll();
    },
    
    playBGM : function(audioClip, loop) {
        if (this.bgmId >= 0) {
            cc.audioEngine.stop(this.bgmId);
        }
        
        this.bgmId = cc.audioEngine.play(audioClip, loop, this.bgmVolume);
        if (this.bgmVolume === 0 && this.bgmId >= 0) {
            cc.audioEngine.pause(this.bgmId);
        }
    },

    playLoginMusic : function() {
        this.playBGM( this.login, true);
    },

    playHomeMusic: function() {
        this.playBGM( this.home, true );

    },

    playGameMusic: function() {
        this.playBGM( this.game, true );
    },
    
    _playSFX: function(clip) {
        if (this.sfxVolume > 0) {
            cc.audioEngine.play( clip, false, this.sfxVolume );
        }
    },
    
    /*
    playWin: function() {
        this._playSFX(this.winAudio);
    },

    playLose: function() {
        this._playSFX(this.loseAudio);
    },
    */

    playButton: function() {
        this._playSFX(this.buttonAudio);
    },
    
    playPeng : function() {
        this._playSFX(this.pengAudio);
    },
    
    playGang : function() {
        this._playSFX(this.gangAudio);
    },
    
    playKan : function() {
        this._playSFX(this.kanAudio);
    },
    
    playJiang : function() {
        this._playSFX(this.jiangAudio);
    },

    playChi : function() {
        this._playSFX(this.chiAudio);
    },
    
    playNiu : function() {
        this._playSFX(this.niuAudio);
    },
    
    playAddNiu : function() {
        this._playSFX(this.addNiuAudio);
    },

    playTing : function() {
        this._playSFX(this.tingAudio);
    },
    
    playHu : function() {
        this._playSFX(this.huAudio);
    },
    
    playCard : function(card) {
        this._playSFX(this.cardsAudio[card]);
    }
});
