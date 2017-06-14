cc.Class({
    extends: cc.Component,
    // use this for initialization
    onLoad: function () {
        var self = this;
        
        function onTouchDown (event) {
            var audioMng = AudioMng();
            if (audioMng) audioMng.playButton();
        }
        function onTouchUp (event) {
            this.stopAllActions();
        }
        
        this.node.on('touchstart', onTouchDown, this.node);
        this.node.on('touchend', onTouchUp, this.node);
        this.node.on('touchcancel', onTouchUp, this.node);
    }
});
