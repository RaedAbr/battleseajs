"use strict";

function print(arg) {
	console.log(arg);
}

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

print("Test Cell");
const cell = Cell(0);
print(cell.toString());
print(cell.setState("striked").toString());

print("\nTest Ship");
const ships = [
	Ship("Carrier", 4, 8, rowsColumns),
	Ship("Battleship", 2, 32, rowsColumns),
	Ship("Cruiser", 45, 47, rowsColumns),
	Ship("Submarine", 58, 78, rowsColumns),
	Ship("Destroyer", 61, 62, rowsColumns)
];
ships.forEach(ship => print(ship.toString()));

print("\nTest Map");
const map = Map(rowsColumns, rowsColumns);
print(map.toString());

print("\nTest MapShip");
const mapShip = MapShip(rowsColumns, rowsColumns, ships);
print(mapShip.toString());

print("\nTest Player");
const player = Player("Bob", mapShip, map);
print(player.toString());