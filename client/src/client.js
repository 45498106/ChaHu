GameLog = engine.commom.Logger;
Util = engine.commom.Util;

var net;
var game;
var nickName = "玩家" + Math.round(Math.random() * 1000000);

// 初始自己的手牌
function SelfInitCards(cards, pengCards, gangCards) {
    $('#Self').empty();
    var a = '<div class="cards"><img oncontextmenu="return false;" ondragstart="return false;" class="fullScale cards-hover" src="./images/2/mingmah_';
    var b = '.png"></div>';
    var gap = '<div class="cards-gap"></div>';
    var last, image;
    var i, j;
    
    for (i = 0; gangCards && i < gangCards.length; i+=4) {
        for (j = 0; j < 4; j++) {
            $('#Self').append(a+gangCards[i]+b);
        }
        $('#Self').append(gap);
    }
    
    for (i = 0; pengCards && i < pengCards.length; i+=3) {
        for (j = 0; j < 3; j++) {
            $('#Self').append(a+pengCards[i+j]+b);
        }
        $('#Self').append(gap);
    }
    
    for (i = 0; i < cards.length; ++i) {
        $('#Self').append(a+cards[i]+b);
        last = $('#Self').children().last();
        image = $(last).children('img');
        image.attr("cardIndex", i);
        image.attr("onclick", "NeedThrowCards($(event.target).attr('cardIndex'));");
    }
}

// 自己摸牌
function SelfAddCard(card) {
    var bigGap = '<div class="cards-big-gap"></div>'
    var a = '<div class="cards"><img oncontextmenu="return false;" ondragstart="return false;" class="fullScale cards-hover" src="./images/2/mingmah_';
    var b = '.png"></div>';
    $('#Self').append(bigGap, a+card+b);
    var last = $('#Self').children().last();
    var image = $(last).children('img');
    image.attr("cardIndex", game.playerSelf.cards.length - 1);
    image.attr("onclick", "NeedThrowCards($(event.target).attr('cardIndex'));");
}

// 自己出牌
function SelfThrowCard(card) {
    var a = '<div class="cards-small"><img oncontextmenu="return false;" ondragstart="return false;" class="fullScale" src="./images/2/mingmah_';
    var b = '.png"></div>';
    $('#SelfOutput').append(a+card+b);
}

function DelSelfLastThrowCard() {
    $('#SelfOutput').children().last().remove()
}

// 初始上家的手牌
function FrontInitCards(cards, pengCards, gangCards) {
    $('#Front').empty();
    var a = '<div class="cards-horizontal"><img oncontextmenu="return false;" ondragstart="return false;" class="fullScale" src="./images/3/mingmah_';
    var b = '.png"></div>';
    var gap = '<div class="cards-gap-horizontal"></div>'
    var i, j;
    for (i = 0; gangCards && i < gangCards.length; i+=4) {
        for (j = 0; j < 4; j++) {
            $('#Front').append(a+gangCards[i]+b);
        }
        $('#Front').append(gap);
    }
    
    for (i = 0; pengCards && i < pengCards.length; i+=3) {
        for (j = 0; j < 3; j++) {
            $('#Front').append(a+pengCards[i+j]+b);
        }
        $('#Front').append(gap);
    }
    
    for (i = 0; i < cards.length; ++i) {
        $('#Front').append(a+cards[i]+b);
    }
}

// 上家模牌
function FrontAddCard(card) {
    var gap = '<div class="cards-gap-horizontal"></div>'
    var a = '<div class="cards-horizontal"><img oncontextmenu="return false;" ondragstart="return false;" class="fullScale" src="./images/3/mingmah_';
    var b = '.png"></div>';
    $('#Front').append(gap, a+card+b);
}

// 上家出牌
function FrontThrowCard(card) {
    var a = '<div class="cards-horizontal"><img oncontextmenu="return false;" ondragstart="return false;" class="fullScale" src="./images/3/mingmah_';
    var b = '.png"></div>';

    if ( $('#FrontOutput > .FrontOutputRight').children().length < 12 ) {
        $('#FrontOutput > .FrontOutputRight').append(a+card+b);
    }else {
        $('#FrontOutput > .FrontOutputLeft').append(a+card+b);
    }
}

