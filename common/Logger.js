
var sprintf = require('./sprintf.js');

var Reset = "\x1b[0m"
var Bright = "\x1b[1m"
var Dim = "\x1b[2m"
var Underscore = "\x1b[4m"
var Blink = "\x1b[5m"
var Reverse = "\x1b[7m"
var Hidden = "\x1b[8m"

var FgBlack = "\x1b[30m"
var FgRed = "\x1b[31m"
var FgGreen = "\x1b[32m"
var FgYellow = "\x1b[33m"
var FgBlue = "\x1b[34m"
var FgMagenta = "\x1b[35m"
var FgCyan = "\x1b[36m"
var FgWhite = "\x1b[37m"

var BgBlack = "\x1b[40m"
var BgRed = "\x1b[41m"
var BgGreen = "\x1b[42m"
var BgYellow = "\x1b[43m"
var BgBlue = "\x1b[44m"
var BgMagenta = "\x1b[45m"
var BgCyan = "\x1b[46m"
var BgWhite = "\x1b[47m"

// 封装日志函数
var Info = function ()
{
    var date = new Date();
    var time = sprintf("%02d", date.getMonth() + 1) + "/" + sprintf("%02d", date.getDate()) + ' ' + 
               sprintf("%02d", date.getHours()) + ':' + sprintf("%02d", date.getMinutes()) + ' ' + 
               sprintf("%02d", date.getSeconds()) + '.' + sprintf("%03d", date.getMilliseconds());
    
    var color = Bright + FgRed;
    
    var args = Array.prototype.slice.call(arguments);
    args.unshift(time);
    
    console.log.apply(console, args);
}

var Error = function ()
{
    var date = new Date();
    var time = sprintf("%02d", date.getMonth() + 1) + "/" + sprintf("%02d", date.getDate()) + ' ' + 
               sprintf("%02d", date.getHours()) + ':' + sprintf("%02d", date.getMinutes()) + ' ' + 
               sprintf("%02d", date.getSeconds()) + '.' + sprintf("%03d", date.getMilliseconds());
    
    var color = Bright + FgRed;
    
    var args = Array.prototype.slice.call(arguments);
    args.unshift(color);
    args.push(Reset);
    args.unshift(time);
    
    console.log.apply(console, args);
}

var Debug = function ()
{
    var date = new Date();
    var time = sprintf("%02d", date.getMonth() + 1) + "/" + sprintf("%02d", date.getDate()) + ' ' + 
               sprintf("%02d", date.getHours()) + ':' + sprintf("%02d", date.getMinutes()) + ' ' + 
               sprintf("%02d", date.getSeconds()) + '.' + sprintf("%03d", date.getMilliseconds());
    
    var color = Bright + BgGreen;
    
    var args = Array.prototype.slice.call(arguments);
    args.unshift(color);
    args.push(Reset);
    args.unshift(time);
    
    console.log.apply(console, args);
}

var Warnnig = function ()
{
    var date = new Date();
    var time = sprintf("%02d", date.getMonth() + 1) + "/" + sprintf("%02d", date.getDate()) + ' ' + 
               sprintf("%02d", date.getHours()) + ':' + sprintf("%02d", date.getMinutes()) + ' ' + 
               sprintf("%02d", date.getSeconds()) + '.' + sprintf("%03d", date.getMilliseconds());
    
    var color = Bright + FgYellow;
    
    var args = Array.prototype.slice.call(arguments);
    args.unshift(color);
    args.push(Reset);
    args.unshift(time);
    
    console.log.apply(console, args);
}

if(typeof module !== 'undefined')
    module.exports = Info;
