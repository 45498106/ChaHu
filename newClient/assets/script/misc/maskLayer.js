cc.Class({
    extends: cc.Component,

    // use this for initialization
    onLoad: function () {

        this.node.on(cc.Node.EventType.TOUCH_END, function (event) {
        });
    },
});
