"use strict";

const states = ["free", "striked", "missed"];
const rowsColumns = Number(10);

// Represent a cell on the map
function Cell(id) {
	let state = states[0];
	let c = {
		getId: () => id, // idem to function() { return id; }
		getState: () => state,
		setState: function(s) { state = s; return c; },
		toString: function() {
			return "[Cell " + this.getId() + ", " + this.getState() + "]";
		}
	};
	return c;
}

// Represent a ship on map
function Ship(name, startCell, endCell, rowsCols) {
	return {
		getName: () => name,
		getStartCell: () => startCell,
		getEndCell: () => endCell,
		getCellsNumber: function() {
			let size = Number(Math.abs(endCell - startCell));
			if (size < Number(rowsCols)) {
				return size + 1;
			}
			else {
				return size / 10 + 1;
			}
		},
		toString: function() {
			return "[Ship : " + name + " with " + this.getCellsNumber() + 
			" cells, in position (" + startCell + ", " + endCell + ")]";
		}
	}
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
		getCells: () => cells,
		toString: function() {
			return "[Map : " + cells.toString() + "]";
		}
	}
}

// Represent a map of cells (with ships)
function MapShip(rows, columns, ships) {
	let m = Map(rows, columns);
	m.ships = ships;
	m.toString = function() {
		return "[Map : \n\tShips : " + ships.toString() + "\n\tCells : " + this.getCells().toString() + "]";
	}
	return m;
}

// Represent a player with his name, his map and the opponent's map
function Player(name, ownMap, opponentMap) {
	return {
		getName: () => name,
		getOwnMap: () => ownMap,
		getOpponentMap: () => opponentMap,
		toString: function() {
			return "Player : " + name + ", \nownMap : " + ownMap.toString() + ", \nopponentMap : " 
			+ opponentMap.toString();
		}
	};
}

exports.states = () => states;
exports.rowsColumns = () => rowsColumns;
exports.Cell = (id) => Cell(id);
exports.Ship = (name, startCell, endCell, rowsCols) => Ship(name, startCell, endCell, rowsCols);
exports.Map = (rows, columns) => Map(rows, columns);
exports.MapShip = (rows, columns, ships) => MapShip(rows, columns, ships);
exports.Player = (name, ownMap, opponentMap) => Player(name, ownMap, opponentMap);

