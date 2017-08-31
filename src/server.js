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

app.use("/static", express.static(path.join(__dirname, "static")));

app.get("/", function(req, res) {
	log.debug("Request index.html");
	res.sendFile(path.join(__dirname + viewsFolder + "/index.html"));
});

app.all("*", function( req, res ) {
	log.error("Requested:", req.url);
	res.status(404).send("Page not found.");
});

// ------------------------ sockets ------------------------
let clientCounter = 0;

io.on("connection", function(socket) {
	log.debug("a client connected : " + clientCounter);
	let player = "";
	socket.on("playerName", function(data) {
		player = data;
		log.debug("player " + player + " connected");
		socket.emit("data", {"name": player, "id": clientCounter});
	});
	clientCounter++;
});
