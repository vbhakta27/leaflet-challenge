// Store our API endpoint inside url
var url1 = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
var url2 = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// Perform a GET request to the URL
d3.json(url1, function (data1) {
  // Once we get a response, send the data.features object to the createFeatures function
  var earthquakes = createFeaturesEarthquakes(data1.features)

  d3.json(url2, function (data2) {
    var tectonics = createFeaturesTectonics(data2.features)

    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes,tectonics)
  })
});

function createFeaturesTectonics(tectonicData) {
  console.log(tectonicData)

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  var tectonics = L.geoJSON(tectonicData, {
  });
  return tectonics
};



function createFeaturesEarthquakes(earthquakeData) {
  console.log(earthquakeData)

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function (geoJsonPoint, latlng) {
      return L.circleMarker(latlng, {
        fillOpacity: 0.75,
        color: "white",
        fillColor: "purple",
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
}

function createMap(earthquakes,tectonics) {

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
    zoom: 4,
    layers: [satellite, earthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
};