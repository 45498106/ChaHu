function Replay (room) {
    this.room = room;
}

Replay.prototype.Start = function()
{
    // 记录
    this.record = {};
    
    this.record.roomInfo = {};
    this.CopyRoomInfo();

    this.record.players = [];
    this.CopyPlayerInfo();

    this.record.actions = [];
}

Replay.prototype.End = function()
{
    var rooid = this.record.roomInfo.id;
    var time = new Date();
    var timeTxt = time.toLocaleDateString() + "-" +  time.toLocaleTimeString()
    var json = JSON.stringify(this.record);

    var Readable = require('stream').Readable;
    var s = new Readable();
    s.push(json);
    s.push(null);

    // 对象上传
    var params = {
        Bucket: "chahu-1253106522",     /* 必须 */
        Region: "cn-southwest",         /* 必须 */
        Key: rooid + '-' + timeTxt + ".json",    /* 必须 */
        Body: s,                        /* 必须 */
        ContentLength: s._readableState.length, /* 必须 */
        ContentType : 'text/json;charset=utf-8',/* 非必须 */
        onHashProgress: function (progressData) {
            console.log(JSON.stringify(progressData));
        },
        onProgress: function (progressData) {
            console.log(JSON.stringify(progressData));
        },
    };

    QcloudCos.putObject(params, function(err, data) {
        if(err) {
            console.log(err);
        } else {
            console.log(data);
        }
    });
}

Replay.prototype.CopyRoomInfo = function() {
    var roomInfo = this.record.roomInfo;
    roomInfo.id = this.room.id;
    roomInfo.createUserId = this.room.createUserId;
    roomInfo.ruleId = this.room.ruleId;
    roomInfo.quanId = this.room.quanId;
    roomInfo.hunCount = this.room.hunCount;
    roomInfo.playCount = this.room.playCount;
    roomInfo.bankerCount = this.room.bankerCount;   // 庄记数
}

Replay.prototype.CopyPlayerInfo = function() {
    var player, playData;
    for (var i = 0; i < this.room.playData.length; ++i) {
        player = {};
        playData = this.room.playData[i];
        player.userId = playData.userId;
        player.userName = playData.userName;
        player.userHeadUrl = playData.userHeadUrl;
        player.cards = playData.cards.slice();
        this.record.players.push(player);
    }
}

// 添加动作
Replay.prototype.AddAction = function(action, place, data) {
    this.record.actions.push({action:action, place:place,data:data});
}

if(typeof module !== 'undefined')
    module.exports = Replay;