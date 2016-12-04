"use strict"

const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io').listen(http);
http.listen(8080);

const players = [];

class Player {
  constructor(id, socketId){
    this.previousField = null;
    this.socketId = socketId;
    this.id = id;
    this.money = 1500;
    this.figure = "fig"+players.length+".png";
    this.property = [];
    this.hotelN = 0;
    this.houseN = 0;
    this.currentField = 0;
    this.inJail = false;
    this.noRentCard = false;
    this.freeFromJailCard = false;
  }
  move(fields){
    this.previousField = this.currentField;
    this.currentField = (40+this.currentField + fields)%40;
    if (this.previousField > this.currentField)
      this.money+=200;updatePlayerInfo(this);
  }
}

class RegularStreet {
  // type 0;

  /*
    type 1 - Purple
    type 2 - Light-Blue
    type 3 - Violet
    type 4 - Orange
    type 5 - Red
    type 6 - Yellow
    type 7 - Dark-Green
    type 8 - Dark-Blue
  */

  constructor(price, rent, group, index){
    this.owner = null;
    this.price = price;
    this.hotel = false;
    this.houses = 0;
    this.rent = rent;
    this.group = group;
    this.idex = index;
  }
  buyMe(player){
    io.to(player.socketId).emit("buyMe?", this.index);
  }
}

const chanceArr = [{text: "They think they can kick you (Go forward 3 spaces).", func(player){
  player.move(3);
  updateMapInfoPlayerPos();
}},
  {text: "You have no money (They have nothing to take you are finally free) – no rent.", func(player){
    player.noRentCard = true;
    updatePlayerInfo(player);
  }},
  {text: "Go to jail - Go directly to jail.", func(player){
    player.inJail = true;
    player.currentField = 10;
    updateMapInfoPlayerPos();
  }},
  {text: "Go back 3 spaces.", func(player){
    player.move(-3);
    updateMapInfoPlayerPos();
  }},
  {text: "You have been elected Chairman of board (Pay each player 30$).", func(player){
    player.money = player.money - (players.length-1)*30;
    for (let i of players){
      if (i!=player)
        i.money += 30;
      updatePlayerInfo(i);
    }
  }},
  {text: "Make general repairs on all your property (Pay 15$ per house, 60$ per hotel).", func(player){
    player.money = player.money - (player.houseN*15 + player.hotelN*60);
    updatePlayerInfo(player);
  }},
  {text: "Pay poor tax of 15$.", func(player){
    player.money -= 15;
    updatePlayerInfo(player);
  }},
  {text: "Your stock stands low (For each property card you pay 10$).", func(player){
    player.money -= player.property.length * 10;
    updatePlayerInfo(player);
  }},
  {text: "Take a walk on Boardwalk (Don’t pay rent).", func(player){
    player.currentField = 39;
    updateMapInfoPlayerPos();
  }},
  {text: "Get out of jail, free (This card may be kept until needed).", func(player){
    player.freeFromJailCard = true;
    updatePlayerInfo(player);
  }},
  {text: "Bank pays you dividend of 50$.", func(player){
    player.money += 50;
    updatePlayerInfo(player);
  }},
  {text: "Advance to “GO” (Collect 200$).", func(player){
    player.currentField = 0;
    player.money += 200;
    updatePlayerInfo(player);
    updateMapInfoPlayerPos();
  }},
  {text: "Your building and loan matures (Collect 50$).", func(player){
    player.money += 50;
    updatePlayerInfo(player);
  }},
  {text: "Pay for telephone conversation 25$.", func(player){
    player.money-=25;
    updatePlayerInfo(player);
  }}];

class Chance {
  //type 4;

  show(player){
    let chosenCard = chanceArr[Math.floor(Math.random()*chanceArr.length)];
    io.to(player.socketId).emit("getTheCard", chosenCard.text);
    chosenCard.func(player);
  }

}

class TrainStation {
  //type 3;

  constructor(){
    this.owner = null;
    this.price = 200;
  }

  /*
    Charge 25 if one owned,
    50 if two owned,
    100 if three owned,
    200 if all owned by the same owner.
  */
}

class LuxuryTax {
  //type 11;
}

class Water {
  //type 9;

  constructor(){
    this.owner = null;
    this.price = 150;
  }

  /*
    Charge 4 times roll of dice is one is owned,
    10 times roll of dice if Electricity is also owned.
  */
}

class Electricity {
  //type 6;

  constructor(){
    this.owner = null;
    this.price = 150;
  }

  /*
    Charge 4 times roll of dice is one is owned,
    10 times roll of dice if Water is also owned.
  */
}

