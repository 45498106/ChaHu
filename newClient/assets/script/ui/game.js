
var Util = require('Utility');

// 是否有效的牌
function IsValidCard(card) {
    if ((card >= 11 && card <= 19) ||
        (card >= 21 && card <= 29) ||
        (card >= 31 && card <= 39) ||
        (card >= 45 && card <= 47) )
    {
        return true;
    }
    
    return false;
}

var GetFrontPlayer = function() {
 
    if (GameData.selfPlace === 0) {
        return GameData.players[3];
    } else {
        return GameData.players[GameData.selfPlace - 1];
    }
}

var GetBackPlayer = function() {
    if (GameData.selfPlace === 3) {
        return GameData.players[0];
    }else {
        return GameData.players[GameData.selfPlace + 1];
    }
}

var GetOppositePlayer = function() {
    if (GameData.selfPlace > 1) {
        return GameData.players[GameData.selfPlace - 2];
    }else {
        return GameData.players[GameData.selfPlace + 2];
    }
}

var IsFrontPlayer = function(place) {
    if (GameData.selfPlace === 0) {
        return 3 === place;
    } else {
        return (GameData.selfPlace - 1) === place;
    }
}

var IsBackPlayer = function(place) {
    if (GameData.selfPlace === 3) {
        return 0 === place;
    }else {
        return (GameData.selfPlace + 1) === place;
    }
}

var IsOppositePlayer = function(place) {
    if (GameData.selfPlace > 1) {
        return (GameData.selfPlace - 2) === place;
    }else {
        return (GameData.selfPlace + 2) == place;
    }
}

var enableColor = new cc.Color(104, 218, 0);
var disableColor = new cc.Color(128, 128, 128);

