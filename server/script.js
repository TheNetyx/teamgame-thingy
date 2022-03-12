// global variables. (:
var accessibleGrids = []; // accessable grids.
var players = [];         // original positions of players
var movedPlayers = [];    // current positions of players
var selectedPlayer;       // currently selected player
const PATROLS = [
  "fox",
  "bull",
  "hound",
  "eagle"
]

// initialises the grid and stuff
function init() {
  // setting the onclick attributes for the cells
  var clickcell = document.getElementsByClassName("gridcell");
  for (var i = 0 ; i < clickcell.length ; i++) {
    clickcell[i].setAttribute("onclick", "moveTo(\"" + clickcell[i].id + "\")");
  }

  // colouring the grids
  for (var i = 1 ; i <= 13 ; i++) {
    for (var j = 1 ; j <= 13 ; j++) {
      var grid = document.getElementById(convertNumCordsToStr({x: j, y: i}));
      if (i + j >= 8 && i + j <= 20 && (14 - i + j) >= 8 && 14 - i + j <= 20) {
        accessibleGrids.push({x: i, y: j});
        grid.classList.add("accessible-cell");
      }
    }
  }
  document.getElementById("A7").classList.add("bull-base")
  document.getElementById("G1").classList.add("fox-base")
  document.getElementById("M7").classList.add("eagle-base")
  document.getElementById("G13").classList.add("hound-base")
  document.getElementById("G7").classList.add("hospital")
/*
  for (var i = 0 ; i < accessibleGrids.length ; i++) {
    accessibleGrids[i].classList.add("accessible-cell");
  }
*/
}

// rendering the players
function renderGrid() {
  for (var i = 1 ; i <= 13 ; i++) {
    for (var j = 1 ; j <= 13 ; j++) {
      document.getElementById(convertNumCordsToStr({x: i, y: j})).innerHTML = "";
      var blankSpace = document.createElement("div");
      blankSpace.classList.add("blank-space");
      document.getElementById(convertNumCordsToStr({x: i, y: j})).appendChild(blankSpace);
    }
  }

  for (var i = 0 ; i < movedPlayers.length ; i++) {
    var loc = convertNumCordsToStr(movedPlayers[i])
    var grid = document.getElementById(loc);
    if (grid == null) { // player with invalid location
      movedPlayers.splice (i, 1);
      players.splice (i--, 1);
      continue;
    }

    var nametag = document.createElement("button");
    nametag.classList.add(movedPlayers[i].patrol + "-member");
    nametag.setAttribute("id", movedPlayers[i].id);
    nametag.setAttribute("onclick", "selectPlayer(" + movedPlayers[i].id + ");event.stopPropagation();");
    var nametext = document.createTextNode(movedPlayers[i].name);
    nametag.appendChild(nametext);

    grid.appendChild(nametag);
  }

  // writing the member list
  // clear the list first
  while (document.getElementById("members-list").firstChild) {
    document.getElementById("members-list").removeChild(document.getElementById("members-list").lastChild);
  }
  // list is now cleared
  for (var i = 0 ; i < players.length ; i++) {
    var nametag = document.createElement("li");
    var div = document.createElement("div");
    var nametext = document.createTextNode(players[i].name);
    var killButton = document.createElement("button");
    var killButtontext = document.createTextNode("Kill player");

    killButton.setAttribute("onclick", "kill(" +  players[i].id + ")")
    nametag.classList.add(players[i].patrol + "-member")
    killButton.classList.add("kill-button");

    killButton.appendChild(killButtontext);
    div.appendChild(nametext);
    div.appendChild(killButton);
    nametag.appendChild(div);
    document.getElementById("members-list").appendChild(nametag);
  }
}

// moving the selected player
function moveTo(destinationStr) {

  if (selectedPlayer == null) {
    return;
  }
  destinationStr += "";
  var destination = {
    x: destinationStr.charCodeAt(0) - 64,
    y: parseInt(destinationStr.substring(1))
  }

  if (getPossibleSpaces(selectedPlayer).some(
    value => { return value.x == destination.x && value.y == destination.y } )
  ) {

    // change movedPlayers.
    getMovedPlayerWithId(selectedPlayer).x = destination.x;
    getMovedPlayerWithId(selectedPlayer).y = destination.y;

    renderGrid();


  }
  // if invalid, just deselect; if valid, needs deselect anyway
  selectPlayer(selectedPlayer); // select itself again to deselect
}

