// 10:34 2017/3/23
// create by li shihai

var Config = {

    listenPort : 18080,
    
    /*
    db_host : '127.0.0.1',
    db_port : 3306,
    db_database : 'mahjong',
    db_user : 'root',
    db_password : '123456',*/
    
    db_host : 'bdm25324667.my3w.com',
    db_port : 3306,
    db_database : 'bdm25324667_db',
    db_user : 'bdm25324667',
    db_password : '0217104lsh',
    
    loginMenu : ['weixin', 'guest'],
}

if(typeof module !== 'undefined')
    module.exports = Config;