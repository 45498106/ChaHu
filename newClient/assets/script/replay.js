(function() {

    //-------------------------------------------------------------
    var Util = require('Utility');
    var Player = require('player');

    function Replay(){
        this.replayMode = false;
        this.step = 0;
    }

    Replay.prototype.Init = function() {
    
    }

    Replay.prototype.Download = function() {

    }

    Replay.prototype.IsReplayMode = function() {
        return this.replayMode;
    }

    Replay.prototype.Start = function() {

        // 设置房间
        var roomInfo = GameData.replayData.roomInfo;
        var roomData = {
            "id"        : roomInfo.id,
            "ownerId"   : roomInfo.createUserId,
            "ruleId"    : roomInfo.ruleId,
            "quanId"    : roomInfo.quanId,
            "hunCount"  : roomInfo.hunCount,
            "playCount" : roomInfo.playCount,
            "played"    : 1,
            "bankerPlace" : 0,
        };

        GameData.userRoomData = roomData;

        // 设置玩家
        var playDatas = [];
        var player;
        for (var i = 0; i < GameData.replayData.players.length; ++i) {
            player = new Player();
            player.Init(GameData.replayData.players[i].userId,
                        i,
                        GameData.replayData.players[i].userName,
                        GameData.replayData.players[i].userHeadUrl);
        
            playDatas.push(player);
            if (player.id === GameData.userId) {
                GameData.selfPlace = i;
            }
        }
        GameData.players = playDatas;

        this.replayMode = true;
        this.firstStep = true;
        this.step = 0;
    }

    Replay.prototype.Step = function() {
        
        if (this.firstStep) {
            this.firstStep = false;

            return this.InitCards();
        }

        var action = GameData.replayData.actions[this.step];
        ++this.step;

        var place = action.place;
        var player = GameData.players[place];
        var card;

        if (action.action === 'addCard') {
            card = action.data;
            player.cards.push(card);
            GameEvent().SendEvent('GetCard', {place:place, card:card});
            return 2;
        }else if (action.action === 'throwCard') {
            card = action.data;
            Util.ArrayRemoveElemnt(player.cards, card);
            player.cards.sort();
            GameEvent().SendEvent('ThrowCard', {place:place, card:card});
            return 2;
        }else if (action.action === 'huCards') {
            //card = action.data.;
            GameData.huPlace = place;
            //player.cards.sort();
            //GameEvent().SendEvent('ThrowCard', {place:action.place, card:card});
        }
        
        return 1000000;
    }

    Replay.prototype.InitCards = function() {
        var data = {};
        for (var i = 0; i < GameData.replayData.players.length; ++i) {

            var palyer = GameData.players[i];
            palyer.Clear();
            palyer.cards = GameData.replayData.players[i].cards.slice();
            palyer.cards.sort();

            data.place = i;
            data.data = GameData.replayData.players[i].cards;

            GameEvent().SendEvent('InitCards', data);
        }
        return 3.0;
    }

    Replay.prototype.End = function() {

    }

    if(typeof module !== 'undefined')
        module.exports = Replay;

    if(typeof window !== 'undefined')
        window.Replay = new Replay();
})();
