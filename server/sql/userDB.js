// 16:26 2017/5/7
// 6ffa709540534027316e96032645b719 微信小程序secret

function UserDB()
{

}

// 获得账号
UserDB.prototype.GetUserInfo = function(uniqueID, callbck)
{
    var cmd = "SELECT `id`,`source`,`name`,`headUrl` FROM `user` WHERE `uniqueId`=?";
    mysql.Query2(cmd, [uniqueID], function (results, fields) {  
        if (results.length === 0) {
            if (typeof callbck === 'function') { callbck(false, null); }
        }else {
            if (typeof callbck === 'function') { callbck(true, results); }
        }
    });
}

// 注册账号
UserDB.prototype.RegisterByUniqueID = function(uniqueID, source, callbck) {
    var cmd = "INSERT INTO `user` VALUES (null, ?, ?, null, null);";
    mysql.Query2(cmd, [uniqueID, source], function (results, fields) {
        if (typeof callbck === 'function') { callbck(true, results.insertId); }
    });
}

// 更新用户信息
UserDB.prototype.UpdateUserInfo = function(uniqueID, name, headUrl, callbck) {
    var cmd = "UPDATE `user` SET `name`=?,`headUrl`=? where `uniqueId`=?;";
    mysql.Query2(cmd, [name, headUrl, uniqueID], function (results, fields) {  
        if (typeof callbck === 'function') { callbck(true, results); }
    });
}

if(typeof module !== 'undefined')
    module.exports = new UserDB();
