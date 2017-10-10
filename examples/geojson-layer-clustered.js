window.OuterSpatial = {
  center: {
    lat: 45.3058,
    lng: -116.7187
  },
  div: 'map',
  overlays: [{
    filter: function (feature) {
      return feature.properties.park === 'Yellowstone';
    },
    popup: {
      description: 'This is {{#ifCond type \'!==\' \'community\'}}not {{/ifCond}}a community.',
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
    cluster: {
      clusterIcon: '#000',
      maxClusterRadius: 70
    },
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
  }],
  zoom: 6
};

(function () {
  var s = document.createElement('script');
  s.src = '{{ path }}/outerspatial-bootstrap.js';
  document.body.appendChild(s);
})();
