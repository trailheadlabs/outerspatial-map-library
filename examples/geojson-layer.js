var NPMap = {
  div: 'map',
  overlays: [{
    filter: function (feature) {
      return feature.properties.park === 'Yellowstone';
    },
    popup: {
      title: '{{name}}'
    },
    styles: {
      point: {
        'marker-symbol': 'star'
      }
    },
    type: 'geojson',
    url: 'data/gateway-points-of-interest.geojson'
  }, {
    popup: {
      description: 'The alpha code is {{Code}}',
      title: '{{Name}}'
    },
    styles: {
      point: {
        'marker-color': '#609321',
        'marker-symbol': 'park'
      }
    },
    type: 'geojson',
    url: 'data/national-parks.geojson'
  }]
};

(function () {
  var s = document.createElement('script');
  s.src = '{{ path }}/npmap-bootstrap.js';
  document.body.appendChild(s);
})();
