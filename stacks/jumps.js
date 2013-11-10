//script wrapped in a function to avoid polluting namespace
(function() {

function truncate(str, maxLength, suffix) {
	if(str.length > maxLength) {
		str = str.substring(0, maxLength + 1); 
		str = str.substring(0, Math.min(str.length, str.lastIndexOf(" ")));
		str = str + suffix;
	}
	return str;
}

var margin = {top: 40, right: 200, bottom: 0, left: 40},
	width = 1200,
	height = 1200;

var start_year = 1995,
	end_year = 2013.5;

var c = d3.scale.category20b();

var x = d3.scale.linear()
	.range([0, width]);

var xAxis = d3.svg.axis()
	.scale(x)
	.orient("top");

var formatYears = d3.format("0000");
xAxis.tickFormat(formatYears);

var svg = d3.select("body").append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.style("margin-left", margin.left + "px")
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.json("data/hxnx_entropy.json", function(error, data) {
	if (error) return console.log("there was an error loading the data: " + error);
	x.domain([start_year, end_year]);
	var xScale = d3.scale.linear()
		.domain([start_year, end_year])
		.range([0, width]);

	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + 0 + ")")
		.call(xAxis);

	for (var j = 0; j < data.length; j++) {
		var g = svg.append("g").attr("class","journal");

		var circles = g.selectAll("circle")
			.data(data[j]['jumps'])
			.enter()
			.append("circle");

		var text = g.selectAll("text")
			.data(data[j]['jumps'])
			.enter()
			.append("text");

		var rScale = d3.scale.linear()
			.domain([0, d3.max(data[j]['jumps'], function(d) { return d[1]; })])
			.range([2, 9]);

		circles
			.attr("cx", function(d, i) { return xScale(d[0]); })
			.attr("cy", j*20+20)
			.attr("r", function(d) { return rScale(d[1]); })
			.style("fill", function(d) { return c(j); });

		text
			.attr("y", j*20+25)
			.attr("x",function(d, i) { return xScale(d[0])-5; })
			.attr("class","value")
			.text(function(d){ return d[1]; })
			.style("fill", function(d) { return c(j); })
			.style("display","none");

		g.append("text")
			.attr("y", j*20+25)
			.attr("x",width+20)
			.attr("class","label")
			.text(truncate(data[j]['name'],30,"..."))
			.style("fill", function(d) { return c(j); });
//			.on("mouseover", mouseover)
//			.on("mouseout", mouseout);
	};

	function mouseover(p) {
		var g = d3.select(this).node().parentNode;
		d3.select(g).selectAll("circle").style("display","none");
		d3.select(g).selectAll("text.value").style("display","block");
	}

	function mouseout(p) {
		var g = d3.select(this).node().parentNode;
		d3.select(g).selectAll("circle").style("display","block");
		d3.select(g).selectAll("text.value").style("display","none");
	}
});

// Flow charts
function sequence(nodes) {
  var margin = {top: 20, right: 440, bottom: 0, left: 40},
      width = 960 - margin.right,
      height = 40 - margin.top - margin.bottom,
      step = 160;

  var svg = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .style("margin", "1em 0 1em " + -margin.left + "px");

  var g = svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var node = g.selectAll(".node")
      .data(nodes)
    .enter().append("g")
      .attr("class", function(d) { return (d.type || "") + " node"; })
      .attr("transform", function(d, i) { return "translate(" + i * step + ",0)"; });

  node.append("text")
      .attr("x", 6)
      .attr("dy", ".32em")
      .text(function(d) { return d.name; })
      .each(function(d) { d.width = d.name ? this.getComputedTextLength() + 12 : 0; });

  node.insert("rect", "text")
      .attr("ry", 6)
      .attr("rx", 6)
      .attr("y", -10)
      .attr("height", 20)
      .attr("width", function(d) { return d.width; });

  var link = g.selectAll(".link")
      .data(d3.range(nodes.length - 1))
    .enter().insert("g", ".node")
      .attr("class", function(i) {
        return (nodes[i + 1].type ? "to-" + nodes[i + 1].type + " " : " ")
          + (nodes[i].type ? "from-" + nodes[i].type + " " : " ")
          + " link";
      });

  link.append("path")
      .attr("d", function(i) { return "M" + (i * step + nodes[i].width) + ",0H" + ((i + 1) * step - 11); });

  link.append("text")
      .attr("x", function(i) { return (i + .5) * step + nodes[i].width / 2; })
      .attr("y", -6)
      .style("text-anchor", "middle")
      .text(function(i) { return nodes[i].link; });

  return svg;
}

})();
