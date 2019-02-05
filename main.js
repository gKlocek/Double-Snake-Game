(function(){
  // Types of players
  var socket = io.connect('http://localhost:5000'),
      player,
      game;

  
  
  px=py=10;
  gs=tc=20;
  ax=ay=15;
  xv=yv=0;


  /** 
   * New Game created by current client. 
  * Update the UI and create new Game var.
  */
  socket.on('newGame', function(data){
      var message = 'Hello, ' + data.name + 
      '. Please ask your friend to enter Game ID: ' +
      data.room + '. Waiting for player 2...';

      // Create game for player 1
      
      game = new Game(data.room);
      socket.emit('movePlayed', {room: game.getRoomId(), move: 39, player1: true})
      socket.emit('movePlayed', {room: game.getRoomId(), move: 37, player1: false})
      player.updateSnake1({x:1,y:1});
      player.updateSnake2({x:18,y:18});
      game.displayBoard(message);		
  });

  socket.on('snake', function(data){
      ctx.fillStyle="lime";
      switch(data.p1move) {
          case 37: // left
          player.updateLastMove(37);
          if (player.getSnake1last().x-1<0) 
              next=19
          else 
              next=player.getSnake1last().x-1;
          player.updateSnake1({x: next, y: player.getSnake1last().y})
          
          break;
  
          case 38: // up
          player.updateLastMove(38);
          if (player.getSnake1last().y-1<0) 
              next=19
          else 
              next=player.getSnake1last().y-1;
          player.updateSnake1({x: player.getSnake1last().x, y:next})
          
          break;
  
          case 39: // right
          player.updateLastMove(39);
          if (player.getSnake1last().x+1>19) 
              next=0
          else 
              next=player.getSnake1last().x+1;
          player.updateSnake1({x: next, y: player.getSnake1last().y})
          
          break;
  
          case 40: // down
          player.updateLastMove(40);
          if (player.getSnake1last().y+1>19) 
              next=0
          else 
              next=player.getSnake1last().y+1;
          player.updateSnake1({x: player.getSnake1last().x, y:next})

          break;
          default: return; // exit this handler for other keys
      }
      
      ctx.fillRect(player.getSnake1()[player.getTail1()].x*gs,player.getSnake1()[player.getTail1()].y*gs,gs-2,gs-2);
      ctx.fillStyle="black";
      if(player.getApple().x==player.getSnake1last().x && player.getApple().y==player.getSnake1last().y)
      {
          if(player.getPlayer1())
          {   
              x= generateRandomNumber(0,20);
              y= generateRandomNumber(0,20);
              random = {x: x, y:y};

              player.updateApple(random);
              socket.emit('ateapple', {x: x, y: y, room: game.getRoomId()});
          }
          player.updateTail1();
      }   
      else
      {
          ctx.fillRect(player.getSnake1()[0].x*gs,player.getSnake1()[0].y*gs,gs-2,gs-2);
      }
      while(player.getSnake1().length>player.getTail1()) {
          player.shiftSnake1();
      }

      ctx.fillStyle="lime";
      switch(data.p2move) {
          case 37: // left
          player.updateLastMove2(37);
          if (player.getSnake2last().x-1<0) 
              next=19
          else 
              next=player.getSnake2last().x-1;
          player.updateSnake2({x: next, y: player.getSnake2last().y})
          
          break;
  
          case 38: // up
          player.updateLastMove2(38);
          if (player.getSnake2last().y-1<0) 
              next=19
          else 
              next=player.getSnake2last().y-1;
          player.updateSnake2({x: player.getSnake2last().x, y:next})
          
          break;
  
          case 39: // right
          player.updateLastMove2(39);
          if (player.getSnake2last().x+1>19) 
              next=0
          else 
              next=player.getSnake2last().x+1;
          player.updateSnake2({x: next, y: player.getSnake2last().y})
          
          break;
  
          case 40: // down
          player.updateLastMove2(40);
          if (player.getSnake2last().y+1>19) 
              next=0
          else 
              next=player.getSnake2last().y+1;
          player.updateSnake2({x: player.getSnake2last().x, y:next})

          break;
          default: return; // exit this handler for other keys
      }

      ctx.fillRect(player.getSnake2()[player.getTail2()].x*gs,player.getSnake2()[player.getTail2()].y*gs,gs-2,gs-2);
      ctx.fillStyle="black";
      if(player.getApple().x==player.getSnake2last().x && player.getApple().y==player.getSnake2last().y)
      {
          if(!player.getPlayer1())
          {
              x= generateRandomNumber(0,20);
              y= generateRandomNumber(0,20);
              random = {x: x, y:y};
              player.updateApple(random);
              socket.emit('ateapple', {x: x, y: y, room: game.getRoomId()});
          }
          player.updateTail2();
      }   
      else
      {
          ctx.fillRect(player.getSnake2()[0].x*gs,player.getSnake2()[0].y*gs,gs-2,gs-2);
      }

      while(player.getSnake2().length>player.getTail2()) {
          player.shiftSnake2();
      }
      player.checkwinner();
  })
  /**
  * If player creates the game, he'll be P1(X) and has the first turn.
  * This event is received when opponent connects to the room.
  */
  socket.on('player1', function(data){		
      var message = 'Hello, ' + player.getPlayerName();
      $('#userHello').html(message);
      
  });

  /**
  * Joined the game, so player is P2(O). 
  * This event is received when P2 successfully joins the game room. 
  */
  socket.on('player2', function(data){
      var message = 'Hello, ' + data.name;

      //Create game for player 2
      player.updatePlayer1(false);
      player.updateSnake1({x:1,y:1});
      player.updateSnake2({y:18,x:18});
      socket.emit('name', player.getPlayerName());
      game = new Game(data.room);
      game.displayBoard(message);
  });	

  socket.on('name', function(data){
      if(player.getOpponentName()==null)
          socket.emit('name', player.getPlayerName());
      player.updateOpponentName(data);
  })
  /**
  * If the other player wins or game is tied, this event is received. 
  * Notify the user about either scenario and end the game. 
  */
  socket.on('gameEnd', function(data){
      game.endGame(data.message);
      socket.leave(data.room);
  })

  /**
  * End the game on any err event. 
  */
  socket.on('err', function(data){
      game.endGame(data.message);
  });

  socket.on('updateapple', function(data){
      player.updateApple(data);
  });

  socket.on('ateapple', function(data){
      socket.emit('updateapple', data);
  })
  
  function generateRandomNumber(min_value , max_value) 
  {
      return Math.floor(Math.random() * (max_value-min_value) + min_value) ;
  }    
  



  /**
  * Player class
  */
  var Player = function(name, type){
      this.name = name;
      this.opponent = null;
      this.snake1 = [];
      this.snake2 = [];
      this.tail1=1;
      this.tail2=1;
      this.lastmove = 0;
      this.lastmove2 = 0;
      this.player1 = type;
      this.apple = {x:10,y:1};
  }


  
  Player.prototype.getPlayerName = function(){
      return this.name;
  }

  Player.prototype.getPlayer1Name = function(){
      if(player.getPlayer1())
          return this.name;
      else
          return this.opponent;
  }
  
  Player.prototype.getPlayer2Name = function(){
      if(player.getPlayer1())
          return this.opponent;
      else
          return this.name;
  }
  
  Player.prototype.getOpponentName = function(){
      return this.opponent;
  }

  Player.prototype.updateOpponentName = function(data){
      this.opponent=data;
  }

  Player.prototype.getPlayer1 = function(){
      return this.player1;
  }

  Player.prototype.getSnake1 = function(){
      return this.snake1;
  }

  Player.prototype.getSnake2 = function(){
      return this.snake2;
  }

  Player.prototype.getSnake1last = function(){
      return this.snake1[this.snake1.length-1];
  }

  Player.prototype.getSnake2last = function(){
      return this.snake2[this.snake2.length-1];
  }
  Player.prototype.getTail1 = function(){
      return this.tail1;
  }

  Player.prototype.getTail2 = function(){
      return this.tail2;
  }
  
  Player.prototype.updateTail1 = function(){
      this.tail1++;
  }

  Player.prototype.updateTail2 = function(){
      this.tail2++;
  }

  Player.prototype.updateSnake1 = function(data){
      this.snake1.push({x:data.x, y:data.y});
  }

  Player.prototype.updateSnake2 = function(data){
      this.snake2.push({x:data.x, y:data.y});
  }

  Player.prototype.shiftSnake1 = function(){
      this.snake1.shift();
  }

  Player.prototype.shiftSnake2 = function(){
      this.snake2.shift();
  }

  Player.prototype.updatePlayer1 = function(bool){
      this.player1 = bool;
  }

  Player.prototype.updateLastMove = function(key){
      this.lastmove = key;
  }

  Player.prototype.updateLastMove2 = function(key){
      this.lastmove2 = key;
  }

  Player.prototype.getLastMove = function(){
      return this.lastmove;
  }
  Player.prototype.getLastMove2 = function(){
      return this.lastmove2;
  }
  
  Player.prototype.getApple = function(){
      return this.apple;
  }

  Player.prototype.updateApple = function(data){
      ctx.fillStyle='red';
      ctx.fillRect(data.x*gs, data.y*gs, gs-2, gs-2);
      this.apple={x:data.x, y:data.y};
  }

  Player.prototype.checkwinner = function(){
      head1=player.getSnake1last();
      head2=player.getSnake2last();
      if (head1.x==head2.x && head1.y==head2.y)
          game.announceWinner(0);
      snake=player.getSnake2();
      for(var i=0; i<player.getTail2()-1;i++)
      {
          if(snake[i].x==head1.x && snake[i].y==head1.y)
              game.announceWinner(2);
          if(snake[i].x==head2.x && snake[i].y==head2.y)
              game.announceWinner(1);
      }
      snake=player.getSnake1();
      for(var i=0; i<player.getTail1()-1;i++)
      {
          if(snake[i].x==head2.x && snake[i].y==head2.y)
              game.announceWinner(1);
          if(snake[i].x==head1.x && snake[i].y==head1.y)
              game.announceWinner(2);
      }
  }


  
  /**
  * Game class
  */
  var Game = function(roomId){
      this.roomId = roomId;
  }

  /**
  * Create the Game board by attaching event listeners to the buttons. 
  */
  Game.prototype.createGameBoard = function() {
      
      ctx.fillRect(0,0,canv.width,canv.height);
      ctx.fillStyle="lime";
      for(var i=0;i<player.getSnake1().length;i++) {
          ctx.fillRect((player.getSnake1()[i].x)*gs,player.getSnake1()[i].y*gs,gs-2,gs-2);
      }
      for(var i=0;i<player.getSnake2().length;i++) {
          ctx.fillRect(player.getSnake2()[i].x*gs,player.getSnake2()[i].y*gs,gs-2,gs-2);
      }
      ax=player.getApple().x;
      ay=player.getApple().y;
      ctx.fillStyle='red';
      ctx.fillRect(ax*gs, ay*gs, gs-2, gs-2);
  }

Game.prototype.displayBoard = function(message) {
  $('#lobby').css('display', 'none');
  $('.gameBoard').css('display', 'block');
  $('#userHello').html(message);
  this.createGameBoard();
}

Game.prototype.displayMenu = function() {
  $('.menu').css('display', 'block')
}
/**
 * Update game board UI

Game.prototype.updateBoard = function(type, row, col, tile){
  $('#'+tile).text(type);
  $('#'+tile).prop('disabled', true);
  this.board[row][col] = type;
  this.moves ++;
}*/

Game.prototype.getRoomId = function(){
  return this.roomId;
}


/**
 * Announce the winner
 * Broadcast this on the room to let the opponent know.
 */
Game.prototype.announceWinner = function(data){
  if (data==0)
      var message = 'Draw!';
  else
      if (data==1)
          var message = player.getPlayer1Name() + ' wins!';
      else
          var message = player.getPlayer2Name() + ' wins!';
  socket.emit('gameEnded', {room: this.getRoomId(), message: message});
  alert(message);
  location.reload();
}

/**
 * End the game if the other player won.  
 */
  Game.prototype.endGame = function(message){
      alert(message);
      location.reload();
  }


  /*
  Keys
  
  */

 $(document).keydown(function(e) {
    if (player.getPlayer1())
        lastmoveplayed=player.getLastMove();
    else
        lastmoveplayed=player.getLastMove2();
    switch(e.which) {
        case 37: // left
        if (lastmoveplayed != 39)
        {
            socket.emit('movePlayed', {room: game.getRoomId(), move: 37, player1: player.getPlayer1()})
        }
        break;

        case 38: // up
        if (lastmoveplayed != 40)
        {
            socket.emit('movePlayed', {room: game.getRoomId(), move: 38, player1: player.getPlayer1()})
        }
        break;

        case 39: // right
        if (lastmoveplayed != 37)
        {
            socket.emit('movePlayed', {room: game.getRoomId(), move: 39, player1: player.getPlayer1()})
        }
        break;

        case 40: // down
        if (lastmoveplayed != 38)
        {
            socket.emit('movePlayed', {room: game.getRoomId(), move: 40, player1: player.getPlayer1()})
        }
        break;

        default: return; // exit this handler for other keys
    }
  e.preventDefault(); // prevent the default action (scroll / move caret) 
  });
  /**
   * Create a new game. Emit newGame event.
   */

  /*$('#new').on('click', function(){
    var name = $('#nameNew').val();
    if(!name){
      alert('Please enter your name.');
      return;
    }
    socket.emit('createGame', {name: name});
    //player = new Player(name, true);
  });*/
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////// stary kod
  $('#home > .enter').on('click', () => {
    const name = $('#home > .nameNew').val();
    if (!name) {
      alert('Please enter your name.');
      return;
    }
    socket.emit('joinLobby');
    $('#lobby').css('display', 'block');
    $('#home').css('display', 'none');
    player = new Player(name, true);
  });

  $('#lobby > .sendGlobalMessage').on('click', () => {
    const msg = player.name + ': '+ $('#lobby > .chatInput').val();
    console.log("message: "+ msg + " was sent")
    socket.emit('global chat message', msg);
  });
  
  $('.gameBoard > .sendRoomMessage').on('click', () => {
    //console.log("dfadgdefgerggrgrw");
    const msg = player.name + ': '+$('.gameBoard > .chatInput').val();
    //$('#lobby > .messages').append($('<li>').text(msg));
    console.log("message: " + msg + " will be sent into room: " + game.roomId)
    socket.emit('room chat message', {message:msg, room: game.roomId });
  });
  // catch global chat message
  socket.on('global chat message', function(msg){
    $('#lobby > .messages').append($('<li>').text(msg));
  });
  // catch global chat message
  socket.on('room chat message', function(msg){
    console.log('client recived message')
    $('.gameBoard > .messages').append($('<li>').text(msg));
  });
  // Create a new game. Emit newGame event.
  $('#lobby .createRoom').on('click', () => {
    console.log("game created by: "+ player.name )
    socket.emit('createGame',  player );
    //player = new Player(name, P1);
  });

  // Join an existing game on the entered roomId. Emit the joinGame event.
  function joinRoom() {
    const roomId = this.id.substr(5, this.id.length-5)
    player.updatePlayer1(false);
    //player.setPlayerType(false);
    socket.emit('joinGame', { name: player.name, room: this.id });

    //player = new Player(player.name, P2);
  };

  socket.on('updateRooms', (data) => {
    const rooms = $('#lobby .rooms');
    for(room of data.rooms) {
      element = `<div class="room" id="${room}">${room}<button class="joinRoom">Join Game</button></div>`;
      rooms.append(element)
      $("#" + room).on('click', joinRoom)
    }
  });




  /** 
   *  Join an existing game on the entered roomId. Emit the joinGame event.
   */ 
  $('#join').on('click', function(){
    var name = $('#nameJoin').val();
    var roomID = $('#room').val();
    if(!name || !roomID){
      alert('Please enter your name and game ID.');
      return;
    }
    socket.emit('joinGame', {name: name, room: roomID});
    //player = new Player(name, true);
  });
})();




















