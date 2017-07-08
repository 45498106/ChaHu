var MessageHandler = require("msgHandler");

var loginMenuBack = {};
loginMenuBack['interest'] = "loginMenuBack";
loginMenuBack['Process'] = function(message) {
    GameLog(message);
    GameData.loginMenu = message.slice();
    GameEvent().SendEvent("LoginMenuBack");
};
MessageHandler.Add(loginMenuBack);

var homeButtonsBack = {};
homeButtonsBack['interest']="homeButtonsBack";
homeButtonsBack['Process'] = function(message) {
    GameLog(message);
    GameData.homeButtons = message.slice();
    GameEvent().SendEvent("HomeButtonsBack");
}

MessageHandler.Add(homeButtonsBack);


var enterGameBack = {};
enterGameBack['interest'] = "enterGameBack";
enterGameBack['Process'] = function (message) {
    GameLog(message);
    
    GameData.userId = message.userId;
    if (message.loginType === 'guest') {
        GameData.userName = message.name;
        GameData.userHeadUrl = message.headUrl;
    }
    
    GameData.validUniqueID = GameData.uniqueID;
    GameEvent().SendEvent("LoginSuccess");
};
MessageHandler.Add(enterGameBack);

