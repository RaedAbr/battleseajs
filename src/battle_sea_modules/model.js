"use strict";

const states = ["free", "taken", "striked", "missed"];
const rowsColumns = Number(10);

// Represent a cell on the map
function Cell(id) {
	let c = {
		id: id,
		state: states[0],
		shipId: undefined,
		setState: function(s) { this.state = s; return c; },
		toString: function() {
			return "(Cell : {id: " + this.id + ", state: " + this.state + ", shipId: " + this.shipId + "})\n";
		}
	};
	return c;
}

// Represent a ship on map
function Ship(id, name, cells, dir) {
	return {
		id: id,
		name: name,
		cells: cells,
		dir: dir,
		destroyedCells: 0,
		isDestroyed: function() {
			return this.destroyedCells >= this.cells.length;
		},
		toString: function() {
			return "(Ship : {id: " + this.id + ", name: " + this.name + ", cells: " + this.cells.toString() + 
			", destroyedCells: " + this.destroyedCells + ", isDestroyed: " + this.isDestroyed() + "})\n";
		}
	};
}

// Represent a map of cells
function Map(rows, columns) {
	let cells = [];
	let i = 0;
	while (i < Number(rows * columns)) {
		cells.push(Cell(i));
		i++;
	}
	return {
		cells: cells,
		toString: function() {
			return "(Map : {cells: " + this.cells.toString() + "})";
		}
	}
}

// Represent a player
function People(id, name, ships) {
	return {
		id: id,
		name: name,
		gameId: undefined,
		map: Map(rowsColumns, rowsColumns),
		ships: ships,
		opponentId: undefined,
		status: undefined,
		destroyedShips: 0,
		hasLost: function() {
			return this.destroyedShips >= this.ships.length;
		},
		toString: function() {
			return "(People : {id: " + this.id + ", name: " + this.name + ", gameId: " + 
			this.gameId + ", map: " + this.map.toString() + ", ships: " + this.ships + 
			", opponentId: " + this.opponentId + ", status: " + this.status + 
			", hasLost: " + this.hasLost() + "})";
		}
	};
}

// Represent a game between two players
function Game(id, iDplayerOne, free) {
	return {
		id: id,
		iDplayerOne: iDplayerOne,
		iDplayerTwo: undefined,
		status: "wait",
		free: free,
		toString: function() {
			return "(Game : {id: " + this.id + ", iDplayerOne: " + this.iDplayerOne 
				+ ", iDplayerTwo: " + this.iDplayerTwo + ", status: " + this.status 
				+ ", free: " + this.free 
				+ "})"; 
		}
	};
}

exports.states = states;
exports.rowsColumns = rowsColumns;
exports.Cell = (id) => Cell(id);
exports.Ship = (id, name, cells, dir) => Ship(id, name, cells, dir);
exports.Map = (rows, columns) => Map(rows, columns);
exports.People = (id, name, ships) => People(id, name, ships);
exports.Game = (id, iDplayerOne, free) => Game(id, iDplayerOne, free);
