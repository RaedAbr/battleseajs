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
		// log.debug("\tFor cell " + firstCell);
		// log.debug("\tOne cellTaken : " + cellsTaken[i]);
		if (cellsTaken[i] !== undefined) {
			// log.debug("\ttrue");
			return true;
		}		
		i += mult;
	}
	// log.debug("\tfalse");
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

		// log.debug("\n");
		// log.debug(cellsTaken);
		// log.debug(ship);
		// log.debug(direction);
		// log.debug(firstCell);

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

// for (var i = 0; i < 100; i++) {
// 	console.log(arrayOfCellsDir(model.rowsColumns));
// 	console.log("\n");
// }

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

let cellsFired = {};

function randomFire(rowsCols) {
	const maxId = rowsCols * rowsCols - 1;
	let fireCell = 0;
	do {
		fireCell = getRandomIntInclusive(0, maxId)
	} while(cellsFired[fireCell] !== undefined);
	cellsFired[fireCell] = "fired";
	return fireCell;
}

function computer(instance) {
	instance.emit(sockets.joinServerEvent, "It's me, Computer !");
	instance.emit(sockets.joinGameEvent);
	log.debug("Computer 'created' game emit");
	
	instance.on(sockets.joinedEvent, function(ids) {
		log.debug("Computer joined");
		instance.emit(sockets.readyEvent, JSON.stringify(placeShips()));
		log.debug("Computer place ships");
	});

	instance.on(sockets.playEvent, function() {
		log.debug("Computer play");
		instance.emit(sockets.playEvent, randomFire(model.rowsColumns));
	});

	instance.on(sockets.fireEvent, function() {
		log.debug("Computer under fire");
	});

	instance.on(sockets.shipDestroyedEvent, function() {
		log.debug("Computer lost a ship");
	} );

	instance.on(sockets.endGameEvent, function() {
		log.debug("Computer endGameEvent");
		instance.close();
	});
}

exports.computer = computer;
