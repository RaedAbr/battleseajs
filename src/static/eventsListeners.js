function loadListeners(cellsData) {
	// wait for player turn to play
	socket.on("play", function() {
		myTurn = true;
	});

	socket.on("fireEvent", function(event) {
		if (playerId === event.player.id) {
			d3.select("#g1" + event.cellId)
				.attr("fill", function() {
					return event.state === "missed" ? "green" : "red";
				});
		} else {
			d3.select("#g2" + event.cellId)
				.attr("fill", function() {
					return event.state === "missed" ? "green" : "red";
				});
		}
		var currentDate = new Date();
		var dateTime = currentdate.getHours() + ":"  
			+ currentdate.getMinutes() + ":" 
			+ currentdate.getSeconds();
		d3.select("#history")
			.append("p")
			.html(dateTime + " =>" + event.player.name + " " + event.state);
	});

	socket.on("shipDestroyed", function(event) {

	});

	// wait for server response after cell fire
	// socket.on("response", function(resp) {
	// 	console.log(resp);
	// 	d3.select("#g1" + resp.cellId)
	// 		.attr("fill", resp.cellColor)
	// 		.style("opacity", "1");
	// 	cellsData[resp.cellId].state = "taken";
	// 	myTurn = false;
	// });

	// socket.on("notify", function(notif) {
	// 	if (notif.code == 0) {
	// 		let cellId = notif.message;
	// 		let color = "green";
	// 		if (notif.code == 1) 
	// 			color = "red";
	// 		d3.select("#g1" + cellId)
	// 			.attr("fill", color)
	// 			.style("opacity", "1");
	// 		cellsData[resp.cellId].state = "taken";
	// 		// d3.select("#history")
	// 		myTurn = false;
	// 	} else if (notif.code == 2) {

	// 	}
	// });
}