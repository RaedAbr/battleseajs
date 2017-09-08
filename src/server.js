"use strict";

const express = require("express");
const app = express();
const path = require("path");
const Log = require("log");
const log = new Log("debug");
const http = require("http").Server(app);

const viewsFolder = "/views";
const modulesFolder = "/battle_sea_modules";
const model = require("." + modulesFolder + "/model.js");

http.listen(8080);

// ------------------------------ sockets ------------------------------
const io = require("socket.io")(http);
const sockets = require("." + modulesFolder + "/socketFunctions.js");
const computer = require("." + modulesFolder + "/computer.js");

// ------------------------------ routes ------------------------------
app.use("/static", express.static(path.join(__dirname, "static")))

.get("/", function(req, res) {
	log.debug("Request index.html");
	res.sendFile(path.join(__dirname + viewsFolder + "/index.html"));
})
.get("/model.js", function(req, res) {
	log.debug("Request model.js");
	res.sendFile(path.join(__dirname + modulesFolder + "/model.js"));
})
.get("/computer", function(req, res) {
	let newInstance = require('socket.io-client')('http://localhost:8080');
	computer.computer(newInstance);
	log.debug("Request computer.html");
	res.sendFile(path.join(__dirname + viewsFolder + "/computer.html"));
})

.all("*", function(req, res) {
	log.error("Requested:", req.url);
	res.status(404).send("404 Page not found.");
});

let people = {};
let games = {};
let gameIdOnHold = undefined;
let gameIdComputer = undefined;

io.on("connection", function(socket) {
	socket.on(sockets.joinServerEvent, function(name) {
		people[socket.id] = model.People(socket.id, name, undefined);
		sockets.peopleList(io, people);
		log.debug("A new person connected : " + people[socket.id].name + ", id: " + socket.id);
	});

	socket.on(sockets.createGameEvent, function() {
		log.debug("in createGame");
		sockets.createGame(io, socket, people, games, false);
	});

	// socket.on(sockets.createGameComputerEvent, function() {
	// 	log.debug("in createGameComputer");
	// 	gameIdComputer = sockets.createGame(io, socket, people, games, true);
	// });

	socket.on(sockets.joinGameEvent, function() {
		if (gameIdOnHold === undefined) {
			log.debug("in if joinGame");
			gameIdOnHold = sockets.createGame(io, socket, people, games, true);
		}
		else {
			log.debug("in else joinGame");
			log.debug(gameIdOnHold);
			gameIdOnHold = sockets.joinGame(io, socket, gameIdOnHold, people, games);
		}
	});

	socket.on(sockets.joinGameIdEvent, function(id) {
		log.debug("in " + sockets.joinGameIdEvent);
		sockets.joinGame(io, socket, id, people, games);
	});

	// socket.on(sockets.joinGameComputerEvent, function() {
	// 	log.debug("in " + sockets.joinGameComputerEvent);
	// 	gameIdComputer = sockets.joinGame(io, socket, gameIdComputer, people, games);
	// });

	socket.on(sockets.readyEvent, function(dataShips) {
		let player = people[socket.id];
		log.debug("id player : " + player.id);
		log.debug("gameId : " + player.gameId);

		let clientShips = JSON.parse(dataShips);
		log.debug(clientShips);
		let ships = [];
		clientShips.forEach(function(clientShip) {
			let cells = [];
			clientShip.cells.forEach(function(id) {
				let cell = model.Cell(id);
				cell.state = model.states[1];
				cell.shipId = clientShip.id;
				cells.push(cell);
				player.map.cells[id] = cell;
			});
			ships.push(model.Ship(clientShip.id, clientShip.name, cells, clientShip.dir));
		});
		player.ships = ships;
		player.status = "ready";
		log.debug(player.toString());

		let game = games[player.gameId];
		if (people[game.iDplayerOne].status === "ready" && people[game.iDplayerTwo].status === "ready") {
			game.status = "play";
			io.to(game.iDplayerOne).emit(sockets.playEvent, people[game.iDplayerOne].id);
			io.to(game.iDplayerTwo).emit("wait");
		}
	});

	socket.on(sockets.playEvent, function(cellId) {
		let continuousGame = true;
		let player = people[socket.id];
		let opponent = people[player.opponentId];
		let gameId = player.gameId;
		let firedCell = opponent.map.cells[cellId];
		let firedShip = opponent.ships[firedCell.shipId];

		if (firedCell.state === model.states[1]) {
			firedCell.state = model.states[2];
			firedShip.destroyedCells++;
		}
		else {
			firedCell.state = model.states[3];
		}

		let playerIdName = {id: player.id, name: player.name};
		log.debug(firedCell.toString());
		io.to(gameId).emit(sockets.fireEvent, {cellId: firedCell.id, cellState: firedCell.state, player: playerIdName});

		if (firedCell.state === model.states[2]) {
			if (firedShip.isDestroyed()) {
				io.to(gameId).emit(sockets.shipDestroyedEvent, {ship: firedShip, player: playerIdName});
				log.debug("Ship destroyed ! " + firedShip.toString());
				opponent.destroyedShips++;

				if (opponent.hasLost()) {
					log.debug("player " + opponent.name + " has lost");
					io.to(gameId).emit(sockets.endGameEvent, {playerWin: {id: player.id, name: player.name}, 
						playerLoose: {id: opponent.id, name: opponent.name}});
					continuousGame = false;
				}
			}
		}

		if (continuousGame) {
			io.to(opponent.id).emit(sockets.playEvent, opponent.id);
		}
	});

	socket.on(sockets.viewGameEvent, function(id) {
		games[id].viewers.push(id);
		socket.join(id);
	});

	socket.on(sockets.listViewersInRoomEvent, function(id) {
		// let names = 
		// socket.emit(JSON.stringify(people));
	});
});
