var NPMap = {
  center: {
    lat: 42.42,
    lng: -104.71
  },
  div: 'map',
  measureControl: true,
  overlays: [{
    name: 'National Parks',
    popup: {
      title: '<a href="https://www.nps.gov/{{toLowerCase Code}}">{{Name}}</a>'
    },
    styles: function (data) {
      return {
        point: {
          'marker-size': 'small',
          'marker-symbol': data.Code.slice(0, 1).toLowerCase()
        }
      };
    },
    type: 'geojson',
    url: 'data/national-parks.geojson'
  }, {
    cluster: true,
    styles: {
      point: {
        'marker-color': '#5e9fd5',
        'marker-size': 'small'
      }
    },
    type: 'csv',
    url: 'data/colorado-cities-simplestyle.csv',
    zoomToBounds: true
  }, {
    type: 'geojson',
    url: 'data/simplestyle.geojson'
  }, {
    popup: {
      description: 'No attributes available'
    },
    styles: {
      line: {
        'stroke': '#03f',
        'stroke-opacity': 0.8,
        'stroke-width': 5
      },
      point: {
        'marker-color': '#fd9126',
        'marker-size': 'small'
      },
      polygon: {
        'fill': '#03f',
        'fill-opacity': 0.2,
        'stroke': '#000',
        'stroke-opacity': 0.8,
        'stroke-width': 8
      }
    },
    type: 'geojson',
    url: 'data/utah-vectors.geojson'
  }],
  zoom: 6
};

(function () {
  var s = document.createElement('script');
  s.src = '{{ path }}/npmap-bootstrap.js';
  document.body.appendChild(s);
})();
