var OuterSpatial = {
  baseLayers: [
    'outerspatial-landscape',
    'outerspatial-satellite'
  ],
  center: {
    lat: 45.53,
    lng: -122.49
  },
  div: 'map',
  geocoderControl: true,
  overlays: [{
    'locationType': 'trailheads',
    'organizationId': 6029,
    'preset': 'outerspatial',
    'cluster': true,
    'searchable': true,
    'name': 'City of Portland Parks and Recreation Trailheads',
    'styles': {
      'point': {
        'marker-library': 'outerspatialsymbollibrary',
        'marker-symbol': 'trailhead-white',
        'marker-color': '#32557d',
        'marker-size': 'medium'
      }
    }
  }],
  zoom: 11
};

(function () {
  var s = document.createElement('script');
  s.src = '{{ path }}/outerspatial-bootstrap.js';
  document.body.appendChild(s);
})();
