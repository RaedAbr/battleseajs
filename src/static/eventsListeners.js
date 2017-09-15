function loadListeners() {
	// wait for player turn to play
	socket.on("play", function(id) {
		myTurn = true;
		let st = playerId === id ? "State : Play! Your turn..." : "State : Wait ! Adversary's turn...";
		d3.select("#play").html(st);
	});

	socket.on("wait", function(id) {
		let st = "State : Wait ! Adversary's turn...";
		d3.select("#play").html(st);
	});

	socket.on("fireEvent", function(event) {
		function cellState() {
			return event.cellState === "missed" ? "green" : "red";
		}
		function cellFired(num) {
			if (event.cellState === "missed") {
				d3.select("#g" + num + event.cellId)
					.attr("fill", "black")
					.style("opacity", ".3");
			} else {
				d3.select("#map" + num).select("svg")
					.append("image")
					.attr("xlink:href", "static/img/pr_fire_2.gif")
					.attr("x", x)
					.attr("y", y)
					.attr("width", z)
					.attr("height", z);
			}
		}
		let x = event.cellId % 10 * z;
		let y = Math.floor(event.cellId / 10) * z;
		if (playerId === event.player.id) {
			cellFired(1);
		} else {
			cellFired(2);
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
		let st = "State : Wait ! Adversary's turn...";
		d3.select("#play").html(st);
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