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
	log.debug("Request computer.html");
	res.sendFile(path.join(__dirname + viewsFolder + "/computer.html"));
})

.all("*", function(req, res) {
	log.error("Requested:", req.url);
	res.status(404).send("404 Page not found.");
});


// ------------------------------ sockets ------------------------------
const io = require("socket.io")(http);
const sockets = require("." + modulesFolder + "/socketFunctions.js");

let people = {};
let games = {};
let gameIdOnHold = undefined;

io.on("connection", function(socket) {
	// ------------------------------------ Socket's events ------------------------------------
	socket.on(sockets.joinServerEvent, function(name) {
		people[socket.id] = model.People(socket.id, name, undefined);
		sockets.peopleList(io, people);
		log.debug("A new person connected : " + people[socket.id].name + ", id: " + socket.id);
	});

	socket.on(sockets.createGameEvent, function() {
		log.debug("in createGame");
		sockets.createGame(io, socket, people, games, false);
	});

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
		sockets.joinGame(io, socket, id, people, games);
	});

	socket.on(sockets.readyEvent, function(dataShips) {
		let player = people[socket.id];
		log.debug("in ready");
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

		let gameId = player.gameId;
		let statusOne = people[games[gameId].iDplayerOne].status;
		let statusTwo = people[games[gameId].iDplayerTwo].status;
		if (statusOne === "ready" && statusTwo === "ready") {
			games[gameId].status = "play";
			io.to(games[gameId].iDplayerOne).emit(sockets.playEvent);
		}
	});

	socket.on(sockets.playEvent, function(cellId) {
		let continuousGame = true;
		let opponentId = people[socket.id].opponentId;
		let opponent = people[opponentId];
		let firedCell = opponent.map.cells[cellId];
		log.debug(firedCell.toString());
		if (firedCell.state === model.states[1]) {
			firedCell.state = model.states[2];
			opponent.ships[firedCell.shipId].destroyedCells++;

			if (opponent.ships[firedCell.shipId].isDestroyed()) {
				io.to(opponent.gameId).emit(sockets.shipDestroyedEvent, {ship: opponent.ships[firedCell.shipId], 
					player: {id: people[socket.id].id, name: people[socket.id].name}});
				log.debug("Ship destroyed ! " + firedCell.shipId + ", " + opponent.ships[firedCell.shipId]);
				opponent.destroyedShips++;

				if (opponent.hasLost()) {
					log.debug("player " + opponent.name + " has lost");
					io.to(opponent.gameId).emit(sockets.endGameEvent, {playerNameWin: people[socket.id].name, 
						playerNameLoose: opponent.name});
					continuousGame = false;
				}
			}
		}
		else {
			firedCell.state = model.states[3];
		}
		log.debug(firedCell);

		if (continuousGame) {
			io.to(opponent.gameId).emit(sockets.fireEvent, {cellId: firedCell.id, cellState: firedCell.state, 
				player: {id: people[socket.id].id, name: people[socket.id].name}});
			io.to(opponentId).emit(sockets.playEvent);
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
