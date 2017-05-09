// 10:34 2017/3/23
// create by li shihai

var Config = {

    listenPort : 18080,
    /*
    db_host : '58dc68f83bd4f.gz.cdb.myqcloud.com',
    db_port : 5818,
    db_database : 'nc',
    db_user : 'cdb_outerroot',
    db_password : '0217104lsh',*/

    
    db_host : '127.0.0.1',
    db_port : 3306,
    db_database : 'mahjong',
    db_user : 'root',
    db_password : '123456',
}

if(typeof module !== 'undefined')
    module.exports = Config;