function DelFrontLastThrowCard() {
    if ( $('#FrontOutput > .FrontOutputLeft').children().length > 0 ) {
        $('#FrontOutput > .FrontOutputLeft').children().last().remove();
    }else {
        $('#FrontOutput > .FrontOutputRight').children().last().remove();
    }
}


// 初始下家的手牌
function BackInitCards(cards, pengCards, gangCards) {
    $('#Back').empty();
    var a = '<div class="cards-horizontal"><img oncontextmenu="return false;" ondragstart="return false;" class="fullScale" src="./images/1/mingmah_';
    var b = '.png"></div>';
    var gap = '<div class="cards-gap-horizontal"></div>'
    var i, j;
    for (i = 0; gangCards && i < gangCards.length; i+=4) {
        for (j = 0; j < 4; j++) {
            $('#Back').append(a+gangCards[i]+b);
        }
        $('#Back').append(gap);
    }
    
    for (i = 0; pengCards && i < pengCards.length; i+=3) {
        for (j = 0; j < 3; j++) {
            $('#Back').append(a+pengCards[i+j]+b);
        }
        $('#Back').append(gap);
    }
    
    for (i = 0; i < cards.length; ++i) {
        $('#Back').append(a+cards[i]+b);
    }
}

// 下家模牌
function BackAddCard(card) {
    var gap = '<div class="cards-gap-horizontal"></div>'
    var a = '<div class="cards-horizontal"><img oncontextmenu="return false;" ondragstart="return false;" class="fullScale" src="./images/1/mingmah_';
    var b = '.png"></div>';
    $('#Back').append(gap, a+card+b);
}

// 下家出牌
function BackThrowCard(card) {
    var a = '<div class="cards-horizontal"><img oncontextmenu="return false;" ondragstart="return false;" class="fullScale" src="./images/1/mingmah_';
    var b = '.png"></div>';

    if ( $('#BackOutput > .BackOutputLeft').children().length < 12 ) {
        $('#BackOutput > .BackOutputLeft').append(a+card+b);
    }else {
        $('#BackOutput > .BackOutputRight').append(a+card+b);
    }
}

function DelBackLastThrowCard() {
    if ( $('#BackOutput > .BackOutputRight').children().length > 0 ) {
        $('#BackOutput > .BackOutputRight').children().last().remove();
    }else {
        $('#BackOutput > .BackOutputLeft').children().last().remove();
    }
}

// 初始对家的手牌
function OppositeInitCards(cards, pengCards, gangCards) {
    $('#Opposite').empty();
    var a = '<div class="cards-small"><img oncontextmenu="return false;" ondragstart="return false;" class="fullScale" src="./images/2/mingmah_';
    var b = '.png"></div>';
    var gap = '<div class="cards-sml-gap"></div>'
    var i, j;
    for (i = 0; gangCards && i < gangCards.length; i+=4) {
        for (j = 0; j < 4; j++) {
            $('#Opposite').append(a+gangCards[i]+b);
        }
        $('#Opposite').append(gap);
    }
    
    for (i = 0; pengCards && i < pengCards.length; i+=3) {
        for (j = 0; j < 3; j++) {
            $('#Opposite').append(a+pengCards[i+j]+b);
        }
        $('#Opposite').append(gap);
    }
    
    for (i = 0; i < cards.length; ++i) {
        $('#Opposite').append(a+cards[i]+b);
    }
}

// 对家模牌
function OppositeAddCard(card) {
    var samllGap = '<div class="cards-sml-gap"></div>'
    var a = '<div class="cards-small"><img oncontextmenu="return false;" ondragstart="return false;" class="fullScale" src="./images/2/mingmah_';
    var b = '.png"></div>';
    $('#Opposite').append(samllGap, a+card+b);
}

// 对家出牌
function OppositeThrowCard(card) {
    var a = '<div class="cards-small"><img oncontextmenu="return false;" ondragstart="return false;" class="fullScale" src="./images/2/mingmah_';
    var b = '.png"></div>';
    $('#OppositeOutput').append(a+card+b);
}

function DelOppositeLastThrowCard() {
    $('#OppositeOutput').children().last().remove();
}

function SetFrontName(nickName) {
    if (typeof nickName === 'undefined' || nickName === null) {
        $('.playerName.frontName').val("");
    }else {
        $('.playerName.frontName').val("玩家:"+nickName);
    }
}

