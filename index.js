const express = require('express');
const path = require('path');

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

let roomsCounter = 0;
let rooms = [];

app.use(express.static('.'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'game.html'));
});

io.on('connection', (socket) => {
    console.log("connection established")

    socket.on('joinLobby', (data) => {
        console.log("lobby joined");
        socket.emit('updateRooms', {rooms: rooms});
    });

    socket.on('createGame', (data) => {
        console.log("game created " + data.name)
        const roomName = `room-${roomsCounter}`;
        console.log(roomName);
        rooms.push(roomName)
        socket.join(`room-${++roomsCounter}`);
        socket.emit('newGame', { name: data.name, room: roomName});
    });

    // Connect the Player 2 to the room he requested. Show error if room full.
    socket.on('joinGame', function (data) {
        socket.join(data.room);
        console.log('joined to: ' + data.room)
        socket.broadcast.to(data.room).emit('player1', {});
        socket.emit('player2', { name: data.name, room: data.room })
    });
    /*socket.on('joinGame', function (data) {
        var room = io.nsps['/'].adapter.rooms[data.room];
        if (room && room.length === 1) {
            socket.join(data.room);
            socket.broadcast.to(data.room).emit('player1', {});
            socket.emit('player2', { name: data.name, room: data.room })
        } else {
            socket.emit('err', { message: 'Sorry, The room is full!' });
        }
    });*/
    /**
       * Handle the turn played by either player and notify the other.
       */
    socket.on('playTurn', (data) => {
        console.log("turn played in: "+data.room)
        socket.broadcast.to(data.room).emit('turnPlayed', {
            tile: data.tile,
            room: data.room
        });
    });

    /**
       * Notify the players about the victor.
       */
    socket.on('gameEnded', (data) => {
        socket.broadcast.to(data.room).emit('gameEnd', data);
    });

    socket.on('global chat message', (msg) => {
        io.emit('global chat message', msg);
    });

    socket.on('room chat message', (data) => {
        console.log(JSON.stringify(data));
        var BreakException = {message: 'to many iterations'};
        i = 0;
        try {
            var clients = io.sockets.adapter.rooms['Room Name'].sockets;   
            //to get the number of clients
            var numClients = (typeof clients !== 'undefined') ? Object.keys(clients).length : 0;
            console.log(numClients);
            for (var clientId in clients ) {
                //this is the socket of each client in the room.
                var clientSocket = io.sockets.connected[clientId];
                //you can do whatever you need with this
                clientSocket.emit('new event', "Updates");
            }
        } catch (e) {
            console.log(JSON.stringify(e));
        }
        //console.log("in that room we have ")
        console.log("room message recived from: "+ data.room);
        console.log("message text: "+ data.message);
    
        //socket.join(data.room);
        //io.emit('room chat message', data.message);
        io.in(data.room).emit('room chat message', data.message);
        //socket.broadcast.to(data.room).emit('room chat message', data.message);
    });
});

server.listen(process.env.PORT || 5000);