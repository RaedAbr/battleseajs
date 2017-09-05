let mapW = 300,
	mapH = 500,
	z = 30,
	nb = mapW / z;

let myTurn = false;

let clone = function(o) {
	return JSON.parse(JSON.stringify(o));
};

let shipData = [
	{x : 10, y : 310, width : 2 * z, height : z, dir : "h", img : {"h" : "static/img/ship1h.png", "v" : "static/img/ship1v.png"}, cells : [], state : "out", valid : undefined, name : "Cruiser"},
	{x : 10, y : 342, width : 3 * z, height : z, dir : "h", img : {"h" : "static/img/ship2h.png", "v" : "static/img/ship2v.png"}, cells : [], state : "out", valid : undefined, name : "Submarine1"},
	{x : 10, y : 374, width : 3 * z, height : z, dir : "h", img : {"h" : "static/img/ship2h.png", "v" : "static/img/ship2v.png"}, cells : [], state : "out", valid : undefined, name : "Submarine2"},
	{x : 10, y : 406, width : 4 * z, height : z, dir : "h", img : {"h" : "static/img/ship3h.png", "v" : "static/img/ship3v.png"}, cells : [], state : "out", valid : undefined, name : "Destroyer"},
	{x : 10, y : 438, width : 5 * z, height : z, dir : "h", img : {"h" : "static/img/ship4h.png", "v" : "static/img/ship4v.png"}, cells : [], state : "out", valid : undefined, name : "Battleship"}
];

function load() {
	////////////////////////////map1/////////////////////////////////////////
	let svg1 = map("#map1", 1);

	svg1.selectAll("rect")
		.on("mouseover", handleMouseOver)
		.on("mouseout", handleMouseOut)
		.on("click", handleMouseClick);

	/////////////////////////////map2//////////////////////////////////////
	let svg2 = map("#map2", 2);

	let initialShipData = clone(shipData);

	drawShips(shipData, svg2);
}
