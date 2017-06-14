var notifyNode = cc.Class({
    extends: cc.Component,

    properties: {
        lable : cc.Label,
        needWait : {
            default : cc.False,
            type : cc.Boolean,
        }
    },

    statics: {
        inst: null
    },
    
    // use this for initialization
    onLoad: function () {
        notifyNode.inst = this;
        this._animCtrl = this.node.getComponent(cc.Animation);
        this.node.zIndex = 1000;
    },
    
    onNeedExit : function() {
        if (this.needWait) {
            this._animCtrl.pause();
        }
    },
    
    onExitAnim : function() {
        this.lable.string = "";
    },
    
    Play : function(text, needWait) {
        if (text === this.lable.string) {
            return;
        }
        if (typeof needWait === 'undefined' || needWait === false) {
            this.needWait = false;
        }else {
            this.needWait = true;
        }
        
        this.lable.string = text;

        this._animCtrl.stop();        
        this._animCtrl.play();
    },
    
    PlayWaitSrv : function() {
        this.Play("正在努力连接服务器...", true);
    },
    
    Continue : function() {
        this.needWait = false;
        this._animCtrl.resume();
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
