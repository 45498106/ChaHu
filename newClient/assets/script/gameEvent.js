var GameEvent = cc.Class({
    extends: cc.Component,

    statics: {
        inst: null
    },
    
    // use this for initialization
    onLoad: function () {
        GameEvent.inst = this;
    },
    
    OnEvent : function (eventName, func, obj) {
        this.node.on(eventName, func, obj);
    },
    
    OffEvent : function (eventName, func, obj) {
        this.node.off(eventName, func, obj);
    },
    
    SendEvent : function(eventName, data) {
        this.node.emit(eventName, data);
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
