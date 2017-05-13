cc.Class({
    extends: cc.Component,

    properties: {
    },

    // use this for initialization
    onLoad: function () {
        this.ReOrder();
    },
    
    ReOrder : function() {
        var children = this.node.children;
        for (var i = 0; i < children.length; ++i) {
            children[i].zIndex = children.length - i;
        }
    },
});
