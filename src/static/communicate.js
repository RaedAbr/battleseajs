let sendData = function() {
	console.log("in sendData");
	let data = [];
	shipData.forEach(ship => data.push({
		name : ship.name, 
		cells : function() {
			let cellsObject = [];
			ship.cells.forEach(cell => cellsObject.push({
				id : cell
			}));
			return cellsObject;
		}()
	}));
	console.log(data);
	socket.emit("ready", JSON.stringify(data));
};