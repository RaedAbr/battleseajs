let map = function(id, num, cellsData) {
	let svg = d3.select(id).append("svg")
		.attr("width", mapW)
		.attr("height", mapH);

	svg.append("image")
		.attr("href", "static/img/sea.jpg")
		.attr("width", mapW)
		.attr("height", mapW);

	svg.selectAll("rect")
		.data(cellsData)
		.enter().append("rect")
		.attr("id", function (d) {
			return "g" + num + d.id;
		})
		.attr("transform", translate)
		.attr("width", z)
		.attr("height", z)
		.attr("fill", "steelblue")
		.style("opacity", ".5");
	return svg;
}

function translate(d) {
	return "translate(" + (d.id % nb * z) + ", " + (Math.floor(d.id / nb) * z) + ")";
}

function handleMouseOver(d) {
	if (myTurn) {
		if (d.state === "free") {
			d3.select(this).style("opacity", ".2");
		}
	}
}

function handleMouseOut(d) {
	if (myTurn) {
		if (d.state === "free") {
			d3.select(this).style("opacity", ".5");
		}
	}
}

function handleMouseClick(d) {
	console.log(d);
	if (myTurn) {
		// d3.select(this).style("fill", "red");
		if (d.state === "free") {
			socket.emit("play", d.id);
			console.log("from client " + d.id);
		}
	}
}