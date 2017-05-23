
// 15:51 2017/3/21
// create by lsh

/**
 * Module exports.
 */

if(typeof module !== 'undefined')
    module.exports = MySQL;

var mysql = require('mysql');

function MySQL()
{
    this.connected = false;
}

MySQL.prototype.Init = function (host, port, database, user, password)
{
    var me = this;
    // 建立数据库连接
    var connection = mysql.createConnection({
        host     : host,
        port     : port,
        user     : user,
        password : password,
        database : database,
        insecureAuth: true,
        multipleStatements: true
    });
    
    connection.connect(function(err) {
        if (err) {
            GameLog('error connecting: ' + err.stack);
            return false;
        }
        
        setInterval(function () {
            if (me.connected) {
                me.connection.query('SELECT 1');
                // GameLog('数据库 ping......');
            }
        }, 10000);

        me.connected = true;
        GameLog('数据库连接成功-->>connected as id ' + connection.threadId);
    });
    
    connection.on('error', function(error) {
        GameLog("数据库抛出一个错误.");
        if(error.code === 'PROTOCOL_CONNECTION_LOST') {     // Connection to the MySQL server is usually
            GameLog('数据库断开连接(error code : ' + error.code + ').');
            me.connected = false;
            me.Init(host, database, user, password);        // lost due to either server restart, or a
        } else {                                            // connnection idle timeout (the wait_timeout
            throw error;                                    // server variable configures this)
        }
    });
    
    me.connection = connection;
}

// 查询
MySQL.prototype.Query = function(commond, func)
{
    if (this.connected == true && this.connection) {
        try {
            var startTime = (new Date()).getMilliseconds();
            var t = this.connection.query(commond, function (err, results, fields) {
                var endTime = (new Date()).getMilliseconds();
                GameLog("查询用时:",(endTime - startTime), "ms");
                if (err) {
                    if(err.code === 'ER_PARSE_ERROR') {
                        GameLog("查询语句解析错误!", err);
                    } else {
                        GameLog(err); 
                    }
                    return; 
                }
                
                if (typeof func === 'function')
                    func(results, fields);
            });
            GameLog("SQL->", t.sql);
        } catch (e) {
            GameLog("查询错误" + e);
        }
    }
 }
 
 MySQL.prototype.Query2 = function(commond, array, func)
{
    if (this.connected == true && this.connection) {
        var startTime = (new Date()).getMilliseconds();
        try {
            var t = this.connection.query(commond, array, function (err, results, fields) {
                var endTime = (new Date()).getMilliseconds();
                GameLog("查询用时:",(endTime - startTime), "ms");
                if (err) { 
                    if(err.code === 'ER_PARSE_ERROR') {
                        GameLog("查询语句解析错误!", err);
                    } else {
                        GameLog(err); 
                    }
                    return; 
                }
                
                if (typeof func === 'function')
                    func(results, fields);
            });
            GameLog("SQL->", t.sql);
        } catch (e) {
            GameLog("查询错误" + e);
        }
    }
 }

// 执行存储过程(stored procedure).
MySQL.prototype.RunSP = function(procedureName, parameterArray, func)
{
    /*
    // example : SET @p0='1234'; SET @p1='www'; CALL `AddUserByUid`(@p0, @p1, @p2); SELECT @p2 AS `out_value`;
    
    var cmd = "";
    for (var i = 0; i < parameterArray.length; ++i) {
        cmd += "SET @p" + i + "='" +  parameterArray[i] + "'; ";
    }
    
    cmd += "CALL `" + procedureName + "` (";
    for (var i = 0; i <= parameterArray.length; ++i) {
        cmd += "@p" + i + ",";
    }
    cmd = cmd.substring(0, cmd.length - 1);
    cmd += "); SELECT @p" + parameterArray.length + " AS `out_value`;"
    */
    
    var cmd = "CALL `" + procedureName + "` (";
    for (var i = 0; i < parameterArray.length; ++i) {
        if (typeof parameterArray[i] === 'number') {
            cmd += parameterArray[i] + ",";
        }else{
            cmd += "'" + parameterArray[i] + "',";
        }
    }
    cmd += "@pOut);";
    this.Query(cmd, func);
}

// 退出
MySQL.prototype.Exit = function() 
{
    if (this.connected) {
        this.connection.destroy();
        this.connected = false;
    }
}
