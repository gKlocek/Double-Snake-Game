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
        rooms.push(roomName)
        socket.join(`room-${++roomsCounter}`);
        socket.emit('newGame', { name: data.name, room: roomName});
    });

    // Connect the Player 2 to the room he requested. Show error if room full.
    socket.on('joinGame', function (data) {
        socket.join(data.room);
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
        socket.broadcast.to(data.room).emit('turnPlayed', {
            tile: data.tile,
            room: data.room
        });
    });

    /*socket.on('joinServer', (data) => {
       
    });*/
    /**
       * Notify the players about the victor.
       */
    socket.on('gameEnded', (data) => {
        socket.broadcast.to(data.room).emit('gameEnd', data);
    });

    socket.on('chat message', function(msg){
        io.emit('chat message', msg);
    });
});

server.listen(process.env.PORT || 5000);