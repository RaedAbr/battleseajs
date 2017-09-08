"use strict";

const socket = io.connect("http://localhost:8080");

const playerName = prompt("Player name :")
socket.emit("joinServer", playerName);
$("#playerName").text(playerName);

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
	let gameId = $.trim($('#gameIdInput').val());
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