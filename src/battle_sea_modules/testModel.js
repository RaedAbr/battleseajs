const model = require("./model.js");

function print(arg) {
	console.log(arg);
}

print(model.rowsColumns());

print("Test Cell");
const cell = model.Cell(0);
print(cell.toString());
print(cell.setState("striked").toString());

print("\nTest Ship");
const ships = [
	model.Ship("Carrier", 4, 8, model.rowsColumns()),
	model.Ship("Battleship", 2, 32, model.rowsColumns()),
	model.Ship("Cruiser", 45, 47, model.rowsColumns()),
	model.Ship("Submarine", 58, 78, model.rowsColumns()),
	model.Ship("Destroyer", 61, 62, model.rowsColumns())
];
ships.forEach(ship => print(ship.toString()));

print("\nTest Map");
const map = model.Map(model.rowsColumns(), model.rowsColumns());
print(map.toString());

print("\nTest MapShip");
const mapShip = model.MapShip(model.rowsColumns(), model.rowsColumns(), ships);
print(mapShip.toString());

print("\nTest Player");
const player = model.Player("Bob", mapShip, map);
print(player.toString());