cc.Class({
    extends: cc.Component,

    properties: {
        hotUpdate : cc.Node,
        
        playingPnl : cc.Node,
        accountsPnl : cc.Node,
        preparePnl : cc.Node,
        
        preSelfHead : cc.Node,
        selfReady : cc.Sprite,
        
        preFrontHead : cc.Node,
        frontReady : cc.Sprite,
        
        preBackHead : cc.Node,
        backReady : cc.Sprite,
        
        preOppositeHead : cc.Node,
        oppositefReady : cc.Sprite,
        
        preRoomIdLabel : cc.Label,
        
        exitRoomBtn : cc.Button,
        inviteBtn : cc.Button,
        readyBtn : cc.Button,
        countiuBtn : cc.Button,
        
        gap : cc.Prefab,
        gap_v : cc.Prefab,
        gap_u : cc.Prefab,
        cardPrefab : cc.Prefab,
        
        gangPrefab : cc.Prefab,
        pengPrefab : cc.Prefab,
        jiangPrefab : cc.Prefab,
        
        frontGangPrefab : cc.Prefab,
        frontPengPrefab : cc.Prefab,
        frontJiangPrefab : cc.Prefab,
        
        backGangPrefab : cc.Prefab,
        backPengPrefab : cc.Prefab,
        backJiangPrefab : cc.Prefab,
        
        upGangPrefab : cc.Prefab,
        upPengPrefab : cc.Prefab,
        upJiangPrefab : cc.Prefab,
        
        selfHand : cc.Node,
        selfOutput : cc.Node,
        
        frontHand : cc.Node,
        frontOutput : cc.Node,
        
        backHand : cc.Node,
        backOutput : cc.Node,
        
        oppositeHand : cc.Node,
        oppositeOutput : cc.Node,
        
        selfHead : cc.Node,
        frontHead : cc.Node,
        backHead : cc.Node,
        upHead : cc.Node,
        
        operationPnl : cc.Node,
        opBtnGuo : cc.Button,
        opBtnZha : cc.Button,
        opBtnHu : cc.Button,
        opBtnPiao : cc.Button,
        opBtnGang : cc.Button,
        opBtnPeng : cc.Button,
        opBtnJiang : cc.Button,
        opBtnKan : cc.Button,
        opBtnNiu : cc.Button,
        opBtnXi : cc.Button,
        
        remainLabel : cc.Label,
        quanLabel : cc.Label,
        hunLabel : cc.Label,
        zhuangLabel : cc.Label,
        jiangLabel : cc.Label,
        niuLabel : cc.Label,
        roomIdLabel : cc.Label,
        
        dongDown : cc.Sprite,
        dongUp : cc.Sprite,
        dongLeft : cc.Sprite,
        dongRight : cc.Sprite,
    },

    // use this for initialization
    onLoad: function () {
        this.playingPnl.active = false;
        this.preparePnl.active = false;
        
        this.exitRoomBtn.node.on('click', this.OnExitRoom, this)
        this.inviteBtn.node.on('click', this.OnInvitePlayer, this)
        this.readyBtn.node.on('click', this.OnReady, this)
        this.countiuBtn.node.on('click', this.OnContinue, this);
        
        this.opBtnGuo.node.on('click', this.OnOpGuo, this);
        this.opBtnZha.node.on('click', this.OnOpZha, this);
        this.opBtnHu.node.on('click', this.OnOpHu, this);
        this.opBtnPiao.node.on('click', this.OnOpPiao, this);
        this.opBtnGang.node.on('click', this.OnOpGang, this);
        this.opBtnPeng.node.on('click', this.OnOpPeng, this);
        this.opBtnJiang.node.on('click', this.OnOpJiang, this);
        this.opBtnKan.node.on('click', this.OnOpKan, this);
        this.opBtnNiu.node.on('click', this.OnOpNiu, this);
        this.opBtnXi.node.on('click', this.OnOpXi, this);
        
        GameEvent().OnEvent('JoinPlayer', this.OnJoinPlayer, this);
        GameEvent().OnEvent('LosePlayer', this.OnLosePlayer, this);
        GameEvent().OnEvent('PlayerOffline', this.OnPlayerOffline, this);
        GameEvent().OnEvent('PlayerReconnection', this.OnPlayerReconnection, this);
        GameEvent().OnEvent('PlayerReady', this.OnPlayerReady, this);
        GameEvent().OnEvent('NewGame', this.PlayingShow, this);
        GameEvent().OnEvent('ExitRoom', this.ExitRoom, this);
        GameEvent().OnEvent('ResumeGame', this.ResumeGame, this);
        GameEvent().OnEvent('InitCards', this.OnInitCards, this);
        GameEvent().OnEvent('GetCard', this.OnGetCard, this);
        GameEvent().OnEvent('AddNiuCard', this.OnAddNiuCard, this);
        GameEvent().OnEvent('ThrowCard', this.OnThrowCard, this);
        GameEvent().OnEvent('PengCards', this.OnPengCards, this);
        GameEvent().OnEvent('GangCards', this.OnGangCards, this);
        GameEvent().OnEvent('KanCards', this.OnKanCards, this);
        GameEvent().OnEvent('NiuCards', this.OnNiuCards, this);
        GameEvent().OnEvent('JiangCards', this.OnJiangCards, this);
        GameEvent().OnEvent('HuCards', this.OnHuCards, this);
       

        if (GameData.userRoomData.played === 0) {
            this.PrepareShow();
        }else if (GameData.userRoomData.played === 1) {
            this.PlayingShow();
            if (GameData.resumeGame === true) {
                this.ResumeGame();
                GameData.resumeGame === false;
            }
        }
    },

    SetTitleInfo : function() {
        
        this.remainLabel.string = "剩余:"+120+"张";
        var quan = (GameData.userRoomData.quanId === 1) ? 1 : 4;
        var playCount = GameData.userRoomData.playCount;
        var quanCount = (typeof playCount === 'undefined') ? 0 : (Math.floor(playCount / 4) + 1);
        this.quanLabel.string = quanCount + "/" + quan + "圈";
        this.hunLabel.string = "荤低:" + GameData.userRoomData.hunCount;
        this.zhuangLabel.node.color = enableColor;
        this.jiangLabel.node.color = disableColor;
        this.niuLabel.node.color = enableColor;
        this.roomIdLabel.string = "房间:" + GameData.userRoomData.id;
    },
    
    SetDongInfo : function(place) {
        
        this.dongDown.node.active = false;
        this.dongUp.node.active = false;
        this.dongLeft.node.active = false;
        this.dongRight.node.active = false;
        
        if (IsFrontPlayer(place)) {
            this.dongLeft.node.active = true;
        }else if (IsBackPlayer(place)) {
            this.dongRight.node.active = true;
        }else if (IsOppositePlayer(place)){
            this.dongUp.node.active = true;
        }else {
            this.dongDown.node.active = true;
        }
    },
    
    PrepareShow : function() {
        this.playingPnl.active = false;
        this.preparePnl.active = true;
        
        this.InitPreHead();
        var player ;
        for (var i = 0 ; i < GameData.players.length; ++i) {
            player = GameData.players[i];
            if (player) {
                this.OnJoinPlayer(player.place);
            }
        }
        
        this.preRoomIdLabel.string = "房间ID:"+ GameData.userRoomData.id;
        
        this.SetTitleInfo();
    },
    
    PlayingShow : function() {
        this.playingPnl.active = true;
        this.preparePnl.active = false;
        this.accountsPnl.active = false;
        
        this.ClearAllOutput();
        this.InitPlayingHead();
        this.HiddenOperat();
        
        GameData.needFlushCard = false;
        
        this.SetTitleInfo();
    },
    
    ResumeGame : function() {
        var player, throwFunc, place;
        for (var i = 0; i < 4; ++i) {
            player = GameData.players[i];
            
            var data = GameData.selfOperation;
            if (player.id === GameData.userId && typeof data.getCard !== 'undefined') {
                // 重现抓牌
                var card = data.getCard;
                Util.ArrayRemoveElemnt(player.cards, card);
                player.cards.sort();
                
                this.SelfInitCards(player.cards, player.pengCards, player.gangCards, 
                                   player.kanCards, player.niuCards, player.jiangCards);
            
                player.cards.push(card);
                this.SelfAddCard(card, player.cards.length - 1);
            }
            else {
                this.InitPlayerCards(i, player);
            }
            
            place = i;
            if (IsFrontPlayer(place)) {
                throwFunc = this.FrontThrowCard;
            }else if (IsBackPlayer(place)) {
                throwFunc = this.BackThrowCard;
            }else if (IsOppositePlayer(place)){
                throwFunc = this.OppositeThrowCard;
            }else {
                throwFunc = this.SelfThrowCard;
            }
            
            if (player.outputCards) {
                for (var oi = 0; oi < player.outputCards.length; ++oi) {
                    throwFunc.call(this, player.outputCards[oi]);
                }
                player.outputCards = null;
            }
            
            if (player.id === GameData.userId ) {
                
                
                this.ShowOperat(typeof data.jiang !== 'undefined', typeof data.niu !== 'undefined', 
                        typeof data.kan !== 'undefined', typeof data.peng !== 'undefined', 
                        typeof data.gang !== 'undefined', typeof data.hu !== 'undefined',
                        typeof data.zha !== 'undefined', typeof data.xi !== 'undefined', 
                        typeof data.piao !== 'undefined' );
                        
                GameData.selfOperation = null;
            }
        }
    },
    
    SetupPreHead : function(player, preHeadNode) {
        var nameLable = preHeadNode.getChildByName("name").getComponent('cc.Label');
        nameLable.string = player.name;
        
        var headSprite = preHeadNode.getChildByName("headIcon").getComponent('cc.Sprite');
        SetSpriteImage(headSprite, player.headUrl);
        
        var rootSprite = preHeadNode.getChildByName("root").getComponent('cc.Sprite');
        rootSprite.node.active = false;
        
        if (typeof GameData.userRoomData.ownerId === 'number') {
            if (GameData.userRoomData.ownerId === player.id) {
                rootSprite.node.active = true;
            }
        }
    },
    
    ClearAllReady : function() {
        this.frontReady.node.active = false;
        this.backReady.node.active = false;
        this.oppositefReady.node.active = false;
        this.selfReady.node.active = false;
        
        this.readyBtn.node.active = false;
        this.inviteBtn.node.active = true;
    },
    
    InitPreHead : function() {
        var headArray = [this.preFrontHead, this.preOppositeHead, this.preBackHead, this.preSelfHead]
        var preHeadNode;
        for (var i = 0; i < headArray.length; ++i) {
            preHeadNode = headArray[i];
            
            var nameLable = preHeadNode.getChildByName("name").getComponent('cc.Label');
            nameLable.string = '';
        
            var headSprite = preHeadNode.getChildByName("headIcon").getComponent('cc.Sprite');
            SetSpriteImage(headSprite, 'game/defaultHead', true);
        
            var rootSprite = preHeadNode.getChildByName("root").getComponent('cc.Sprite');
            rootSprite.node.active = false;
        }
        
        this.ClearAllReady();
    },
    
    InitPlayingHead : function() {
        var headNode, player;
        for (var i = 0; i < 4; ++i) {
            if (IsFrontPlayer(i)) {
                headNode = this.frontHead;
            }else if (IsBackPlayer(i)) {
                headNode = this.backHead;
            }else if (IsOppositePlayer(i)) {
                headNode = this.upHead;
            }else {
                headNode = this.selfHead;
            }
            
            player = GameData.players[i];
            
            var nameLable = headNode.getChildByName("name").getComponent('cc.Label');
            nameLable.string = player.name;
   
            var headSprite = headNode.getChildByName("headIcon").getComponent('cc.Sprite');
            SetSpriteImage(headSprite, player.headUrl);
            
            var rootSprite = headNode.getChildByName("root").getComponent('cc.Sprite');
            rootSprite.node.active = false;
            if (typeof GameData.userRoomData.ownerId === 'number') {
                if (GameData.userRoomData.ownerId === player.id) {
                    rootSprite.node.active = true;
                }
            }
            
            var offlineSprite = headNode.getChildByName("offline").getComponent('cc.Sprite');
            offlineSprite.node.active = false;
            if (typeof player.offline !== 'undefined') {
                offlineSprite.node.active = true;
            }
            
            var zhuangSprite = headNode.getChildByName("zhuang").getComponent('cc.Sprite');
            zhuangSprite.node.active = false;
            if (GameData.userRoomData.bankerPlace === i) {
                zhuangSprite.node.active = true;
            }
        }
    },
    
    OnJoinPlayer : function(event) {
        
        var place;
        if (typeof event === 'number') {
            place = event;
        }else {
            place = event.detail;
        }
        
        var player = GameData.players[place];
        
        var preHeadNode;
        if (IsFrontPlayer(place)) {
            preHeadNode = this.preFrontHead;
        }else if (IsBackPlayer(place)) {
            preHeadNode = this.preBackHead;
        }else if (IsOppositePlayer(place)) {
            preHeadNode = this.preOppositeHead;
        }else {
            preHeadNode = this.preSelfHead;
        }
        
        this.SetupPreHead(player, preHeadNode);
        
        if (GameData.GetPlayerCount() === 4) {
            this.inviteBtn.node.active = false;
            this.readyBtn.node.active = true;
        }else {
            this.readyBtn.node.active = false;
            this.inviteBtn.node.active = true;
        }
    },
    
    OnLosePlayer : function(event) {
        var place = event.detail;
        
        var preHeadNode, readySpr;
        if (IsFrontPlayer(place)) {
            preHeadNode = this.preFrontHead;
            this.frontReady.node.active = false;
        }else if (IsBackPlayer(place)) {
            preHeadNode = this.preBackHead;
            this.backReady.node.active = false;
        }else if (IsOppositePlayer(place)) {
            preHeadNode = this.preOppositeHead;
            this.oppositefReady.node.active = false;
        }else {
            preHeadNode = this.preSelfHead;
            this.selfReady.node.active = false;
        }
        
        var nameLable = preHeadNode.getChildByName("name").getComponent('cc.Label');
        nameLable.string = '';
        
        var headSprite = preHeadNode.getChildByName("headIcon").getComponent('cc.Sprite');
        SetSpriteImage(headSprite, '/game/defaultHead', true);
    
        var rootSprite = preHeadNode.getChildByName("root").getComponent('cc.Sprite');
        rootSprite.node.active = false;
        
        this.ClearAllReady();
    },
    
    OnPlayerOffline : function(event) {
        var place = event.detail;
        var headNode;
        if (IsFrontPlayer(place)) {
            headNode = this.frontHead;
        }else if (IsBackPlayer(place)) {
            headNode = this.backHead;
        }else if (IsOppositePlayer(place)) {
            headNode = this.upHead;
        }else {
            headNode = this.selfHead;
        }
        
        var offlineSprite = headNode.getChildByName("offline").getComponent('cc.Sprite');
        offlineSprite.node.active = false;
        var player = GameData.players[place];
        if (typeof player.offline !== 'undefined') {
            offlineSprite.node.active = true;
        }
    },
    
    OnPlayerReconnection : function(event) {
        var place = event.detail;
        var headNode;
        if (IsFrontPlayer(place)) {
            headNode = this.frontHead;
        }else if (IsBackPlayer(place)) {
            headNode = this.backHead;
        }else if (IsOppositePlayer(place)) {
            headNode = this.upHead;
        }else {
            headNode = this.selfHead;
        }
        
        var offlineSprite = headNode.getChildByName("offline").getComponent('cc.Sprite');
        offlineSprite.node.active = false;
        var player = GameData.players[place];
        if (typeof player.offline !== 'undefined') {
            offlineSprite.node.active = true;
        }
    },
    
    OnPlayerReady : function(event) {
        var place = event.detail;
        
        var readySpr = null;
        if (IsFrontPlayer(place)) {
            readySpr = this.frontReady;
        }else if (IsBackPlayer(place)) {
            readySpr = this.backReady;
        }else if (IsOppositePlayer(place)) {
            readySpr = this.oppositefReady;
        }else {
            readySpr = this.selfReady;
        }
        
        if (readySpr)
            readySpr.node.active = true;
    },
    
    OnExitRoom : function() {
        GameSocket().Send("exitRoom");
    },
    
    ExitRoom : function() {
        cc.director.loadScene('home'); 
    },
    
    OnInvitePlayer : function() {
        GameLog("OnInvitePlayer");
    },
    
    OnReady : function() {
        GameSocket().Send("ready");
    },
    
    OnContinue : function() {
        this.accountsPnl.active = false;
        GameSocket().Send("ready");
    },
    
    OnInitCards : function(event) {
        var data = event.detail;
        var place = data.place;

        var player = GameData.players[place];
        if (IsFrontPlayer(place)) {
            this.FrontInitCards(player.cards, player.pengCards, player.gangCards, 
                player.kanCards, player.niuCards, player.jiangCards);
        }else if (IsBackPlayer(place)) {
            this.BackInitCards(player.cards, player.pengCards, player.gangCards, 
                player.kanCards, player.niuCards, player.jiangCards);
        }else if (IsOppositePlayer(place)) {
            this.OppositeInitCards(player.cards, player.pengCards, player.gangCards, 
                player.kanCards, player.niuCards, player.jiangCards);
        }else {
            this.SelfInitCards(player.cards, player.pengCards, player.gangCards, 
                player.kanCards, player.niuCards, player.jiangCards);
        }
    },
    
    OnGetCard : function(event) {
        
        var data = event.detail;
        var place = data.place;
        var card = data.card;
        
        if (GameData.needFlushCard) {
            InitPlayerCards(place, player);
            GameData.needFlushCard = false;
        }
        
        this.SetDongInfo(place);
        
        if (IsFrontPlayer(place)) {
            this.FrontAddCard(card);
        }else if (IsBackPlayer(place)) {
            this.BackAddCard(card);
        }else if (IsOppositePlayer(place)){
            this.OppositeAddCard(card)
        }else {
            var cards = GameData.players[place].cards;
            this.SelfAddCard(card, cards.length - 1);
        }
        
        this.ShowOperat(typeof data.jiang !== 'undefined', typeof data.niu !== 'undefined', 
                        typeof data.kan !== 'undefined', typeof data.peng !== 'undefined', 
                        typeof data.gang !== 'undefined', typeof data.hu !== 'undefined',
                        typeof data.zha !== 'undefined', typeof data.xi !== 'undefined', 
                        typeof data.piao !== 'undefined' );
        
    },
    
    OnAddNiuCard : function(event) {
        
        var data = event.detail;
        var place = data.place;
        var card = data.card;
        
        if (GameData.needFlushCard) {
            InitPlayerCards(place, player);
            GameData.needFlushCard = false;
        }

        if (IsFrontPlayer(place)) {
            this.FrontAddCard(card);
        }else if (IsBackPlayer(place)) {
            this.BackAddCard(card);
        }else if (IsOppositePlayer(place)){
            this.OppositeAddCard(card)
        }else {
            var cards = GameData.players[place].cards;
            this.SelfAddCard(card, cards.length - 1);
        }
        
        this.ShowOperat(typeof data.jiang !== 'undefined', typeof data.niu !== 'undefined', 
                        typeof data.kan !== 'undefined', typeof data.peng !== 'undefined', 
                        typeof data.gang !== 'undefined', typeof data.hu !== 'undefined',
                        typeof data.zha !== 'undefined', typeof data.xi !== 'undefined', 
                        typeof data.piao !== 'undefined' );
        
        GameData.needFlushCard = true;
    },
    
    OnThrowCard : function(event) {

        var data = event.detail;
        var place = data.place;
        var card = data.card;
        
        var player = GameData.players[place];
        
        if (IsFrontPlayer(place)) {
            this.FrontInitCards(player.cards, player.pengCards, player.gangCards, player.kanCards, player.niuCards, player.jiangCards);
            this.FrontThrowCard(card);
        }else if (IsBackPlayer(place)) {
            this.BackInitCards(player.cards, player.pengCards, player.gangCards, player.kanCards, player.niuCards, player.jiangCards);
            this.BackThrowCard(card);
        }else if (IsOppositePlayer(place)){
            this.OppositeInitCards(player.cards, player.pengCards, player.gangCards, player.kanCards, player.niuCards, player.jiangCards);
            this.OppositeThrowCard(card);
        }else {
            this.SelfInitCards(player.cards, player.pengCards, player.gangCards, player.kanCards, player.niuCards, player.jiangCards);
            this.SelfThrowCard(card);
        }
        
        this.ShowOperat(typeof data.jiang !== 'undefined', typeof data.niu !== 'undefined', 
                typeof data.kan !== 'undefined', typeof data.peng !== 'undefined', 
                typeof data.gang !== 'undefined', typeof data.hu !== 'undefined',
                typeof data.zha !== 'undefined', typeof data.xi !== 'undefined', 
                typeof data.piao !== 'undefined' );
    
        // 播放声音
        var audioMng = AudioMng();
        if (audioMng) audioMng.playCard(card);
    },
    
    OnPengCards : function(event) {

        var data = event.detail;
        var place = data.place;
        
        if (GameData.selfPlace === place) {
            this.HiddenOperat();
        }
        
        var player = GameData.players[place];
        this.InitPlayerCards(place, player);
    
        if (typeof data.throwCardPlace !== 'undefined') {
            this.DelLastThrowCardByPlace(data.throwCardPlace);
        }
        
        this.ShowOperat(typeof data.jiang !== 'undefined', typeof data.niu !== 'undefined', 
                        typeof data.kan !== 'undefined', typeof data.peng !== 'undefined', 
                        typeof data.gang !== 'undefined', typeof data.hu !== 'undefined',
                        typeof data.zha !== 'undefined', typeof data.xi !== 'undefined', 
                        typeof data.piao !== 'undefined' );
        
        // 播放声音
        //pengSound.play();
    },
    
    OnGangCards : function(event) {

        var data = event.detail;
        var place = data.place;
        
        if (GameData.selfPlace === place) {
            this.HiddenOperat();
        }
        
        var player = GameData.players[place];
        this.InitPlayerCards(place, player);
    
        if (typeof data.throwCardPlace !== 'undefined') {
            this.DelLastThrowCardByPlace(data.throwCardPlace);
        }
        
        this.ShowOperat(typeof data.jiang !== 'undefined', typeof data.niu !== 'undefined', 
                        typeof data.kan !== 'undefined', typeof data.peng !== 'undefined', 
                        typeof data.gang !== 'undefined', typeof data.hu !== 'undefined',
                        typeof data.zha !== 'undefined', typeof data.xi !== 'undefined', 
                        typeof data.piao !== 'undefined' );

        // 播放声音
        //pengSound.play();
    },
    
    OnKanCards : function(event) {
        
        var data = event.detail;
        var place = data.place;
        
        var player = GameData.players[place];
        this.InitPlayerCards(place, player);
        
        this.ShowOperat(typeof data.jiang !== 'undefined', typeof data.niu !== 'undefined', 
                        typeof data.kan !== 'undefined', typeof data.peng !== 'undefined', 
                        typeof data.gang !== 'undefined', typeof data.hu !== 'undefined',
                        typeof data.zha !== 'undefined', typeof data.xi !== 'undefined', 
                        typeof data.piao !== 'undefined' );
        // 播放声音
        //jiangSound.play();
    },
    
    OnNiuCards : function(event) {
        
        var data = event.detail;
        var place = data.place;
        
        var player = GameData.players[place];
        this.InitPlayerCards(place, player);
        
        this.ShowOperat(typeof data.jiang !== 'undefined', typeof data.niu !== 'undefined', 
                        typeof data.kan !== 'undefined', typeof data.peng !== 'undefined', 
                        typeof data.gang !== 'undefined', typeof data.hu !== 'undefined',
                        typeof data.zha !== 'undefined', typeof data.xi !== 'undefined', 
                        typeof data.piao !== 'undefined' );
        // 播放声音
        //jiangSound.play();
    },
    
    OnJiangCards : function(event) {
        
        var data = event.detail;
        var place = data.place;
        
        var player = GameData.players[place];
        this.InitPlayerCards(place, player);
        
        if (typeof data.throwCardPlace !== 'undefined') {
            this.DelLastThrowCardByPlace(data.throwCardPlace);
        }
        
        this.ShowOperat(typeof data.jiang !== 'undefined', typeof data.niu !== 'undefined', 
                        typeof data.kan !== 'undefined', typeof data.peng !== 'undefined', 
                        typeof data.gang !== 'undefined', typeof data.hu !== 'undefined',
                        typeof data.zha !== 'undefined', typeof data.xi !== 'undefined', 
                        typeof data.piao !== 'undefined' );

        // 播放声音
        //jiangSound.play();
    },

    OnHuCards : function(event) {

        var data = event.detail;
        var place = data.place;
        
        var player = GameData.players[place];
        this.InitPlayerCards(place, player);

        this.ShowOperat(typeof data.jiang !== 'undefined', typeof data.niu !== 'undefined', 
                        typeof data.kan !== 'undefined', typeof data.peng !== 'undefined', 
                        typeof data.gang !== 'undefined', typeof data.hu !== 'undefined',
                        typeof data.zha !== 'undefined', typeof data.xi !== 'undefined', 
                        typeof data.piao !== 'undefined' );
    
        // 播放声音
        //huSound.play();
        
        this.accountsPnl.active = true;
    },
    
    
    OnOpGuo : function() {
        GameSocket().Send('passCards');
    },
    
    OnOpZha : function() {
        GameSocket().Send('zhaCards');
    },
    
    OnOpHu : function() {
        GameSocket().Send('huCards');

    },
    
    OnOpPiao : function() {
        GameSocket().Send('piaoCards');
        
    },
    
    OnOpGang : function() {
        GameSocket().Send('gangCards');

    },
    
    OnOpPeng : function() {
        GameSocket().Send('pengCards');
    },
    
    OnOpJiang : function() {
        GameSocket().Send('jiangCards');
    },
    
    OnOpKan : function() {
        GameSocket().Send('kanCards');
    },
    
    OnOpNiu : function() {
        GameSocket().Send('niuCards');
    },
    
    OnOpXi : function() {
        GameSocket().Send('xiCards');
    },

    
////////////////////////////////////////////////////////////////////////////////

    NeedThrowCards : function(cardIndex) {
        if (GameData.selfPlace === GameData.getCardPlace) {
            GameSocket().Send('needThrowCard',  { 
                "card" : GameData.players[GameData.selfPlace].cards[cardIndex] 
            });
        }
    },

    ClearAllOutput : function() {
        var i;
        var children = this.selfOutput.children;
        for (i = 0; i < children.length; ++i) {
            children[i].opacity = 0;
        }
        
        children = this.frontOutput.children;
        for (i = 0; i < children.length; ++i) {
            children[i].opacity = 0;
        }
        
        children = this.backOutput.children;
        for (i = 0; i < children.length; ++i) {
            children[i].opacity = 0;
        }
        
        children = this.oppositeOutput.children;
        for (i = 0; i < children.length; ++i) {
            children[i].opacity = 0;
        }
    },
    
    ShowOperat : function(jiang, niu, kan, peng, gang, hu, zha, xi, piao) {
        
        if (jiang === false && niu === false && kan === false && peng === false  && 
            gang === false && hu === false && zha === false && xi === false && piao === false) {
            this.HiddenOperat();
            return;
        }
        
        this.operationPnl.active = true;
        this.opBtnGuo.node.active = true;
        
        if (jiang)
            this.opBtnJiang.node.active = true;
        else
            this.opBtnJiang.node.active = false;
            
        if (niu) 
            this.opBtnNiu.node.active = true;
        else
            this.opBtnNiu.node.active = false;
            
        if (kan) 
            this.opBtnKan.node.active = true;
        else
            this.opBtnKan.node.active = false;
            
        if (peng) 
            this.opBtnPeng.node.active = true;
        else
            this.opBtnPeng.node.active = false;
        
        if (gang) 
            this.opBtnGang.node.active = true;
        else
            this.opBtnGang.node.active = false;
            
        if (hu) 
            this.opBtnHu.node.active = true;
        else
            this.opBtnHu.node.active = false;
            
        if (piao) 
            this.opBtnPiao.node.active = true;
        else
            this.opBtnPiao.node.active = false;
    
        if (zha) 
            this.opBtnZha.node.active = true;
        else
            this.opBtnZha.node.active = false;
            
        if (xi) 
            this.opBtnXi.node.active = true;
        else
            this.opBtnXi.node.active = false;
    },
    
    HiddenOperat : function() {
        this.operationPnl.active = false;
    },
    
    InitSpecialCards : function(hand, cardDir, gapPrefab, pengPrefab, gangPrefab,
        jiangPrefab, pengCards, gangCards, kanCards, niuCards, jiangCards) 
    {
        var k,c;
        for (k = 0; niuCards && k < niuCards.length; k+=3) {
            var inst = cc.instantiate(pengPrefab);
            var children = inst.children;
            for (c = 0; c < children.length; c++) {
                var spr = children[c].getComponent(cc.Sprite);
                spr.spriteFrame = CardSpriteFrameCache[cardDir][45+c];;
            }
            
            hand.addChild(inst);
            hand.addChild(cc.instantiate(gapPrefab));
        }
        
        for (k = 0; gangCards && k < gangCards.length; k+=4) {
            var inst = cc.instantiate(gangPrefab);
            var spr = inst.getChildByName('card4').getComponent(cc.Sprite);
            spr.spriteFrame = CardSpriteFrameCache[cardDir][gangCards[k]];
            
            hand.addChild(inst);
            hand.addChild(cc.instantiate(gapPrefab));
        }
        
        for (k = 0; kanCards && k < kanCards.length; k+=3) {
            var inst = cc.instantiate(pengPrefab);
            var children = inst.children;
            for (c = 0; c < children.length; c++) {
                var spr = children[c].getComponent(cc.Sprite);
                spr.spriteFrame = CardSpriteFrameCache[cardDir][kanCards[k]];;
            }
            
            hand.addChild(inst);
            hand.addChild(cc.instantiate(gapPrefab));
        }
        
        for (k = 0; pengCards && k < pengCards.length; k+=3) {
            var inst = cc.instantiate(pengPrefab);
            var children = inst.children;
            for (c = 0; c < children.length; c++) {
                var spr = children[c].getComponent(cc.Sprite);
                spr.spriteFrame = CardSpriteFrameCache[cardDir][pengCards[k]];;
            }
            
            hand.addChild(inst);
            hand.addChild(cc.instantiate(gapPrefab));
        }
 
        for (k = 0; jiangCards && k < jiangCards.length; k+=2) {
            var inst = cc.instantiate(jiangPrefab);
            var children = inst.children;
            for (c = 0; c < children.length; c++) {
                var spr = children[c].getComponent(cc.Sprite);
                spr.spriteFrame = CardSpriteFrameCache[cardDir][jiangCards[k]];;
            }
            
            hand.addChild(inst);
            hand.addChild(cc.instantiate(gapPrefab));
        }
    },
    
    InitSpecialCardsForBack : function(hand, cardDir, gapPrefab, pengPrefab, gangPrefab,
        jiangPrefab, pengCards, gangCards, kanCards, niuCards, jiangCards) 
    {
        var k,c;
        for (k = 0; niuCards && k < niuCards.length; k+=3) {
            var inst = cc.instantiate(pengPrefab);
            var children = inst.children;
            for (c = 0; c < children.length; c++) {
                var spr = children[c].getComponent(cc.Sprite);
                spr.spriteFrame = CardSpriteFrameCache[cardDir][45+c];;
            }
            
            hand.addChild(inst, -hand.children.length);
            hand.addChild(cc.instantiate(gapPrefab), -hand.children.length);
        }
        
        for (k = 0; gangCards && k < gangCards.length; k+=4) {
            var inst = cc.instantiate(gangPrefab);
            var spr = inst.getChildByName('card4').getComponent(cc.Sprite);
            spr.spriteFrame = CardSpriteFrameCache[cardDir][gangCards[k]];
            
            hand.addChild(inst, -hand.children.length);
            hand.addChild(cc.instantiate(gapPrefab), -hand.children.length);
        }
        
        for (k = 0; kanCards && k < kanCards.length; k+=3) {
            var inst = cc.instantiate(pengPrefab);
            var children = inst.children;
            for (c = 0; c < children.length; c++) {
                var spr = children[c].getComponent(cc.Sprite);
                spr.spriteFrame = CardSpriteFrameCache[cardDir][kanCards[k]];;
            }
            
            hand.addChild(inst, -hand.children.length);
            hand.addChild(cc.instantiate(gapPrefab), -hand.children.length);
        }
        
        for (k = 0; pengCards && k < pengCards.length; k+=3) {
            var inst = cc.instantiate(pengPrefab);
            var children = inst.children;
            for (c = 0; c < children.length; c++) {
                var spr = children[c].getComponent(cc.Sprite);
                spr.spriteFrame = CardSpriteFrameCache[cardDir][pengCards[k]];;
            }
            
            hand.addChild(inst, -hand.children.length);
            hand.addChild(cc.instantiate(gapPrefab), -hand.children.length);
        }
 
        for (k = 0; jiangCards && k < jiangCards.length; k+=2) {
            var inst = cc.instantiate(jiangPrefab);
            var children = inst.children;
            for (c = 0; c < children.length; c++) {
                var spr = children[c].getComponent(cc.Sprite);
                spr.spriteFrame = CardSpriteFrameCache[cardDir][jiangCards[k]];;
            }
            
            hand.addChild(inst, -hand.children.length);
            hand.addChild(cc.instantiate(gapPrefab), -hand.children.length);
        }
    },
    
    InitPlayerCards : function(place, player) {
        if (IsFrontPlayer(place)) {
            this.FrontInitCards(player.cards, player.pengCards, player.gangCards, player.kanCards, player.niuCards, player.jiangCards);
        }else if (IsBackPlayer(place)) {
            this.BackInitCards(player.cards, player.pengCards, player.gangCards, player.kanCards, player.niuCards, player.jiangCards);
        }else if (IsOppositePlayer(place)){
            this.OppositeInitCards(player.cards, player.pengCards, player.gangCards, player.kanCards, player.niuCards, player.jiangCards);
        }else {
            this.SelfInitCards(player.cards, player.pengCards, player.gangCards, player.kanCards, player.niuCards, player.jiangCards);
        }
    },
    
    DelLastThrowCardByPlace : function(place) {
        if (IsFrontPlayer(place)) {
            this.DelFrontLastThrowCard();
        }else if (IsBackPlayer(place)) {
            this.DelBackLastThrowCard();
        }else if (IsOppositePlayer(place)){
            this.DelOppositeLastThrowCard();
        }else {
            this.DelSelfLastThrowCard();
        }
    },

    // 初始自己的手牌
    SelfInitCards : function(cards, pengCards, gangCards, kanCards, niuCards, jiangCards) {
        this.selfHand.removeAllChildren();
    
        // 添加特殊牌
        this.InitSpecialCards(this.selfHand, 4, this.gap, 
                              this.pengPrefab, this.gangPrefab,
                              this.jiangPrefab, pengCards, gangCards, 
                              kanCards, niuCards, jiangCards);
        
        // 添加手牌
        var inst, spr;
        for (var i = 0; i < cards.length; ++i) {
            inst = cc.instantiate(this.cardPrefab);
            spr = inst.getComponent(cc.Sprite);
            spr.spriteFrame = CardSpriteFrameCache[1][cards[i]];
            spr.node.cardIndex = i;
            spr.node.on(cc.Node.EventType.TOUCH_END, function (event) {
                this.NeedThrowCards(event.target.cardIndex);
            }.bind(this), this);
            this.selfHand.addChild(inst);
        }
    },
    
    // 自己摸牌
    SelfAddCard : function(card, index) {
        var gap = cc.instantiate(this.gap);
        var cardInst = cc.instantiate(this.cardPrefab);
        var spr = cardInst.getComponent(cc.Sprite);
        spr.spriteFrame = CardSpriteFrameCache[1][card];
        spr.node.cardIndex = index;
        spr.node.on(cc.Node.EventType.TOUCH_END, function (event) {
            this.NeedThrowCards(event.target.cardIndex);
        }.bind(this), this);
            
        this.selfHand.addChild(gap);
        this.selfHand.addChild(cardInst);
    },
    
    // 自己出牌
    SelfThrowCard : function(card) {
        var children = this.selfOutput.children;
        for (var i = 0; i < children.length; ++i) {
            if (children[i].opacity === 0) {
                children[i].opacity = 255;
                var spr = children[i].getComponent(cc.Sprite);
                spr.spriteFrame = CardSpriteFrameCache[3][card];
                break;
            }
        }
    },
    
    DelSelfLastThrowCard : function() {
        var children = this.selfOutput.children;
        for (var i = children.length - 1; i >= 0; --i) {
            if (children[i].opacity === 255) {
                children[i].opacity = 0;
                break;
            }
        }
    },

    // 初始上家的手牌
    FrontInitCards : function(cards, pengCards, gangCards, kanCards, niuCards, jiangCards) {
        this.frontHand.removeAllChildren();
        
        // 添加特殊牌
        this.InitSpecialCards(this.frontHand, 0, this.gap_v, 
                              this.frontPengPrefab, this.frontGangPrefab,
                              this.frontJiangPrefab, pengCards, gangCards, 
                              kanCards, niuCards, jiangCards);

        // 添加手牌
        var inst, spr;
        for (var i = 0; i < cards.length; ++i) {
            inst = cc.instantiate(this.cardPrefab);
            spr = inst.getComponent(cc.Sprite);
            spr.spriteFrame = CardSpriteFrameCache[0][cards[i]];
            this.frontHand.addChild(inst);
        }
    },
    
    // 上家模牌
    FrontAddCard : function(card) {
        var gap = cc.instantiate(this.gap_v);
        var cardInst = cc.instantiate(this.cardPrefab);
        var spr = cardInst.getComponent(cc.Sprite);
        spr.spriteFrame = CardSpriteFrameCache[0][card];
            
        this.frontHand.addChild(gap);
        this.frontHand.addChild(cardInst);
    },
    
    // 上家出牌
    FrontThrowCard : function(card) {
        var children = this.frontOutput.children;
        for (var i = 0; i < children.length; ++i) {
            if (children[i].opacity === 0) {
                children[i].opacity = 255;
                var spr = children[i].getComponent(cc.Sprite);
                spr.spriteFrame = CardSpriteFrameCache[0][card];
                break;
            }
        }
    },
    
    DelFrontLastThrowCard : function() {
        var children = this.frontOutput.children;
        for (var i = children.length - 1; i >= 0; --i) {
            if (children[i].opacity === 255) {
                children[i].opacity = 0;
                break;
            }
        }
    },
    
    // 初始下家的手牌
    BackInitCards : function(cards, pengCards, gangCards, kanCards, niuCards, jiangCards) {
        this.backHand.removeAllChildren();
        

        // 添加特殊牌
        this.InitSpecialCardsForBack(this.backHand, 2, this.gap_v, 
                              this.backPengPrefab, this.backGangPrefab,
                              this.backJiangPrefab, pengCards, gangCards, 
                              kanCards, niuCards, jiangCards);
                              
        // 添加手牌
        var inst, spr;
        for (var i = 0; i < cards.length; ++i) {
            inst = cc.instantiate(this.cardPrefab);
            spr = inst.getComponent(cc.Sprite);
            spr.spriteFrame = CardSpriteFrameCache[2][cards[i]];
            this.backHand.addChild(inst, -this.backHand.children.length);
        }
    },
    
    // 下家模牌
    BackAddCard : function(card) {
        var gap = cc.instantiate(this.gap_v);
        var cardInst = cc.instantiate(this.cardPrefab);
        var spr = cardInst.getComponent(cc.Sprite);
        spr.spriteFrame = CardSpriteFrameCache[2][card];
            
        this.backHand.addChild(gap, -this.backHand.children.length);
        this.backHand.addChild(cardInst, -this.backHand.children.length);
    },
    
    // 下家出牌
    BackThrowCard : function(card) {
        var children = this.backOutput.children;
        for (var i = children.length - 1; i >= 0; --i) {
            if (children[i].opacity === 0) {
                children[i].opacity = 255;
                var spr = children[i].getComponent(cc.Sprite);
                spr.spriteFrame = CardSpriteFrameCache[2][card];
                break;
            }
        }
    },
    
    DelBackLastThrowCard : function() {
        var children = this.backOutput.children;
        for (var i = 0; i < children.length; ++i) {
            if (children[i].opacity === 255) {
                children[i].opacity = 0;
                break;
            }
        }
    },
    
    // 初始对家的手牌
    OppositeInitCards : function(cards, pengCards, gangCards, kanCards, niuCards, jiangCards) {
        this.oppositeHand.removeAllChildren();
        
        // 添加特殊牌
        this.InitSpecialCards(this.oppositeHand, 3, this.gap_u, 
                              this.upPengPrefab, this.upGangPrefab,
                              this.upJiangPrefab, pengCards, gangCards, 
                              kanCards, niuCards, jiangCards);
        
        // 添加手牌
        var inst, spr;
        for (var i = 0; i < cards.length; ++i) {
            inst = cc.instantiate(this.cardPrefab);
            spr = inst.getComponent(cc.Sprite);
            spr.spriteFrame = CardSpriteFrameCache[3][cards[i]];
            this.oppositeHand.addChild(inst);
        }
    },
    
    // 对家模牌
    OppositeAddCard : function(card) {
        var gap = cc.instantiate(this.gap_u);
        var cardInst = cc.instantiate(this.cardPrefab);
        var spr = cardInst.getComponent(cc.Sprite);
        spr.spriteFrame = CardSpriteFrameCache[3][card];
            
        this.oppositeHand.addChild(gap);
        this.oppositeHand.addChild(cardInst);
    },
    
    // 对家出牌
    OppositeThrowCard : function(card) {
        var children = this.oppositeOutput.children;
        for (var i = children.length - 1; i >= 0; --i) {
            if (children[i].opacity === 0) {
                children[i].opacity = 255;
                var spr = children[i].getComponent(cc.Sprite);
                spr.spriteFrame = CardSpriteFrameCache[3][card];
                break;
            }
        }
    },
    
    DelOppositeLastThrowCard : function() {
        var children = this.oppositeOutput.children;
        for (var i = 0; i < children.length; ++i) {
            if (children[i].opacity === 255) {
                children[i].opacity = 0;
                break;
            }
        }
    },
    

    // called every frame, uncomment this function to activate update callback
    //update: function (dt) {
    //},
});
