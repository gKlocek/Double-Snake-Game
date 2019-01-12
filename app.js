var http = require('http');
var socket = require('socket.io');
var fs = require('fs');
var express = require('express');

var app = express();

app.set('view engine', 'ejs');
app.set('views', './views');

var server = http.createServer(app);
var io = socket(server);

app.get('/', function(req, res) {
    res.render('app');
});

server.listen(3000);


io.on('connection', function(socket) {
    console.log('client connected:' + socket.id);
    socket.on('chat message', function(data) {
        io.emit('chat message', data); // do wszystkich
        //socket.emit('chat message', data); tylko do połączonego
    })
});

setInterval( function() {
    var date = new Date().toString();
    io.emit( 'message', date.toString() );
}, 1000 );

console.log( 'server listens' );

// rooms and namespaces https://socket.io/docs/rooms-and-namespaces/
// cheat sheet https://stackoverflow.com/questions/10058226/send-response-to-all-clients-except-sender