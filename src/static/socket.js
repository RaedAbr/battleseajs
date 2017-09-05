let socket = io.connect("http://localhost:8080");

let playerName = prompt("Player name :")
socket.emit("joinServer", playerName);
$("#playerName").text(playerName);

socket.on("people", function(people) {
	$("#people").text("People : " + people);
});

socket.on("games", function(games) {
	$("#games").text("Games : " + games);
});

$("#createGame").on("click", function() {
	socket.emit("createGame");
});
socket.on("createGame", function(id) {
	$("#gameCreated").text("Game id : " + id);
});

$("#joinGame").on("click", function() {
	let gameId = $.trim($('#gameId').val());
	if(gameId === "") {
		socket.emit("joinGame");
	}
	else {
		socket.emit("joinGameId", gameId);
	}
});
socket.on("joined", function(id) {
	$("#joined").text("Joined on " + id);
	load();
});

socket.on("play", function(id) {
	$("#play").text("Play ! Your turn");
});
