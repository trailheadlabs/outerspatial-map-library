var OuterSpatial = {
  div: 'map',
  baseLayers: [{
    attribution: 'Esri',
    clickable: false,
    tiled: true,
    type: 'arcgisserver',
    url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'
  }],
  overlays: [{
    attribution: 'Land Resources Division',
    name: 'National Parks',
    type: 'geojson',
    url: 'https://outerspatial-utilities.herokuapp.com/arcgis2geojson/?url=https://mapservices.nps.gov/arcgis/rest/services/LandResourcesDivisionTractAndBoundaryService/MapServer/1'
  }, {
    attribution: 'Great Smoky Mountains National Park',
    name: 'Restrooms',
    styles: {
      point: {
        'marker-library': 'outerspatialsymbollibrary',
        'marker-symbol': 'restrooms-white'
      }
    },
    type: 'geojson',
    url: 'https://services1.arcgis.com/fBc8EJBxQRMcHlei/ArcGIS/rest/services/GRSM_RESTROOMS/FeatureServer/0/query?f=geojson&outSR=4326&where=OBJECTID+IS+NOT+NULL'
  }, {
    attribution: 'Esri',
    layers: '2',
    name: 'National Parks',
    opacity: 0.5,
    popup: {
      description: {
        fields: [
          'PARKNAME',
          'UNIT_TYPE'
        ],
        format: 'table'
      },
      title: '{{PARKNAME}}'
    },
    tiled: false,
    type: 'arcgisserver',
    url: 'https://mapservices.nps.gov/arcgis/rest/services/LandResourcesDivisionTractAndBoundaryService/MapServer'
  }, {
    attribution: 'Esri',
    name: 'Hurricanes',
    layers: '0,1',
    opacity: 1,
    popup: {
      actions: '<ul><li><a href="#" onclick="window.alert(\'Clicked!\');return false;">Click Me</a></li></ul>',
      description: function (data) {
        var html = '<table><tbody>';

        if (typeof data.CAT === 'undefined') {
          html += '' +
            '<tr><td>Stage</td><td>{{STAGE}}</td></tr>' +
            '<tr><td>Day</td><td>{{DAY}}</td></tr>' +
            '<tr><td>Time</td><td>{{TIME}}</td></tr>' +
            '<tr><td>Pressure</td><td>{{PRESSURE}}</td></tr>' +
            '<tr><td>Wind Speed (Knots)</td><td>{{WINDSPEED}}</td></tr>' +
          '';
        } else {
          html += '' +
            '<tr><td>Category</td><td>{{CAT}}</td></tr>' +
            '<tr><td>Date</td><td>{{Date_date}}</td></tr>' +
            '<tr><td>Start Time</td><td>{{Time}}</td></tr>' +
            '<tr><td>End Time</td><td>{{EndTime}}</td></tr>' +
            '<tr><td>Wind Speed (Knots)</td><td>{{WIND_KTS}}</td></tr>' +
          '';
        }

        return html + '</tbody></table>';
      },
      title: function (data) {
        if (typeof data.CAT === 'undefined') {
          return data.EVENTID;
        } else {
          return data.NAME;
        }
      }
    },
    tiled: false,
    type: 'arcgisserver',
    url: 'https://sampleserver6.arcgisonline.com/arcgis/rest/services/Hurricanes/MapServer'
  }]
};

(function () {
  var s = document.createElement('script');
  s.src = '{{ path }}/outerspatial-bootstrap.js';
  document.body.appendChild(s);
})();
