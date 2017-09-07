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

function maxFrom(cellId, direction) {
	if (direction === "h") {
		const line = Math.floor(cellId / model.rowsColumns);
		return line * model.rowsColumns + model.rowsColumns - 1;
	}
	else {
		const row = cellId % model.rowsColumns;
		return model.rowsColumns * model.rowsColumns - model.rowsColumns + row;
	}
}

// console.log(maxFrom(9, "h"));
// console.log(maxFrom(12, "h"));
// console.log(maxFrom(20, "h"));
// console.log(maxFrom(99, "h"));
// console.log(maxFrom(9, "v"));
// console.log(maxFrom(12, "v"));
// console.log(maxFrom(20, "v"));
// console.log(maxFrom(99, "v"));

function cellsOnWay(cellsTaken, firstCell, shipSize, mult) {
	let i = firstCell;
	while (i < firstCell + shipSize * mult) {
		console.log("\tFor cell " + firstCell);
		console.log("\tOne cellTaken : " + cellsTaken[i]);
		if (cellsTaken[i] !== undefined) {
			console.log("\ttrue");
			return true;
		}		
		i += mult;
	}
	console.log("\tfalse");
	return false;
}

function arrayOfCells() {
	let cellsTaken = {};
	let cellsDirShips = [];
	for (let ship of modelShips) {
		let direction = randomDirection();
		let firstCell = getRandomIntInclusive(0, model.rowsColumns * model.rowsColumns);

		let mult = 1;
		if (direction === "v") {
			mult = model.rowsColumns;
		}

		console.log("\n");
		console.log(cellsTaken);
		console.log(ship);
		console.log(direction);
		console.log(firstCell);
		while ((firstCell + mult * (ship.size - 1)) > maxFrom(firstCell, direction) 
			|| cellsOnWay(cellsTaken, firstCell, ship.size, mult)) {
			firstCell = getRandomIntInclusive(0, model.rowsColumns * model.rowsColumns);
		}

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

console.log(arrayOfCells());

function placeShips(cells) {
	let ships = [];
	for (let ship of modelShips) {
		ships.push(model.Ship(ship.id, ship.name, undefined, undefined));
	}
	return ships;
}

function computer(instance) {
	instance.emit(sockets.joinServerEvent, "It's me, Computer !");
	instance.emit(sockets.joinGameEvent);
	log.debug("Computer 'created' game emit");
	
	instance.on(sockets.joinedEvent, function(ids) {
		log.debug("Computer joined");
		instance.emit(sockets.readyEvent, placeShips());
	});

	instance.on(sockets.playEvent, function() {
		log.debug("Computer play");
	});

	instance.on(sockets.fireEvent, function() {
		log.debug("Computer under fire");
	});

	instance.on(sockets.shipDestroyedEvent, function() {
		log.debug("Computer lost a ship");
	} );

	instance.on(sockets.endGameEvent, function() {
		log.debug("Computer endGameEvent");
	} );
}

exports.computer = computer;
