var enableColor = new cc.Color(168, 120, 20);
var disableColor = new cc.Color(128, 128, 128);

var winFontColor = new cc.Color(230, 116, 10);
var loseFontColor = new cc.Color(168, 120, 20);

cc.Class({
    extends: cc.Component,

    properties: {
        
        roomId : cc.Label,
        quan : cc.Label,
        hunCount : cc.Label,
        zhuang : cc.Label,
        zatouzi : cc.Label,
        niu : cc.Label,
        
        heads : {
            default : [],
            type : cc.Node,
        },
    },

    // use this for initialization
    onLoad: function () {

    },
    
    OnShow : function() {
        this.node.active = true;
        this.SetUp();
    },
    
    OnHide : function() {
        this.node.active = false;
        GameEvent().SendEvent('CloseTotalAccuoutsPanel');
    },
    
    SetUp : function() {
        var quan = (GameData.userRoomData.quanId === 1) ? 1 : 4;
        var playCount = GameData.userRoomData.playCount;
        var quanCount = (typeof playCount === 'undefined') ? 0 : (Math.floor(playCount / 4) + 1);
        this.quan.string = quanCount + "/" + quan + "圈";
        this.hunCount.string = "荤低:" + GameData.userRoomData.hunCount;
        this.zhuang.node.color = (GameData.userRoomData.ruleId & 1) === 1 ? enableColor : disableColor;
        this.zatouzi.node.color = (GameData.userRoomData.ruleId & 4) === 4 ? enableColor : disableColor;
        this.niu.node.color = (GameData.userRoomData.ruleId & 2) === 2 ? enableColor : disableColor;
        this.roomId.string = "房间:" + GameData.userRoomData.id;
        
        var player;
        var winnerPlace = 0;
        var minScore = -999999999;
        for (var pi = 0; pi < 4; ++pi) {
            player = GameData.players[pi];
            
            if (minScore < player.totalScore) {
                minScore = player.totalScore;
                winnerPlace = pi;
            }
        }
        
        for (var i = 0; i < 4; ++i) {
            player = GameData.players[i];
            
            var rootNode = this.heads[i].getChildByName('root');
            rootNode.active = GameData.userRoomData.ownerId === player.id ? true : false;
            
            var iconSpr = this.heads[i].getChildByName('icon').getComponent(cc.Sprite);
            SetSpriteImage(iconSpr, {url: player.headUrl, type:'jpg'});
            
            this.heads[i].getChildByName('winner').active = winnerPlace === i ? true : false;
            if (winnerPlace === i && player.totalScore === 0) {
                this.heads[i].getChildByName('winner').active = false;
            }
            
            var nameLab = this.heads[i].getChildByName('name').getComponent(cc.Label);
            nameLab.string = player.name;
            
            var scoreLab = this.heads[i].getChildByName('score').getComponent(cc.Label);
            scoreLab.string = player.totalScore;
            if (player.totalScore >= 0) {
                scoreLab.node.color = winFontColor;
            }else {
                scoreLab.node.color = loseFontColor;
            }
     
        }
    }
    

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