function SetFrontName(nickName) {
    if (typeof nickName === 'undefined' || nickName === null) {
        $('.playerName.frontName').text("");
    }else {
        $('.playerName.frontName').text("玩家:"+nickName);
    }
}

function SetBackName(nickName) {
    if (typeof nickName === 'undefined' || nickName === null) {
        $('.playerName.backName').text("");
    }else {
        $('.playerName.backName').text("玩家:"+nickName);
    }
}

function SetOppositeName(nickName) {
    if (typeof nickName === 'undefined' || nickName === null) {
        $('.playerName.oppositeName').text("");
    }else {
        $('.playerName.oppositeName').text("玩家:"+nickName);
    }
}

function SetSelfName(nickName) {
    if (typeof nickName === 'undefined' || nickName === null) {
        $('.playerName.selfName').text("");
    }else {
        $('.playerName.selfName').text("玩家:"+nickName);
    }
}

// 清除牌
function ClearGameScene() {
    $('#Self').empty();
    $('#Front').empty();
    $('#Back').empty();
    $('#Opposite').empty();
    
    $('#FrontOutput > .FrontOutputLeft').empty();
    $('#FrontOutput > .FrontOutputRight').empty();
    $('#SelfOutput').empty();
    $('#BackOutput > .BackOutputLeft').empty();
    $('#BackOutput > .BackOutputRight').empty();
    $('#OppositeOutput').empty();
    
    HiddenOperat();
    
    GameLog("---------------------->")
}



function ShowOperat(peng, gang, hu) {
    HiddenOperat();
    
    if (peng === false  && gang === false && hu === false)
        return;
    
    var image;
    image = '<img oncontextmenu="return false;" ondragstart="return false;" class="fullScale ' + (peng ? "" : "gray") + '" src="./images/Button_PengAction.png">'
    $('.PengCards').append(image);
    if (peng) {
         $('.PengCards').children('img').attr("onclick", "PengCards();");
    }
    
    image = '<img oncontextmenu="return false;" ondragstart="return false;" class="fullScale ' + (gang ? "" : "gray") + '" src="./images/Button_GangAction.png">'
    $('.GangCards').append(image);
    if (gang) {
         $('.GangCards').children('img').attr("onclick", "GangCards();");
    }
    
    
    image = '<img oncontextmenu="return false;" ondragstart="return false;" class="fullScale ' + (hu ? "" : "gray") + '" src="./images/Button_HuAction.png">'
    $('.HuCards').append(image);
    if (hu) {
         $('.HuCards').children('img').attr("onclick", "HuCards();");
    }

    image = '<img oncontextmenu="return false;" ondragstart="return false;" class="fullScale" src="./images/Button_GuoAction.png">'
    $('.PassCards').append(image);
    $('.PassCards').children('img').attr("onclick", "PassCards();");
    
}

function HiddenOperat() {
    $('.PengCards').empty();
    $('.GangCards').empty();
    $('.HuCards').empty();
    $('.PassCards').empty();
}

function NeedThrowCards(cardIndex) {
    if (game.playerSelf.place === game.getCardsPlace) {
        var index = parseInt(cardIndex);
        net.socket.emit('needThrowCard',  { "card" : game.playerSelf.cards[index] } );
    }
}

function PengCards() {
    net.socket.emit('pengCards');
}

function GangCards() {
    net.socket.emit('gangCards');
}

function HuCards() {
    net.socket.emit('huCards');
}

function PassCards() {
    net.socket.emit('passCards');
}

function Ready() {
    net.socket.emit('ready');
}

function DelLastThrowCardByPlace(place) {
    if (game.IsFrontPlayer(place)) {
        DelFrontLastThrowCard();
    }else if (game.IsBackPlayer(place)) {
        DelBackLastThrowCard();
    }else if (game.IsOppositePlayer(place)){
        DelOppositeLastThrowCard();
    }else {
        DelSelfLastThrowCard();
    }
}

//-------------------------------------------------------------
function Player(){
    this.id = -1;
    this.place = -1;
    this.nickName = "unknow";
    this.cards = null;
    this.pengCards = null;
    this.gangCards = null;
}

Player.prototype.Init = function(id, place, nickName) {
    this.id = id;
    this.place = place;
    this.nickName = nickName;
}

