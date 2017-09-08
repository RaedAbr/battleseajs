const socket = io.connect("http://localhost:8080");

const playerName = prompt("Player name :")
socket.emit("joinServer", playerName);
$("#playerName").text(playerName);

// socket.on("people", function(people) {
// 	$("#people").text("People : " + people);
// });

// socket.on("games", function(games) {
// 	$("#games").text("Games : " + games);
// });

function removeButtons() {
	$("#createGame").remove();
	$("#gameId").remove();
	$("#joinGame").remove();
}

$("#createGame").on("click", function() {
	socket.emit("createGame");
	removeButtons();
});
socket.on("createGame", function(id) {
	$("#gameCreated").text("Game id : " + id);
});

$("#joinGame").on("click", function() {
	let gameId = $.trim($('#gameId').val());
	if(gameId === "") {
		console.log("joinGame");
		socket.emit("joinGame");
	}
	else {
		console.log("joinGameId");
		socket.emit("joinGameId", gameId);
	}
	removeButtons();
});
socket.on("joined", function(ids) {
	$("#joined").text("Joined on " + ids.gameId);
	$("#gameContent").css({"opacity" : "1"});
	load(ids.playerId);
});

socket.on("play", function(id) {
	$("#play").text("Play ! Your turn...");
});

socket.on("endGame", function() {
	socket.close();
});

let sendData = function() {
	console.log("in sendData");
	let data = [];
	shipsData.forEach(ship => data.push({
		id: ship.id,
		name : ship.name, 
		cells : ship.cells,
		dir: ship.dir
	}));
	console.log(data);
	socket.emit("ready", JSON.stringify(data));
};