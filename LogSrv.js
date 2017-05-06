var IO = require('socket.io')(38086);
IO.on('connection', function (socket) {
    console.log("client connection");
    socket.on('Log', function(data) {
        if (data instanceof Array) {
            console.log.apply(console.log, data);
        }else {
            console.log(data);
        }
    });
    
    socket.on('disconnect', function () {
        console.log("client disconnect");
    });
});
