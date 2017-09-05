function drawShips(data, svg) {
	let filledCells  = [];
	let drag = d3.behavior.drag()
		.on("drag", function(d) {
			d.x += d3.event.dx;
			d.y += d3.event.dy;
			if (d.y + d.height <= mapW) {
				d.state =  "in";
			}
			defineLimits(d, d3.select(this));
			d3.select(this)
				.attr("x", d.x).attr("y", d.y);
			console.log('dragging');
		})
		.on('dragstart', function(d){
			removeOldCells(d);

			d.cells = [];

			startBlink(d3.select(this));

			console.log('drag start');
		})
		.on('dragend', function(d, i){
			if (d.state == "in")
				magnet(d, d3.select(this));
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
			console.log('drag end');
		});

	let removeOldCells = function(ship) {
		oldCells = clone(ship.cells);
		oldCells.forEach(cell => filledCells.forEach(function(d, i) {
			if (cell == d) {
				filledCells.splice(i, 1);
			}
		}));
	};

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
		.on("contextmenu", changeDirection);

	function changeDirection(d) {
		d3.event.preventDefault();
		if (d.dir == "h") 
			d.dir = "v";
		else
			d.dir = "h";
		d3.select(this)
			.attr("xlink:href", function(d){ return d.img[d.dir]; });
		d.x += d.width / 2 - d.height / 2;
		d.y -= d.width / 2 - d.height / 2;
		let aux = d.width;
		d.width = d.height;
		d.height = aux;
		d3.select(this)
			.attr("width", d.width)
			.attr("height", d.height);
		defineLimits(d, d3.select(this));
		magnet(d, d3.select(this));
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
	};

	let magnet = function(d, object) {
		d.x = Math.round(d.x / z) * z;
		d.y = Math.round(d.y / z) * z;
		object.attr("x", d.x).attr("y", d.y);

		// filledCells .push(d.x / z + d.y / z * 10);
		updateShipCells(d, object);
	};

	let updateShipCells = function(ship, object) {
		// removing old cells
		removeOldCells(ship);

		let firstCell = ship.x / z + ship.y / z * 10;
		ship.cells = [];
		if (ship.dir == "h") {
			d3.range(ship.width / z).map(function(i) {
				ship.cells.push(firstCell + i);
			});
		}
		if (ship.dir == "v") {
			d3.range(ship.height / z).map(function(i) {
				ship.cells.push(firstCell + i * 10);
			});
		}
		// adding new cells
		ship.valid = true;
		ship.cells.forEach(cell => ship.valid &= (filledCells.indexOf(cell) == -1));
		if (ship.valid) {
			ship.cells.forEach(cell => filledCells.push(cell));

			object.transition()
				.style("opacity", function() {
					return 1;
				});
		} else {
			ship.cells = [];
			startBlink(object);
		}

		getReady();
	};

	let getReady = function () {
		let unvalidShips = shipData.filter(e => !e.valid || e.valid == undefined);
		if (unvalidShips.length == 0) {
			d3.select("#buttonTd")
				.selectAll("button").remove();
			d3.select("#buttonTd")
				.append("button")
				.attr("id", "readyButton")
				.on("click", function() {
					sendData();
					d3.select(this).remove();
				})
				.append("text")
				.text("Ready");
		} else {
			d3.select("#buttonTd")
				.selectAll("button").remove();
		}
	};
}