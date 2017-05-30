var MessageHandler = require("msgHandler");

var errorBack = {};
errorBack['interest'] = "gameError";
errorBack['Process'] = function(message) {
    GameLog(message);
    Notify().Play(message.msg);
};
MessageHandler.Add(errorBack);
