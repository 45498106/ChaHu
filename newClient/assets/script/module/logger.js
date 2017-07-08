
var sprintf = require('sprintf');

// 封装日志函数
var Logger = function ()
{
    var date = new Date();
    var time = sprintf("%02d", date.getMonth() + 1) + "/" + sprintf("%02d", date.getDate()) + ' ' + 
               sprintf("%02d", date.getHours()) + ':' + sprintf("%02d", date.getMinutes()) + ' ' + 
               sprintf("%02d", date.getSeconds()) + '.' + sprintf("%03d", date.getMilliseconds());

    var args = Array.prototype.slice.call(arguments);
    args.unshift(time);
    console.log.apply(console, args);
    
    if (typeof this.socket !== 'undefined' && this.socket.connected === true) {
        this.socket.send(JSON.stringify(args));
    }
}

if(typeof module !== 'undefined')
    module.exports = Logger;
