var playerId = undefined;
let mapW = 300,
	mapH = 500,
	z = 30,
	nb = mapW / z;

let myTurn = false;

let clone = function(o) {
	return JSON.parse(JSON.stringify(o));
};

let cellsData = [];
d3.range(nb * nb)
	.forEach(i => cellsData.push({
		id : i,
		state : "free"
	}));

let shipsData = [
	{x : 10, y : 310, size : 2, width : 2 * z, height : z, dir : "h", img : {"h" : "static/img/CruiserH.png", "v" : "static/img/CruiserV.png"}, cells : [], state : "out", valid : undefined, id : 0, name : "Cruiser"},
	{x : 10, y : 342, size : 3, width : 3 * z, height : z, dir : "h", img : {"h" : "static/img/Submarine1H.png", "v" : "static/img/Submarine1V.png"}, cells : [], state : "out", valid : undefined, id : 1, name : "Submarine1"},
	{x : 10, y : 374, size : 3, width : 3 * z, height : z, dir : "h", img : {"h" : "static/img/Submarine2H.png", "v" : "static/img/Submarine2V.png"}, cells : [], state : "out", valid : undefined, id : 2, name : "Submarine2"},
	{x : 10, y : 406, size : 4, width : 4 * z, height : z, dir : "h", img : {"h" : "static/img/DestroyerH.png", "v" : "static/img/DestroyerV.png"}, cells : [], state : "out", valid : undefined, id : 3, name : "Destroyer"},
	{x : 10, y : 438, size : 5, width : 5 * z, height : z, dir : "h", img : {"h" : "static/img/BattleshipH.png", "v" : "static/img/BattleshipV.png"}, cells : [], state : "out", valid : undefined, id : 4, name : "Battleship"}
];

function load(gamePlayerId) {
	playerId = gamePlayerId;
	////////////////////////////map1/////////////////////////////////////////
	let svg1 = map("#map1", 1, cellsData);

	svg1.selectAll("rect")
		.on("mouseover", handleMouseOver)
		.on("mouseout", handleMouseOut)
		.on("click", handleMouseClick);

	/////////////////////////////map2//////////////////////////////////////
	let svg2 = map("#map2", 2, cellsData);

	drawShips(svg2);

	loadListeners();
}