//-------------------------------------------------------------
function Game() {
    this.playerSelf = null;
    this.players = new Array(4);
    this.roomId = 0;
    this.bankerPlace = 0;
    this.getCardsPlace = 0;
}

Game.prototype.GetFrontPlayer = function() {
 
    if (this.playerSelf.place === 0) {
        return this.players[this.players.length - 1];
    } else {
        return this.players[this.playerSelf.place - 1];
    }
}

Game.prototype.GetBackPlayer = function() {
    if (this.playerSelf.place === 3) {
        return this.players[0];
    }else {
        return this.players[this.playerSelf.place + 1];
    }
}

Game.prototype.GetOppositePlayer = function() {
    if (this.playerSelf.place > 1) {
        return this.players[this.playerSelf.place - 2];
    }else {
        return this.players[this.playerSelf.place + 2];
    }
}

Game.prototype.IsFrontPlayer = function(place) {
    if (this.playerSelf.place === 0) {
        return (this.players.length - 1) === place;
    } else {
        return (this.playerSelf.place - 1) === place;
    }
}

Game.prototype.IsBackPlayer = function(place) {
    if (this.playerSelf.place === 3) {
        return 0 === place;
    }else {
        return (this.playerSelf.place + 1) === place;
    }
}

Game.prototype.IsOppositePlayer = function(place) {
    if (this.playerSelf.place > 1) {
        return (this.playerSelf.place - 2) === place;
    }else {
        return (this.playerSelf.place + 2) == place;
    }
}

Game.prototype.SetPlayerName = function(player) {
    if (game.IsFrontPlayer(player.place)) {
        SetFrontName(player.nickName);
    }else if (game.IsBackPlayer(player.place)) {
        SetBackName(player.nickName);
    }else if (game.IsOppositePlayer(player.place)){
        SetOppositeName(player.nickName);
    }else {
        SetSelfName(player.nickName);
    }
}

Game.prototype.ClearPlayerName = function(place) {
    if (game.IsFrontPlayer(place)) {
        SetFrontName(null);
    }else if (game.IsBackPlayer(place)) {
        SetBackName(null);
    }else if (game.IsOppositePlayer(place)){
        SetOppositeName(null);
    }else {
        SetSelfName(null);
    }
}

Game.prototype.SetZhuangFlag = function(place) {
    var flag = '<img class="fullScale" src="./images/zhuang.png">';
    game.ClearZhuangFlag();
    if (game.IsFrontPlayer(place)) {
        $('.flagIcon.frontIcon').append(flag);
    }else if (game.IsBackPlayer(place)) {
        $('.flagIcon.backIcon').append(flag);
    }else if (game.IsOppositePlayer(place)){
        $('.flagIcon.oppositeIcon').append(flag);
    }else {
        $('.flagIcon.selfIcon').append(flag);
    }
}

Game.prototype.ClearZhuangFlag = function() {
    $('.flagIcon.frontIcon').empty();
    $('.flagIcon.backIcon').empty();
    $('.flagIcon.oppositeIcon').empty();
    $('.flagIcon.selfIcon').empty();
}

