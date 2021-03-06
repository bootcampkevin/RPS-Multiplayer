$(document).ready(function () {
  //
  //This HW was rough. Way too much time getting a working game. Need to move onto Project 1. 
  //
  //
  //Global Variables, then Objects, then Function Calls, yo.
  $('#chat-inputs').hide();
  //GLOBALS
  // references to the database
  var database = firebase.database();
  var players = database.ref('players');
  var playerOne = database.ref('players/playerOne');
  var playerOnePick = database.ref('players/playerOne/pick');
  var playerTwo = database.ref('players/playerTwo');
  var playerTwoPick = database.ref('players/playerTwo/pick');
  var playerTurn = database.ref('turn');
  var chatArea = database.ref('chat');

  var player = { id: '', name: '' };
  var numberOfPlayers = 0;
  var currentPlayer;
  var turn = 1;
  var player1pick = '';
  var player2pick = '';
  var player1score = 0;
  var player2score = 0;
  var delay = 4;

  var rockSVG = 'assets/images/rock.svg';
  var paperSVG = 'assets/images/paper-bl.svg';
  var scissorsSVG = 'assets/images/scissors.svg';

  function setupGame() {
    // turn = 1;
    // playerTurn.set(turn);    
    if (player.id === 'playerOne') {
      let div = makeImageDivs();
      $('#player-left-div').html(div);
    }
    else if (player.id === 'playerTwo') {
      let div = makeImageDivs();
      $('#player-right-div').html(div);
    }    
  }

  function makeImageDivs() {
    let div = $('<div>');
    let img = $('<img width="100" height="100">');
    img.attr('src', rockSVG);
    img.attr('data-name', 'rock');
    img.addClass('selection m-1');
    div.html(img);
    img = $('<img width="100" height="100">');
    img.attr('src', paperSVG);
    img.attr('data-name', 'paper');
    img.addClass('selection m-1');
    div.append(img);
    img = $('<img width="100" height="100">');
    img.attr('src', scissorsSVG);
    img.attr('data-name', 'scissors');
    img.addClass('selection m-1');
    div.append(img);

    return div;    
  }

  function initialSetup() {

    let name = $('#user-input').val().trim();
    $('#user-input').val('');
    if (name.length === 0) {
      $('#welcome').text('Pretty please sign in...')
    }
    else {
      $('#sign-in').remove();
      $('#chat-inputs').show();

      createNewPlayer(name);
      setupGame();
    }
  }

  function createNewPlayer(name) {

    if ((numberOfPlayers === 0) || ((numberOfPlayers === 1) && (currentPlayer.hasOwnProperty('playerTwo')))) {
      playerOne.set({
        name: name,
        win: 0,
        loss: 0
      });
      $('#welcome').text(`Welcome, ${name}.`);
      player.id = 'playerOne';
      player.name = name;
      playerOne.onDisconnect().remove();
      
    }
    else if ((numberOfPlayers === 1) && (currentPlayer.hasOwnProperty('playerOne'))) {
      playerTwo.set({
        name: name,
        win: 0,
        loss: 0
      });
      $('#welcome').text(`Welcome, ${name}.`);
      player.id = 'playerTwo';
      player.name = name;
      playerTwo.onDisconnect().remove();
      
    }
    else if (numberOfPlayers >= 2) {
      console.log('No more than two players at a time.');
    }
  }

  players.on("value", function (snapshot) {
    //TODO play more than one game at a time
    numberOfPlayers = snapshot.numChildren();
    $('#connections').text(numberOfPlayers);
    if (numberOfPlayers === 2) {
      playerTurn.set(turn);
    }
    // set the current player id from firebase
    currentPlayer = snapshot.val();
    // console.log(currentPlayer);
  });

  players.on('child_added', function (snapshot) {
    //reset the player's scores when a player joins
    if (numberOfPlayers >= 1) {
      player1score = 0;
      player2score = 0;

      playerOne.update({ win: 0, loss: 0 });
      playerTwo.update({ win: 0, loss: 0 });
    }
  });

  // upon a player when disconnected, reset
  players.on('child_removed', function (snapshot) {
    // reset the turn if a player leaves the game
    // turn = 1;
    // playerTurn.set(turn);
    playerTurn.remove();
    chatArea.remove();
    //TODO double check on clear all the divs
    player1score = 0;
    player2score = 0;
    $('#player-left-div').empty();
    $('#player-middle-div').html('');
    $('#player-right-div').empty();
    $('#notification').html('');    
    $('#result').html('');
    newThrow();

  });

  playerOne.on('value', function(snapshot) {
    let name = snapshot.child('name').val();   
    let win = snapshot.child('win').val();
    let loss = snapshot.child('loss').val();
  
    if (name !== null) {     
      $('#left-score').html('Wins: ' + win + ' Losses: ' + loss);
    }
  });

  playerTwo.on('value', function(snapshot) { 
    let name = snapshot.child('name').val();    
    let win = snapshot.child('win').val();
    let loss = snapshot.child('loss').val();
  
    if (name !== null) {     
      $('#right-score').html('Wins: ' + win + ' Losses: ' + loss);
    }
  });

  playerTurn.on('value', function (snapshot) {
    var gameTurn = snapshot.val();

    //TODO fix game flag and change options
    if (gameTurn === 1) {
      // console.log('GT: ' + gameTurn);
      // $("#player-middle-div").addClass("mid");
      $("#player-left-div").removeClass("stop");
      $("#player-left-div").addClass("go");
      $("#player-right-div").removeClass("go");
      $("#player-right-div").addClass("stop");

      if (player.id === "playerOne") {
        $("#notification").html('<span class="text-success">It\'s your turn!</span>');
      } else {
        $("#notification").html(
          '<span class="text-warning">Waiting for Player 1...</span>'
        );
      }
    }

    if (gameTurn === 2) {
      // console.log('GT: ' + gameTurn);
      $('#player-left-div').removeClass('go');
      $('#player-left-div').addClass('stop');
      $('#player-right-div').removeClass('stop');
      $('#player-right-div').addClass('go');

      if (player.id === 'playerTwo') {
        $('#notification').html('<span class="text-success">It\'s your turn!</span>');
      }
      else {
        $('#notification').html('<span class="text-warning">Waiting for Player 2...</span>');
      }
    }

    if (gameTurn === 3) {
      // console.log('GT: ' + gameTurn);
      $('#player-left-div').removeClass('stop');
      $('#player-right-div').removeClass('go');
      // $('#player-middle-div').addClass('mid');
      // $('#player-middle-div').html('<div class="card w-100 h-100 p-2">Player1 picked: ' + player1pick.toUpperCase() + ' & Player2 picked: ' + player2pick.toUpperCase() + ' </div>');
      $('#left-choice').html('<div class="card bg-light w-100 h-100 p-2"><div class="card-header">Player1 picked:</div><div class="card-body"><p class="card-text">' + player1pick.toUpperCase() + '</p</div></div>');
      $('#right-choice').html('<div class="card bg-light w-100 h-100 p-2"><div class="card-header">Player2 picked:</div><div class="card-body"><p class="card-text">' + player2pick.toUpperCase() + '</p></div></div>');
           
      //TODO hitting twice so score goes up 2 per win/loss
      //can hack the scores by dividing by 2 to mask the issue. 
      // tried moving it in the on pick selection, same issue        
      // checkForWin();
    }
  });

  function checkForWin() {
    
    if ((player1pick !== null) && (player2pick !== null)) {

      if (player1pick === player2pick) {
        $('#result').html('<span class="">It\'s a Tie!</span>');
        // console.log('turn:' + turn);
        turn = 3;
        // playerTurn.set(turn);
        setTimeout(newThrow, 1000 * delay);

      }
      else if (((player1pick === 'rock') && (player2pick === 'scissors')) || ((player1pick === 'paper') && (player2pick === 'rock')) || ((player1pick === 'scissors') && (player2pick === 'paper'))) {

        $('#result').html('<span class="">Player 1 Wins!</span>');

        player1score++;

        playerOne.update({ win: player1score });
        playerTwo.update({ loss: player1score });

        turn = 3;
        // playerTurn.set(turn);
        setTimeout(newThrow, 1000 * delay);


      }
      else if (((player2pick === 'rock') && (player1pick === 'scissors')) || ((player2pick === 'paper') && (player1pick === 'rock')) || ((player2pick === 'scissors') && (player1pick === 'paper'))) {

        $('#result').html('<span class="">Player 2 Wins!</span>');

        player2score++;

        playerTwo.update({ win: player2score });
        playerOne.update({ loss: player2score });

        turn = 3;
        // playerTurn.set(turn);
        setTimeout(newThrow, 1000 * delay);

      }
      else {
        // console.log('broken logic');
      }
    }


  }

  function toggleImg(i, data) {
    if (i === 1) {
      let img = $('<img width="200" height="200">');
      let imgSrc;
      if (data === 'rock') {
        imgSrc = rockSVG;
      }
      else if (data === 'paper') {
        imgSrc = paperSVG;
      }
      else if (data === 'scissors') {
        imgSrc = scissorsSVG;
      }
      img.attr('src', imgSrc);
      $('#player-left-div').html(img);
    }
    else {
      let img = $('<img width="200" height="200">');
      let imgSrc;
      if (data === 'rock') {
        imgSrc = rockSVG;
      }
      else if (data === 'paper') {
        imgSrc = paperSVG;
      }
      else if (data === 'scissors') {
        imgSrc = scissorsSVG;
      }
      img.attr('src', imgSrc);
      $('#player-right-div').html(img);
    }
  }

  function updateTurn() {
    turn++;
    //playerTurn.set(turn);
  }

  //Get the pick from DB for player one
  playerOnePick.on('value', function (snapshot) {
    player1pick = snapshot.val();
    // console.log('p1picksnapshot: ' + player1pick);
    //lag seems to be an issue with pick too quickly on firebase.
    //pick doesn't change if player picks the same choice as last choice.
    //remove() pick from firebase to fix issue. 
    if (player1pick) {
      updateTurn();
    }
    checkForWin();
  });

  //Get the pick from DB for player two
  playerTwoPick.on('value', function (snapshot) {
    player2pick = snapshot.val();
    // console.log('p2picksnapshot: ' + player2pick);
    if (player2pick) {
      updateTurn();
    }
    checkForWin();
  });

  function makeSelection() {
    // console.log($(this).attr('data-name'));
    // console.log('player id: '+ player.id);
    // console.log('turn: '+ turn);

    let currentPick = $(this).attr('data-name');
    if (numberOfPlayers === 2) {
      if ((player.id === 'playerOne') && (turn === 1)) {

        toggleImg(1, currentPick);
        playerOnePick.set(currentPick);
      }
      else if ((player.id === 'playerTwo') && (turn === 2)) {
        toggleImg(2, currentPick);
        playerTwoPick.set(currentPick);
      }
      else {
        // console.log('broken selection');
      }
    }
  }

  function newThrow() {
    //remove the picks on firebase to solve issue or not being able to select the same choice twice.
    playerOnePick.remove();
    playerTwoPick.remove();

    //clear out the player picks
    player1pick = '';
    player2pick = '';
    
    turn = 1;
    playerTurn.set(turn);
    
    // $('#left-choice').html('');
    // $('#right-choice').html('');
    //reset the imageDivs via setup
    setupGame();
  }

  function sendChat() {
    // console.log('Send Chat');
    let text = $('#chat-input').val().trim();
    $('#chat-input').val('');
    if (text.length > 0) {
      let chat = `${player.name}: ${text}`;
      if (player.id === 'playerOne') {
        chatArea.push('<span class="text-info">' + chat + '</span>');
      }
      if (player.id === 'playerTwo') {
        chatArea.push('<span class="text-warning">' + chat + '</span>');
      }
      // chatArea.push(chat);
    }
  }

  chatArea.on('child_added', function (snapshot) {
    var chatMsg = snapshot.val();
    $('#chat-area').prepend('<p>' + chatMsg + '</p>');
  });

  /*clear chat on firebase if disconnected*/
  chatArea.on('child_removed', function () {
    $('#chat-area').text('');
  });

  $(document).on('click', '#start-btn', initialSetup);
  $(document).on('click', '#chat-btn', sendChat);
  $(document).on('click', '.selection', makeSelection);

});//document ready