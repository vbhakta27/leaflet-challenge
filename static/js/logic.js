// Store our API endpoint inside url
var url1 = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
var url2 = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// Perform a GET request to the URL for earthquake data
d3.json(url1, function (data1) {
  // Send the data.features object to the createFeaturesEarthquakes function
  var earthquakes = createFeaturesEarthquakes(data1.features)

  // Perform a GET request to the URL for tectonics data
  d3.json(url2, function (data2) {
    // Send the data.features object to the createFeaturesTectonics function
    var tectonics = createFeaturesTectonics(data2.features)

    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes, tectonics)
  })
});


function createFeaturesEarthquakes(earthquakeData) {
  console.log(earthquakeData)
  // Create a GeoJSON layer containing the features array on the earthquakeData object
  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function (geoJsonPoint, latlng) {
      return L.circleMarker(latlng, {
        fillOpacity: 0.75,
        color: "none",
        fillColor: chooseColor(geoJsonPoint.properties.mag),
        radius: geoJsonPoint.properties.mag * 4
      })
    },
    // Run the onEachFeature function once for each piece of data in the array
    // Give each feature a popup describing the place and time of the earthquake
    onEachFeature: function (feature, layer) {
      layer.bindPopup("<h3>" + feature.properties.place +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    },
  });
  return earthquakes
};

// Function that will determine the color of a circle based on the magnitude size of the earthquake
function chooseColor(magnitude) {
  if (magnitude <= 1) {
    return "#FFFF00";
  }
  else if (magnitude <= 2) {
    return "#FFCC00";
  }
  else if (magnitude <= 3) {
    return "#FF9900";
  }
  else if (magnitude <= 4) {
    return "#FF6600";
  }
  else if (magnitude <= 5) {
    return "#FF3300";
  }
  else {
    return "#990000"
  }
};


function createFeaturesTectonics(tectonicData) {
  console.log(tectonicData)
  // Create a GeoJSON layer containing the features array on the tectonicData object
  var tectonics = L.geoJSON(tectonicData, {
    color: "orange"
  });
  return tectonics
};


function createMap(earthquakes, tectonics) {

  // Define streetmap and darkmap layers
  var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  var grayscale = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Satellite": satellite,
    "Grayscale": grayscale
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
    Tectonics: tectonics
  };


  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -105.71
    ],
    zoom: 3,
    layers: [satellite, earthquakes, tectonics]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  var legend = L.control({ position: 'bottomright' });

  legend.onAdd = function (myMap) {

    var div = L.DomUtil.create('div', 'info legend'),
      grades = [0, 1, 2, 3, 4, 5],
      labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
      div.innerHTML +=
        '<i style="background:' + chooseColor(grades[i] + 1) + '"></i> ' +
        grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
  };

  legend.addTo(Mymap);
};