let map = function(id, num) {
	let svg = d3.select(id).append("svg")
		.attr("width", mapW)
		.attr("height", mapH);

	svg.append("image")
		.attr("href", "static/img/sea.jpg")
		.attr("width", mapW)
		.attr("height", mapW);

	svg.selectAll("rect")
		.data(d3.range(nb * nb))
		.enter().append("rect")
		.attr("id", function (d) {
			return "g" + num + d;
		})
		.attr("transform", translate)
		.attr("width", z)
		.attr("height", z)
		.style("fill", "steelblue")
		.style("opacity", ".5");
	return svg;
}

function translate(d) {
	return "translate(" + (d % nb * z) + ", " + (Math.floor(d / nb) * z) + ")";
}

function handleMouseOver(d) {
	if (myTurn) {
		d3.select(this).style("opacity", ".2");
	}
}

function handleMouseOut(d) {
	// if (myTurn) {
	// 	d3.select(this).style("opacity", ".5");
	// }
}

function handleMouseClick(d) {
	console.log(myTurn);
	if (myTurn) {
		// d3.select(this).style("fill", "red");
		socket.emit("play", d);
		console.log("from client " + d);
		socket.on("response", function(resp) {
			console.log(resp);
			d3.select("g1" + resp.cellId)
				.style("fill", resp.cellColor)
				.style("opacity", "1");
			myTurn = false;
		});
	}
}