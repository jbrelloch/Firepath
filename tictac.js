
var turn = false;
var playerMarker = "     ";
var opponentMarker = "     ";
var moveCount = 0;

var myDataRef = new Firebase('https://tic-test-fb.firebaseIO.com/');
var gameRef;
var playerRef;
var nameList = [];

function getCookie(c_name)
{
     var c_value = document.cookie;
     var c_start = c_value.indexOf(" " + c_name + "=");
     if (c_start == -1)
     {
          c_start = c_value.indexOf(c_name + "=");
     }
     if (c_start == -1)
     {
          c_value = null;
     }
     else
     {
          c_start = c_value.indexOf("=", c_start) + 1;
          var c_end = c_value.indexOf(";", c_start);
          if (c_end == -1)
          {
               c_end = c_value.length;
          }
          c_value = unescape(c_value.substring(c_start,c_end));
     }
     return c_value;
}

window.onload = function()
{
     //collect current names
     myDataRef.child("Players").on("child_added", function(childSnapshot, prevChildName){
          nameList.push(childSnapshot.child("Name").val());

//alert(nameList[0]);
     });

     var nameCookie = getCookie("ticTacName");
     var refCookie = getCookie("ticTacRef");

     //check if player already created name
     if ((nameCookie != null) && (refCookie != null))
     {
          playerName = nameCookie;
//alert("playerName = "+nameCookie);
          chatEnabled = true;
          playerRef = myDataRef.child('Players').child(refCookie);
//alert("playerRef = "+refCookie);

//alert("getting ready to match");
          startMatchmaking();
     }
};

function contains(a, obj) {
    var i = a.length;
    while (i--) {
       if (a[i] == obj) {
           return true;
       }
    }
    return false;
}

function player_select(buttonPressed)
{
     var buttonRef = document.getElementsByName("sqr"+buttonPressed)[0];
     if(turn)
     {
          if(buttonRef.value == "     ")
          {
               buttonRef.value = playerMarker;
               turn = false;
               if(playerMarker == "  X  ")
               {
                    gameRef.push({'Player': '1', 'buttonNum': buttonPressed});
               }
               else
               {
                    gameRef.push({'Player': '2', 'buttonNum': buttonPressed});
               }
          }
     }
}

function createPlayer()
{
     var nameToCreate = document.getElementsByName("pname")[0].value;

     if(contains(nameList,nameToCreate))
     {
          alert('Name already in use!  Please choose another.');
          return;
     }

     playerName = nameToCreate;
     chatEnabled = true;
     playerRef = myDataRef.child('Players').push({Name:nameToCreate,Wins:0,Losses:0});
     document.cookie = "ticTacName="+nameToCreate;
     document.cookie = "ticTacRef="+playerRef.name();
     
     startMatchmaking();
}

