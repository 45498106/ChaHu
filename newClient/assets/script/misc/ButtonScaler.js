cc.Class({
    extends: cc.Component,

    properties: {
        pressedScale: 0.85,
        transDuration: 0.1
    },

    // use this for initialization
    onLoad: function () {
        var self = this;
        self.initScale = self.node.scale;
        self.scaleDownAction = cc.scaleTo(self.transDuration, self.pressedScale);
        self.scaleUpAction = cc.scaleTo(self.transDuration, self.initScale);
        function onTouchDown (event) {
            
            if (self.node.getComponent(cc.Button) && 
                self.node.getComponent(cc.Button).interactable === false) {
                // 如果是按钮，且按钮不可用
                return false;
            }
                
            self.node.scale = self.initScale;
            self.node.stopAllActions();
            var audioMng = AudioMng();
            if (audioMng) audioMng.playButton();
            self.node.runAction(self.scaleDownAction);
        }
        function onTouchUp (event) {
            self.node.stopAllActions();
            self.node.runAction(self.scaleUpAction);
        }
        this.node.on('touchstart', onTouchDown, this.node);
        this.node.on('touchend', onTouchUp, this.node);
        this.node.on('touchcancel', onTouchUp, this.node);
    }
});
