function loadListeners() {
	// wait for player turn to play
	socket.on("play", function() {
		myTurn = true;
	});


	socket.on("fireEvent", function(event) {
		if (playerId === event.player.id) {
			d3.select("#g1" + event.cellId)
				.attr("fill", function() {
					return event.cellState === "missed" ? "green" : "red";
				})
				.style("opacity", 1);
		} else {
			d3.select("#g2" + event.cellId)
				.attr("fill", function() {
					return event.cellState === "missed" ? "green" : "red";
				})
				.style("opacity", 1);
		}
		var currentdate = new Date();
		var dateTime = currentdate.getHours() + ":"  
			+ currentdate.getMinutes() + ":" 
			+ currentdate.getSeconds();
		d3.select("#historyRow")
			.append("tr")
			.append("td")
			.html(dateTime + " : " + event.player.name + " => " + event.cellState + " cell")
			.attr("class", function() {
				return event.cellState === "missed" ? "d-block bg-secondary text-white" : "d-block bg-warning text-white";
			});
		myTurn = false;
		var box = document.getElementById('historyDiv');
			box.scrollTop = box.scrollHeight;
	});

	socket.on("shipDestroyed", function(event) {
		if (playerId === event.player.id) {
			let x = event.ship.cells[0].id % 10 * z;
			let y = Math.floor(event.ship.cells[0].id / 10) * z;
			let width = event.ship.dir === "h" ? event.ship.cells.length * z : z;
			let height = event.ship.dir === "h" ? z : event.ship.cells.length * z;
			let imageSrc = event.ship.dir === "h" ? event.ship.name + "H.png" : event.ship.name + "V.png";
			d3.select("#map1").select("svg")
				.append("image")
				.attr('x', x)
				.attr('y', y)
				.attr('width', width) 
				.attr('height', height)
				.attr("xlink:href", "static/img/" + imageSrc)
				.style("opacity", .7);
		}
		var currentdate = new Date();
		var dateTime = currentdate.getHours() + ":"  
			+ currentdate.getMinutes() + ":" 
			+ currentdate.getSeconds();
		d3.select("#historyRow")
			.append("tr")
			.append("td")
			.html(dateTime + " : \"" + event.player.name + "\" destroy " + event.ship.name)
			.attr("class", "d-block bg-danger text-white");

		var box = document.getElementById('historyDiv');
			box.scrollTop = box.scrollHeight;
	});

	socket.on("endGame", function(event) {
		let st = event.playerWin.id === playerId ? "You win!" : "You loose!";
		d3.select("#endGameModalLabel").html(st);
		st = event.playerWin.id === playerId ? "Player \"" + event.playerLoose.name + "\" loose." : "Player \"" + event.playerWin.name + "\" win."
		d3.select("#endGameModalBody").html(st);
		let color = event.playerWin.id === playerId ? "bg-success text-white" : "bg-danger text-white";
		d3.select(".modal-header").classed(color, true);
		d3.select("#closeModalButton").classed(color, true);
		$('#endGamePopUp').modal();
	});
}