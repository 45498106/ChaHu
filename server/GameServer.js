if(typeof module !== 'undefined')
    module.exports = GameServer;

var Room = require("./Room.js");
var Player = require("./Player.js");
    
function GameServer()
{
    this.lastRoomId = 0;
    this.rooms = [];
    this._pdte = new Date().getTime();
}

GameServer.prototype.Init = function()
{
    // 设置更新
    setInterval(function(){
        this._pdt = (new Date().getTime() - this._pdte) / 1000.0;
        this._pdte = new Date().getTime();
        //if (this._pdt > 0.04) {
        //    GameLog("!!!###########this._pdt=", this._pdt);
        //}
        this.Update(this._pdt);
    }.bind(this), 1000.0/30.0);
}

GameServer.prototype.Update = function(dt)
{

}

GameServer.prototype.GenRoomId = function()
{
    return ++this.lastRoomId + 100000;
}

GameServer.prototype.NewClient = function(client)
{
    var socket = client.socket;
    var server = this;
    
    socket.on('enterGame', function (data) {
        
        if (typeof client.player !== 'undefined') {
            GameLog(socket.id + "repeat enterGame");
            return;
        }
        
        // check nickName is valid.
        var newPlayer = new Player();
        newPlayer.Init(socket.id, data.nickName, socket);
        client.player = newPlayer;
        
        server.AddToRoom(newPlayer);
    });
}

GameServer.prototype.DeleteClient = function(client)
{
    var player = client.player;
    if (player) {
        client.player = null;
        if (player.room) {
            player.room.RemovePlayer(player);
        }
    }
}

GameServer.prototype.AddToRoom = function(player)
{
    var room = null;
    
    for (var i = 0; i < this.rooms.length; ++i) {
        if (this.rooms[i].GetPlayerCount() !== 4) {
            room = this.rooms[i]; 
            break;
        }
    }
    
    if (room === null) {
        room = new Room();
        room.Init(this.GenRoomId());
        this.rooms.push(room);
    }
    
    room.AddPlayer(player);
    player.room = room;
}
