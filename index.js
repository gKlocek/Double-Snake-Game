const express = require('express');
const path = require('path');

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

let rooms = [];
let messages = []
///////////////////////////////////////////////////
var rooms2 = 0;
var player1move = [];
var player2move = [];
var apple = [];
var ended = [];
var started = [];

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
        rooms2++;
        const roomName = `room-${rooms.length}`;
        rooms.push(roomName)
        socket.join(roomName);
        socket.emit('newGame', { name: data.name, room: roomName});
    });

    // Connect the Player 2 to the room he requested. Show error if room full.
    socket.on('joinGame', function (data) {
        socket.join(data.room);
        console.log('joined to: ' + data.room)
        socket.broadcast.to(data.room).emit('player1', {});
        socket.emit('player2', { name: data.name, room: data.room })
        setTimeout(function(){
            console.log('setTimeout launched on room: '+ data.room);
            started[data.room] = true;
        },1000);
    });

    socket.on('movePlayed', function(data){
        if (data.player1)
        {
            player1move[data.room]=data.move;
        }
        else
        {
            player2move[data.room]=data.move;
        }
    })
    
    function generateRandomNumber(min_value , max_value) 
    {
        return Math.floor(Math.random() * (max_value-min_value) + min_value) ;
    }    
    

    socket.on('ateapple', function(data){
        socket.broadcast.to(data.room).emit('updateapple', {x:data.x, y:data.y});
    })

    setInterval(function(){
        for(var i=0; i<rooms2; i++) {

            id='room-'+i;
            if (!ended[id]&&started[id])
                socket.broadcast.to(id).emit('snake', {p1move: player1move[id], p2move: player2move[id], apple : apple[id]});
        }
    }, 1000/2);

    /*socket.on('playTurn', (data) => {
        console.log("turn played in: "+data.room)
        socket.broadcast.to(data.room).emit('turnPlayed', {
            tile: data.tile,
            room: data.room
        });
    });*/

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
      console.log(data)
        console.log("room message recived from: "+ data.room);
        console.log("message text: "+ data.message);
        //socket.join(data.room);
        io.sockets.in(data.room).emit('room chat message', data.message);
        //socket.broadcast.to(data.room).emit('room chat message', data.message);
    });
});

server.listen(process.env.PORT || 5000);