// select a player
function selectPlayer(id) {
  // shit way to let you click through buttons to put multiple people
  // on the same square
  // moveTo(convertNumCordsToStr(getMovedPlayerWithId(id)))

  // clear all highlighted moves
  var el = document.getElementById(id);

  clearSelected();

  // deselecting
  if (selectedPlayer == id) {
    selectedPlayer = null;
    if (el.classList.contains("selected-member")) {
      el.classList.remove("selected-member");
    }
  }

  // selecting
  else {
/*    if (! MOVE_THIS_ROUND || getPlayerWithId(id).patrol != MYPATROL) {
      return;
    }
*/
    // deselect currently selected one
    var cur = document.getElementsByClassName("selected-member");
    while (cur.length) {
      cur[0].classList.remove("selected-member");
    }

    selectedPlayer = id;
    el.classList.add("selected-member");
    var spaces = getPossibleSpaces(selectedPlayer);
    for (var i = 0 ; i < spaces.length ; i++) {
//      legalMoves.push(convertNumCordsToStr(spaces[i]));
      document.getElementById(convertNumCordsToStr(spaces[i])).classList.add("legal-move");
    }
  }
}

// add a player
function newPlayer() {
  coords = convertStrToNumCords (document.getElementById("new-player-coords").value);
  var player = {
    name: document.getElementById("new-player-name").value,
    x: coords.x,
    y: coords.y,
    patrol: document.getElementById("new-player-patrol").value,
    id: Math.floor(Math.random()*100000000000000),
    alive: true
  };
  var dupPlayer = JSON.parse(JSON.stringify(player));

  players.push (player);
  movedPlayers.push (dupPlayer);

  renderGrid();
}

// kill a player
function kill(id) {
  for (var i = 0 ; i < players.length ; i++) {
    if (players[i].id == id) {
      players.splice (i, 1);  //decrements i afterward because the array shrinks
      movedPlayers.splice(i, 1);

      renderGrid();
      return;
    }
  }
}

// generate string used by admins to check for conflicts and stuff
function generateString() {
  for (var i = 0 ; i < PATROLS.length ; i++) {
    var temp = [];
    for (var j = 0 ; j < movedPlayers.length ; j++) {
//console.log("DEBUG: " + movedPlayers[j]);
      if (movedPlayers[j].patrol == PATROLS[i]) {
        temp.push(movedPlayers[j]);
      }
    }
    var str = btoa(JSON.stringify(temp));

    document.getElementById("generated-string-" + PATROLS[i]).setAttribute("value", str);
  }
}

// configure board using string given from admins
function setString() {
  players = [];
  movedPlayers = [];

  for (var i = 0 ; i < PATROLS.length ; i++) {
    var temp = document.getElementById("input-string-" + PATROLS[i]).value;
    if(temp == "") {
      temp = btoa(JSON.stringify({}))
    }
    temp = JSON.parse(atob(temp));

    for (var j = 0 ; j < temp.length ; j++) {
      temp[j].patrol = PATROLS[i];
    }

    players = players.concat(temp);
  }

  movedPlayers = JSON.parse(JSON.stringify(players));
  renderGrid();
}

/*******************
* useful functions *
*******************/
// converts coordinates to grid name
function convertNumCordsToStr(player) {
  return "" + String.fromCharCode(player.x + 64) + player.y;
}

// reverses the above
function convertStrToNumCords (str) {
  str = str.toUpperCase();
  return {
    x: str.charCodeAt(0) - 64,
    y: parseInt(str.substring(1))
  };
}

function getPlayerWithId(id) {
  return getEntryWithId (players, id)
}

function getMovedPlayerWithId(id) {
  return getEntryWithId (movedPlayers, id)
}

// dont use this.
function getEntryWithId(arr, id) {
  for (var i = 0 ; i < arr.length ; i++) {
    if (arr[i].id == id) {
      return arr[i];
    }
  }
  return null;
}

// returns an array of legal moves for a player
function getPossibleSpaces(id) {
  var player = getPlayerWithId(id);
  var arr = [ //let's do this the retarded way - list everything out
    {x: player.x, y: player.y + 2},
    {x: player.x - 1, y: player.y + 1},
    {x: player.x, y: player.y + 1},
    {x: player.x + 1, y: player.y + 1},
    {x: player.x - 2, y: player.y},
    {x: player.x - 1, y: player.y},
    {x: player.x, y: player.y},
    {x: player.x + 1, y: player.y},
    {x: player.x + 2, y: player.y},
    {x: player.x - 1, y: player.y - 1},
    {x: player.x, y: player.y - 1},
    {x: player.x + 1, y: player.y - 1},
    {x: player.x, y: player.y - 2}
  ];

  for (var i = 0 ; i < arr.length ; i++) {
    if (! isAccessable({x: arr[i].x, y: arr[i].y})) {
      arr.splice (i--, 1);  //decrements i afterward because the array shrinks
    }
  }
  return arr;
}


function isAccessable(coords) {
  for (var i = 0 ; i < accessibleGrids.length ; i++) {
    if (coords.x == accessibleGrids[i].x && coords.y == accessibleGrids[i].y) {
      return true;
    }
  }
  return false;
}

// clear all selections and legal move squares
function clearSelected() {
  var legalMoves = document.getElementsByClassName("legal-move");
  while(legalMoves.length > 0){
    legalMoves[0].classList.remove("legal-move");
  }
}