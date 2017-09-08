"use strict";

const uuidv4 = require('uuid/v4');
const Log = require("log");
const log = new Log("debug");
const model = require("./model.js");

const joinServerEvent = "joinServer";
const createGameEvent = "createGame";
const createGameComputerEvent = "createGameComputer";
const joinGameEvent = "joinGame";
const joinGameIdEvent = "joinGameId";
const joinGameComputerEvent = "joinGameComputer";
const joinedEvent = "joined";
const readyEvent = "ready";
const playEvent = "play";
const fireEvent = "fireEvent";
const shipDestroyedEvent = "shipDestroyed";
const endGameEvent = "endGame";

const peopleListEvent = "people";
const listGamesEvent = "games";
const viewGameEvent = "viewGame";
const listViewersInRoomEvent = "listViewersInRoom";

function peopleList(io, people) {
	io.emit(peopleListEvent, Object.keys(people).map(key => people[key].name)); // emit to all socket in all rooms
}

function listGames(io, people, games) {
	io.emit(listGamesEvent, Object.keys(games).map(key => "[" + games[key].id + ", " + 
		people[games[key].iDplayerOne].name + "]"));
}

function createGame(io, socket, people, games, free) {
	let gameIdOnHold = undefined;
	let gameId = uuidv4();
	games[gameId] = model.Game(gameId, socket.id, free);
	socket.join(gameId);
	people[socket.id].gameId = gameId;
	if (free) {
		gameIdOnHold = gameId;
	}
	else {
		socket.emit(createGameEvent, gameId);
	}
	// io.emit("games", names);
	listGames(io, people, games);
	log.debug("A new game is created : ");
	log.debug(games[gameId]);
	return gameIdOnHold;
}

function joinGame(io, socket, id, people, games) {
	let gameIdOnHold = undefined;
	if (games[id].status !== joinedEvent) {
		if (socket.id !== games[id].iDplayerOne) {
			games[id].iDplayerTwo = socket.id;
			games[id].status = joinedEvent;

			let opponentId = games[id].iDplayerOne;
			people[opponentId].opponentId = socket.id;
			people[socket.id].opponentId = opponentId;

			socket.join(id);
			people[socket.id].gameId = id;
			socket.emit(joinedEvent, {gameId: id, playerId: socket.id});
			io.to(opponentId).emit(joinedEvent, {gameId: id, playerId: opponentId});
			log.debug(people[socket.id].name + " join game :");
			log.debug(games[id]);
		}
		else {
			gameIdOnHold = id;
		}
	}
	else {
		log.debug("in joinGame, game full");
	}
	return gameIdOnHold;
}

exports.joinServerEvent = joinServerEvent;
exports.createGameEvent = createGameEvent;
exports.createGameComputerEvent = createGameComputerEvent;
exports.joinGameEvent = joinGameEvent;
exports.joinGameIdEvent = joinGameIdEvent;
exports.joinGameComputerEvent = joinGameComputerEvent;
exports.joinedEvent = joinedEvent;
exports.readyEvent = readyEvent;
exports.playEvent = playEvent;
exports.fireEvent = fireEvent;
exports.shipDestroyedEvent = shipDestroyedEvent;
exports.endGameEvent = endGameEvent;
exports.peopleListEvent = peopleListEvent;
exports.listGamesEvent = listGamesEvent;
exports.viewGameEvent = viewGameEvent;
exports.listViewersInRoomEvent = listViewersInRoomEvent;

exports.peopleList = peopleList;
exports.listGames = listGames;
exports.createGame = createGame;
exports.joinGame = joinGame;