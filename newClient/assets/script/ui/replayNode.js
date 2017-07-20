cc.Class({
    extends: cc.Component,

    properties: {
        frontBtn : cc.Button,
        subBtn : cc.Button,
        playBtn : cc.Button,
        addBtn : cc.Button,
        nextBtn : cc.Button,

        minSpeed : cc.Float,
        maxSpeed : cc.Float,
    },

    // use this for initialization
    onLoad: function () {
        this._played = false;
        this._speed = 1.0;
    },

    OnFront : function() {
        
    },

    OnNext : function() {

    },
    
    OnPlay : function() {
        if (this._played === false) {
            // 设置成暂停图标
            this._played = true;
        }else {
            // 设置成播放图标
            this._played = false;
        }
    },
    
    OnFastForward : function() {
        this._speed *= 0.5;
        if (this._speed < this.minSpeed) {
            this._speed = this.minSpeed;
        }
    },
    
    OnBackForward : function() {
        this._speed *= 2;
        if (this._speed > this.maxSpeed) {
            this._speed = this.maxSpeed;
        }
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
