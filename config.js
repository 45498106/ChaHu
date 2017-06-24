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
    
    branchA : { // aplha审核分支
        loginMenu : ['guest'],
        homeButtons : ['rule'],
        createRoomAutoInviteRobot : true,   // 创建房间自动邀请机器人
    },
    
    branchB : { // beta正式分支
        loginMenu : ['weixin'],
        homeButtons : ['share', 'rule', 'record', 'setting', 'money', 'notify'],
        createRoomAutoInviteRobot : false,
    },
    
    branchC : { // 新功能试验版分支
        loginMenu : ['guest', 'weixin'],
        homeButtons : ['share', 'rule', 'record', 'setting', 'money', 'notify'],
        createRoomAutoInviteRobot : true,
    },
    
    GetBranch : function(varsion) {
        var branchC_mapArray = ['web1.1', 'webMobile1.1'];
        var inBranchC = (branchC_mapArray.indexOf(varsion) >= 0);
        if (inBranchC) {
            return this.branchC;
        }
        
        var branchB_mapArray = ['1.0','web1.0','webMobile1.0','ios1.0','android1.0'];
        var inBranchB = (branchB_mapArray.indexOf(varsion) >= 0);
        if (inBranchB) {
            return this.branchB;
        }
        
        return this.branchA;
    }
}

if(typeof module !== 'undefined')
    module.exports = Config;