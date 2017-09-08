"use strict";

let sendData = function() {
	console.log("in sendData");
	let data = [];
	shipsData.forEach(ship => data.push({
		id: ship.id,
		name : ship.name, 
		cells : ship.cells,
		dir: ship.dir
	}));
	console.log(data);
	socket.emit("ready", JSON.stringify(data));
};