cc.Class({
    extends: cc.Component,

    properties: {
        
        a : cc.Node,
        b : cc.Node,
        
        sureBtn : cc.Button,
        opposeBtn : cc.Button,
        
        names: {
            default: [],
            type: cc.Label
        },
        
        status: {
            default: [],
            type: cc.Label
        },
    },

    // use this for initialization
    onLoad: function () {
        GameEvent().OnEvent('CancelDestoryRoom', this.OnCancelDestoryRoom, this);
        this.Clear();
    },
    
    OnCancelDestoryRoom : function() {
        this.OnHide();
        Notify().Play("发起总结算失败,有玩家不同意");
    },
    
    Clear : function() {
        this.remainTime = 60;
        this.dt = 0;
        this.data = null;
    },
    
    OnShow : function(req) {
        this.req = req;
        this.node.active = true;
        if (req) {
            this.a.active = true;
            this.b.active = false;
            
            this.sureBtn.interactable = true;
            this.opposeBtn.interactable = true;
        }
        else {
            this.a.active = false;
            this.b.active = true;
            var player;
            for (var i = 0; i < 4; ++i) {
                player = GameData.players[i];
                this.names[i].string = player.name;
                this.status[i].string = this.remainTime + "秒后自动同意";
            }
        }
    },
    
    OnHide : function() {
        this.node.active = false;
        this.Clear();
    },
    
    OnSure : function() {
        if (this.req) {
            GameSocket().Send("reqDestoryRoom");
        }else {
            GameSocket().Send("rspDestoryRoom", { agree : 1});
        }
    },
    
    OnOppose : function() {
        if (this.req) {
            this.OnHide();
        }else {
            GameSocket().Send("rspDestoryRoom", { agree : 0});
        }
    },
    
    Reload : function(data) {
        this.data = data.slice();
        this._Reload();
    },
    
    _Reload : function() {
        var data = this.data;
        for (var i = 0; i < 4; ++i) {
            if (data[i] === -1) {
                this.status[i].string = this.remainTime + "秒后自动同意";
            }
            else if (data[i] === 0) {
                this.status[i].string = "不同意";
            }
            else if (data[i] === 1) {
                this.status[i].string = "同意";
            }else if (data[i] === 2) {
                this.status[i].string = "发起请求";
            }
            
            if (i === GameData.selfPlace) {
                if (data[i] > -1) {
                    this.sureBtn.interactable = false;
                    this.opposeBtn.interactable = false;
                }else {
                    this.sureBtn.interactable = true;
                    this.opposeBtn.interactable = true;
                }
            }
        }
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if (this.remainTime > 0 && this.data !== null) {
            this.dt += dt;
            if (this.dt > 1.0) {
                this.remainTime -= 1;
                this._Reload();
                this.dt -= 1.0;
            }
        }
    },
});