/*
(function init() {
  const P1 = 'X';
  const P2 = 'O';
  let player;
  let game;

  // const socket = io.connect('http://tic-tac-toe-realtime.herokuapp.com'),
  const socket = io.connect('http://localhost:5000');

  class Player {
    constructor(name, type) {
      this.name = name;
      this.type = type;
      this.currentTurn = true;
      this.playsArr = 0;
    }

    static get wins() {
      return [7, 56, 448, 73, 146, 292, 273, 84];
    }

    // Set the bit of the move played by the player
    // tileValue - Bitmask used to set the recently played move.
    updatePlaysArr(tileValue) {
      this.playsArr += tileValue;
    }

    getPlaysArr() {
      return this.playsArr;
    }

    setPlayerType(type) {
      this.type = type;
    }
    // Set the currentTurn for player to turn and update UI to reflect the same.
    setCurrentTurn(turn) {
      this.currentTurn = turn;
      const message = turn ? 'Your turn' : 'Waiting for Opponent';
      $('#turn').text(message);
    }

    getPlayerName() {
      return this.name;
    }

    getPlayerType() {
      return this.type;
    }

    getCurrentTurn() {
      return this.currentTurn;
    }
  }

  // roomId Id of the room in which the game is running on the server.
  class Game {
    constructor(roomId) {
      this.roomId = roomId;
      this.board = [];
      this.moves = 0;
    }

    // Create the Game board by attaching event listeners to the buttons.
    createGameBoard() {
      function tileClickHandler() {
        const row = parseInt(this.id.split('_')[1][0], 10);
        const col = parseInt(this.id.split('_')[1][1], 10);
        console.log("we are updating on: " + row + "|"+ col)
        if (!player.getCurrentTurn() || !game) {
          alert('Its not your turn!');
          return;
        }

        if ($(this).prop('disabled')) {
          alert('This tile has already been played on!');
          return;
        }

        // Update board after your turn.
        game.playTurn(this);
        game.updateBoard(player.getPlayerType(), row, col, this.id);

        player.setCurrentTurn(false);
        console.log("current player name and type: " + player.name + " " + player.type)
        console.log("current player game array: "+ player.getPlaysArr())
        //titleValue = 1 << ((row * 3) + col);
        player.updatePlaysArr(1 << ((row * 3) + col));

        game.checkWinner();
      }

      for (let i = 0; i < 3; i++) {
        this.board.push(['', '', '']);
        for (let j = 0; j < 3; j++) {
          $(`#button_${i}${j}`).on('click', tileClickHandler);
        }
      }
    }
    // Remove the menu from DOM, display the gameboard and greet the player.
    displayBoard(message) {
      $('#lobby').css('display', 'none');
      $('.gameBoard').css('display', 'block');
      $('#userHello').html(message);
      this.createGameBoard();
    }

    displayMenu(message) {
      $('.menu').css('display', 'block')
    }
    
    updateBoard(type, row, col, tile) {
      $(`#${tile}`).text(type).prop('disabled', true);
      this.board[row][col] = type;
      this.moves++;
    }

    getRoomId() {
      return this.roomId;
    }

    // Send an update to the opponent to update their UI's tile
    playTurn(tile) {
      const clickedTile = $(tile).attr('id');

      // Emit an event to update other player that you've played your turn.
      socket.emit('playTurn', {
        tile: clickedTile,
        room: this.getRoomId(),
      });
    }
    checkWinner() {
      const currentPlayerPositions = player.getPlaysArr();

      Player.wins.forEach((winningPosition) => {
        if ((winningPosition & currentPlayerPositions) === winningPosition) {
          game.announceWinner();
        }
      });

      const tieMessage = 'Game Tied :(';
      if (this.checkTie()) {
        socket.emit('gameEnded', {
          room: this.getRoomId(),
          message: tieMessage,
        });
        alert(tieMessage);
        location.reload();
      }
    }

    checkTie() {
      return this.moves >= 9;
    }

    announceWinner() {
      const message = `${player.getPlayerName()} wins!`;
      socket.emit('gameEnded', {
        room: this.getRoomId(),
        message,
      });
      alert(message);
      location.reload();
    }

    // End the game if the other player won.
    endGame(message) {
      alert(message);
      location.reload();
    }
  }

  // submit nick and enter into server
  $('#home > .enter').on('click', () => {
    const name = $('#home > .nameNew').val();
    if (!name) {
      alert('Please enter your name.');
      return;
    }
    socket.emit('joinLobby');
    $('#lobby').css('display', 'block');
    $('#home').css('display', 'none');
    player = new Player(name, P1);
  });

  $('#lobby > .sendGlobalMessage').on('click', () => {
    const msg = player.name + ': '+ $('#lobby > .chatInput').val();
    console.log("message: "+ msg + " was sent")
    socket.emit('global chat message', msg);
  });
  
  $('.gameBoard > .sendRoomMessage').on('click', () => {
    //console.log("dfadgdefgerggrgrw");
    const msg = player.name + ': '+$('.gameBoard > .chatInput').val();
    //$('#lobby > .messages').append($('<li>').text(msg));
    console.log("message: " + msg + " will be sent into room: " + game.roomId)
    socket.emit('room chat message', {message:msg, room: game.roomId });
  });
  // catch global chat message
  socket.on('global chat message', function(msg){
    $('#lobby > .messages').append($('<li>').text(msg));
  });
  // catch global chat message
  socket.on('room chat message', function(msg){
    console.log('client recived message')
    $('.gameBoard > .messages').append($('<li>').text(msg));
  });
  // Create a new game. Emit newGame event.
  $('#lobby .createRoom').on('click', () => {
    console.log("game created by: "+ player.name )
    socket.emit('createGame',  player );
    //player = new Player(name, P1);
  });

  // Join an existing game on the entered roomId. Emit the joinGame event.
  function joinRoom() {
    const roomId = this.id.substr(5, this.id.length-5)
    player.setPlayerType(P2);
    socket.emit('joinGame', { name: player.name, room: this.id });

    //player = new Player(player.name, P2);
  };

  socket.on('updateRooms', (data) => {
    const rooms = $('#lobby .rooms');
    for(room of data.rooms) {
      element = `<div class="room" id="${room}">${room}<button class="joinRoom">Join Game</button></div>`;
      rooms.append(element)
      $("#" + room).on('click', joinRoom)
    }
  });

  // New Game created by current client. Update the UI and create new Game var.
  socket.on('newGame', (data) => {
    console.log("game created " + data.name);
    const message =
      `Hello, ${data.name}<br/>
      ${data.room}.<br />
      Waiting for player 2...`;

    // Create game for player 1
    game = new Game(data.room);
    game.displayBoard(message);
  });

  socket.on('player1', (data) => {
    console.log("opponent connected the room");
    const message = `Hello, ${player.getPlayerName()}`;
    $('#userHello').html(message);
    player.setCurrentTurn(true);
  });

  socket.on('player2', (data) => {
    console.log("you have connected the room");
    const message = `Hello, ${data.name}`;

    // Create game for player 2
    game = new Game(data.room);
    game.displayBoard(message);
    player.setCurrentTurn(false);
  });

  socket.on('turnPlayed', (data) => {
    const row = data.tile.split('_')[1][0];
    const col = data.tile.split('_')[1][1];
    const opponentType = player.getPlayerType() === P1 ? P2 : P1;

    game.updateBoard(opponentType, row, col, data.tile);
    player.setCurrentTurn(true);
  });

  // If the other player wins, this event is received. Notify user game has ended.
  socket.on('gameEnd', (data) => {
    game.endGame(data.message);
    socket.leave(data.room);
  });

  socket.on('err', (data) => {
    game.endGame(data.message);
  });
}());*/
