"use strict";

const states = ["free", "striked", "missed"];
const rowsColumns = Number(10);

// Represent a cell on the map
function Cell(id) {
	// let state = states[0];
	let c = {
		id: id,
		state: states[0],
		setState: function(s) { this.state = s; return c; },
		toString: function() {
			return "(Cell : {id: " + this.id + ", state: " + this.state + "})";
		}
	};
	return c;
}

// Represent a ship on map
function Ship(name, cells) {
	return {
		name: name,
		cells: cells,
		toString: function() {
			return "(Ship : {name: " + this.name + ", cells: " + this.cells + "})";
		}
	};
}

// Represent a map of cells (without ships)
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

// Represent a map of cells (with ships)
function MapShip(rows, columns, ships) {
	let m = Map(rows, columns);
	m.ships = ships;
	m.toString = function() {
		return "(MapShip : {Ships : " + ships.toString() + ", Cells : " + this.cells.toString() + "})";
	}
	return m;
}

// Represent a player or a viewer
function People(id, name) {
	return {
		id: id,
		name: name,
		toString: function() {
			return "(People : {id: " + this.id + ", name: " + this.name + "})";
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
		viewers: [],
		toString: function() {
			return "(Game : {id: " + this.id + ", iDplayerOne: " + this.iDplayerOne 
				+ ", iDplayerTwo: " + this.iDplayerTwo + ", status:" + this.status 
				+ ", free: " + this.free 
				+ "})"; 
		}
	};
}

exports.states = states;
exports.rowsColumns = rowsColumns;
exports.Cell = (id) => Cell(id);
exports.Ship = (name, cells) => Ship(name, cells);
exports.Map = (rows, columns) => Map(rows, columns);
exports.MapShip = (rows, columns, ships) => MapShip(rows, columns, ships);
exports.People = (id, name) => People(id, name);
exports.Game = (id, iDplayerOne, free) => Game(id, iDplayerOne, free);
