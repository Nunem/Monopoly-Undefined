const socket = io();
const playerImgs = [];
socket.on("playerImages", (imgs)=>{
    playerImgs.push(imgs);
});
socket.on("playerInfoUpdate", (playerData)=>{
  let money = JSON.parse(playerData).socketMoney; //has to be in the player information, top left corner, REACT
  let property = JSON.parse(playerData).socketProperty; //has to be in the player information, top left corner, REACT
  //let cards = JSON.parse(playerData.socketCards); //array, length = 2, boolean values, cards[0]= (true if player has a jail card) cards[1]= (true if player doesnt have to pay rent for the next house he moves to)
  console.log(money, property);
});
socket.on("diceResults", (dice1, dice2)=>{
  //dice animation
});
socket.on("getTheCard", (text)=>{
  console.log(text);
});

window.onload = ()=>{
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  socket.on("mapInfoPlayerPos", (mapData)=>{
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    console.log(mapData);
    for (let i=0; i<mapData.length; i++)
      playerPositionUpdate(ctx, mapData[i], playerImgs[i]);
    /*
      An array, mapData[0] is the player1 position, mapData[1] is the player2 position,
      mapData[2] is the player3 position, mapData[3] is the player4 position.
      Give these values to the function wich is going to place the figures in the right position on the canvas.
      for (let i of mapData)
        yourFunction(i);
    */
  });
    //socket.emit('moveTheFigure');
}
