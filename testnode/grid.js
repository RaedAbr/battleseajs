var w = 500,
    h = 500,
    z = 50,
    nb = w / z;

var svg = d3.select("body").append("svg")
    .attr("width", w + 9)
    .attr("height", h + 9);

svg.selectAll("rect")
    .data(d3.range(nb * nb))
  .enter().append("rect")
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