
let map = function(id, num) {
    let svg = d3.select(id).append("svg")
        .attr("width", mapW + 9)
        .attr("height", mapH + 9);

    svg.selectAll("rect")
        .data(d3.range(nb * nb))
        .enter().append("rect")
        .attr("id", function (d) {
            return "g" + num + d;
        })
        .attr("transform", translate)
        .attr("width", z)
        .attr("height", z)
        .style("fill", "steelblue");
    return svg;
}

function translate(d) {
  return "translate(" + (d % nb * z) + ", " + (Math.floor(d / nb) * z) + ")";
}