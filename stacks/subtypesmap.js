var subtypemap = (function(){

    var numberFormat = d3.format(".2f");

    var subtypeMapChart = dc.geoChoroplethChart("#subtype-map");
    var subtypeTimeChart = dc.barChart("#subtype-chart");

    d3.csv("data/hxnx_jumps.csv", function (csv) {
        var data = crossfilter(csv);

        var location = data.dimension(function (d) {
            return d.location;
        });
        var locations = location.group().reduceSum(function (d) {
            return d["proportion"];
        });
//		var locations = location.group(function(d) { return d; });
		
        var years = data.dimension(function (d) {
            return new Date(d.year);
        });
        var yearJumps = years.group().reduceSum(function (d) {
            return d["jumps"];
        });


		var projection = d3.geo.conicEqualArea()
				  .parallels([20, 60])
				  .rotate([-80, 0])
				  .center([38, 138])
				  .scale(800);

        d3.json("geo/chinese_provinces.json", function (locationsJson) {
            subtypeMapChart.width(1000)
                    .height(600)
               		.transitionDuration(0)
                    .dimension(location)
                    .group(locations)
                    .colors(d3.scale.quantize().range(["#E6F2F2", "#CCE6E6", "#B2D9D9", "#99CCCC", "#80C0C0", "#66B3B3", "#4DA6A6", "#339999", "#198D8D", "#008080"]))
                    .colorDomain([0, 1])
                    .colorCalculator(function (d) { return d ? subtypeMapChart.colors()(d) : '#ccc'; })
                    .overlayGeoJson(locationsJson.features, "location", function (d) {
                        return d.properties.name;
                    })
                    .projection(projection)
                    .title(function (d) {
                        return "Location: " + d.key + "\nJumps: ";
                    });

	
      		subtypeTimeChart.width(900)
			.transitionDuration(0)
			.height(200)
			.margins({top: 10, right: 20, bottom: 20, left: 20})
			.dimension(years)
			.group(yearJumps)
			.centerBar(true)
			.x(d3.time.scale().domain([new Date(1990, 0, 1), new Date()]))
			.round(d3.time.year.round)
			.xUnits(d3.time.years);

            dc.renderAll();
        });
    });
return subtypemap;})();
