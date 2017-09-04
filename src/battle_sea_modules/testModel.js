const model = require("./model.js");

console.log("Test Cell");
const cell = model.Cell(42);
console.log(cell.toString());
console.log(cell.setState(model.states[1]).toString());
console.log(cell.setState(model.states[2]).toString());

console.log("\nTest Ship");
const ship = model.Ship("Cruiser", [34, 35, 36, 37]);
console.log(ship.toString());

console.log("\nTest Map");
const map = model.Map(model.rowsColumns, model.rowsColumns);
console.log(map.toString());

const ships = [ship, model.Ship("Submamodel.rine", [3, 13, 23]), model.Ship("Destroyer", [56, 57, 58])];
console.log(ships);

console.log("\nTest MapShip");
const mapShip = model.MapShip(model.rowsColumns, model.rowsColumns, ships);
console.log(mapShip.toString());

console.log("\nTest People");
const people = model.People(42, "bob");
console.log(people.toString());

console.log("\nTest Game");
const game = model.Game(56, people.id, true);
console.log(game);
console.log(game.toString());
