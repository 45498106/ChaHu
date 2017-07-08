
function Voice() {
    
}

Voice.prototype.Init = function() {
    if (!cc.sys.isNative) {
        return;
    }
    else if (cc.sys.os === cc.sys.OS_ANDROID) {
        return;
    }
    else if (cc.sys.os === cc.sys.OS_IOS) {
        
        if (GameData.loginType === "weixin") {
            var uniqueId = WeiXin().unionid;
            jsb.reflection.callStaticMethod("GVoice", "Init:", uniqueId);
            jsb.reflection.callStaticMethod("GVoice", "ApplyMessageKey:", 60000);
        }else {
            window.GetUniqueID(function(uniqueId){
                var md5 = require('md5.min');
                jsb.reflection.callStaticMethod("GVoice", "Init:", md5(uniqueId));
                jsb.reflection.callStaticMethod("GVoice", "ApplyMessageKey:", 60000);
            });
        }
    }
}

Voice.prototype.SetUploadCallback =  function (func) {
    this.uploadCallback = func;
}

Voice.prototype.UploadCallback = function(fileID) {
    if (typeof this.uploadCallback === 'function') {
        this.uploadCallback(fileID);
    }
}

Voice.prototype.SetDownloadCallback =  function (func) {
    this.downloadCallback = func;
}

Voice.prototype.DownloadCallback = function(fileID) {
    if (typeof this.downloadCallback === 'function') {
        this.downloadCallback(fileID);
    }
}

Voice.prototype.SetPlayRecordedFileEndCallback = function(func) {
    this.playEndCallback = func;
}

Voice.prototype.PlayRecordedFileEnd = function(filePath) {
    if (typeof this.playEndCallback === 'function') {
        this.playEndCallback(filePath);
    }
}

Voice.prototype.StartRecording = function(filePath) {
    if (!cc.sys.isNative) {
        return;
    }
    else if (cc.sys.os === cc.sys.OS_ANDROID) {
        return;
    }
    else if (cc.sys.os === cc.sys.OS_IOS) {
        jsb.reflection.callStaticMethod("GVoice", "StartRecording:", filePath);
    }
}

Voice.prototype.StopRecording = function() {
    if (!cc.sys.isNative) {
        return;
    }
    else if (cc.sys.os === cc.sys.OS_ANDROID) {
        return;
    }
    else if (cc.sys.os === cc.sys.OS_IOS) {
        jsb.reflection.callStaticMethod("GVoice", "StopRecording");
    }
}

Voice.prototype.UploadRecordedFile = function(filePath)
{
    if (!cc.sys.isNative) {
        return;
    }
    else if (cc.sys.os === cc.sys.OS_ANDROID) {
        return;
    }
    else if (cc.sys.os === cc.sys.OS_IOS) {
        jsb.reflection.callStaticMethod("GVoice", "UploadRecordedFile:", filePath);
    }
}


Voice.prototype.DownloadRecordedFile = function(fileID, saveFilePath)
{
    if (!cc.sys.isNative) {
        return;
    }
    else if (cc.sys.os === cc.sys.OS_ANDROID) {
        return;
    }
    else if (cc.sys.os === cc.sys.OS_IOS) {
        jsb.reflection.callStaticMethod("GVoice", "DownloadRecordedFile:SaveFilePath:", fileID, saveFilePath);
    }    
}

Voice.prototype.PlayRecordedFile = function(filePath)
{
    if (!cc.sys.isNative) {
        return;
    }
    else if (cc.sys.os === cc.sys.OS_ANDROID) {
        return;
    }
    else if (cc.sys.os === cc.sys.OS_IOS) {
        jsb.reflection.callStaticMethod("GVoice", "PlayRecordedFile:", filePath);
    }    
    
}
Voice.prototype.StopPlayRecordedFile = function() 
{
    if (!cc.sys.isNative) {
        return;
    }
    else if (cc.sys.os === cc.sys.OS_ANDROID) {
        return;
    }
    else if (cc.sys.os === cc.sys.OS_IOS) {
        jsb.reflection.callStaticMethod("GVoice", "StopPlayRecordedFile");
    }    
}

Voice.prototype.Poll = function() 
{
    if (!cc.sys.isNative) {
        return;
    }
    else if (cc.sys.os === cc.sys.OS_ANDROID) {
        return;
    }
    else if (cc.sys.os === cc.sys.OS_IOS) {
        jsb.reflection.callStaticMethod("GVoice", "Poll");
    }
}

Voice.prototype.GetMicLevel = function() 
{
    var rt = 0;
    if (!cc.sys.isNative) {
        return rt;
    }
    else if (cc.sys.os === cc.sys.OS_ANDROID) {
        return rt;
    }
    else if (cc.sys.os === cc.sys.OS_IOS) {
        rt = jsb.reflection.callStaticMethod("GVoice", "GetMicLevel");
        return rt;
    }
}

Voice.prototype.GetRecordedSeconds = function(filePath) {
    
    var rt = 0;
    if (!cc.sys.isNative) {
        return rt;
    }
    else if (cc.sys.os === cc.sys.OS_ANDROID) {
        return rt;
    }
    else if (cc.sys.os === cc.sys.OS_IOS) {
        rt = jsb.reflection.callStaticMethod("GVoice", "GetRecordedSeconds:", filePath);
        return rt;
    }
}

if(typeof module !== 'undefined')
    module.exports = Voice;