const express = require("express");
const app = express();
const path = require("path");
const Log = require("log");
const log = new Log("debug");
const http = require("http").Server(app);
const io = require("socket.io")(http);
const uuidv4 = require('uuid/v4');

const model = require("./battle_sea_modules/model.js");
const viewsFolder = "/views";
const modulesFolder = "/battle_sea_modules";

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

.all("*", function(req, res) {
	log.error("Requested:", req.url);
	res.status(404).send("404 Page not found.");
});


// ------------------------------ sockets ------------------------------
let people = {};
let games = {};
let gameIdOnHold = undefined;
// let maps = {};

io.on("connection", function(socket) {
	// ------------------------------------ Socket's functions ------------------------------------
	function peoplesList() {
		io.emit("people", Object.keys(people).map(key => people[key].name)); // emit to all socket in all rooms
	}

	function listGames() {
		io.emit("games", Object.keys(games).map(key => "[" + games[key].id + ", " + 
			people[games[key].iDplayerOne].name + "]"));
	}

	function createGame(free) {
		let gameId = uuidv4();
		games[gameId] = model.Game(gameId, socket.id, free);
		socket.join(gameId);
		people[socket.id].gameId = gameId;
		if (free) {
			gameIdOnHold = gameId;
		}
		else {
			socket.emit("createGame", gameId);
		}
		// io.emit("games", names);
		listGames();
		log.debug("A new game is created : ");
		log.debug(games[gameId]);
	}

	function joinGame(id) {
		if (games[id].status !== "joined") {
			games[id].iDplayerTwo = socket.id;
			games[id].status = "joined";

			let opponentId = games[id].iDplayerOne;
			people[opponentId].opponentId = socket.id;
			people[socket.id].opponentId = opponentId;

			socket.join(id);
			people[socket.id].gameId = id;
			io.to(id).emit("joined", id); // emit to all socket in the room "id"
			log.debug(people[socket.id].name + " join game :");
			log.debug(games[id]);
		}
		else {
			log.debug("in joinGame, game full");
		}
	}

	// ------------------------------------ Socket's events ------------------------------------
	socket.on("joinServer", function(name) {
		people[socket.id] = model.People(socket.id, name, undefined);
		peoplesList();
		log.debug("A new person connected : " + people[socket.id].name);
	});

	socket.on("createGame", function() {
		log.debug("in createGame");
		createGame(false);
	});

	socket.on("joinGame", function() {
		if (gameIdOnHold === undefined) {
			log.debug("in if joinGame");
			createGame(true);
		}
		else {
			log.debug("in else joinGame");
			joinGame(gameIdOnHold);
			gameIdOnHold = undefined;
		}
	});

	socket.on("joinGameId", function(id) {
		joinGame(id);
	});

	socket.on("ready", function(dataShips) {
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
			ships.push(model.Ship(clientShip.id, clientShip.name, cells));
		});
		player.ships = ships;
		player.status = "ready";
		log.debug(player.toString());

		let gameId = player.gameId;
		let statusOne = people[games[gameId].iDplayerOne].status;
		let statusTwo = people[games[gameId].iDplayerTwo].status;
		if (statusOne === "ready" && statusTwo === "ready") {
			games[gameId].status = "play";
			io.to(games[gameId].iDplayerOne).emit("play");
		}
	});

	socket.on("play", function(cellId) {
		let continuousGame = true;
		let opponentId = people[socket.id].opponentId;
		let opponent = people[opponentId];
		let firedCell = opponent.map.cells[cellId];
		log.debug(firedCell.toString());
		let color = undefined;
		if (firedCell.state === model.states[1]) {
			firedCell.state = model.states[2];
			color = "red";
			if (opponent.ships[firedCell.shipId].isDestroyed()) {
				log.debug("Ship destroyed ! " + firedCell.shipId);
				if (opponent.isLost()) {
					log.debug("player " + opponent.name + " has lost");
					io.to(opponent.gameId).emit("endGame");
					continuousGame = false;
				}
			}
		}
		else {
			firedCell.state = model.states[3];
			color = "green";
		}
		log.debug(firedCell);

		if (continuousGame) {
			let response = {cellId: firedCell.id, cellColor: color};
			socket.emit("response", response);
			io.to(opponentId).emit("play", response);
		}
	});

	socket.on("viewGame", function(id) {
		games[id].viewers.push(id);
		socket.join(id);
	});

	socket.on("listViewersInRoom", function(id) {
		// let names = 
		// socket.emit(JSON.stringify(people));
	});
});
