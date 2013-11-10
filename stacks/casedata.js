var casedata = (function() {
	var onsetChart1 = dc.barChart("#slide1_onset-chart");
	var onsetChart2 = dc.barChart("#slide2_onset-chart");
	var provinceChart = dc.rowChart("#slide1_province-chart");
	var ageChart = dc.barChart("#slide2_age-chart");
	var genderChart = dc.rowChart("#slide2_gender-chart");
	var deathChart = dc.rowChart("#slide2_death-chart");

	dc.constants.EVENT_DELAY = 0;

	var map = L.map('slide1_map', {
    		center: [31.25, 121.4333333],
  			zoom: 5,
  			maxZoom: 8,
  			minZoom: 2  		
		});

	map.zoomControl.removeFrom(map);
	map.attributionControl.removeFrom(map);

//	L.control.scale().addTo(map);

	//var layer = new L.StamenTileLayer('toner');
	//map.addLayer(layer);

	L.tileLayer('http://{s}.tile.cloudmade.com/{key}/{styleId}/256/{z}/{x}/{y}.png', {
		key: "ffed45bc02bf40009f3d5c7e4dcf7f63",
		styleId: 44909
//		styleId: 104059
	}).addTo(map);
	
	queue()
		.defer(d3.json, "data/china.geojson")
		.defer(d3.json, "data/provinces.json")
        .defer(d3.json, "data/cities.json")
        .defer(d3.csv, "data/cases.csv")
        .await(ready);


	function ready(error, provinceOutlines, provinceData, cityData, caseData) {
		if (error) return console.log("there was an error loading the data: " + error);


	  // Various formatters.
	  var formatNumber = d3.format(",d"),
		  formatDate = d3.time.format("%Y-%m-%d"),
		  formatPrettyDate = d3.time.format("%d %b"),
		  formatMonth = d3.time.format("%b %Y");


	  var cases = [];

	  var nestByDate = d3.nest()
		  .key(function(d) { return d3.time.month(d.date); });

	  // A little coercion, since the CSV is untyped.
	  caseData.forEach(function(d, i) {
		d.index = i;
		
		if (d.onset != null) {
			d.onset = formatDate.parse(d.onset);
		}
		
		if (d.hospitalized != null) {
			d.hospitalized = formatDate.parse(d.hospitalized);
		}

		if (d.reported != null) {
			d.reported = formatDate.parse(d.reported);
		}

		if (d.death != null) {
			d.death = formatDate.parse(d.death);
			if (d.death != null) {
				d.outcome = 2;
			} else {
				d.outcome = 1;
			}
		} else {
			d.outcome = 0;
		}
		
		d.date = d.onset;
		d.dateType = "onset";

		if (d.date == null) {
			d.date = d.hospitalized;
			d.dateType = "hospitalized";
		}
		if (d.date == null) {
			d.date = d.death;
			d.dateType = "death";

			if (d.date == null || d.reported < d.date) {
				d.date = d.reported;
				d.dateType = "reported";
			}
		}

		d.age = +d.age;
		if (isNaN(d.age)) {
			d.age = null;
		}
		 
		if (d.gender == 'F') {
			d.genderCode = 1;
		} else if (d.gender == 'M') {
			d.genderCode = 2;
		} else {
			d.genderCode = 0;
		}
		
		d.cluster = (d.secondary === "TRUE" ? "secondary" : "primary");
	
		var found = false;

		if (d.city.length > 0) {
			cityData.forEach(function(city) {
				if (d.city == city.name) {
					d['city'] = city;
					found = true;
				}
			});
			if (!found) console.log("City not found: " + d.city);
		}
		if (!found) d.city = null;


		if (d.province.length > 0) {
			provinceData.forEach(function(province) {
				if (d.province == province.name) {
					d['province'] = province;
					found = true;
				}
			});
			if (!found) console.log("Province not found: " + d.province);
		}
		if (!found) d.province = null;

		found = false;

	 	if (d.date != null && d.province != null) {
			cases.push(d);
		}
	
		//console.log(d.code + ": " + d.age + ", " + d.gender + ", " + d.province + " [" + d.dateType + "], " + d.secondary + ", " + d.cluster);
	 });
  
	  var ageGroupSize = 5;

	  // Create the crossfilter for the relevant dimensions and groups.
	  var crossFilter = crossfilter(cases),
		  filteredCases = crossFilter.groupAll(),
		  allCases = crossFilter.dimension(function(d) { return d; }),
		  onsetDate = crossFilter.dimension(function(d) { return d.date; }),
		  onsetDates = onsetDate.group(d3.time.day),
		  province = crossFilter.dimension(function(d) { return d.province.name; }),
		  provinces = province.group(function(d) { return d; }),
		  gender = crossFilter.dimension(function(d) { return d.genderCode; }),
		  genders = gender.group(function(d) { return d; }),
		  death = crossFilter.dimension(function(d) { return d.outcome }),
		  deathStates = death.group(function(d) { return d; }),
		  age = crossFilter.dimension(function(d) { return d.age; }),
		  ageGroups = age.group(function(d) { return Math.floor(d / ageGroupSize) * ageGroupSize; });
		//  cluster = crossFilter.dimension(function(d) { return d.cluster; });
		//  clusterType = cluster.group(function(d) { return d; });
		
		onsetChart1.width(1280)
			.transitionDuration(0)
			.height(250)
			.margins({top: 20, right: 20, bottom: 40, left: 100})
			.dimension(onsetDate)
			.group(onsetDates)
			.centerBar(true)
			.gap(-1)
			.x(d3.time.scale().domain([new Date(2013, 0, 1), new Date()]))
			.round(d3.time.day.round)
			.xUnits(d3.time.days)
			.on("filtered", function(d) { renderAll(); });

		onsetChart2.width(1280)
			.transitionDuration(0)
			.height(250)
			.margins({top: 20, right: 20, bottom: 40, left: 100})
			.dimension(onsetDate)
			.group(onsetDates)
			.centerBar(true)
			.gap(-1)
			.x(d3.time.scale().domain([new Date(2013, 0, 1), new Date()]))
			.round(d3.time.day.round)
			.xUnits(d3.time.days)
			.on("filtered", function(d) { renderAll(); });

		provinceChart.width(380)
			.height(320)
			.transitionDuration(0)
			.margins({top: 20, right: 20, bottom: 40, left: 100})
			.group(provinces)
			.dimension(province)
			.colors(['LightSteelBlue'])
			.label(function (d) {
				return d.value + " " + d.key; 
			})
			.title(function(d) {return d.value;})
			.elasticX(false)
				.on("filtered", function() { renderAll(); })
			.xAxis().ticks(5);

		ageChart.width(300)
			.transitionDuration(0)
			.height(180)
			.margins({top: 10, right: 10, bottom: 20, left: 20})
			.dimension(age)
			.group(ageGroups)
			.centerBar(false)
			.gap(-8)
			.x(d3.scale.linear().domain([0, 100]))
			.on("filtered", function() { renderAll(); })
			.xAxis().ticks(100 / (ageGroupSize * 2));

		genderChart
			.transitionDuration(0)
			.width(180)
			.height(180)
			.margins({top: 80, right: 0, bottom: 20, left: 20})
			.group(genders)
			.dimension(gender)
					.colors(['#36648B', '#4F94CD', '#63B8FF'])
			.label(function (d){
				return d.value + " " + (d.key === 1 ? "female" : (d.key === 2 ? "male" : "unknown"));
			})
	    // (optional) whether chart should render labels, :default = true
			.title(function(d){return d.value;})
			.elasticX(false)
			.on("filtered", function() { renderAll(); })
			.xAxis().ticks(5)

		deathChart
			.transitionDuration(0)
			.width(180)
			.height(180)
			.margins({top: 103, right: 0, bottom: 20, left: 20})
			.group(deathStates)
			.dimension(death)
					.colors(['#CD9B1D', '#FFC125'])
			.label(function (d){
				return d.value + " " + (d.key === 1 ? "alive" : (d.key === 2 ? "dead" : "unknown"));
			})
			.title(function(d){return d.value;})
			.elasticX(false)
				.on("filtered", function() { renderAll(); })
			.xAxis().ticks(5);

		var minDate = new Date(2013, 1, 15);
		var selectedDate = new Date(2013, 1, 15);
		var maxDate = new Date()
		var updateInterval = 100, updateStep = 1;

        var playing = false,
            processID,
            button = d3.select("#play-button")
                           .attr("class", "playPauseButton")
                           .on("click", function() {
                                if (playing) {
                                    playing = false;
                                    clearInterval(processID);
                                } else {
                                    playing = true;
                                    processID = setInterval(function() {
                                        if (selectedDate) {
                                            selectedDate.setDate(selectedDate.getDate() + updateStep);
                                            if (selectedDate > maxDate) {
                                                selectedDate = new Date(maxDate.getTime());
                                                clearInterval(processID);
                                                playing = false;
                                                button.classed("playing", playing);
                                            }
	       									d3.select("body").selectAll("span.slide1_date-calendar").text(selectedDate.toDateString()); 
                                        } else {
                                            selectedDate = minDate;
                                        }
										onsetDate.filter(function(d) { 
											return d <= selectedDate; 
										});
										dc.redrawAll();

//										console.log([minDate, selectedDate] + " : " + onsetChart2.brush().extent());
//										onsetChart1.filter([minDate, selectedDate]);
//										onsetChart1.filter(function(d) { 
//											return d.getTime() >= minDate.getTime() && d.getTime() <= selectedDate.getTime(); 
//										});
										renderAll();
                                   }, updateInterval);
                                }

                                button.classed("playing", playing);
                           });
		
		// Render the total.
		dc.dataCount("#slide1_data-count")
			.dimension(crossFilter)
			.group(filteredCases);

		// Render the total.
		dc.dataCount("#slide2_data-count")
			.dimension(crossFilter)
			.group(filteredCases);
			
//		map.addLayer(new GeoJSONLayer());
		
		var markerLayers = L.layerGroup();		
		markerLayers.addTo(map);

		function updateMap() {		
			markerLayers.clearLayers();
		
			// Create a layer for all the cities with circles scaled by the number of cases
			provinces.all().forEach(function(province) {
				var markers = L.markerClusterGroup({ 
					maxClusterRadius: 1,
					spiderfyOnMaxZoom: true, 
					showCoverageOnHover: false, 
					zoomToBoundsOnClick: true, 
					singleMarkerMode: true,
					iconCreateFunction: function(cluster) {
						var childCount = cluster.getChildCount();

						var c = ' marker-cluster-';
						if (childCount < 10) {
							c += 'small';
						} else if (childCount < 20) {
							c += 'medium';
						} else {
							c += 'large';
						}

						return new L.DivIcon({ html: '<div><span>' + childCount + '</span></div>', className: 'marker-cluster' + c, iconSize: new L.Point(40, 40) });
    				}

					});
				
				var markerList = [];
				allCases.top(Infinity).forEach(function(d) {
					if (d.province.name == province.key) {
						var city = d.city;
						if (city != null) {
//							var title = city.name;
							var title = "<h3>" + d.city.name + ", " + d.province.name + " province<br>" + 
								(isNaN(d.age) ? "?" : d.age) + ", " + d.gender + 
								", Date: " + formatPrettyDate(d.date) + " (" + d.dateType + ")</h3>" +
								(d.FT != null && d.FT.length > 0 ? "<p><a target=\"_blank\" href=\"http://www.flutrackers.com/forum/showthread.php?t=205075\">FluTrackers case: #" + d.FT + "</a></p>" : "") + 
								"<ul>" +
								(d.onset != null ? "<li>Onset: " + formatPrettyDate(d.onset) : "</li>") + 
								(d.hospitalized != null ? "<li>Hospitalized: " + formatPrettyDate(d.hospitalized) + "</li>" : "") +
								(d.death != null ? "<li>Death: " + formatPrettyDate(d.death) + "</li>" : "") +
								(d.reported != null ? "<li>Reported: " + formatPrettyDate(d.reported) + "</li>" : "") +
								"</ul>" +
								(d.notes != null && d.notes.length > 0 ? "<p>"+d.notes+"</p>" : "");
							var marker = L.marker(L.latLng(city.coordinates[1], city.coordinates[0]), { title: title });
							marker.bindPopup(title);
							markers.addLayer(marker);
							markerList.push(marker);
						} else {
							var title = d.province.name + " Province";
							var marker = L.marker(L.latLng(d.province.coordinates[1], d.province.coordinates[0]), { title: title });
							marker.bindPopup(title);
							markers.addLayer(marker);
							markerList.push(marker);
						}			
					}	
				});
				
				markerLayers.addLayer(markers);
			});
		}
		
		renderAll();

		// Renders the specified chart or list.
		function render(method) {
			d3.select(this).call(method);
		}

		// Whenever the brush moves, re-rendering everything.
		function renderAll() {
		//	list.each(render);
			dc.renderAll();
			updateMap();
		}

		// Like d3.time.format, but faster.
		function parseDate(d) {
		return new Date(2001,
			d.substring(0, 2) - 1,
			d.substring(2, 4),
			d.substring(4, 6),
			d.substring(6, 8));
		}

		window.filter = function(filters) {
			renderAll();
		};

		window.reset = function(i) {
			renderAll();
		};

	
	} // function ready(error, cityData, caseData)
return casedata;})();
