cc.Class({
    extends: cc.Component,

    properties: {
        chiPrefabs : {
            default : [],
            type : cc.Node,
        },

        ASet : {
            default : [],
            type : cc.Node,
        },

        BSet : {
            default : [],
            type : cc.Node,
        }
    },

    // use this for initialization
    onLoad: function () {

    },

    OnShow : function(chiCardsArray) {
        if(chiCardsArray.length < 2) {
            GameLog("吃牌组合小于两种!");
            return;
        }
        
        this.node.active = true;
        if (chiCardsArray.length === 2) {
            for (var i = 0; i < this.BSet.length; ++i) {
                this.BSet[i].active = false;
            }
        }
        else {
            for (var i = 0; i < this.BSet.length; ++i) {
                this.BSet[i].active = true;
            }
        }

        var chiPrefab = null, children, spr;
        for (var j = 0; j < chiCardsArray.length && j < 3; ++j) {
            chiPrefab = this.chiPrefabs[j];
            children = chiPrefab.children;
            for (var k = 0; k < children.length; ++k) {
                spr = children[k].getComponent(cc.Sprite);
                spr.spriteFrame = CardSpriteFrameCache[4][chiCardsArray[j][k]];
            }
        }
    },
    
    OnHide : function() {
        this.node.active = false;
    },

    OnSelect : function (event, selectIndex) {
        GameEvent().SendEvent('ChiSelected', selectIndex);
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