Game.prototype.PacketHandler = function() {
    var socket = net.socket;
    
    socket.on('enterGameBack', function (data) {
        // 创建房间
        GameLog(data);
        game.roomId = data.roomId;
    });
    
    socket.on('newGame', function(data) {
        ClearGameScene();
        game.bankerPlace = data.bankerPlace;
        game.SetZhuangFlag(game.bankerPlace);
        game.getCardsPlace = data.bankerPlace;
        
        $('#UIReady').hide();
        $('#UIReadyOK').hide();
    });
    
    socket.on('ready', function(data) {
        $('#UIReady').show();
    });
    
    socket.on('newPlayer', function (data) {
        // 添加角色
        GameLog(data);

        var newPlayer = new Player();
        newPlayer.Init(data.id, data.place, data.nickName);
        game.players[newPlayer.place] = newPlayer;
        
        if (game.playerSelf === null) {
            game.playerSelf = newPlayer;
        }
        
        game.SetPlayerName(newPlayer);
    });
    
    socket.on('playerList', function (data) {
        // 已有角色
        GameLog(data);
        var newPlayer;
        for (var i = 0; i < data.length; ++i) {
            newPlayer = new Player();
            newPlayer.Init(data[i].id, data[i].place, data[i].nickName);
            game.players[newPlayer.place] = newPlayer;
            game.SetPlayerName(newPlayer);
        }
    });
   
    socket.on('losePlayer', function (data) {
        // 玩家掉线或离开
        GameLog(data);
        var place = data.place;
        game.players[place] = null;
        
        game.ClearPlayerName(place);
        $('#UIReady').hide();
        $('#UIReadyOK').hide();
    });
    
    socket.on('readyOk', function (data) {
        // 玩家掉线或离开
        $('#UIReady').hide();
        $('#UIReadyOK').show();
    });
    
    socket.on('initCards', function (data) {
        // 发牌给玩家
        GameLog(data);
        var place = data.place;
        if (game.playerSelf.place === place) {
            game.playerSelf.cards = data.cards.slice();
            game.playerSelf.cards.sort();
            game.playerSelf.pengCards = null;
            game.playerSelf.gangCards = null;
            SelfInitCards(game.playerSelf.cards, game.playerSelf.pengCards, game.playerSelf.gangCards);
        }else {
            var player;
            if (game.IsFrontPlayer(place)) {
                player = game.GetFrontPlayer();
                player.cards = data.cards.slice();
                player.cards.sort();
                player.pengCards = null;
                player.gangCards = null;
                FrontInitCards(player.cards, player.pengCards, player.gangCards);
            }else if (game.IsBackPlayer(place)) {
                player = game.GetBackPlayer();
                player.cards = data.cards.slice();
                player.cards.sort();
                player.pengCards = null;
                player.gangCards = null;
                BackInitCards(player.cards, player.pengCards, player.gangCards);
            }else {
                player = game.GetOppositePlayer();
                player.cards = data.cards.slice();
                player.cards.sort();
                player.pengCards = null;
                player.gangCards = null;
                OppositeInitCards(player.cards, player.pengCards, player.gangCards)
            }
        }
    });
    
    socket.on('getCard', function (data) {
        // 玩家摸牌
        GameLog('getCard', data);
        var place = data.place;
        var card = data.card;
        // 添加摸牌
        game.players[place].cards.push(card);
        
        if (game.IsFrontPlayer(place)) {
            FrontAddCard(card);
        }else if (game.IsBackPlayer(place)) {
            BackAddCard(card);
        }else if (game.IsOppositePlayer(place)){
            OppositeAddCard(card)
        }else {
            SelfAddCard(card);
        }
        
        game.getCardsPlace = place;
        ShowOperat(typeof data.peng !== 'undefined', typeof data.gang !== 'undefined', typeof data.hu != 'undefined');
    });
    
    socket.on('throwCard', function (data) {
        // 玩家出牌
        GameLog('throwCard', data);
        var place = data.place;
        var card = data.card;
        
        var player = game.players[place];
        if (game.playerSelf.place === place) {
            Util.ArrayRemoveElemnt(player.cards, card);
            player.cards.sort();
        }else {
            player.cards.pop();
        }
        
        if (game.IsFrontPlayer(place)) {
            FrontInitCards(player.cards, player.pengCards, player.gangCards);
            FrontThrowCard(card);
        }else if (game.IsBackPlayer(place)) {
            BackInitCards(player.cards, player.pengCards, player.gangCards);
            BackThrowCard(card);
        }else if (game.IsOppositePlayer(place)){
            OppositeInitCards(player.cards, player.pengCards, player.gangCards);
            OppositeThrowCard(card);
        }else {
            SelfInitCards(player.cards, player.pengCards, player.gangCards);
            SelfThrowCard(card);
        }
        
        ShowOperat(typeof data.peng !== 'undefined', typeof data.gang !== 'undefined', typeof data.hu != 'undefined');
    });
    
    socket.on('pengCards', function (data) {
        // 玩家碰牌
        GameLog(data);
        var place = data.place;
        var card = data.card;
        
        var player = game.players[place];
        if (game.playerSelf.place === place) {
            HiddenOperat();
        }
        
        player.cards = data.cards.slice();
        player.cards.sort();
        player.pengCards = data.pengCards.slice();

        if (game.IsFrontPlayer(place)) {
            FrontInitCards(player.cards, player.pengCards, player.gangCards);
        }else if (game.IsBackPlayer(place)) {
            BackInitCards(player.cards, player.pengCards, player.gangCards);
        }else if (game.IsOppositePlayer(place)){
            OppositeInitCards(player.cards, player.pengCards, player.gangCards)
        }else {
            SelfInitCards(player.cards, player.pengCards, player.gangCards);
        }
        
        if (typeof data.throwCardPlace !== 'undefined') {
            DelLastThrowCardByPlace(data.throwCardPlace);
        }
        
        game.getCardsPlace = place;
    });
    
    socket.on('gangCards', function (data) {
        // 玩家杠牌
        GameLog(data);
        var place = data.place;
        var card = data.card;
        
        var player = game.players[place];
        if (game.playerSelf.place === place) {
            HiddenOperat();
        }
        
        player.cards = data.cards.slice();
        player.cards.sort();
        player.gangCards = data.gangCards.slice();

        if (game.IsFrontPlayer(place)) {
            FrontInitCards(player.cards, player.pengCards, player.gangCards);
        }else if (game.IsBackPlayer(place)) {
            BackInitCards(player.cards, player.pengCards, player.gangCards);
        }else if (game.IsOppositePlayer(place)){
            OppositeInitCards(player.cards, player.pengCards, player.gangCards)
        }else {
            SelfInitCards(player.cards, player.pengCards, player.gangCards);
        }
        
        if (typeof data.throwCardPlace !== 'undefined') {
            DelLastThrowCardByPlace(data.throwCardPlace);
        }
        
        game.getCardsPlace = place;
    });
    
    socket.on('huCards', function (data) {
        // 玩家胡牌
        GameLog(data);
        var place = data.place;
        var player = game.players[place];
        
        player.cards = data.cards.slice();
        player.cards.sort();
        
        if (typeof data.pengCards !== 'undefined') {
            player.pengCards = data.pengCards.slice();
        }
        
        if (typeof data.gangCards !== 'undefined') {
            player.gangCards = data.gangCards.slice();
        }
        
        if (game.IsFrontPlayer(place)) {
            FrontInitCards(player.cards, player.pengCards, player.gangCards);
        }else if (game.IsBackPlayer(place)) {
            BackInitCards(player.cards, player.pengCards, player.gangCards);
        }else if (game.IsOppositePlayer(place)){
            OppositeInitCards(player.cards, player.pengCards, player.gangCards)
        }else {
            SelfInitCards(player.cards, player.pengCards, player.gangCards);
        }
        
        game.getCardsPlace = -1;
    });
}

