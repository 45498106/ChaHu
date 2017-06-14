
var constString = "输入6位房间号";

cc.Class({
    extends: cc.Component,

    properties: {
        closeBtn : cc.Button,
        joinBtn : cc.Button,
        
        inputLabel : cc.Label,
        _input : cc.String,
    },

    // use this for initialization
    onLoad: function () {
        this.closeBtn.node.on('click', this.OnHide, this);
        this.joinBtn.node.on('click', this.OnJoin, this);
    },
    
    OnShow : function() {
        this.node.active = true;
        this.ClearNumber();
    },
    
    OnHide : function() {
        this.node.active = false;
    },
    
    OnJoin : function() {
        // 加入房间
        if (this._input.length !== 6) {
            Notify().Play("请输入六位房间号");
            return;
        }
        
        var roomId = parseInt(this._input);
        GameSocket().Send("joinRoom", { roomId:roomId});
        
        Notify().PlayWaitSrv();
    },
    
    ClearNumber : function () {
       this.inputLabel.string = constString;
       this.inputLabel.fontSize = 34;
       this._input = "";
    },
    
    OnClickNumber : function (event, data) {
        if (data === '-1') {
            // clear.
            this.ClearNumber();
        }
        else if (data === '-2') {
            if (this._input.length > 0) {
                this._input = this._input.substr(0, this._input.length - 1);
                this.inputLabel.string = this._input;
                this.inputLabel.fontSize = 40;
                if (this._input.length === 0) {
                    this.ClearNumber();
                }
            }
        }else {
            if (this._input.length < 6) {
                this._input += data;
                this.inputLabel.string = this._input;
                this.inputLabel.fontSize = 40;
            }
        }
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
