
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