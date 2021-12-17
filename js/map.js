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

info.update = function (name, stats) {
  if (!name) {
    this._div.innerHTML = `
      <div class="country-stats">
        <p>Hover over a country to display data</p>
      </div>
    `;
    return;
  }
  if (!stats) {
    this._div.innerHTML = `
      <div class="country-stats">
        <h3><b>${name}</b></h3>

        <p>Insufficient or no data about the country</p>
      </div>
    `;
  }
  this._div.innerHTML = `
    <div class="country-stats">
      <h3><b>${name}</b></h3>
      <table>
        <tr>
          <td>Fraction of quotes from men:</td>
          <td><span>${stats.male_frac}%</span></td>
        </tr>
        <tr>
          <td>Total quotes:</td>
          <td><span>${stats.total_quotes}</span></td>
        </tr>
        <tr>
          <td>Total citations:</td>
          <td><span>${stats.total_citations}</span></td>
        </tr>
        <tr>
          <td>Average citations for women:</td>
          <td><span>${stats.avg_citations_female}</span></td>
        </tr>
        <tr>
          <td>Average citations for men:</td>
          <td><span>${stats.avg_citations_male}</span></td>
        </tr>
        <tr>
          <td>Most popular topic:</td>
        </tr>
        <tr>
          <td><span>${stats.most_popular_topic}</span></td>
        </tr>
      </table
    <div>
`;
};

info.addTo(map);


// get color depending on fraction of males
function _getColor(d) {

  return  d > 99 ? '#03045e' :
          d > 95  ? '#023e8a' :
          d > 90  ? '#0077b6' :
          d > 80  ? '#0096c7' :
          d > 70  ? '#00b4d8' :
          d > 60   ? '#48cae4' :
          d > 55   ? '#90e0ef' :
          d > 50   ? '#ade8f4' :

          d > 45   ? '#F7CAD0' :
          d > 40   ? '#F9BEC7' :
          d > 35   ? '#FBB1BD' :
          d > 30   ? '#FF99AC' :
          d > 25   ? '#FF85A1' :
          d > 20   ? '#ff7096' :
          d > 15   ? '#ff5c8a' :
          d > 10   ? '#ff477e' :
          d >= 0  ? '#ff0a54' :
                    '#ced4da';
}
function getColor(country) {
  var country_stats = countries_stats[country]
  var d = country_stats ? country_stats.male_frac : -1;
  return _getColor(d);
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
                color: '#2b2b2b',
                fillOpacity: 0.7
        });

        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                layer.bringToFront();
        }

        var name = layer.feature.properties.ADMIN;
        info.update(name, countries_stats[name]);
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
        var grades = [0, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 70, 80, 90, 95, 99];
        var labels = [];
        var from, to;

        for (var i = 0; i < grades.length; i++) {
                from = grades[i];
                to = grades[i + 1];

                labels.push(
                        '<i style="background:' + _getColor(from + 0.1) + '"></i> ' +
                        from + (to ? '&ndash;' + to : '+'));
        }
        labels.push('<i style="background: #ced4da"></i> no data');

        div.innerHTML = labels.join('<br>');
        return div;
};

legend.addTo(map);

