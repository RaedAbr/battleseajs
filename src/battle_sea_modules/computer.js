"use strict";

const Log = require("log");
const log = new Log("debug");
const sockets = require("./socketFunctions.js");
const model = require("./model.js");

const modelShips = [
	{id: 0, name: "Cruiser", size: 2},
	{id: 1, name: "Submarine1", size: 3},
	{id: 2, name: "Submarine2", size: 3},
	{id: 3, name: "Destroyer", size: 4},
	{id: 4, name: "Battleship", size: 5}
];


let cellsFired = {};
let lastStrikedCell = {};


function getRandomIntInclusive(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDirection() {
	let directions = ["h", "v"];
	return directions[getRandomIntInclusive(0, directions.length - 1)];
}

function maxFrom(cellId, direction, rowsCols) {
	if (direction === "h") {
		const line = Math.floor(cellId / rowsCols);
		return line * rowsCols + rowsCols - 1;
	}
	else {
		const row = cellId % rowsCols;
		return rowsCols * rowsCols - rowsCols + row;
	}
}

function cellsOnWay(cellsTaken, firstCell, shipSize, mult) {
	let i = firstCell;
	while (i < firstCell + shipSize * mult) {
		if (cellsTaken[i] !== undefined) {
			return true;
		}		
		i += mult;
	}
	return false;
}

function arrayOfCellsDir(rowsCols) {
	let cellsTaken = {};
	let cellsDirShips = [];
	const maxId = rowsCols * rowsCols - 1;
	for (let ship of modelShips) {
		let direction = randomDirection();
		let firstCell = 0;

		let mult = 1;
		if (direction === "v") {
			mult = rowsCols;
		}
		
		do {
			firstCell = getRandomIntInclusive(0, maxId);
		} while ((firstCell + mult * (ship.size - 1)) > maxFrom(firstCell, direction, rowsCols) 
			|| cellsOnWay(cellsTaken, firstCell, ship.size, mult));

		let cellsShip = [];
		let i = firstCell;
		while (i < firstCell + ship.size * mult) {
			cellsShip.push(i);
			cellsTaken[i] = "taken";
			i += mult;
		}

		cellsDirShips.push({cells: cellsShip, dir: direction});
	}
	return cellsDirShips;
}

function placeShips() {
	let ships = [];
	let i = 0;
	let cellsDir = arrayOfCellsDir(model.rowsColumns);
	while (i < modelShips.length) {
		ships.push({id: modelShips[i].id, name: modelShips[i].name, cells: cellsDir[i].cells, dir: cellsDir[i].dir});
		i++;
	}
	log.debug(ships);
	return ships;
}

function neighbourCells(playerId, cellId, rowsCols) {
	let neighboursCoord = [];
	const min = 0;
	const max = rowsCols - 1;
	const row = Math.floor(cellId / rowsCols);
	const col = cellId % rowsCols;

	function checkCoord(i, j) {
		if (i >= min && i <= max && j >= min && j <= max && !(i == row && j == col)) {
			let id = i * rowsCols + j;
			if (cellsFired[playerId][id] !== "fired") {
				neighboursCoord.push(id);
			}
		}
	}

	checkCoord(row - 1, col);
	checkCoord(row + 1, col);
	checkCoord(row, col - 1);
	checkCoord(row, col + 1);

	return neighboursCoord;
}

function randomFire(id, rowsCols) {
	const maxId = rowsCols * rowsCols - 1;
	let fireCell = 0;
	if (lastStrikedCell[id] !== undefined) {
		let i = 0;
		let neighbours = neighbourCells(id, lastStrikedCell[id], rowsCols);
		do {
			fireCell = neighbours[getRandomIntInclusive(0, neighbours.length - 1)];
			i++;
			if (i >= neighbours.length) {
				lastStrikedCell[id] = undefined;
			}
			log.debug("first do while");
		} while(cellsFired[id][fireCell] !== undefined && i < neighbours.length);
	}
	else {
		do {
			fireCell = getRandomIntInclusive(0, maxId);
			log.debug("second do while");
		} while(cellsFired[id][fireCell] !== undefined);
	}
	cellsFired[id][fireCell] = "fired";
	log.debug(cellsFired[id]);
	return fireCell;
}

function computer(instance) {
	instance.emit(sockets.joinServerEvent, "Computer");
	instance.emit(sockets.joinGameEvent);
	log.debug("Computer 'created' game emit");
	
	instance.on(sockets.joinedEvent, function(ids) {
		log.debug("Computer joined");
		cellsFired[ids.playerId] = {};
		instance.emit(sockets.readyEvent, JSON.stringify(placeShips()));
		log.debug("Computer place ships");
	});

	instance.on(sockets.playEvent, function() {
		log.debug("Computer play");
		instance.emit(sockets.playEvent, randomFire(instance.id, model.rowsColumns));
	});

	instance.on(sockets.fireEvent, function(data) {
		log.debug(data);
		if (data.player.id === instance.id) {
			if (data.cellState === "striked") {
				lastStrikedCell[instance.id] = data.cellId;
			}
		}
	});

	instance.on(sockets.shipDestroyedEvent, function(data) {
		if (data.player.id === instance.id) {
			lastStrikedCell[instance.id] = undefined;
			log.debug("player ship destroyed (by computer)");
		}
	});

	instance.on(sockets.endGameEvent, function() {
		log.debug("Computer close");
		cellsFired[instance.id] = undefined;
		instance.close();
	});
}

exports.computer = computer;
