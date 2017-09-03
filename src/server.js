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

// ------------------------ routes ------------------------
app.use("/static", express.static(path.join(__dirname, "static")));
app.get("/", function(req, res) {
	log.debug("Request index.html");
	res.sendFile(path.join(__dirname + viewsFolder + "/index.html"));
})
.get("/model.js", function(req, res) {
	log.debug("Request model.js");
	res.sendFile(path.join(__dirname + modulesFolder + "/model.js"));
})
.get("/test", function(req, res) {
	log.debug("Request test.html");
	res.sendFile(path.join(__dirname + viewsFolder + "/test.html"));
});
app.all("*", function(req, res) {
	log.error("Requested:", req.url);
	res.status(404).send("404 Page not found.");
});


// ------------------------ sockets ------------------------
function People(id, name) {
	return {
		id: id,
		name: name,
		toString: function() {
			return "(People : {id: " + this.id + ", name: " + this.name + "})";
		}
	};
}

function Game(id, iDplayerOne, free) {
	return {
		id: id,
		iDplayerOne: iDplayerOne,
		status: "wait",
		free: free,
		viewers: [],
		toString: function() { 
			return 
				"(Game : {id: " + this.id + ", iDplayerOne: " + this.iDplayerOne 
				+ ", status:" + this.status + ", free: " + this.free 
				+ "})"; 
		}
	};
}

let people = {};
let games = {};
let gameIdOnHold = undefined;

io.on("connection", function(socket) {
	function listPeople() {
		let names = function() {
			let n = [];
			for (let key in people) {
				n.push(people[key].name);
			}
			return n;
		}();
		io.emit("people", names); // broadcast to all socket in all rooms
	}

	function listGames() {
		let names = function() {
			let n = [];
			for (let key in games) {
				n.push("[" + games[key].id + ", " + people[games[key].iDplayerOne].name + "]");
			}
			return n;
		}();
		io.emit("games", names);
	}

	function createGame(free) {
		let gameId = uuidv4();
		games[gameId] = Game(gameId, socket.id, free);
		socket.join(gameId);
		if (free) {
			gameIdOnHold = gameId;
		}
		else {
			socket.emit("createGame", gameId);
		}
		listGames();
		log.debug("A new game is created : ");
		log.debug(games[gameId]);
	}

	function joinGame(id) {
		games[id].iDplayerTwo = socket.id;
		games[id].status = "play";
		socket.join(id);
		socket.emit("play", id);
		socket.to(id).emit("play", id);
		listGames();
		log.debug(people[socket.id].name + " join game :");
		log.debug(games[id]);
	}

	socket.on("joinServer", function(name) {
		people[socket.id] = People(socket.id, name);
		listPeople();
		log.debug("A new person connected : " + people[socket.id].toString());
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

	socket.on("viewGame", function(id) {
		games[id].viewers.push(id);
		socket.join(id);
	});

	socket.on("listViewersInRoom", function(id) {
		// let names = 
		// socket.emit(JSON.stringify(people));
	});
});