function ConnectServerStart() {
    // 捕获消息
    game.PacketHandler();
    // 进入游戏
    net.socket.emit('enterGame',  { "nickName" : nickName} );
}

function ConnectServerFailure() {
}

function validNick(nickName) {
    return nickName !== "";
}

function StartGame() {    
    //GameLog.socket = io('http://localhost:38086');
    
    net = new Net();
    net.Start(ConnectServerStart, ConnectServerFailure);
    
    game = new Game();
}

function PopLogin() {

    var btnStart = document.getElementById('startButton');
    var nickErrorText = document.getElementById('nickErrorText');
    var nickNameInput = document.getElementById('nickNameInput');
        
    if (btnStart) {
        btnStart.onclick = function () {
            if (nickErrorText) {
                // Checks if the nick is valid.
                if (validNick(nickNameInput.value)) {
                    nickErrorText.style.opacity = 0;
                    nickName = nickNameInput.value;
                    btnStart.onclick = function() {}
                    StartGame();
                    $("#UILogin").hide();
                } else {
                    nickErrorText.style.opacity = 1;
                }
            }
        };
    }
        
    if (nickErrorText) {
        nickErrorText.onclick = function (e) {
            if (nickNameInput) {
                nickNameInput.select();
            }
            e.preventDefault();
            nickErrorText.style.opacity=0;
        };
    }
}

/*
oncontextmenu="return false;" //禁止鼠标右键
ondragstart="return false;" //禁止鼠标拖动
onselectstart="return false;"//文字禁止鼠标选中
onselect="document.selection.empty();"//禁止复制文本
*/

$(document).ready(function(){
    $("body").attr("onSelectStart","return false;");
    $("#UIReady > img").attr({ onclick:"Ready();", oncontextmenu:"return false;", ondragstart:"return false;" });
    
    $('#UIReady').hide();
    $('#UIReadyOK').hide();
    
    PopLogin();
});