function startMatchmaking()
{
//alert("we are matchMaking");
     document.getElementById("createPlayer").style.display = "none";
     document.getElementById("playAgain").style.display = "none";
     document.getElementById("matchMaking").style.display = "block";
//alert("0.3");
     var matchRef = myDataRef.child('Looking').push({Player:playerRef.name(),Status:'1'});
     matchRef.onDisconnect().remove();
//alert("0.6");
     var matchStr = "Matchmaking";
     document.getElementById("matchMaking").innerHTML = matchStr;
     var ticCount = 0;
//alert("1");
     //5 seconds of being available to other players
     var myDotTimer = setInterval(function()
     {    
          if(ticCount < 5)
          {
               document.getElementById("matchMaking").innerHTML = document.getElementById("matchMaking").innerHTML+".";
               ticCount = ticCount + 1;
          }
          else
          {
               document.getElementById("matchMaking").innerHTML = matchStr;
               ticCount=0;
          }
     },1000);
//alert("2");
     //5 seconds up, begin creating games
     setTimeout(function()
     {
          matchRef.child('Game').once('value', function(snapshot) 
          {
               if (snapshot.val() === null) 
               {
                    //no match has been made, begin creating
                    matchStr = "Waiting for other players";

                    //set us to not looking
                    matchRef.update({Status:'2'});

                    //first we go through existing players looking
                    var success = false;
                    //alert("MARK0");

                    myDataRef.child('Looking').once('value', function(lookSnapshot) 
                    {
                         //alert("MARK0.5");
                         var forEachTest = false;
                         /////////////////////////////////////////////
                         //
                         //  THIS IS UNNECESSARY! on("child_added") goes
                         //  through existing children!
                         //
                         /////////////////////////////////////////////
                         /*
                         forEachTest = lookSnapshot.forEach(function(childSnap)
                         {
                              //alert("MARK1");
                              if(childSnap.child("Status").val() == 1)
                              {
                                   //alert("MARK2");
                                   //player looking has been found, try to create game (concurrent safe)
                                   //first create game
                                   var gameAttemptRef = myDataRef.child('Games').push({Player1:playerRef.name(),Player2:childSnap.child('Player').val()});

                                   //alert("MARK3");

                                   //game attempt created, check to see if player is still available, grab if he is, if not fail
                                   childSnap.ref().child("Status").transaction(function(statusData) 
                                   {
                                        //alert("MARK4");
                                        if(statusData == 1)
                                        {
                                             if(!success)
                                                  gameRef = gameAttemptRef;
                                             success = true;

                                             clearInterval(myDotTimer);

                                             //game matched, enable tic-tac-toe board
                                             document.getElementById("matchMaking").style.display = "none";
                                             document.getElementById("tic").style.display = "block";

                                             //kill looker - everyone should have the game ref
                                             childSnap.update({Game:gameAttemptRef.name()});
                                             matchRef.remove();

                                             //alert("MARK5");

                                             return "2"; //status is still 1, change to 2 (lock player into game)
                                        }
                                        else
                                        {
                                             //status changed before player could be grabbed, abort and delete game attempt
                                             gameAttemptRef.remove();
                                             return;
                                        }
                                   }, function(error, committed, snapshot) 
                                   {
                                        if (error)
                                             alert('Transaction failed abnormally!');
                                   });
                              }

                              if(success)
                              {
                                   return true;//cancel further looping, game found
                              }
                         });*/

                         //if for each look failed, register listener for new players
                         if(!forEachTest)
                         {
                              myDataRef.child('Looking').on('child_added', function(childSnapshot, prevChildName) 
                              {
                                   var gameAttemptRef = myDataRef.child('Games').push({Player1:playerRef.name(),Player2:childSnapshot.child('Player').val()});

                                   //game attempt created, check to see if player is still available, grab if he is, if not fail
                                   childSnapshot.ref().child("Status").transaction(function(statusData) 
                                   {
                                        //alert("MARKA");
                                        if(statusData == 1)
                                        {
                                             if(!success)
                                                  gameRef = gameAttemptRef;
                                             success = true;

                                             clearInterval(myDotTimer);

                                             //kill looker - everyone should have the game ref
                                             childSnapshot.ref().update({Game:gameAttemptRef.name()});
                                             matchRef.remove();
                                             myDataRef.child('Looking').off();

                                             //alert("MARKB");
                                             startGameWithDelay();

//alert("returned!");

                                             return "2"; //status is still 1, change to 2 (lock player into game)
                                        }
                                        else
                                        {
                                             //status changed before player could be grabbed, abort and delete game attempt
                                             gameAttemptRef.remove();
                                             return;
                                        }
                                   }, function(error, committed, snapshot) 
                                   {
                                        if (error)
                                             alert('Transaction failed abnormally!');
                                   });
                              });
                         }
                    });
               } 
               else 
               {
                    //match has been made, go to game, delete looker
                    clearInterval(myDotTimer);
                    //alert("pre marker1");
                    //alert("marker1 = "+snapshot.val());

                    gameRef = myDataRef.child("Games").child(snapshot.val());

                    //alert("marker1");

                    //kill looker - everyone should have the game ref
                    matchRef.remove();

                    document.getElementById("matchMaking").style.display = "none";
                    document.getElementById("tic").style.display = "block";

                    startGame();
               } 
          });
     },5000);
//alert("3");
}
     
