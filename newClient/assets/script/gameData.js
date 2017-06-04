(function() {

    var GameData = {
        loginMenu : [],
        homeButtons : [],
        
        
    	userId : -1,
    	userName : "",
    	userHeadUrl : "",
    	userRoomCard : 0,
    	userRoomData : {},
    	
    	selfPlace : -1,
    	players : [null,null,null,null],
        getCardPlace : -1,
        huPlace : -1,
        huCard : 0,
        huCards : [],
        needFlushCard : false,
        resumeGame : false,
        selfOperation : null,
        
    }
    
    GameData.GetUserId = function () {
      return this.userId;  
    }
    
    GameData.GetUserName = function () {
        return this.userName;
    }
    
    GameData.GetUserHeadUrl = function () {
        return this.userHeadUrl;
    }
    
    GameData.GetUserRoomCard = function () {
        return this.userRoomCard;
    }
    
    GameData.GetUserRoomData = function () {
        return this.userRoomData;
    }
    
    GameData.GetPlayerCount = function() {
        var count = 0;
        for (var i = 0; i < this.players.length; ++i) {
            if (this.players[i])
            {
                ++count;
            }
        }
        return count;
    }
    
    if(typeof module !== 'undefined')
        module.exports = GameData;
        
    if(typeof window !== 'undefined')
        window.GameData = GameData;
})();