const chestArr = [{text: "Income tax refund (Collect 20$).", func(player){
  player.money += 20;
  updatePlayerInfo(player);
}},
  {text: "Bank error in your favor (Collect 200$).", func(player){
    player.money += 200;
    updatePlayerInfo(player);
  }},
  {text: "From sale of stock you get 40$.", func(player){
    player.money += 40;
    updatePlayerInfo(player);
  }},
  {text: "Life insurance matures (Collect 100$).", func(player){
    player.money += 100;
    updatePlayerInfo(player);
  }},
  {text: "Collect 50$ from every player.", func(player){
    player.money = player.money + (players.length-1)*50;
    for (let i of players){
      if (i!=player)
        i.money -= 50;
      updatePlayerInfo(i);
    }
  }},
  {text: "Relieve your own stress collect 20$.", func(player){
    player.money += 20;
    updatePlayerInfo(player);
  }},
  {text: "Pay hospital 100$.", func(player){
    player.money -= 100;
    updatePlayerInfo(player);
  }},
  {text: "Doctor’s fee pay 50$.", func(player){
    player.money -= 50;
    updatePlayerInfo(player);
  }},
  {text: "Pay school tax of 150$.", func(player){
    player.money -= 150;
    updatePlayerInfo(player);
  }},
  {text: "X-mas fund matures (Collect 45$).", func(player){
    player.money += 45;
    updatePlayerInfo(player);
  }},
  {text: "You have won second prize in a beauty contest (Collect 50$).", func(player){
    player.money += 50;
    updatePlayerInfo(player);
  }},
  {text: "From the charitable alliance (Collect 60$).", func(player){
    player.money += 60;
    updatePlayerInfo(player);
  }},
  {text: "Receive for services 25$.", func(player){
    player.money += 60;
    updatePlayerInfo(player);
  }},
  {text: "Go to jail- Go directly to jail.", func(player){
    player.inJail = true;
    player.currentField = 10;
    updateMapInfoPlayerPos();
  }}];

class Chest {
  //type 1;
  show(player){
    let chosenCard = chestArr[Math.floor(Math.random()*chestArr.length)];
    io.to(player.socketId).emit("getTheCard", chosenCard.text);
    chosenCard.func(player);
  }
}

class Jail {
  //type 5;

  constructor(){
      this.currentPrisoners = [];
  }

}

const regStrT1Arr = [{type: 0, fieldData: new RegularStreet(60,2,1,1)},
  {type: 0, fieldData: new RegularStreet(60,4,1,3)}];
const regStrT2Arr = [{type: 0, fieldData: new RegularStreet(100,6,2,6)},
  {type: 0, fieldData: new RegularStreet(100,6,2,8)},
  {type: 0, fieldData: new RegularStreet(120,8,2,9)}];
const regStrT3Arr = [{type: 0, fieldData: new RegularStreet(140,10,3,11)},
  {type: 0, fieldData: new RegularStreet(140,10,3,13)},
  {type: 0, fieldData: new RegularStreet(160,12,3,14)}];
const regStrT4Arr = [{type: 0, fieldData: new RegularStreet(180,14,4,16)},
  {type: 0, fieldData: new RegularStreet(180,14,4,18)},
  {type: 0, fieldData: new RegularStreet(200,16,4,19)}];
const regStrT5Arr = [{type: 0, fieldData: new RegularStreet(220,18,5,21)},
  {type: 0, fieldData: new RegularStreet(220,18,5,23)},
  {type: 0, fieldData: new RegularStreet(240,20,5,24)}];
const regStrT6Arr = [{type: 0, fieldData: new RegularStreet(260,22,6,26)},
  {type: 0, fieldData: new RegularStreet(260,22,6,27)},
  {type: 0, fieldData: new RegularStreet(280,24,6,29)}];
const regStrT7Arr = [{type: 0, fieldData: new RegularStreet(300,26,7,31)},
  {type: 0, fieldData: new RegularStreet(300,26,7,32)},
  {type: 0, fieldData: new RegularStreet(320,28,7,34)}];
const regStrT8Arr = [{type: 0, fieldData: new RegularStreet(350,35,8,37)},
  {type: 0, fieldData: new RegularStreet(350,35,8,39)}];

const trainStationArr = [{type: 3, fieldData: new TrainStation()},
  {type: 3, fieldData: new TrainStation()},
  {type: 3, fieldData: new TrainStation()},
  {type: 3, fieldData: new TrainStation()}];

const utilitiesArr = [{type: 6, fieldData: new Electricity()},
  {type: 9, fieldData: new Water()}];