function startGameWithDelay()
{
     var matchStr = "Setting Up Game";
     document.getElementById("matchMaking").innerHTML = matchStr;
     var ticCount = 0;

     var myDotTimer = setInterval(function()
     {    
          if(ticCount < 5)
          {
               document.getElementById("matchMaking").innerHTML = document.getElementById("matchMaking").innerHTML+".";
               ticCount = ticCount + 1;
          }
          else
          {
               document.getElementById("matchMaking").innerHTML = matchStr;
               ticCount=0;
          }
     },1000);

     setTimeout(function()
     {
          clearInterval(myDotTimer);

          //game matched, enable tic-tac-toe board
          document.getElementById("matchMaking").style.display = "none";
          document.getElementById("tic").style.display = "block";

          startGame();
     },5000);
}

function startGame()
{
     //figure out whos turn it is, player one starts
     gameRef.once('value', function(snapshot) 
     {
//alert("1")
          //if our turn, enable buttons
          if(playerRef.name() == snapshot.child("Player1").val())
          {
//alert("1a");
               turn = true;
               playerMarker = "  X  ";//X's start
               opponentMarker = "  O  ";

               var oRef = new Firebase('https://tic-test-fb.firebaseIO.com/Players/'+snapshot.child("Player2").val());
               oRef.once('value', function(osnapshot) {
                    opponentName = osnapshot.child("Name").val();

                    //setup game label
                    document.getElementById("versus").innerHTML = playerName + " vs " + opponentName + " : your turn";
               });
          }
          else
          {
//alert("1b");
               playerMarker = "  O  ";
               opponentMarker = "  X  ";//X's start

               var oRef = new Firebase('https://tic-test-fb.firebaseIO.com/Players/'+snapshot.child("Player1").val());
               oRef.once('value', function(osnapshot) {
                    opponentName = osnapshot.child("Name").val();

                    //setup game label
                    document.getElementById("versus").innerHTML = playerName + " vs " + opponentName + " : " + opponentName + "'s turn";
               });
          }

          //regardless setup listener for other players move
          moveCount = 0;
//alert("2");
          gameRef.on('child_added', function(childSnapshot, prevChildName) 
          {
               if(childSnapshot.hasChild("Player"))
               {
                    //check win logic
                    if((childSnapshot.child("Player").val() == '1' && playerMarker == "  O  ") 
                         || (childSnapshot.child("Player").val() == '2' && playerMarker == "  X  "))
                    {
//alert('mark2');
                         //update game board
                         var buttonRef = document.getElementsByName("sqr"+childSnapshot.child('buttonNum').val())[0];
                         buttonRef.value = opponentMarker;

                         //our turn, opponent just made a move
                         document.getElementById("versus").innerHTML = playerName + " vs " + opponentName + " : your turn";
                         turn = true;
                         moveCount++;
                    }
                    else
                    {
                         //just read our own move
                         var buttonRef = document.getElementsByName("sqr"+childSnapshot.child('buttonNum').val())[0];
                         buttonRef.value = playerMarker;
                         document.getElementById("versus").innerHTML = playerName + " vs " + opponentName + " : " + opponentName + "'s turn";
                         turn = false;
                         moveCount++;    
                    }

                    //check for wins
                    checkWin(opponentMarker);
                    checkWin(playerMarker);
               }
          });
     });
}

function updateAndRestartGame(marker)
{
     //first update players score
     if(marker != "")
     {
          if(marker == playerMarker)
          {
               var winRef = playerRef.child('Wins');
               winRef.once('value', function(snapshot) {
                    winRef.set(snapshot.val() + 1);
               });
          }
          else
          {
               var lossRef = playerRef.child('Losses');
               lossRef.once('value', function(snapshot) {
                    lossRef.set(snapshot.val() + 1);
               });
          }
     }

     //clean up gamespace
     gameRef.off();
     gameRef.remove();
     gameRef = null;
     document.getElementsByName("sqr1")[0].value = "     ";
     document.getElementsByName("sqr2")[0].value = "     ";
     document.getElementsByName("sqr3")[0].value = "     ";
     document.getElementsByName("sqr4")[0].value = "     ";
     document.getElementsByName("sqr5")[0].value = "     ";
     document.getElementsByName("sqr6")[0].value = "     ";
     document.getElementsByName("sqr7")[0].value = "     ";
     document.getElementsByName("sqr8")[0].value = "     ";
     document.getElementsByName("sqr9")[0].value = "     ";
     turn = false;
     document.getElementById("versus").innerHTML = "";

     //display play again option
     document.getElementById("tic").style.display = "none";
     document.getElementById("playAgain").style.display = "block";
}

