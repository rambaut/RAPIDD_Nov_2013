    //script wrapped in a function to avoid polluting namespace
    (function() {

        var i,
            contourFile = "data/chinese_provinces.json",
            centroidFile = "data/H7N9_locations.csv"
//            tileSource = "http://{s}.tile.cloudmade.com/1a1b06b230af4efdbb989ea99e9841af/998/256/{z}/{x}/{y}.png",
              inputFiles = ["data/PB2.json",
              				"data/PB1.json",
              				"data/PA.json",
                            "data/NP.json",
                            "data/MP.json",
                            "data/NS.json"
                            ];

        var mapPanel = new pandemix.MapPanel;
        mapPanel.placePanel({target: "slide3_map", initCoords: [48, 90], initZoom: 5})
                .addLayer({layerType: pandemix.map.regionOutlineLayer, name: "Regions"})
//				.addTileLayer(tileSource)
                .loadContours(contourFile)
                .loadCentroids(centroidFile)
                .addInfoDisplay(function(d) {return "<h4>" + d.location + "</h4>" + d.treeName + " - " + d.number})
                .addLayer({layerType: pandemix.map.locationLayer, name: "Locations", displayedProperty: "location", unitRadius: 0.1, minRadius: 1, maxRadius: 5});

		$( "#map-reset" ).click(function() {
			mapPanel.getMap().setView([34, 114], 4);
		});
		$( "#show-location" ).click(function() {
			pandemix.selectTrait("location");
		});
		$( "#show-segment" ).click(function() {
			pandemix.selectTrait("Tree");
		});
		$( ".show-location" ).click(function() {
			pandemix.selectTrait("location");
		});
		$( ".show-HA" ).click(function() {
			pandemix.selectTrait("Hx");
		});
		$( ".show-NA" ).click(function() {
			pandemix.selectTrait("Nx");
		});
		$( ".show-host" ).click(function() {
			pandemix.selectTrait("host");
		});

        pandemix.panels.push(mapPanel);

        pandemix.addSearchBox({target: "#search"});
        pandemix.addColorPicker({target: "#color"});
        pandemix.addGlobalZoomButton({target: "#zoom1", zoomAmount: 1});
        pandemix.addGlobalZoomButton({target: "#zoom2", zoomAmount: 1});
        pandemix.addGlobalZoomButton({target: "#zoom3", zoomAmount: 1});
        pandemix.addGlobalZoomButton({target: "#zoom4", zoomAmount: 1});
        pandemix.addGlobalZoomButton({target: "#zoom5", zoomAmount: 1});
        pandemix.addGlobalZoomButton({target: "#zoom6", zoomAmount: 1});

        //var traitSelectionPanel = new pandemix.TraitSelectionPanel;
        //traitSelectionPanel.placePanel({target: "#traitSelection"});

        var legendPanel = new pandemix.LegendPanel;
        legendPanel.placePanel({target: "#legend"});
        var legendPanel = new pandemix.LegendPanel;
        legendPanel.placePanel({target: "#legend1"});
        var legendPanel = new pandemix.LegendPanel;
        legendPanel.placePanel({target: "#legend2"});
        var legendPanel = new pandemix.LegendPanel;
        legendPanel.placePanel({target: "#legend3"});
        var legendPanel = new pandemix.LegendPanel;
        legendPanel.placePanel({target: "#legend4"});
        var legendPanel = new pandemix.LegendPanel;
        legendPanel.placePanel({target: "#legend5"});
        var legendPanel = new pandemix.LegendPanel;
        legendPanel.placePanel({target: "#legend6"});

        var timePanel = new pandemix.TimePanel;
        timePanel.placePanel({target: "#globalTime"});
		pandemix.addPlayPauseButton({target: "#playPause", updateInterval: 200, updateStep: 10});

        pandemix.initializeCrossfilter();

		var names = ["PB2", "PB1", "PA", "NP", "MP", "NS"];
        //read each input file and draw the tree in its own div
        for (i = 0; i < inputFiles.length; i += 1) {
            var f = inputFiles[i];                

			var treePanel = new pandemix.TreePanel;
			treePanel.placePanel("#tree" + (i + 1));
			treePanel.initializePanelData({file: f, color: pandemix.getHSBColor(i, inputFiles.length)});
			
			if (i == 0) {
				mapPanel.addLayer({layerType: pandemix.map.treeLayer, treePanel: treePanel, name: names[i], color: treePanel.getColor()});
			}
        }

        mapPanel.addLayer({layerType: pandemix.map.bubbleTransLayer, name: "Bubble transitions", radius: 0.1})
                .addLayer({layerType: pandemix.map.bubbleChartLayer, name: "Bubble chart", unitRadius: 0.2});

		pandemix.when(function() {
				return pandemix.panelsLoaded("treePanel");
			}, function() {
				pandemix.selectTrait("Tree");
			}, 100);
	})();
