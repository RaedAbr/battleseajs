const express = require("express");
const app = express();
const path = require("path");
const Log = require("log");
const log = new Log("debug");
const http = require("http").Server(app);
const io = require("socket.io")(http);

const model = require("./battle_sea_modules/model.js");
const viewsFolder = "/views";

http.listen(8080);

// ------------------------ routes ------------------------
app.use("/static", express.static(path.join(__dirname, "static")));

app.get("/", function(req, res) {
	log.debug("Request index.html");
	res.sendFile(path.join(__dirname + viewsFolder + "/index.html"));
})
.get("/model.js", function(req, res) {
	log.debug("Request model.js");
	res.sendFile(path.join(__dirname + "/battle_sea_modules" + "/model.js"));
})
.get("/wait", function(req, res) {
	log.debug("Request wait.html");
	res.sendFile(path.join(__dirname + viewsFolder + "/wait.html"));
})
.get("/foo", function(req, res) {
	log.debug("Request foo.html");
	res.sendFile(path.join(__dirname + viewsFolder + "/foo.html"));
})
.get("/bar", function(req, res) {
	log.debug("Request bar.html");
	res.sendFile(path.join(__dirname + viewsFolder + "/bar.html"));
});

app.all("*", function( req, res ) {
	log.error("Requested:", req.url);
	res.status(404).send("Page not found.");
});

// ------------------------ sockets ------------------------
let clientCounter = 1;
let wait = io.of("/wait");

let playerOne = undefined;
let playerTwo = undefined;

wait.on("connection", function(socket) {
	function newPlayer(name, waiting, socketId) {
		let player = model.Player(name, waiting, socket.id);
		log.debug("Client n° " + clientCounter + " connected, " + player.toString());
		socket.emit("you", JSON.stringify(player.toString()));
		clientCounter++;
		return player;
	}

	if (clientCounter === 1) {
		socket.on("playerName", function(name) {
			playerOne = newPlayer(name, true);
		});
	}
	else if (clientCounter === 2) {
		socket.on("playerName", function(name) {
			playerTwo = newPlayer(name, false);
			// wait.emit("gameStart"); // pour envoyer à tous les clients connectés à "/wait"
			log.debug("gameStart");
			// socket.to(playerTwo.getSocketId()).emit("gameStart", JSON.stringify(playerOne.toString()));
			socket.emit("gameStart", JSON.stringify(playerOne.toString()));
			log.debug("send to playerTwo");
			socket.to(playerOne.getSocketId()).emit("gameStart", JSON.stringify(playerTwo.toString()));
			log.debug("send to playerOne");
		});
	}
});
