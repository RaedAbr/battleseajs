"use strict";

const socket = io.connect("http://localhost:8080");

const playerName = prompt("Player name :")
socket.emit("joinServer", playerName);
$("#playerName").text(playerName);

socket.on("people", function(people) {
	$("#people").text("People : " + people);
});

socket.on("games", function(games) {
	$("#games").text("Games : " + games);
});

socket.emit("joinGame");

socket.on("joined", function(ids) {
	$("#joined").text("Joined on " + ids.gameId);
	$("#gameContent").css({"opacity" : "1"});
	load(ids.playerId);
});

socket.on("play", function(id) {
	$("#play").text("Play ! Your turn");
});

socket.on("endGame", function() {
	socket.close();
});