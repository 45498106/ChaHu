// 18:30 2017/3/22
// create by lsh

;(function() {
    var MessageHandler = { }
    var handlers = {}

    MessageHandler.Add = function(handler) {
        if (typeof handler.interest === 'string' &&
            typeof handler.Process === 'function') {
            handlers[handler.interest] = handler.Process
            GameLog("Add handler :" + handler.interest);
        }
        else {
            GameLog("error type of handler" + handler);
        }
    }

    MessageHandler.Process = function(msg) {
        if (typeof msg.type === 'string' && 
            typeof handlers[msg.type] === 'function') {
            GameLog("receive", msg.type);
            handlers[msg.type](msg);
        }else {
            GameLog("invalid massage ->>" + msg);
        }    
    }
    
    MessageHandler.SocketRegister = function(socket) {
        
        var delegate = function(object, objectMethod, data) {
            return function(e) {
                GameLog("receive : " + data);
                //if (cc.sys.isNative) {
                    return objectMethod.call(object, e);
                //}else {
                //    return objectMethod.apply(object, arguments);
                //}
            }
        }
        
        for (var key in handlers)  {
            if (typeof handlers[key] === 'function') {
                socket.on(key, delegate(handlers[key],handlers[key],key));
            }
        }
    }
    
    if(typeof module !== 'undefined')
        module.exports = MessageHandler;
        
    if(typeof window !== 'undefined')
        window.MessageHandler = MessageHandler;
})();