const chance = new Chance();
const chest = new Chest();

const map = [{type: 8},
regStrT1Arr[0],
{type: 1},
regStrT1Arr[1],
{type: 2},
trainStationArr[0],
regStrT2Arr[0],
{type: 4},
regStrT2Arr[1],
regStrT2Arr[2],
{type: 5, fieldData: new Jail()},
regStrT3Arr[0],
utilitiesArr[0],
regStrT3Arr[1],
regStrT3Arr[2],
trainStationArr[1],
regStrT4Arr[0],
{type: 1},
regStrT4Arr[1],
regStrT4Arr[2],
{type: 7},
regStrT5Arr[0],
{type: 4},
regStrT5Arr[1],
regStrT5Arr[2],
trainStationArr[2],
regStrT6Arr[0],
regStrT6Arr[1],
utilitiesArr[1],
regStrT6Arr[2],
{type: 10},
regStrT7Arr[0],
regStrT7Arr[1],
{type: 1},
regStrT7Arr[2],
trainStationArr[3],
{type: 4},
regStrT8Arr[0],
{type: 11},
regStrT8Arr[1]];

const updatePlayerInfo = (player)=>{
    io.to(player.socketId).emit('playerInfoUpdate', JSON.stringify({socketMoney: player.money, socketProperty: player.property, socketCards: [player.freeFromJailCard, player.noRentCard]}));
}

const updateMapInfoPlayerPos = ()=>{
  io.sockets.emit('mapInfoPlayerPos', [players[0].currentField, players[1].currentField, players[2].currentField, players[3].currentField]);
}

const gameStart = ()=>{
  console.log("4 players are ready, the games has started.");
  console.log("It's player0's turn.");
  for (let i=0; i<players.length;i++){
    updatePlayerInfo(players[i]);
  }
  updateMapInfoPlayerPos();
  yourTurn(players[turn]);
}

const who = (id)=>{
  for (let i of players){
    if (i.socketId===id)
      return players.indexOf(i);
  }
}

const trowDice = ()=>{
  return (1+Math.floor(Math.random()*6));
}

let turnTime;
let turn = 0;
const yourTurn = (player)=>{
  io.to(player.socketId).emit("itsYourTurn");
  turnTime = setTimeout(()=>{
    console.log("Player"+(turn)+" failed to play in time. Now it's player"+(turn+1)+"'s turn.");
    turn=(turn+1)%4;
    yourTurn(players[turn]);
  }, 30000);
};

app.get('/', (req, res)=>{
  if (players.length < 4)
    res.sendFile(__dirname + '/public/index.html');
  else
    res.end("Sorry, the game is full.");
});

app.use(express.static('public'));

io.on('connection', (socket)=>{
	console.log("A new socket connected to server. It's ID is - " + socket.id);
  players.push(new Player(players.length, socket.id));

  if (players.length===4)
    gameStart();

  socket.on('moveTheFigure', ()=>{
    const sender = who(socket.id);
    if (sender===turn)
    {
      clearTimeout(turnTime);
      console.log("player"+turn+" moved.");

      let dice1 = trowDice();
      let dice2 = trowDice();
      io.sockets.emit("diceResults", dice1, dice2);
      players[sender].move(dice1+dice2);
      updateMapInfoPlayerPos();
      if (map[players[sender].currentField].type===4)//chance
        chance.show(players[sender]);
      else if (map[players[sender].currentField].type===1)//chest
        chest.show(players[sender]);
      else if (map[players[sender].currentField].type===2){//incomeTax
        players[sender].money = players[sender].money - ((200 < (players[sender].money*0.1) ? 200 : (players[sender].money*0.1)));
        updatePlayerInfo(players[sender]);
      }
      else if (map[players[sender].currentField].type===10){//goToJail
        players[sender].inJail = true;
        players[sender].currentField = 10;
        map[10].fieldData.currentPrisoners.push(players[sender]);
        io.sockets.emit("imprisoned", (turn+1));
        updateMapInfoPlayerPos();
      }
      else if (map[players[sender].currentField].type===11){
          players[sender].money-=100;
          updatePlayerInfo(players[sender]);
      }
      else if (map[players[sender].currentField].type===0){
        if (map[players[sender].currentField].fieldData.owner===null){
          map[players[sender].currentField].fieldData.buyMe(players[sender]);
        }
      }
      turn=(turn+1)%4;
      yourTurn(players[turn]);
    }
    else{
      io.to(players[sender].socketId).emit("notYourTurn", (turn+1));
    }
  });
});
