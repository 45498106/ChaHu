var IO = require('socket.io')(38086);
IO.on('connection', function (socket) {
    socket.on('Log', function(data) {
        //console.log(data);
        console.log.apply(console.log, data);
    });
});