function checkWin(marker) 
{
     if (document.getElementsByName('sqr7')[0].value == marker) 
     {
          var adjArray = ['sqr8', 'sqr5', 'sqr4'];
          for (var i = 0; i < adjArray.length; i++) 
          {
               adjacentMarked = checkAdjacent(marker, 'sqr7', adjArray[i]);
               if (adjacentMarked.bool == true) 
               {
                    var win = check7Win(marker, adjacentMarked.adjacentBox);
                    if (win == true) 
                    {
                         alert("Player: " + marker + " wins!");
                         updateAndRestartGame(marker);
                         return;
                    }
               }
          }
     }

     if (document.getElementsByName('sqr4')[0].value == marker)
     {
          var adjArray = ['sqr5'];
          for (var i = 0; i < adjArray.length; i++) {
               adjacentMarked = checkAdjacent(marker, 'sqr4', adjArray[i]);
               if (adjacentMarked.bool == true)
               {
                    var win = check4Win(marker, adjacentMarked.adjacentBox);
                    if (win == true)
                    {
                         alert("Player: " + marker + " wins!");
                         updateAndRestartGame(marker);
                         return;
                    }
               }
          }
     }
        
     if (document.getElementsByName('sqr1')[0].value == marker)
     {
          var adjArray = ['sqr5', 'sqr2'];
          for (var i = 0; i < adjArray.length; i++) 
          {
               adjacentMarked = checkAdjacent(marker, 'sqr1', adjArray[i]);
               if (adjacentMarked.bool == true)
               {
                    var win = check1Win(marker, adjacentMarked.adjacentBox);
                    if (win == true)
                    {
                         alert("Player: " + marker + " wins!");
                         updateAndRestartGame(marker);
                         return;
                    }
               }
          }
     }

     if (document.getElementsByName('sqr2')[0].value == marker)
     {
          var adjArray = ['sqr5'];
          for (var i = 0; i < adjArray.length; i++)
          {
               adjacentMarked = checkAdjacent(marker, 'sqr2', adjArray[i]);
               if (adjacentMarked.bool == true)
               {
                    var win = check2Win(marker, adjacentMarked.adjacentBox);
                    if (win == true)
                    {
                         alert("Player: " + marker + " wins!");
                         updateAndRestartGame(marker);
                         return;
                    }
               }
          }
     }

     if (document.getElementsByName('sqr3')[0].value == marker)
     {
          var adjArray = ['sqr6'];
          for (var i = 0; i < adjArray.length; i++) 
          {
               adjacentMarked = checkAdjacent(marker, 'sqr3', adjArray[i]);
               if (adjacentMarked.bool == true)
               {
                    var win = check3Win(marker, adjacentMarked.adjacentBox);
                    if (win == true)
                    {
                         alert("Player: " + marker + " wins!");
                         updateAndRestartGame(marker);
                         return;
                    }
               }
          }
     }

     if(moveCount == 9)
     {
          alert("Draw!");
          updateAndRestartGame("");
          moveCount++;
          return;
     }
     return;
}

