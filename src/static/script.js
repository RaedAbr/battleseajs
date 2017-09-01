var mapW = 300,
    mapH = 500,
    z = 30,
    nb = mapW / z;

////////////////////////////map1/////////////////////////////////////////
let svg1 = map("#map1", 1);
/////////////////////////////map2//////////////////////////////////////
let svg2 = map("#map2", 2);


svg1.selectAll("rect")
	.on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut)
    .on("click", handleMouseClick);

function handleMouseOver(d) {
  // this.parentNode.appendChild(this);
  	d3.select(this).style("opacity", ".8");
}

function handleMouseOut(d) {
	d3.select(this).style("opacity", "1");
}

function handleMouseClick(d) {
	d3.select(this).style("fill", "red");
	// socket.emit('message', d);
	console.log("from client " + d);
}


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
    .on('dragend', function(d, i){
    	magnet(d, d3.select(this));
    	// if (collision(d, d3.select(this))) {
    	// 	d3.select(this)
    	// 		.attr("x", initialShipData[i].x)
    	// 		.attr("y", initialShipData[i].y)
    	// 		.attr("width", initialShipData[i].width)
    	// 		.attr("height", initialShipData[i].height);
    	// 	d.x = initialShipData[i].x;
    	// 	d.y = initialShipData[i].y;
    	// 	d.width = initialShipData[i].width;
    	// 	d.height = initialShipData[i].height;
    	// }
        console.log('drag end');
    });

let collision = function(d, object) {
	let result = shipData.filter(x => intersects(d, x));
	if (result.length != 0)
		return true;
	return false;
}

function intersects(current, other) {
	// if (current.dir == "v" && other.dir == "h") {
		console.log("x : " + current.x + ", y1 : " + current.y + ", y2 : " + current.y + current.height);
		if (current.x >= other.x && current.x <= other.x + other.width
			&& current.y <= other.y && current.y + current.height >= other.y) {
			console.log("in " + true);
			return other;
		}
	// }
	console.log("hello");
	return undefined;
}

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
	if (d.x + d.width > mapW) {
		object.attr('x', mapW - d.width);
		d.x = mapW - d.width;
	}
	if (d.y < 0) {
		object.attr('y', 0);
		d.y= 0;
	}
	if (d.y + d.height > mapW) {
		object.attr('y', mapW - d.height);
		d.y = mapW - d.height;
	}
}
    

let initialShipData = [
	{x : 10, y : 310, width : 2 * z, height : z, dir : "h", color : "maroon", img : "boat.png"},
	{x : 10, y : 342, width : 3 * z, height : z, dir : "h", color : "chartreuse"},
	{x : 10, y : 374, width : 3 * z, height : z, dir : "h", color : "darkgreen"},
	{x : 10, y : 406, width : 4 * z, height : z, dir : "h", color : "darkorange"},
	{x : 10, y : 438, width : 5 * z, height : z, dir : "h", color : "gold"}
	];

let shipData = [];
initialShipData.map(item => shipData.push({
	x : item.x, 
	y : item.y, 
	width : item.width, 
	height : item.height, 
	dir : item.dir, 
	color : item.color
}));
  
svg2.selectAll('.ship')
	.data(shipData)
	.enter()
	.append('image')
	.attr('x', function(d){ return d.x; })
	.attr('y', function(d){ return d.y; })
	.attr('width', function(d){ return d.width; }) 
	.attr('height', function(d){ return d.height; })
	// .attr('fill', function(d) { return d.color; })
	.attr("xlink:href", "static/boat.png")
	.attr("class", "ship")
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
				.attr("translate", "rotate(0)")
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
				.attr("translate", "rotate(0)")
				.attr("x", function (d) { return d.x - (d.height / 2 - d.width / 2) })
				.attr("y", function (d) { return d.y + (d.height / 2 - d.width / 2) })
				.attr("width", h)
				.attr("height", w);
			d.x = d.x - (d.height / 2 - d.width / 2);
			d.y = d.y + (d.height / 2 - d.width / 2);
			d.width = h;
			d.height = w;
			d.dir = "h";
		}
		magnet(d, d3.select(this));
    	defineLimits(d, d3.select(this));
	}