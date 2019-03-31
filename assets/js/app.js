$(document).ready(function () {
  //
  //
  //
  //Global Variables, then Objects, then Function Calls, yo.
  $('#chat-inputs').hide();
  //GLOBALS
  // reference the database
  var database = firebase.database();
  var players = database.ref('players');
  var playerOne = database.ref('players/playerOne');
  var playerOnePick = database.ref('players/playerOne/pick');
  var playerTwo = database.ref('players/playerTwo');
  var playerTwoPick = database.ref('players/playerTwo/pick');

  var playerTurn = database.ref('turn');

  var player = { id: '', name: '' };

  var numberOfPlayers = 0;
  var turn = 1;
  var player1pick = ''; 
  var player2pick = '';
  

  var rockSVG = 'assets/images/rock.svg';
  var paperSVG = 'assets/images/paper-bl.svg';
  var scissorsSVG = 'assets/images/scissors.svg';

  function setupGame() {
    if (player.id === 'playerOne') {
      let div = makeImageDivs();
      $('#player-left-div').html(div);
    }
    else {
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
    //TODO come back to fix
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
      // setupGame();
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
      // setupGame();
    }
    else if (numberOfPlayers >= 2) {
      console.log('No more than two players at a time.');
    }
  }

  players.on("value", function (snapshot) {
    //find the number of connections
    //TODO play more than one game at a time
    numberOfPlayers = snapshot.numChildren();
    $('#connections').text(numberOfPlayers);
    if (numberOfPlayers === 2) {
      playerTurn.set(turn);
    }
    // set the current player id from firebase*/
    currentPlayer = snapshot.val();
    // console.log(currentPlayer);
  });

  // remove player when disconnected
  players.on('child_removed', function (snapshot) {
    // reset the turn upon a leaving player
    turn = 1;
    playerTurn.set(turn);
    //TODO clear divs
    $('#notification').html('');
    newThrow();
  
  });


  playerTurn.on('value', function (snapshot) {
    var gameTurn = snapshot.val();

    //TODO add a game flag and change options
    if (gameTurn === 1) {
      console.log(gameTurn);


      if (player.id === 'playerOne') {
        $('#notification').html('It\'s your turn!');
      }
      else {
        $('#notification').html('Waiting for player 1...');
      }
    }

    if (gameTurn === 2) {
      console.log(gameTurn);

      if (player.id === 'playerTwo') {
        $('#notification').html('It\'s your turn!');
      }
      else {
        $('#notification').html('Waiting for player 2...');
      }
    }

    if (gameTurn === 3) {
      console.log(gameTurn);
      $('#notification').html('Waiting for game logic to work.'); 
      console.log(player1pick);
      console.log(player2pick);
      
      //TODO add the game logic
     

    }
  });

  function toggleImg(i, data) {
    if (i === 1) {
      let img = $('<img width="200" height="200">');
      let imgSrc;
      if (data === 'rock'){
        imgSrc = rockSVG;
      }
      else if (data === 'paper'){
        imgSrc = paperSVG;
      }
      else if (data === 'scissors'){
        imgSrc = scissorsSVG;
      }
      img.attr('src', imgSrc);
      $('#player-left-div').html(img);
    }
    else {
      let img = $('<img width="200" height="200">');
      let imgSrc;
      if (data === 'rock'){
        imgSrc = rockSVG;
      }
      else if (data === 'paper'){
        imgSrc = paperSVG;
      }
      else if (data === 'scissors'){
        imgSrc = scissorsSVG;
      }
      img.attr('src', imgSrc);
      $('#player-right-div').html(img);
    }
  }
  //Get the pick from DB for player one
  playerOnePick.on('value', function(snapshot) {
    player1pick = snapshot.val();
    // console.log(player1pick);
    if (player1pick) {
      turn++;
    }    
  });
  
  //Get the pick from DB for player two
  playerTwoPick.on('value', function(snapshot) {
    player2pick = snapshot.val();
    // console.log(player2pick);
    
    if (player2pick) {
      turn++;
    }    
  });

  function makeSelection() {
    // console.log($(this).attr('data-name'));
    let currentPick = $(this).attr('data-name');
    if (numberOfPlayers === 2) {
      if ((player.id === 'playerOne') && (turn === 1)) {
        playerOnePick.set(currentPick);
        toggleImg(1, currentPick);
      }
      else if ((player.id === 'playerTwo') && (turn === 2)) {
        playerTwoPick.set(currentPick);
        toggleImg(2, currentPick);
      }
    }    
  }

  function newThrow() {
    //remove data on firsebase
    playerOnePick.remove();
    playerTwoPick.remove();
  
    //clear player picks
    player1pick = '';
    player2pick = '';
        
    //reset turn and push to change firebase
    turn = 1;
    playerTurn.set(turn);

    //reset the imageDivs
    setupGame();
  }

  function sendChat(){
    console.log('Send Chat');
    
  }

  $(document).on('click', '#start-btn', initialSetup);
  $(document).on('click', '#chat-btn', sendChat);
  $(document).on('click', '.selection', makeSelection);

});//document ready