function checkAdjacent(marker, box, adjacent)
{
     switch (box) 
     {
          case 'sqr7':
               switch (adjacent)
               {
                    case 'sqr8':
                         if (document.getElementsByName('sqr8')[0].value == marker)
                         {
                              return { bool: true, adjacentBox: 'sqr8' };
                         }
                         else 
                         {
                              return { bool: false, adjacentBox: null };
                         }
                    case 'sqr5':
                         if (document.getElementsByName('sqr5')[0].value == marker)
                         {
                              return { bool: true, adjacentBox: 'sqr5' };
                         }
                         else 
                         {
                              return { bool: false, adjacentBox: null };
                         }
                    case 'sqr4':
                         if (document.getElementsByName('sqr4')[0].value == marker)
                         {
                              return { bool: true, adjacentBox: 'sqr4' };
                         }
                         else 
                         {
                              return { bool: true, adjacentBox: null };
                         }
                    default:
                         //alert("input error");
                         return { bool: false, adjacentBox: null };
               }
          case 'sqr4':
               switch (adjacent)
               {
                    case 'sqr5':
                         if (document.getElementsByName('sqr5')[0].value == marker)
                         {
                              return { bool: true, adjacentBox: 'sqr5' };
                         }
                         else 
                         {
                              return { bool: true, adjacentBox: null };
                         }
                         //alert("input error");
                         return { bool: false, adjacentBox: null };
               }
          case 'sqr1':
               switch (adjacent)
               {
                    case 'sqr5':
                         if (document.getElementsByName('sqr5')[0].value == marker)
                         {
                              return { bool: true, adjacentBox: 'sqr5' };
                         }
                         else 
                         {
                              return { bool: false, adjacentBox: null };
                         }
                    case 'sqr2':
                         if (document.getElementsByName('sqr2')[0].value == marker)
                         {
                              return { bool: true, adjacentBox: 'sqr2' };
                         }
                         else 
                         {
                              return { bool: false, adjacentBox: null };
                         }
                    default:
                         //alert("input error");
                         return { bool: false, adjacentBox: null };
               }
          case 'sqr2':
               switch (adjacent)
               {
                    case 'sqr5':
                         if (document.getElementsByName('sqr5')[0].value == marker)
                         {
                              return { bool: true, adjacentBox: 'sqr5' };
                         }
                    default:
                         //alert("input error");
                         return { bool: false, adjacentBox: null };
               }
          case 'sqr3':
               switch (adjacent)
               {
                    case 'sqr6':
                         if (document.getElementsByName('sqr6')[0].value == marker)
                         {
                              return { bool: true, adjacentBox: 'sqr6' };
                         }
                         break;
                    default: 
                         //alert("input error");
                         return { bool: false, adjacentBox: null };
               }
          default:
               //alert("Input error");
               return { bool: false, adjacentBox: null };
     }
}

function check7Win(marker, adjacent) 
{
     if (adjacent == 'sqr8')
     {
          if (document.getElementsByName('sqr9')[0].value == marker)
          {
               return true;
          }
          else 
          {
               return false;
          }
     }
     else if (adjacent == 'sqr5')
     {
          if (document.getElementsByName('sqr3')[0].value == marker)
          {
               return true;
          }
          else 
          {
               return false;
          }
     }
     else if (adjacent == 'sqr4') 
     {
          if (document.getElementsByName('sqr1')[0].value == marker) 
          {
               return true;
          }
          else 
          {
               return false;
          }
     }
     else 
     {
          //alert("Adjacent error!");
          return false;
     }
}

function check4Win(marker, adjacent) 
{
     if (adjacent == 'sqr5')
     {
          if (document.getElementsByName('sqr6')[0].value == marker)
          {
               return true;
          }
          else 
          {
               return false;
          }
     }
     else 
     {
          //alert("Adjacent error");
          return false;
     }
}

function check1Win(marker, adjacent)
{
    if (adjacent == 'sqr5')
    {
          if (document.getElementsByName('sqr9')[0].value == marker)
          {
               return true;
          }
          else 
          {
               return false;
          }

    }
    else if (adjacent == 'sqr2')
    {
          if (document.getElementsByName('sqr3')[0].value == marker)
          {
               return true;
          }
          else 
          {
               return false;
          }
    }
    else 
    {
          //alert("Adjacent error");
          return false;
    } 
}

function check2Win(marker, adjacent)
{
     if (adjacent == 'sqr5')
     {
          if (document.getElementsByName('sqr8')[0].value == marker)
          {
               return true;
          }
          else 
          {
               return false;
          }

     }
     else 
     {
          //alert("Adjacent error");
          return false;
     }
}

function check3Win(marker, adjacent)
{
     if (adjacent == 'sqr6')
     {
          if (document.getElementsByName('sqr9')[0].value == marker)
          {
               return true;
          }
          else 
          {
               return false;
          }

     }
     else 
     {
          //alert("Adjacent error");
          return false;
     }
}
