function clickListener() {

    let filter = document.getElementById('earthquake_filter').value;
  
    // STEP 0: GET THE DATA
  
    // Store our API endpoint as queryUrl.
    let queryUrl = `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_${filter}.geojson`;
    let url2 = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";
  
    // nuke map
    d3.select("#map_container").html("");
    d3.select("#map_container").html("<div id='map'></div>");
  
    // Perform a GET request to the query URL.
    d3.json(queryUrl).then(function (data) {
  
      d3.json(url2).then(function (data2) {
        createMap(data, data2);
      });
    });
  }
  
  // Helper Function
  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>${feature.properties.title}</h3><hr><p>${new Date(feature.properties.time)}</p><hr><p>Mag: ${feature.properties.mag}, Depth: ${feature.geometry.coordinates[2]}</p>`);
  }
  
  
  // A function to determine the marker size based on the magnitude
  function markerSize(magnitude) {
    let radius = magnitude * 20000;
  
    if (magnitude === 0) {
      radius = 40;
    }
    return radius;
  }
  
  function markerColor(depth) {
    let color = "#A0D468";
    if (depth >= 90) {
      color = "#DA4453";
    } else if (depth >= 70) {
      color = "#E9573F";
    } else if (depth >= 50) {
      color = "#F6BB42";
    } else if (depth >= 30) {
      color = "#FFCE54";
    } else if (depth >= 10) {
      color = "#8CC152";
    } else {
      color = "#A0D468";
    }
    return color;
  }
  
  
  // createMap() takes the earthquake data and incorporates it into the visualization:
  
  function createMap(data, data2) {
  
    // STEP 1: CREATE THE BASE LAYERS
  
    // Create the base layers.
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })
  
    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    let sat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
        maxZoom: 20,
        subdomains:['mt0','mt1','mt2','mt3']
    });
  
    // STEP 2: CREATE THE OVERLAY LAYERS
  
    // Create an overlays object.
    let earthquakeLayer = L.geoJSON(data.features, {
      onEachFeature: onEachFeature
    });
  
    let tectonicLayer = L.geoJSON(data2, { color: "#D19C1D", weight: 3 });
  
    let earthquakeCircles = [];
    // Loop through each earthquake.
    for (let i = 0; i < data.features.length; i++) {
      let earthquake = data.features[i];
  
      let location = [earthquake.geometry.coordinates[1], earthquake.geometry.coordinates[0]];
  
      // Set the marker radius for the state by passing the population to the markerSize() function.
      let earthquakeCircle = L.circle(location, {
        stroke: false,
        fillOpacity: 0.85,
        color: markerColor(earthquake.geometry.coordinates[2]),
        weight: 9,
        fillColor: markerColor(earthquake.geometry.coordinates[2]),
        radius: markerSize(earthquake.properties.mag)
      }).bindPopup(`<h3>${earthquake.properties.title}</h3><hr><p>${new Date(earthquake.properties.time)}</p><hr><p>Mag: ${earthquake.properties.mag}, Depth: ${earthquake.geometry.coordinates[2]}</p>`);
  
      earthquakeCircles.push(earthquakeCircle);
    }
  
    let circleLayer = L.layerGroup(earthquakeCircles);
  
  
    // STEP 3: Build the Layer Controls
  
    // Create a baseMaps object.
    let baseMaps = {
      "Street": street,
      "Topographic": topo,
      "Satellite": sat
    };
  
    let overlayMaps = {
      "Earthquake Markers": earthquakeLayer,
      "Earthquake Circles": circleLayer,
      "Tectonic Plates": tectonicLayer
    };
  
    // STEP 4: Init the Map
  
    // Create a new map.
    // Edit the code to add the earthquake data to the layers.
    let myMap = L.map("map", {
      center: [37.09, -95.71],
      zoom: 5,
      layers: [street, circleLayer, tectonicLayer]
    });
  
    // STEP 5: Add the Layer Controls/Legend to the map
    // Create a layer control that contains our baseMaps.
    // Be sure to add an overlay Layer that contains the earthquake GeoJSON.
    L.control.layers(baseMaps, overlayMaps).addTo(myMap);
  
    // STEP 6: Add the LEGEND
    let legend = L.control({
      position: "bottomright"
    });
  
    // Then add all the details for the legend
    legend.onAdd = function () {
      let div = L.DomUtil.create("div", "info legend");
      div.innerHTML += "<div><b>Legend</b></div>";
  
      div.innerHTML += "<i style='background: #8CC152'></i> 0 - 10<br>";
      div.innerHTML += "<i style='background: #FFCE54'></i> 10 - 30<br>";
      div.innerHTML += "<i style='background: #F6BB42'></i> 30 - 50<br>";
      div.innerHTML += "<i style='background: #E9573F'></i> 50 - 70<br>";
      div.innerHTML += "<i style='background: #DA4453'></i> 70 - 90<br>";
      div.innerHTML += "<i style='background: #ea2c2c'></i> 90+";
  
      return div
    }
  
    // Add the legend to the map.
    legend.addTo(myMap);
  }
  
  // on page load
  clickListener();
  