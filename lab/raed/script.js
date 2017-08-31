let socket = io.connect('http://localhost:8080');

let gridW = 300,
    gridH = 500,
    z = 30,
    nb = gridW / z;
////////////////////////////map1/////////////////////////////////////////
let svg1 = d3.select("#map1").append("svg")
    .attr("width", gridW + 9)
    .attr("height", gridH + 9);

svg1.selectAll("rect")
    .data(d3.range(nb * nb))
    .enter().append("rect")
    .attr("id", function (d) {
      return "g1" + d;
    })
    .attr("transform", translate)
    .attr("width", z)
    .attr("height", z)
    .style("fill", "steelblue")
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut)
    .on("click", handleMouseClick);

function translate(d) {
  return "translate(" + (d % nb * z) + ", " + (Math.floor(d / nb) * z) + ")";
}

function handleMouseOver(d) {
  // this.parentNode.appendChild(this);
  	d3.select(this).style("opacity", ".8");
}

function handleMouseOut(d) {
	d3.select(this).style("opacity", "1");
}

function handleMouseClick(d) {
	d3.select(this).style("fill", "red");
	socket.emit('message', d);
	console.log("from client " + d);
}

/////////////////////////////map2//////////////////////////////////////
let svg2 = d3.select("#map2").append("svg")
    .attr("width", gridW+ 9)
    .attr("height", gridH + 9);

svg2.selectAll("rect")
    .data(d3.range(nb * nb))
    .enter().append("rect")
    .attr("id", function (d) {
      return "g2" + d;
    })
    .attr("transform", translate)
    .attr("width", z)
    .attr("height", z)
    .style("fill", "steelblue");

///////////////////////////////bateaux/////////////////////////////////////////    
let drag = d3.behavior.drag()
    .on('drag', function(d){
		d3.select(this)
			.attr('x', d.x += d3.event.dx)
			.attr('y', d.y += d3.event.dy);
    	defineLimits(d, d3.select(this));

		console.log('dragging');
    })
    .on('dragstart', function(d){
        console.log('drag start');
    })
    .on('dragend', function(d){
    	magnet(d, d3.select(this));
        console.log('drag end');
    });

let magnet = function(d, object) {
	let x0 = d.x;
	let y0 = d.y;
	object.attr('x', Math.round(x0 / z) * z)
		.attr('y', Math.round(y0 / z) * z);
	d.x = Math.round(x0 / z) * z;
	d.y = Math.round(y0 / z) * z;
}

let defineLimits = function(d, object) {
	if (d.x < 0) {
		object.attr('x', 0);
		d.x = 0;
	}
	if (d.x + d.width > gridW) {
		object.attr('x', gridW - d.width);
		d.x = gridW - d.width;
	}
	if (d.y < 0) {
		object.attr('y', 0);
		d.y= 0;
	}
	if (d.y + d.height > gridW) {
		object.attr('y', gridW - d.height);
		d.y = gridW - d.height;
	}
}
    

let data = [
	{x : 10, y : 310, width : 2 * z, height : z, dir : "h", color : "maroon", img : "boat.png"},
	{x : 10, y : 342, width : 3 * z, height : z, dir : "h", color : "chartreuse"},
	{x : 10, y : 374, width : 3 * z, height : z, dir : "h", color : "darkgreen"},
	{x : 10, y : 406, width : 4 * z, height : z, dir : "h", color : "darkorange"},
	{x : 10, y : 438, width : 5 * z, height : z, dir : "h", color : "gold"}
	];
// svg1.append('rect')
//   .attr('width', w)
//   .attr('height', h)
//   .attr('fill', '#cc99ff');
  
svg2.selectAll('.battle')
	.data(data)
	.enter()
	.append('rect')
	.attr('x', function(d){ return d.x; })
	.attr('y', function(d){ return d.y; })
	.attr('width', function(d){ return d.width; }) 
	.attr('height', function(d){ return d.height; })
	.attr('fill', function(d) { return d.color; })
	.attr("class", "battle")
	.call(drag)
	.on('click', function(){
		console.log('clicked');
	})
	.on("contextmenu", changeDirection);

function changeDirection(d) {
		d3.event.preventDefault();
		if (d.dir == "h") {
			let w = d.width;
			let h = d.height;
			d3.select(this)
				.attr("x", function (d) { return d.x + (d.width / 2 - d.height / 2) })
				.attr("y", function (d) { return d.y - (d.width / 2 - d.height / 2) })
				.attr("width", h)
				.attr("height", w);
			d.x = d.x + (d.width / 2 - d.height / 2);
			d.y = d.y - (d.width / 2 - d.height / 2);
			d.width = h;
			d.height = w;
			d.dir = "v";
		} else {
			let w = d.width;
			let h = d.height;
			d3.select(this)
				.attr("x", function (d) { return d.x - (d.width / 2 - d.height / 2) })
				.attr("y", function (d) { return d.y + (d.width / 2 - d.height / 2) })
				.attr("width", h)
				.attr("height", w);
			d.x = d.x - (d.width / 2 - d.height / 2);
			d.y = d.y + (d.width / 2 - d.height / 2);
			d.width = h;
			d.height = w;
			d.dir = "h";
		}
		magnet(d, d3.select(this));
    	defineLimits(d, d3.select(this));
    	console.log(d);
	}

// On affiche une boîte de dialogue quand le serveur nous envoie un "message"
socket.on('message', function(message) {
	console.log(message);
    d3.select("#g2" + message)
        .style("fill", "red");
});