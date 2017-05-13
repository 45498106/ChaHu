var IO = require('socket.io')(38086);
IO.on('connection', function (socket) {
    console.log("client connection");
    socket.on('Log', function(data) {
        if (typeof data === "object") {
            if (data instanceof Array) {
                console.log.apply(console.log, data);
            }else {
                console.log(data);
            }
        }else if (typeof data === "string"){
            try {
                var dataObj = JSON.parse(data);
                if (dataObj instanceof Array) {
                    console.log.apply(console.log, dataObj);
                }else {
                    console.log(dataObj);
                }
            } catch (e) {
                console.log(data);
            }
        }
    });
    
    socket.on('disconnect', function () {
        console.log("client disconnect");
    });
});
