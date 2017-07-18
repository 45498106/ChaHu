
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

// 是否可飘
function CanPiao(cards) {
    if (cards.length === 1) {
        return true;
    }
    else if (cards.length === 4) {
        if (cards[0] === cards[1] && 
            cards[2] === cards[3]) {
            return true;        
        }
        
        if (cards[0] === cards[2] && 
            cards[1] === cards[3]) {
            return true;        
        }
        
        if (cards[0] === cards[3] && 
            cards[1] === cards[2]) {
            return true;        
        }
    }
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
    } else {
        return GameData.players[GameData.selfPlace + 1];
    }
}

var GetOppositePlayer = function() {
    if (GameData.selfPlace > 1) {
        return GameData.players[GameData.selfPlace - 2];
    } else {
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
        playingPnl : cc.Node,
        accountsPnl : cc.Node,
        totalAccountsPnl : cc.Node,
        preparePnl : cc.Node,
        destoryRoomPnl : cc.Node,
        
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
        settingBtn : cc.Button,
        shortWordBtn : cc.Button,
        voiceBtn : cc.Button,
        inviteBtn : cc.Button,
        readyBtn : cc.Button,
        countiuBtn : cc.Button,
        
        layout_v : cc.Prefab,
        layout_vReplay : cc.Prefab,
        gap : cc.Prefab,
        gap_v : cc.Prefab,
        gap_vx : cc.Prefab,
        gap_vl : cc.Prefab,
        gap_u : cc.Prefab,
        selfCardPrefab : cc.Prefab,
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
        opBtnGang : cc.Button,
        opBtnPeng : cc.Button,
        opBtnJiang : cc.Button,
        opBtnKan : cc.Button,
        opBtnNiu : cc.Button,
        opBtnChi : cc.Button,
        
        operation2Pnl : cc.Node,
        opBtnGuo2 : cc.Button,
        opBtnPiao : cc.Button,
        opBtnXi : cc.Button,
        
        remainLabel : cc.Label,
        quanLabel : cc.Label,
        hunLabel : cc.Label,
        zhuangLabel : cc.Label,
        jiangLabel : cc.Label,
        niuLabel : cc.Label,
        chiLabel : cc.Label,
        roomIdLabel : cc.Label,
        
        dongDown : cc.Sprite,
        dongUp : cc.Sprite,
        dongLeft : cc.Sprite,
        dongRight : cc.Sprite,
        
        piaoDown : cc.Sprite,
        piaoUp : cc.Sprite,
        piaoLeft : cc.Sprite,
        piaoRight : cc.Sprite,
        
        timeLabel : cc.Label,
        secondLabel : cc.Label,
        
        animHu : cc.Node,
        huArrow : cc.Node,
        animLiuJu : cc.Node,
        
        animPiao : cc.Node,
        piaoArrow : cc.Node,
        
        tingCardsNotify : cc.Node,
        chiSelectPnl : cc.Node, 
        
        voiceMonitor : cc.Node,
        voiceVolumeSpr : cc.Sprite,

        sceneName : cc.String,
    },

    // use this for initialization
    onLoad: function () {
        this.playingPnl.active = false;
        this.preparePnl.active = false;
        
        //this.exitRoomBtn.node.on('click', this.OnExitRoom, this);
        this.settingBtn.node.on('click', this.OnSetting, this);
        this.shortWordBtn.node.on('click', this.OnShortWord, this);
        //this.voiceBtn.node.on('click', this.OnVoice, this);
        this.inviteBtn.node.on('click', this.OnInvitePlayer, this);
        this.readyBtn.node.on('click', this.OnReady, this);
        
        this.opBtnGuo.node.on('click', this.OnOpGuo, this);
        this.opBtnZha.node.on('click', this.OnOpZha, this);
        this.opBtnHu.node.on('click', this.OnOpHu, this);
        this.opBtnGang.node.on('click', this.OnOpGang, this);
        this.opBtnPeng.node.on('click', this.OnOpPeng, this);
        this.opBtnJiang.node.on('click', this.OnOpJiang, this);
        this.opBtnKan.node.on('click', this.OnOpKan, this);
        this.opBtnNiu.node.on('click', this.OnOpNiu, this);
        this.opBtnChi.node.on('click', this.OnOpChi, this);
        this.opBtnGuo2.node.on('click', this.OnOpGuo2, this);
        this.opBtnPiao.node.on('click', this.OnOpPiao, this);
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
        GameEvent().OnEvent('ChiCards', this.OnChiCards, this);
        GameEvent().OnEvent('PiaoCards', this.OnPiaoCards, this);
        GameEvent().OnEvent('HuCards', this.OnHuCards, this);
        GameEvent().OnEvent('Accounts', this.OnAccounts, this);
        GameEvent().OnEvent('CloseAccuoutsPanel', this.OnCloseAccounts, this);
        GameEvent().OnEvent('CloseTotalAccuoutsPanel', this.OnCloseTotalAccounts, this);
        GameEvent().OnEvent('VoiceBack', this.OnVoiceBack, this);
        GameEvent().OnEvent('DestoryRoomBack', this.OnDestoryRoomBack, this);
        GameEvent().OnEvent('ChiSelected', this.OnChiSelected, this);
        
        GameEvent().OnEvent("reconnectedServer", this.OnReconnectedServer, this);
        GameEvent().OnEvent("ReconnectBack", this.OnReconnectBack, this);
        GameEvent().OnEvent('ExitRoom', this.OnExitRoom, this);
        
        // 播放声音
        var audioMng = AudioMng();
        if (audioMng) audioMng.playGameMusic();

        if (Replay.IsReplayMode()) {
            // 重拨模式
            this.PlayingShow();
            this.replayDt = 0;
            this.setpInterval = 0;
        }
        else {
            // 游戏模式
            if (GameData.userRoomData.played === 0) {
                this.PrepareShow();
            }else if (GameData.userRoomData.played === 1) {
                this.PlayingShow();
                if (GameData.resumeGame === true) {
                    this.ResumeGame();
                    GameData.resumeGame === false;
                }
            }
        }
        
        this.UpdataTimeLabel();
        
        // 初始化录音sdk
        this.InitVoice();
    },
    
    InitVoice : function() {
        
        if (!cc.sys.isNative) {
            //this.voiceBtn.node.active = false;
            return;
        }
        
        this.voiceQueue = [];
        this.voicePlaying = false;
        this.downloading = false;
        this.onceRecord = false;
        var filePath = jsb.fileUtils.getWritablePath() + "/tempRecord.dat";
        
        function onTouchDown (event) {
            this.voiceMonitor.active = true;
            
            var audioMng = AudioMng();
            if (audioMng) audioMng.pauseAll();
            
            window.Voice().StartRecording(filePath);
            this.onceRecord = true;
            this.recordNeedCancel = false;
            
            this.voiceMonitor.getChildByName('frame1').active = true;
            this.voiceMonitor.getChildByName('frame2').active = false;
        }
        
        function onTouchMove (event) {
            var touches = event.getTouches();
            var pos = this.voiceBtn.node.convertTouchToNodeSpace(touches[0]);
            var btnSize = this.voiceBtn.node.getContentSize();
            var rect = new cc.rect(0,0, btnSize.width,  btnSize.height);
            if (rect.contains(pos)) {
                this.voiceMonitor.getChildByName('frame1').active = true;
                this.voiceMonitor.getChildByName('frame2').active = false;
                this.recordNeedCancel = false;
            }
            else {
                if(pos.y > (btnSize.height) + 80) {
                    this.voiceMonitor.getChildByName('frame1').active = false;
                    this.voiceMonitor.getChildByName('frame2').active = true;
                    this.recordNeedCancel = true;
                }
            }
        }
        
        function onTouchUp(event) {
            this.onceRecord = false;
            this.voiceMonitor.active = false;
            window.Voice().StopRecording();
            
            if(this.recordNeedCancel === false) {
                var seconds = window.Voice().GetRecordedSeconds(filePath);
                if (seconds < 0.5) {
                    Notify().Play("录音失败,录音时间太短");
                }
                else {
                    window.Voice().UploadRecordedFile(filePath);
                    window.Voice().SetUploadCallback(function(fileID) {
                        GameSocket().Send("voice", {place:GameData.selfPlace, fileID:fileID});
                    })
                }
            }
                
            var audioMng = AudioMng();
            if (audioMng) audioMng.resumeAll();
        }
        
        this.voiceBtn.node.on('touchstart', onTouchDown, this);
        this.voiceBtn.node.on('touchmove', onTouchMove, this);
        this.voiceBtn.node.on('touchend', onTouchUp, this);
        this.voiceBtn.node.on('touchcancel', onTouchUp, this);
        
        // 初始化录音sdk
        window.Voice().Init();
        
        window.LoadAllVoiceVolumeSriteFrame();
    },
    
    OnReconnectedServer : function() {
        if (typeof GameData.validUniqueID === 'undefined') {
            if (typeof this._timeOutHandle !== 'undefined') {
                clearTimeout(this._timeOutHandle);
                this._timeOutHandle = undefined;
            }
            cc.director.loadScene('login');        
        }
        else {
            GameSocket().Send("reconnect", {uniqueID : GameData.validUniqueID} );
        }
    },
    
    OnReconnectBack : function() {
        this.ExitRoom();
    },
    
    PlayCountDown : function() {
        
        if (typeof this.playCountDownFunc === 'function') {
            this.unschedule(this.playCountDownFunc);
        }
        else {
            this.playCountDownFunc = function(){
                --this.secondLabel.tiemCount;
                this.secondLabel.string = this.secondLabel.tiemCount;
            }.bind(this);
        }
        
        var interval = 1; // 1 miao
        var repeat = 29;  // 30 ci
        
        this.secondLabel.tiemCount = 30;
        this.secondLabel.string = this.secondLabel.tiemCount; 
        
        this.schedule(this.playCountDownFunc, interval, repeat, 0);
    },
    
    
    PlayHuAnim : function(place) {
        this._huPlace = place;
        this.animHu.active = true;
        var anim = this.animHu.getComponent(cc.Animation);
        anim.play();
        
        anim.on('finished', function() {
            this.animHu.active = false;
            this.huArrow.active = true;
            var anim = this.huArrow.getComponent(cc.Animation);

            if (IsFrontPlayer(this._huPlace)) {
                anim.play('anim-arrow-left');
            }else if (IsBackPlayer(this._huPlace)) {
                anim.play('anim-arrow-right');
            }else if (IsOppositePlayer(this._huPlace)){
                anim.play('anim-arrow-up');
            }else {
                anim.play('anim-arrow-down');
            }
            
            anim.on('finished', function(){
                this.huArrow.active = false;
                this.accountsPnl.getComponent('accounts').OnShow();
            }.bind(this), this);
        }.bind(this), this);
    },
    
    PlayPiaoAnim : function(place) {
        this._piaoPlace = place;
        this.animPiao.active = true;
        var anim = this.animPiao.getComponent(cc.Animation);
        anim.play();
        
        anim.on('finished', function() {
            this.animPiao.active = false;
            this.piaoArrow.active = true;
            var anim = this.piaoArrow.getComponent(cc.Animation);

            if (IsFrontPlayer(this._piaoPlace)) {
                anim.play('anim-arrow-left');
            }else if (IsBackPlayer(this._piaoPlace)) {
                anim.play('anim-arrow-right');
            }else if (IsOppositePlayer(this._piaoPlace)){
                anim.play('anim-arrow-up');
            }else {
                anim.play('anim-arrow-down');
            }
            
            anim.on('finished', function(){
                this.piaoArrow.active = false;
            }.bind(this), this);
        }.bind(this), this);
    },
    
    UpdataTimeLabel : function() {
        
        var now = new Date();
        var nowHours = now.getHours();
        var nowMintues = now.getMinutes();
        
        var next = new Date(now);
        next.setMinutes(nowMintues + 1, 0 , 0);
        
        var fun1 = (function() {
            var now = new Date();
            var nowHours = now.getHours();
            var nowMintues = now.getMinutes();
            if (nowMintues < 10) {
                nowMintues = "0" + nowMintues;
            }
            if (this.node === null) { return };
            this.timeLabel.string = nowHours + ":" + nowMintues;
        }.bind(this));
        
        fun1();
        
         this._timeOutHandle = setTimeout(function() {
            fun1();
            setInterval(fun1, 60000);
        }, next.getTime() - now.getTime());
    },

    SetTitleInfo : function() {
        
        this.remainLabel.string = "剩余:"+ 120 +"张";
        if (typeof GameData.userRoomData.remainNum === 'number') {
            this.remainLabel.string = "剩余:"+GameData.userRoomData.remainNum+"张";
        }
        
        var quan = (GameData.userRoomData.quanId === 1) ? 1 : 4;
        var playCount = GameData.userRoomData.playCount;
        var quanCount = (typeof playCount === 'undefined') ? 0 : (Math.floor(playCount / 4) + 1);
        this.quanLabel.string = quanCount + "/" + quan + "圈";
        this.hunLabel.string = "荤低:" + GameData.userRoomData.hunCount;
        this.zhuangLabel.node.active = (GameData.userRoomData.ruleId & 1) === 1 ? true : false;
        this.jiangLabel.node.active = (GameData.userRoomData.ruleId & 4) === 4 ? true : false;
        this.niuLabel.node.active = (GameData.userRoomData.ruleId & 2) === 2 ? true : false;
        this.chiLabel.node.active = (GameData.userRoomData.ruleId & 8) === 8 ? true : false;
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
    
    SetPiaoCard : function(place, card) {
        if (IsFrontPlayer(place)) {
            this.piaoLeft.node.active = true;
            this.piaoLeft.spriteFrame = CardSpriteFrameCache[3][card];
        }else if (IsBackPlayer(place)) {
            this.piaoRight.node.active = true;
            this.piaoRight.spriteFrame = CardSpriteFrameCache[3][card];
        }else if (IsOppositePlayer(place)){
            this.piaoUp.node.active = true;
            this.piaoUp.spriteFrame = CardSpriteFrameCache[3][card];
        }else {
            this.piaoDown.node.active = true;
            this.piaoDown.spriteFrame = CardSpriteFrameCache[3][card];
        }
    },
    
    HiddenPiaoCard : function() {
        this.piaoLeft.node.active = false;
        this.piaoRight.node.active = false;
        this.piaoUp.node.active = false;
        this.piaoDown.node.active = false;
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
        this.accountsPnl.getComponent('accounts').OnHide(true);
        
        this.ClearAllOutput();
        this.InitPlayingHead();
        this.HiddenOperat();
        this.HiddenOperat2();
        this.HiddenPiaoCard();
        this.tingCardsNotify.active = false;
        
        GameData.addNiuFlushCard = false;
        
        this.SetTitleInfo();
    },

    SureChiArray : function(data) {
        if (typeof data.chi !== 'undefined') {
            if (typeof data.chi === 'object' && data.chi instanceof Array) {
                this.chiArray = data.chi.slice();
            }
        }else {
            this.chiArray = null;
        }
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
                
                this.SelfInitCards(player.cards, player.pengCards, player.gangCards, player.kanCards, 
                                   player.niuCards, player.jiangCards, player.chiCards);
            
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
                
                this.ShowOperatEx(data);
                this.SureChiArray(data);
                GameData.selfOperation = null;
            }
        }
    },
    
    SetupPreHead : function(player, preHeadNode) {
        var nameLable = preHeadNode.getChildByName("name").getComponent('cc.Label');
        nameLable.string = player.name;
        
        var headSprite = preHeadNode.getChildByName("headIcon").getComponent('cc.Sprite');
        SetSpriteImage(headSprite, {url: player.headUrl, type:'jpg'});
        
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
            SetSpriteImage(headSprite, {url: player.headUrl, type:'jpg'});
            
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
            
            var huLabel = headNode.getChildByName("huLabel").getComponent('cc.Label');
            huLabel.string = player.totalScore + "虎";
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
        if (GameData.gameEnd === true) {
            this.ExitRoom();
        }
        else {
            if (GameData.userRoomData.playConnt > 0 || GameData.userRoomData.played === 1) {
                this.destoryRoomPnl.getComponent('destoryRoom').OnShow(true);
            }
            else {
                GameSocket().Send("exitRoom");
            }
        }
    },
    
    ExitRoom : function() {
        if (typeof this._timeOutHandle !== 'undefined') {
            clearTimeout(this._timeOutHandle);
            this._timeOutHandle = undefined;
        }
        
        cc.director.loadScene('home');
        GameData.ClearGamePlayers();
    },
    
    OnInvitePlayer : function() {
        WeiXin().InviteFriend();
    },
    
    OnVoice : function() {
        //Notify().Play("加班实现中，敬请期待");
        if (cc.sys.os === cc.sys.OS_IOS)
        {
            if (typeof this.onceRecord === 'undefined') {
                this.onceRecord = false;
            }
            
            var filePath = jsb.fileUtils.getWritablePath() + "/record.dat";
            if (this.onceRecord === true) {
                this.onceRecord = false;
                window.Voice().StopRecording();
                var seconds = window.Voice().GetRecordedSeconds(filePath);
                GameLog("file time:" + seconds);
                var rst = window.Voice().PlayRecordedFile(filePath);
                if (rst === false) {
                    var audioMng = AudioMng();
                    if (audioMng) audioMng.resumeAll();
                }
                else {
                    window.Voice().SetPlayRecordedFileEndCallback(function () {
                        var audioMng = AudioMng();
                        if (audioMng) audioMng.resumeAll();
                    });
                    
                    window.Voice().UploadRecordedFile(filePath);
                }
            }
            else if (this.onceRecord === false) {
                
                var audioMng = AudioMng();
                if (audioMng) audioMng.pauseAll();
            
                window.Voice().StartRecording(filePath);
                this.onceRecord = true;
            }
        }
    },
    
    OnSetting : function() {
        window.OpenSetting(true,this.sceneName);
    },
    
    OnShortWord : function() {
        Notify().Play("加班实现中，敬请期待");
    },
    
    OnReady : function() {
        GameSocket().Send("ready");
    },
    
    OnInitCards : function(event) {
        var data = event.detail;
        var place = data.place;

        var player = GameData.players[place];
        if (IsFrontPlayer(place)) {
            this.FrontInitCards(player.cards, player.pengCards, player.gangCards, 
                player.kanCards, player.niuCards, player.jiangCards, player.chiCards);
        }else if (IsBackPlayer(place)) {
            this.BackInitCards(player.cards, player.pengCards, player.gangCards, 
                player.kanCards, player.niuCards, player.jiangCards, player.chiCards);
        }else if (IsOppositePlayer(place)) {
            this.OppositeInitCards(player.cards, player.pengCards, player.gangCards, 
                player.kanCards, player.niuCards, player.jiangCards, player.chiCards);
        }else {
            this.SelfInitCards(player.cards, player.pengCards, player.gangCards, 
                player.kanCards, player.niuCards, player.jiangCards, player.chiCards);
        }
    },
    
    OnGetCard : function(event) {
        
        var data = event.detail;
        var place = data.place;
        var card = data.card;
        
        if (GameData.addNiuFlushCard) {
            var player = GameData.players[place];
            var lastCard = player.cards.pop();
            this.InitPlayerCards(place, player);
            player.cards.push(lastCard);
            GameData.addNiuFlushCard = false;
        }
        
        if (typeof GameData.userRoomData.remainNum === 'number') {
            this.remainLabel.string = "剩余:"+GameData.userRoomData.remainNum+"张";
        }
        
        this.SetDongInfo(place);
        
        if (IsFrontPlayer(place)) {
            this.FrontAddCard(card);
        }else if (IsBackPlayer(place)) {
            this.BackAddCard(card);
        }else if (IsOppositePlayer(place)){
            this.OppositeAddCard(card)
        }else {
            var player = GameData.players[place];
            var cards = player.cards;
            this.SelfAddCard(card, cards.length - 1);
            
            if (player.piao === true && typeof data.hu === 'undefined') {
                setTimeout(function(card){
                    return function() {
                        GameSocket().Send('needThrowCard',  { "card" : card } );
                    }
                }(card), 1000);
            }
        }
        
        this.ShowOperatEx(data);
        
        // 播放倒计时
        this.PlayCountDown();
        
    },
    
    OnAddNiuCard : function(event) {
        
        var data = event.detail;
        var place = data.place;
        var card = data.addNiuCard;
        
        if (GameData.addNiuFlushCard) {
            var player = GameData.players[place];
            var lastNiuCard = player.niuCards.pop();
            this.InitPlayerCards(place, player);
            player.niuCards.push(lastNiuCard); 
            GameData.addNiuFlushCard = false;
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
                        
        // 播放声音
        var audioMng = AudioMng();
        if (audioMng) audioMng.playAddNiu();
        
        GameData.addNiuFlushCard = true;
    },
    
    OnThrowCard : function(event) {

        var data = event.detail;
        var place = data.place;
        var card = data.card;
        
        var player = GameData.players[place];
        
        if (IsFrontPlayer(place)) {
            this.FrontInitCards(player.cards, player.pengCards, player.gangCards, player.kanCards,
                                player.niuCards, player.jiangCards, player.chiCards);
            this.FrontThrowCard(card);
        }else if (IsBackPlayer(place)) {
            this.BackInitCards(player.cards, player.pengCards, player.gangCards, player.kanCards,
                               player.niuCards, player.jiangCards, player.chiCards);
            this.BackThrowCard(card);
        }else if (IsOppositePlayer(place)){
            this.OppositeInitCards(player.cards, player.pengCards, player.gangCards, player.kanCards,
                                   player.niuCards, player.jiangCards, player.chiCards);
            this.OppositeThrowCard(card);
        }else {
            this.SelfInitCards(player.cards, player.pengCards, player.gangCards, player.kanCards,
                               player.niuCards, player.jiangCards, player.chiCards);
            this.SelfThrowCard(card);
        }
        
        this.ShowOperatEx(data);
        this.SureChiArray(data);

        this.ShowOperat2(typeof data.xi !== 'undefined', typeof data.piao !== 'undefined');
        
        
        // 听牌提示 
        if (GameData.huCards.length > 0) {
            this.tingCardsNotify.active = true;
            if (typeof this.tingCardsNotify.huCardStr !== undefined) {
                if (this.tingCardsNotify.huCardStr !== GameData.huCards.toString()) {
                    var layout = this.tingCardsNotify.getChildByName('cards');
                    var children = layout.children;
                    var spr;
                    for (var i = 0; i < 3; ++i) {
                        if (i < GameData.huCards.length) {
                            children[i].active = true;
                            spr = children[i].getComponent(cc.Sprite);
                            spr.spriteFrame = CardSpriteFrameCache[3][GameData.huCards[i]];
                        }else {
                            children[i].active = false;
                        }
                    }
                    
                    this.tingCardsNotify.huCardStr = GameData.huCards.toString();
                }
            } 
            
        }else {
            this.tingCardsNotify.active = false;
        }

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
        
        this.ShowOperatEx(data);
        
        this.SetDongInfo(place);
        
        // 播放声音
        var audioMng = AudioMng();
        if (audioMng) audioMng.playPeng();
        
        // 播放倒计时
        this.PlayCountDown();
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

        this.ShowOperatEx(data);

        // 播放声音
        var audioMng = AudioMng();
        if (audioMng) audioMng.playGang();
    },
    
    OnKanCards : function(event) {
        
        var data = event.detail;
        var place = data.place;
        
        var player = GameData.players[place];
        this.InitPlayerCards(place, player);
        
        this.ShowOperatEx(data);
        
        // 播放声音
        var audioMng = AudioMng();
        if (audioMng) audioMng.playKan();
    },
    
    OnNiuCards : function(event) {
        
        var data = event.detail;
        var place = data.place;
        
        var player = GameData.players[place];
        this.InitPlayerCards(place, player);
        
        this.ShowOperatEx(data);

        // 播放声音
        var audioMng = AudioMng();
        if (audioMng) audioMng.playNiu();
    },
    
    OnJiangCards : function(event) {
        
        var data = event.detail;
        var place = data.place;
        
        var player = GameData.players[place];
        this.InitPlayerCards(place, player);
        
        if (typeof data.throwCardPlace !== 'undefined') {
            this.DelLastThrowCardByPlace(data.throwCardPlace);
        }
        
        this.ShowOperatEx(data);

        // 播放声音
        var audioMng = AudioMng();
        if (audioMng) audioMng.playJiang();
    },

    OnChiCards : function(event) {
        var data = event.detail;
        var place = data.place;
        
        var player = GameData.players[place];
        this.InitPlayerCards(place, player);

        if (typeof data.throwCardPlace !== 'undefined') {
            this.DelLastThrowCardByPlace(data.throwCardPlace);
        }

        this.ShowOperatEx(data);
        // 播放声音
        var audioMng = AudioMng();
        if (audioMng) audioMng.playChi();
    },
    
    OnPiaoCards : function(event) {
        var data = event.detail;
        var place = data.place;
        var card = data.card;
        this.PlayPiaoAnim(place);
        
        this.DelLastThrowCardByPlace(place);
        this.SetPiaoCard(place, card);

        // 播放声音
        var audioMng = AudioMng();
        if (audioMng) audioMng.playTing();
    },

    OnHuCards : function(event) {

        var data = event.detail;
        var place = data.place;
        
        var player = GameData.players[place];
        this.InitPlayerCards(place, player);

        this.ShowOperatEx(data);
    
        // 播放声音
        var audioMng = AudioMng();
        if (audioMng) audioMng.playHu();
        
        this.PlayHuAnim(place);
    },
    
    
    OnAccounts : function(event) {
        var datas = event.detail;
        if (datas.status === 1) {
            this.animLiuJu.active = true;
            var anim = this.animHu.getComponent(cc.Animation);
            anim.play();
            
            anim.on('finished', function() {
                this.animLiuJu.active = false;
                this.accountsPnl.getComponent('accounts').OnShow();
            }.bind(this), this);
        }
        else if(datas.status === 3) {
            this.destoryRoomPnl.getComponent('destoryRoom').OnHide();
            this.accountsPnl.getComponent('accounts').OnShow();
        }
    },
    
    OnCloseAccounts : function(event) {
        // reflush totalScore for player head.
        this.InitPlayingHead();
        
        if (GameData.gameEnd === true) {
            // open total Accounts
            this.totalAccountsPnl.getComponent('totalAccounts').OnShow();
        }else {
            GameSocket().Send("ready");
        }
    },
    
    OnCloseTotalAccounts : function(event) {
        this.ExitRoom();
    },
    
    OnVoiceBack : function(event) {
        if (!cc.sys.isNative) {
            return;
        }
        
        var data = event.detail;
        this.voiceQueue.push(data);
    },
    
    OnDestoryRoomBack : function(event) {
        var data = event.detail;
        var script = this.destoryRoomPnl.getComponent('destoryRoom');
        script.OnShow(false);
        script.Reload(data);
    },

    OnChiSelected : function(event) {
        var selectIdx = event.detail;
        this.chiSelectPnl.getComponent('chiSelect').OnHide();
        GameSocket().Send('chiCards', selectIdx);
    },
    
    OnOpGuo : function() {
        GameSocket().Send('passCards');
        this.ShowOperat(false, false,
                        false, false,
                        false, false,
                        false, false);
    },
    
    OnOpZha : function() {
        GameSocket().Send('zhaCards');
    },
    
    OnOpHu : function() {
        GameSocket().Send('huCards');

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

    OnOpChi : function() {
        if (this.chiArray === null) {
            GameSocket().Send('chiCards');
        } else {
            // 显示吃牌选择
            this.chiSelectPnl.getComponent('chiSelect').OnShow(this.chiArray);
        }
    },
    
    OnOpGuo2 : function() {
        //GameSocket().Send('passCards');
        this.HiddenOperat2();
        this.DelLastThrowCardByPlace(this.piaoThrowCard);
        GameSocket().Send('needThrowCard',  {
            "card" : this.piaoThrowCard
        });
    },
    
    OnOpPiao : function() {
        this.HiddenOperat2();
        //GameSocket().Send('piaoCards');
        this.DelLastThrowCardByPlace(this.piaoThrowCard);
        GameSocket().Send('needThrowCard',  {
            "card" : this.piaoThrowCard, "piao" : 1,
        });
    },
    
    OnOpXi : function() {
        this.HiddenOperat2();
        GameSocket().Send('xiCards');
    },

    
////////////////////////////////////////////////////////////////////////////////

    NeedThrowCards : function(cardIndex) {
        if (GameData.selfPlace === GameData.getCardPlace) {
            var player = GameData.players[GameData.selfPlace];
            var tempCards = player.cards.slice();
            var card = player.cards[cardIndex];
            Util.ArrayRemoveElemnt(tempCards, card);
            if (player.piao === false && CanPiao(tempCards) && player.chiCards === null) {
                this.ShowOperat2(false, true);
                this.SelfInitCards(tempCards, player.pengCards, player.gangCards, player.kanCards,
                                   player.niuCards, player.jiangCards, player.chiCards);
                this.SelfThrowCard(card);
                this.piaoThrowCard = card;
            }
            else {
                GameSocket().Send('needThrowCard',  {
                    "card" : GameData.players[GameData.selfPlace].cards[cardIndex]
                });
            }
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
    
    ShowOperat : function(jiang, niu, kan, peng, gang, hu, zha, chi) {
        
        if (jiang === false && niu === false && kan === false && peng === false  && 
            gang === false && hu === false && zha === false && chi === false) {
            this.HiddenOperat();
            return;
        }
        
        this.HiddenOperat2();
        
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

        if (chi)
            this.opBtnChi.node.active = true;
        else
            this.opBtnChi.node.active = false;
    
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
    
        if (zha) 
            this.opBtnZha.node.active = true;
        else
            this.opBtnZha.node.active = false;
    },

    ShowOperatEx : function(data) {
        this.ShowOperat(typeof data.jiang !== 'undefined', typeof data.niu !== 'undefined', 
                        typeof data.kan !== 'undefined', typeof data.peng !== 'undefined', 
                        typeof data.gang !== 'undefined', typeof data.hu !== 'undefined',
                        typeof data.zha !== 'undefined', typeof data.chi !== 'undefined');
    },
    
    HiddenOperat : function() {
        this.operationPnl.active = false;
    },
    
    ShowOperat2 : function(xi, piao) {
        if (xi === false && piao === false) {
            this.HiddenOperat2();
            return;
        }
        
        this.HiddenOperat();
        
        this.operation2Pnl.active = true;
        this.opBtnGuo2.node.active = true;
        
        if (xi) 
            this.opBtnXi.node.active = true;
        else
            this.opBtnXi.node.active = false;
            
        if (piao) 
            this.opBtnPiao.node.active = true;
        else
            this.opBtnPiao.node.active = false;
    },
    
    HiddenOperat2 : function() {
        this.operation2Pnl.active = false;
    },
    
    InitSpecialCards : function(hand, cardDir, gapPrefab, pengPrefab, gangPrefab,
        jiangPrefab, pengCards, gangCards, kanCards, niuCards, jiangCards, chiCards) 
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
            k+=13;
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
                if (cardDir === 4 && c === 1) {
                    spr.spriteFrame = CardSpriteFrameCache[cardDir][kanCards[k]];
                }else {
                    spr.spriteFrame = CardSpriteFrameCache[cardDir][10];
                }
            }
            
            hand.addChild(inst);
            hand.addChild(cc.instantiate(gapPrefab));
        }
        
        for (k = 0; pengCards && k < pengCards.length; k+=3) {
            var inst = cc.instantiate(pengPrefab);
            var children = inst.children;
            for (c = 0; c < children.length; c++) {
                var spr = children[c].getComponent(cc.Sprite);
                spr.spriteFrame = CardSpriteFrameCache[cardDir][pengCards[k]];
            }
            
            hand.addChild(inst);
            hand.addChild(cc.instantiate(gapPrefab));
        }

        for (k = 0; chiCards && k < chiCards.length; k+=3) {
            var inst = cc.instantiate(pengPrefab);
            var children = inst.children;
            for (c = 0; c < children.length; c++) {
                var spr = children[c].getComponent(cc.Sprite);
                spr.spriteFrame = CardSpriteFrameCache[cardDir][chiCards[k+c]];
            }
            
            hand.addChild(inst);
            hand.addChild(cc.instantiate(gapPrefab));
        }
 
        for (k = 0; jiangCards && k < jiangCards.length; k+=2) {
            var inst = cc.instantiate(jiangPrefab);
            var children = inst.children;
            for (c = 0; c < children.length; c++) {
                var spr = children[c].getComponent(cc.Sprite);
                spr.spriteFrame = CardSpriteFrameCache[cardDir][jiangCards[k]];
            }
            
            hand.addChild(inst);
            hand.addChild(cc.instantiate(gapPrefab));
        }
    },
    
    InitSpecialCardsForBack : function(hand, cardDir, gapPrefab, pengPrefab, gangPrefab,
        jiangPrefab, pengCards, gangCards, kanCards, niuCards, jiangCards, chiCards) 
    {
        var k,c;
        for (k = 0; niuCards && k < niuCards.length; k+=3) {
            var inst = cc.instantiate(pengPrefab);
            var children = inst.children;
            for (c = 0; c < children.length; c++) {
                var spr = children[c].getComponent(cc.Sprite);
                spr.spriteFrame = CardSpriteFrameCache[cardDir][45+c];
            }
            
            hand.addChild(inst, -hand.children.length);
            hand.addChild(cc.instantiate(gapPrefab), -hand.children.length);
            k+=13;
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
                spr.spriteFrame = CardSpriteFrameCache[cardDir][10];
            }
            
            hand.addChild(inst, -hand.children.length);
            hand.addChild(cc.instantiate(gapPrefab), -hand.children.length);
        }
        
        for (k = 0; pengCards && k < pengCards.length; k+=3) {
            var inst = cc.instantiate(pengPrefab);
            var children = inst.children;
            for (c = 0; c < children.length; c++) {
                var spr = children[c].getComponent(cc.Sprite);
                spr.spriteFrame = CardSpriteFrameCache[cardDir][pengCards[k]];
            }
            
            hand.addChild(inst, -hand.children.length);
            hand.addChild(cc.instantiate(gapPrefab), -hand.children.length);
        }

        for (k = 0; chiCards && k < chiCards.length; k+=3) {
            var inst = cc.instantiate(pengPrefab);
            var children = inst.children;
            for (c = 0; c < children.length; c++) {
                var spr = children[c].getComponent(cc.Sprite);
                spr.spriteFrame = CardSpriteFrameCache[cardDir][chiCards[k+c]];
            }
            
            hand.addChild(inst);
            hand.addChild(cc.instantiate(gapPrefab));
        }
 
        for (k = 0; jiangCards && k < jiangCards.length; k+=2) {
            var inst = cc.instantiate(jiangPrefab);
            var children = inst.children;
            for (c = 0; c < children.length; c++) {
                var spr = children[c].getComponent(cc.Sprite);
                spr.spriteFrame = CardSpriteFrameCache[cardDir][jiangCards[k]];
            }
            
            hand.addChild(inst, -hand.children.length);
            hand.addChild(cc.instantiate(gapPrefab), -hand.children.length);
        }
    },
    
    InitPlayerCards : function(place, player) {
        if (IsFrontPlayer(place)) {
            this.FrontInitCards(player.cards, player.pengCards, player.gangCards, player.kanCards, 
                                player.niuCards, player.jiangCards, player.chiCards);
        }else if (IsBackPlayer(place)) {
            this.BackInitCards(player.cards, player.pengCards, player.gangCards, player.kanCards, 
                               player.niuCards, player.jiangCards, player.chiCards);
        }else if (IsOppositePlayer(place)){
            this.OppositeInitCards(player.cards, player.pengCards, player.gangCards, player.kanCards,
                                   player.niuCards, player.jiangCards, player.chiCards);
        }else {
            this.SelfInitCards(player.cards, player.pengCards, player.gangCards, player.kanCards,
                               player.niuCards, player.jiangCards, player.chiCards);
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

    CheckDoubleClick : function(cardSpr) {
        if (typeof cardSpr.clickCount === 'undefined') {
            cardSpr.clickCount = 1;
            cardSpr.node.y = 30;
                    
            if (this.selectThrowCard !== null) {
                this.selectThrowCard.node.y = 0;
                this.selectThrowCard.clickCount = undefined;
            }
            this.selectThrowCard = cardSpr;
            //-------超时1秒,再点收回-----------
            //cardSpr.scheduleOnce(function(){
            //    this.clickCount = -1;  
            //},1);
            //-------超时1秒,再点收回-----------
        }
        //-------超时1秒,再点收回-----------
        //else if (cardSpr.clickCount === -1) {
        //    cardSpr.clickCount = undefined;
        //    cardSpr.node.y = 0;
        //    this.selectThrowCard = null;
        //}
        //-------超时1秒,再点收回-----------
         
        else {

            //-------未到自己出牌,二次点击收回-----------
            //if (GameData.selfPlace !== GameData.getCardPlace) {
            //    cardSpr.clickCount = undefined;
            //    cardSpr.node.y = 0;
            //    this.selectThrowCard = null;
            //}
            //-------未到自己出牌,二次点击收回-----------

            this.NeedThrowCards(cardSpr.node.cardIndex);
        }
        
        var audioMng = AudioMng();
        if (audioMng) audioMng.playButton();
    },

    // 初始自己的手牌
    SelfInitCards : function(cards, pengCards, gangCards, kanCards, niuCards, jiangCards, chiCards) {
        this.selfHand.removeAllChildren();
    
        // 添加特殊牌
        this.InitSpecialCards(this.selfHand, 4, this.gap, 
                              this.pengPrefab, this.gangPrefab,
                              this.jiangPrefab, pengCards, gangCards, 
                              kanCards, niuCards, jiangCards, chiCards);
        
        // 添加手牌
        this.selectThrowCard = null;
        var inst, spr;
        for (var i = 0; i < cards.length; ++i) {
            inst = cc.instantiate(this.selfCardPrefab);
            spr = inst.getChildByName('img').getComponent(cc.Sprite);
            spr.spriteFrame = CardSpriteFrameCache[1][cards[i]];
            spr.node.cardIndex = i;
            inst.on(cc.Node.EventType.TOUCH_END, function (event) {
                this.CheckDoubleClick(event.target.getChildByName('img').getComponent(cc.Sprite));
            }.bind(this), this);
            this.selfHand.addChild(inst);
        }
    },
    
    // 自己摸牌
    SelfAddCard : function(card, index) {
        var gap = cc.instantiate(this.gap);
        var cardInst = cc.instantiate(this.selfCardPrefab);
        var spr = cardInst.getChildByName('img').getComponent(cc.Sprite);
        spr.spriteFrame = CardSpriteFrameCache[1][card];
        spr.node.cardIndex = index;
        cardInst.on(cc.Node.EventType.TOUCH_END, function (event) {
            this.CheckDoubleClick(event.target.getChildByName('img').getComponent(cc.Sprite));
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
    FrontInitCards : function(cards, pengCards, gangCards, kanCards, niuCards, jiangCards, chiCards) {
        this.frontHand.removeAllChildren();
        
        // 添加特殊牌
        this.InitSpecialCards(this.frontHand, 0, this.gap_v, 
                              this.frontPengPrefab, this.frontGangPrefab,
                              this.frontJiangPrefab, pengCards, gangCards, 
                              kanCards, niuCards, jiangCards, chiCards);
        
        if  (Replay.IsReplayMode()) {
            this.frontHand.layout_v = cc.instantiate(this.layout_vReplay);
        }else {
            this.frontHand.layout_v = cc.instantiate(this.layout_v);
        }
        this.frontHand.addChild(this.frontHand.layout_v);

        // 添加手牌
        var inst, spr;
        for (var i = 0; i < cards.length; ++i) {
            inst = cc.instantiate(this.cardPrefab);
            spr = inst.getComponent(cc.Sprite);
            spr.spriteFrame = CardSpriteFrameCache[0][cards[i]];
            this.frontHand.layout_v.addChild(inst);
            this.frontHand.layout_v.getComponent(cc.Layout)._updateLayout();
            this.frontHand.getComponent(cc.Layout)._updateLayout();
        }
    },
    
    // 上家模牌
    FrontAddCard : function(card) {
        var gap = Replay.IsReplayMode() ? cc.instantiate(this.gap_vl) : cc.instantiate(this.gap_vx);
        var cardInst = cc.instantiate(this.cardPrefab);
        var spr = cardInst.getComponent(cc.Sprite);
        spr.spriteFrame = CardSpriteFrameCache[0][card];
            
        this.frontHand.layout_v.addChild(gap);
        this.frontHand.layout_v.addChild(cardInst);
        this.frontHand.layout_v.getComponent(cc.Layout)._updateLayout();
        this.frontHand.getComponent(cc.Layout)._updateLayout();
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
    BackInitCards : function(cards, pengCards, gangCards, kanCards, niuCards, jiangCards, chiCards) {
        this.backHand.removeAllChildren();
        

        // 添加特殊牌
        this.InitSpecialCardsForBack(this.backHand, 2, this.gap_v, 
                              this.backPengPrefab, this.backGangPrefab,
                              this.backJiangPrefab, pengCards, gangCards, 
                              kanCards, niuCards, jiangCards, chiCards);
        
        if  (Replay.IsReplayMode()) {
            this.backHand.layout_v = cc.instantiate(this.layout_vReplay);
        }else {
            this.backHand.layout_v = cc.instantiate(this.layout_v);
        }
        this.backHand.addChild(this.backHand.layout_v);

        // 添加手牌
        var inst, spr;
        for (var i = 0; i < cards.length; ++i) {
            inst = cc.instantiate(this.cardPrefab);
            spr = inst.getComponent(cc.Sprite);
            spr.spriteFrame = CardSpriteFrameCache[2][cards[i]];
            this.backHand.layout_v.addChild(inst, -this.backHand.layout_v.children.length);
            this.backHand.layout_v.getComponent(cc.Layout)._updateLayout();
            this.backHand.getComponent(cc.Layout)._updateLayout();
        }
    },
    
    // 下家模牌
    BackAddCard : function(card) {
        var gap = Replay.IsReplayMode() ? cc.instantiate(this.gap_vl) : cc.instantiate(this.gap_vx);
        var cardInst = cc.instantiate(this.cardPrefab);
        var spr = cardInst.getComponent(cc.Sprite);
        spr.spriteFrame = CardSpriteFrameCache[2][card];
            
        this.backHand.layout_v.addChild(gap, -this.backHand.layout_v.children.length);
        this.backHand.layout_v.addChild(cardInst, -this.backHand.layout_v.children.length);

        this.backHand.layout_v.getComponent(cc.Layout)._updateLayout();
        this.backHand.getComponent(cc.Layout)._updateLayout();
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
    OppositeInitCards : function(cards, pengCards, gangCards, kanCards, niuCards, jiangCards, chiCards) {
        this.oppositeHand.removeAllChildren();
        
        // 添加特殊牌
        this.InitSpecialCards(this.oppositeHand, 3, this.gap_u, 
                              this.upPengPrefab, this.upGangPrefab,
                              this.upJiangPrefab, pengCards, gangCards, 
                              kanCards, niuCards, jiangCards, chiCards);
        
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
    
    voicePoll : function() {
        if (!cc.sys.isNative) {
            return;
        }
        
        if (typeof this.voiceQueue === 'undefined')
            return; // no initialized.
        
        window.Voice().Poll();
        
        if (this.onceRecord === true && this.recordNeedCancel === false) {
            var rt = window.Voice().GetMicLevel();
            //GameLog("GetMicLevel:" + rt);
            var lv = Math.floor(rt / 2000);
            if (lv > 6) {
                lv = 6;
            }
            this.voiceVolumeSpr.spriteFrame = window.VoiceVolumeSriteFrameCache[lv];
        }
        
        if (this.voiceQueue.length > 0 && this.downloading === false && this.voicePlaying === false) {
            
            if (this.onceRecord === true) { return } // 正在录音中，不播下载的文件
            
            var filePath = jsb.fileUtils.getWritablePath() + "/record.dat";
            var data = this.voiceQueue[0];
            var self = this;
            window.Voice().DownloadRecordedFile(data.fileID, filePath);
            window.Voice().SetDownloadCallback(function(fileID) {
                self.voiceQueue.shift();
                self.downloading = false;
                self.voicePlaying = true;
                var filePath = jsb.fileUtils.getWritablePath() + "/record.dat";
                
                var audioMng = AudioMng();
                if (audioMng) audioMng.pauseAll();
                
                var rst = window.Voice().PlayRecordedFile(filePath);
                if (rst === false) {
                    var audioMng = AudioMng();
                    if (audioMng) audioMng.resumeAll();
                    self.voicePlaying = false;
                }
                else {
                    window.Voice().SetPlayRecordedFileEndCallback(function () {
                        var audioMng = AudioMng();
                        if (audioMng) audioMng.resumeAll();
                        self.voicePlaying = false;
                    });
                }
            });
            this.downloading = true;
        }
    },
    

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        this.voicePoll();
        
        var pause = false;
        if (Replay.IsReplayMode() && !pause) {
            
            this.replayDt += dt;

            if (this.replayDt > this.setpInterval) {
                this.setpInterval = Replay.Step();
                this.replayDt = 0;
            }
        }
    },
});
