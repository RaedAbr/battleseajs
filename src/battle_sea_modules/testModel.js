const model = require("./model.js");

console.log("--------------------------------- Test Cell");
const cell = model.Cell(42);
console.log(cell.toString());
console.log(cell.setState(model.states[1]).toString());
console.log(cell.setState(model.states[2]).toString());

console.log("\n--------------------------------- Test Ship");
const ship = model.Ship("Cruiser", [model.Cell(34), model.Cell(35), model.Cell(36), model.Cell(37)]);
console.log(ship.toString());

console.log("\n--------------------------------- Test Map");
const map = model.Map(model.rowsColumns, model.rowsColumns);
console.log(map.toString());

console.log("\n--------------------------------- Test ships");
const ships = [
	ship,
	model.Ship("Submarine", [model.Cell(3), model.Cell(13), model.Cell(23)]),
	model.Ship("Destroyer", [model.Cell(56), model.Cell(57), model.Cell(58)])
];
console.log(ships.toString());

console.log("\n--------------------------------- Test People");
const people = model.People(42, "bob", ships);
console.log(people.toString());

console.log("\n--------------------------------- Test Game");
const game = model.Game(56, people.id, true);
console.log(game.toString());
