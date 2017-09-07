function drawShips(data, svg) {
	let enableContextMenuEvent = true;
	let takenCells  = [];
	drag = d3.behavior.drag()
		.on("drag", function(d) {
			d.x += d3.event.dx;
			d.y += d3.event.dy;
			if (d.y + d.height <= mapW) {
				d.state =  "in";
			}
			defineLimits(d, d3.select(this));
			console.log('dragging');
		})
		.on('dragstart', function(d){
			console.log(takenCells);
			removeOldCells(d);
			console.log(takenCells);

			d.cells = [];

			// startBlink(d3.select(this));

			console.log('drag start');
		})
		.on('dragend', function(d, i){
			if (d.state == "in")
				magnet(d, d3.select(this));
				updateShipCells(d, d3.select(this));
		//	if (collision(d, d3.select(this))) {
		//		d3.select(this)
		//			.attr("x", initialShipData[i].x)
		//			.attr("y", initialShipData[i].y)
		//			.attr("width", initialShipData[i].width)
		//			.attr("height", initialShipData[i].height)
				// 	.attr("xlink:href", function(d){ return initialShipData[i].img[initialShipData[i].dir]; });
				// d.x = initialShipData[i].x;
				// d.y = initialShipData[i].y;
				// d.width = initialShipData[i].width;
				// d.height = initialShipData[i].height;
				// d.dir = initialShipData[i].dir;
		//	}
			console.log(takenCells);
			console.log('drag end');
		});

	let startBlink = function(shipView) {
		shipView.transition()
			.each("start", function repeat() {
				d3.select(this)
				.transition()
				.duration(300)
				.style("opacity", 0.3)
				.transition()
				.duration(300)
				.style("opacity", 1)
				.each("end", repeat);
			});
	};

	let stopBlink = function(shipView) {
		shipView.transition()
			.style("opacity", function() {
				return 1;
			});
	};

	// let collision = function(d, object) {
	// 	let result = shipData.filter(x => intersects(d, x));
	// 	if (result.length != 0)
	// 		return true;
	// 	return false;
	// }

	// function intersects(current, other) {
	// 	// if (current.dir == "v" && other.dir == "h") {
	// 		// if (current.x >= other.x && current.x <= other.x + other.width
	// 		// 	&& current.y <= other.y && current.y + current.height >= other.y) {
	// 		// 	return other;
	// 		// }
	// 	// }
	// 	return undefined;
	// }

	svg.selectAll('.ship')
		.data(data)
		.enter()
		.append('image')
		.attr("id", function (d) { return "ship" + d.id; })
		.attr('x', function(d) { return d.x; })
		.attr('y', function(d) { return d.y; })
		.attr('width', function(d) { return d.width; }) 
		.attr('height', function(d) { return d.height; })
		.attr("xlink:href", function(d) { return d.img[d.dir]; })
		.attr("class", "ship")
		.call(drag)
		.on('click', function() {
			console.log('clicked');
		})
		.on("contextmenu", function(d) { changeDirection(d, d3.select(this)); });

	function changeDirection(ship, object) {
		d3.event.preventDefault();
		if (enableContextMenuEvent) {
			if (ship.dir == "h") 
				ship.dir = "v";
			else
				ship.dir = "h";
			object.attr("xlink:href", ship.img[ship.dir]);
			ship.x += ship.width / 2 - ship.height / 2;
			ship.y -= ship.width / 2 - ship.height / 2;
			let aux = ship.width;
			ship.width = ship.height;
			ship.height = aux;
			object.attr("width", ship.width).attr("height", ship.height);
			magnet(ship, object);
			defineLimits(ship, object);
			updateShipCells(ship, object);
		}
	};

	let defineLimits = function (d, object) {
		if (d.state == "in") {
			if (d.x < 0) {
				d.x = 0;
			}
			if (d.x + d.width > mapW) {
				d.x = mapW - d.width;
			}
			if (d.y < 0) {
				d.y = 0;
			}
			if (d.y + d.height > mapW) {
				d.y = mapW - d.height;
			}
		}
		updateView(d, object);
	};

	let magnet = function(d, object) {
		d.x = Math.round(d.x / z) * z;
		d.y = Math.round(d.y / z) * z;
		updateView(d, object);
	};

	let updateShipCells = function(ship, object) {
		// removing old cells
		removeOldCells(ship);

		let firstShipCell = ship.x / z + ship.y / z * 10;
		ship.cells = [];
		if (ship.dir == "h") {
			d3.range(Math.floor(ship.width / z)).map(function(i) {
				ship.cells.push(firstShipCell + i);
			});
		}
		if (ship.dir == "v") {
			d3.range(Math.floor(ship.height / z)).map(function(i) {
				ship.cells.push(firstShipCell + i * 10);
			});
		}
		// adding new cells
		ship.valid = true;
		ship.cells.forEach(cell => ship.valid &= (takenCells.indexOf(cell) == -1));
		if (ship.valid) {
			ship.cells.forEach(cell => takenCells.push(cell));
			stopBlink(object);
		} else {
			ship.cells = [];
			startBlink(object);
		}

		getReady();
	};

	let removeOldCells = function(ship) {
		let oldCells = clone(ship.cells);
		oldCells.forEach(cell => takenCells.forEach(function(d, i) {
			if (cell === d) {
				takenCells.splice(i, 1);
			}
		}));
	};

	let getReady = function () {
		let unvalidShips = shipData.filter(e => !e.valid || e.valid == undefined);
		if (unvalidShips.length == 0) {
			d3.selectAll("#readyButton").remove();
			d3.select("#buttonTd")
				.append("button")
				.attr("id", "readyButton")
				.on("click", function() {
					drag.on("drag", null);
					drag.on("dragstart", null);
					drag.on("dragend", null);
					svg.selectAll('.ship').selectAll('image').on("contextmenu", null);
					sendData();
					d3.select("#buttonTd").selectAll("button").remove();
					enableContextMenuEvent = false;
				})
				.html("Ready");
		} else {
			d3.select("#buttonTd")
				.selectAll("#readyButton").remove();
		}
	};

	;(function(){
		d3.select("#buttonTd")
			.append("button")
			.html("Random")
			.attr("id", "randomButton")
			.on("click", function() {
				takenCells  = [];
				randomShipPositions(data);
				console.log(takenCells);
			});
	})();

	function randomShipPositions(data) {
		data.forEach(function(ship) {
			let rn = getRndInteger(0, 100);
			if (rn < 50) {
				changeDirection(ship, d3.select("#ship" + ship.id));
			}
			ship.x = getRndInteger(0, mapW - ship.width);
			ship.y = getRndInteger(0, mapW - ship.height);
			magnet(ship, d3.select("#ship" + ship.id));
			defineLimits(ship, d3.select("#ship" + ship.id));
			updateShipCells(ship, d3.select("#ship" + ship.id));
		});
	}
}

/*
	Function ( min : string, max : string )

	Return Type: integer

	Description: returns a random number between min and max (both included)
*/
function getRndInteger(min, max) {
	return Math.floor(Math.random() * (max - min + 1) ) + min;
}

function updateView(ship, shipView) {
	shipView.attr("x", ship.x).attr("y", ship.y);
}