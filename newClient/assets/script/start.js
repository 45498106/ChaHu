cc.Class({
    extends: cc.Component,

    properties: {

    },

    // TODO : 引擎初始化工作放在这里 
    onLoad: function () {
        
        // 创建日志 
        var useNetLog = cc.sys.isNative;
        CreateLogger(useNetLog);
        
        // 加载所有麻将资源 
        LoadAllCardSpriteFrame();
    },
});
