var MessageHandler = require("msgHandler");

var errorBack = {};
errorBack['interest'] = "error";
errorBack['Process'] = function(message) {
    GameLog(message);
    Notify().Play(message.msg);
};
MessageHandler.Add(errorBack);
