var enableColor = new cc.Color(168, 120, 20);
var disableColor = new cc.Color(128, 128, 128);

cc.Class({
    extends: cc.Component,

    properties: {
        
        heads : {
            default : [],
            type : cc.Node,
        },
        
        cards : {
            default : [],
            type : cc.Node,
        },
        
        scores : {
            default : [],
            type : cc.Label,
        },
        
        singleScores : {
            default : [],
            type : cc.Label,
        },
        
        shareBtn : cc.Button,
        continueBtn : cc.Button,
        
        roomId : cc.Label,
        remain : cc.Label,
        quan : cc.Label,
        hunCount : cc.Label,
        zhuang : cc.Label,
        zatouzi : cc.Label,
        niu : cc.Label,
        
        cardPrefab : cc.Prefab,
        gapPrefab : cc.Prefab,
        gangPrefab : cc.Prefab,
        pengPrefab : cc.Prefab,
        jiangPrefab : cc.Prefab,
    },

    // use this for initialization
    onLoad: function () {
        

    },
    
    OnShow : function() {
        this.node.active = true;
        this.SetTitleInfo();
        this.SetHeads();
        this.SetCards();
        this.SetScore();
    },
    
    OnHide : function() {
        this.node.active = false;
    },
    
    
    SetTitleInfo : function() {
        this.remain.string = "剩余:"+ 66 +"张";
        if (typeof GameData.userRoomData.remainNum === 'number') {
            this.remain.string = "剩余:"+GameData.userRoomData.remainNum+"张";
        }
        
        var quan = (GameData.userRoomData.quanId === 1) ? 1 : 4;
        var playCount = GameData.userRoomData.playCount;
        var quanCount = (typeof playCount === 'undefined') ? 0 : (Math.floor(playCount / 4) + 1);
        this.quan.string = quanCount + "/" + quan + "圈";
        this.hunCount.string = "荤低:" + GameData.userRoomData.hunCount;
        this.zhuang.node.color = (GameData.userRoomData.ruleId & 1) === 1 ? enableColor : disableColor;
        this.zatouzi.node.color = (GameData.userRoomData.ruleId & 4) === 4 ? enableColor : disableColor;
        this.niu.node.color = (GameData.userRoomData.ruleId & 2) === 2 ? enableColor : disableColor;
        this.roomId.string = "房间:" + GameData.userRoomData.id;
    },
    
    SetCards : function() {
        var player, cards, niuCards, gangCards, kanCards, pengCards, jiangCards;
        var inst, spr, children, k, c;
        for (var i = 0; i < 4; ++i) {
            player = GameData.players[i];
            cards = player.cards;
            niuCards = player.niuCards;
            gangCards = player.gangCards;
            kanCards = player.kanCards;
            pengCards = player.pengCards;
            jiangCards = player.jiangCards;
            
            this.cards[i].removeAllChildren();
            
            for (k = 0; niuCards && k < niuCards.length; k+=3) {
                inst = cc.instantiate(this.pengPrefab);
                children = inst.children;
                for (c = 0; c < children.length; c++) {
                    spr = children[c].getComponent(cc.Sprite);
                    spr.spriteFrame = CardSpriteFrameCache[3][45+c];
                }
            
                this.cards[i].addChild(inst);
                this.cards[i].addChild(cc.instantiate(this.gapPrefab));
                k+=13;
            }
        
            for (k = 0; gangCards && k < gangCards.length; k+=4) {
                inst = cc.instantiate(this.gangPrefab);
                spr = inst.getChildByName('card4').getComponent(cc.Sprite);
                spr.spriteFrame = CardSpriteFrameCache[3][gangCards[k]];
            
                this.cards[i].addChild(inst);
                this.cards[i].addChild(cc.instantiate(this.gapPrefab));
            }
        
            for (k = 0; kanCards && k < kanCards.length; k+=3) {
                inst = cc.instantiate(this.pengPrefab);
                children = inst.children;
                for (c = 0; c < children.length; c++) {
                    spr = children[c].getComponent(cc.Sprite);
                    if (c === 1) {
                        spr.spriteFrame = CardSpriteFrameCache[3][kanCards[k]];
                    }else {
                        spr.spriteFrame = CardSpriteFrameCache[3][10];
                    }
                }
            
                this.cards[i].addChild(inst);
                this.cards[i].addChild(cc.instantiate(this.gapPrefab));
            }
        
            for (k = 0; pengCards && k < pengCards.length; k+=3) {
                inst = cc.instantiate(this.pengPrefab);
                children = inst.children;
                for (c = 0; c < children.length; c++) {
                    spr = children[c].getComponent(cc.Sprite);
                    spr.spriteFrame = CardSpriteFrameCache[3][pengCards[k]];
                }
                
                this.cards[i].addChild(inst);
                this.cards[i].addChild(cc.instantiate(this.gapPrefab));
            }
     
            for (k = 0; jiangCards && k < jiangCards.length; k+=2) {
                inst = cc.instantiate(jiangPrefab);
                children = inst.children;
                for (c = 0; c < children.length; c++) {
                    spr = children[c].getComponent(cc.Sprite);
                    spr.spriteFrame = CardSpriteFrameCache[3][jiangCards[k]];
                }
            
                this.cards[i].addChild(inst);
                this.cards[i].addChild(cc.instantiate(gapPrefab));
            }
            
            
            for (var j = 0; j < cards.length; ++j) {
                inst = cc.instantiate(this.cardPrefab);
                spr = inst.getComponent(cc.Sprite);
                spr.spriteFrame = CardSpriteFrameCache[4][cards[j]];
                if (GameData.huPlace === i && j === (cards.length - 1))
                {
                    if (((cards.length - 1) % 3) !== 0) {
                        this.cards[i].addChild(cc.instantiate(this.gapPrefab));
                        this.cards[i].addChild(inst);
                    }
                    else {
                        this.cards[i].addChild(inst);
                        this.cards[i].addChild(cc.instantiate(this.gapPrefab));
                        inst = cc.instantiate(this.cardPrefab);
                        spr = inst.getComponent(cc.Sprite);
                        spr.spriteFrame = CardSpriteFrameCache[4][GameData.huCard];
                        this.cards[i].addChild(inst);
                    }
                }
                else {
                    this.cards[i].addChild(inst);
                }
            }
        }
    },
    
    
    SetHeads : function() {
        GameLog(GameData);
        var head, player;
        for (var i = 0; i < 4; ++i) {
            player = GameData.players[i];
            head = this.heads[i];
            
            var headIcon = head.getChildByName('headIcon').getComponent(cc.Sprite);
            SetSpriteImage(headIcon, player.headUrl);
            
            if (GameData.userRoomData.bankerPlace === i) {
                head.getChildByName("zhuang").active = true;
            }
            else {
                head.getChildByName("zhuang").active = false;
            }
            
            if (GameData.userRoomData.ownerId === player.id) {
                head.getChildByName("root").active = true;
            }else {
                head.getChildByName("root").active = false;
            }
            
            if (GameData.huPlace === i) {
                head.getChildByName("hu").active = true;
            }else {
                head.getChildByName("hu").active = false;
            }
        }
          
    },
    
    
    SetScore : function() {
        for (var i = 0; i < GameData.players.length; ++i) {
            this.scores[i].string = GameData.players[i].score;
            if (GameData.players[i].singleScore >= 0) {
                this.singleScores[i].string = "+" + GameData.players[i].singleScore;
            }else {
                this.singleScores[i].string = GameData.players[i].singleScore;
            }
        }    
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
