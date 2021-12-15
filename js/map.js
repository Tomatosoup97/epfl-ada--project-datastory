var map = L.map('map', {
  gestureHandling: true,
}).setView([28.0, 17.8], 3);

var tiles = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
      maxZoom: 18,
      id: 'mapbox/light-v9',
      tileSize: 512,
      zoomOffset: -1,
}).addTo(map);


// control that shows state info on hover
var info = L.control();

info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info');
        this.update();
        return this._div;
};

info.update = function (props) {
        this._div.innerHTML = '<h4>Fraction of quotes from male</h4>' +  (props ?
                '<b>' + props.name + ': ' + props.male_freq + '%' : 'Hover over a state');
};

info.addTo(map);

function getCountryMaleFreq(country) {
  var PRECISION = 4

  var d = quotesFractions[country];
  if (d == undefined) {
    d = 0;
  }
  var dec = 10 ** PRECISION;
  return Math.round(d * dec) / (dec/100);
}


// get color depending on fraction of males
// TODO: change colors
function _getColor(d) {
  return d > 90 ? '#800026' :
          d > 80  ? '#BD0026' :
          d > 70  ? '#E31A1C' :
          d > 60  ? '#FC4E2A' :
          d > 50   ? '#FD8D3C' :
          d > 40   ? '#FEB24C' :
          d > 30   ? '#FED976' :
          d > 1  ? '#FFEDA0' :
                      '#FFFFFF';
}
function getColor(country) {
  return _getColor(getCountryMaleFreq(country));
}

function style(feature) {
        return {
                weight: 1,
                opacity: 1,
                color: 'white',
                fillOpacity: 0.7,
                fillColor: getColor(feature.properties.ADMIN)
        };
}

function highlightFeature(e) {
        var layer = e.target;

        layer.setStyle({
                weight: 4,
                color: '#666',
                fillOpacity: 0.7
        });

        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                layer.bringToFront();
        }

        var name = layer.feature.properties.ADMIN;
        var male_freq = getCountryMaleFreq(name);
        info.update({name, male_freq});
}

var geojson;

function resetHighlight(e) {
        geojson.resetStyle(e.target);
        info.update();
}

function zoomToFeature(e) {
        map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
        layer.on({
                mouseover: highlightFeature,
                mouseout: resetHighlight,
                click: zoomToFeature
        });
}

/* global statesData */

geojson = L.geoJson(countriesBoundaries, {
        style: style,
        onEachFeature: onEachFeature
}).addTo(map);


var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend');
        var grades = [1, 30, 40, 50, 60, 70, 80, 90];
        var labels = [];
        var from, to;

        for (var i = 0; i < grades.length; i++) {
                from = grades[i];
                to = grades[i + 1];

                labels.push(
                        '<i style="background:' + _getColor(from + 1) + '"></i> ' +
                        from + (to ? '&ndash;' + to : '+'));
        }

        div.innerHTML = labels.join('<br>');
        return div;
};

legend.addTo(map);

