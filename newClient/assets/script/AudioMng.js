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
        
        niuAudio: {
            default: null,
            url: cc.AudioClip
        },
        
        addNiuAudio: {
            default: null,
            url: cc.AudioClip
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
        }
    },
    
    statics: {
        inst: null
    },
    
    // use this for initialization
    onLoad: function () {
        AudioMng.inst = this;
    },

    playLoginMusic : function() {
        var id = cc.audioEngine.playMusic( this.login, true );
        cc.audioEngine.setVolume(id, 0.2);
    },

    playHomeMusic: function() {
        var id = cc.audioEngine.playMusic( this.home, true );
        cc.audioEngine.setVolume(id, 0.2);
    },

    playGameMusic: function() {
        var id = cc.audioEngine.playMusic( this.game, true );
        cc.audioEngine.setVolume(id, 0.2);
    },
    
    pauseMusic: function() {
        cc.audioEngine.pauseMusic();
    },

    resumeMusic: function() {
        cc.audioEngine.resumeMusic();
    },

    _playSFX: function(clip) {
        cc.audioEngine.playEffect( clip, false );
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
    
    playNiu : function() {
        this._playSFX(this.niuAudio);
    },
    
    playAddNiu : function() {
        this._playSFX(this.addNiuAudio);
    },
    
    playHu : function() {
        this._playSFX(this.huAudio);
    },
    
    playCard : function(card) {
        this._playSFX(this.cardsAudio[card]);
    }
});
