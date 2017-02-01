var OuterSpatial = {
  center: {
    lat: 44.599,
    lng: -110.554
  },
  baseLayers: [
    'mapbox-outdoors',
    'mapbox-satellite'
  ],
  div: 'map',
  hashControl: true,
  overlays: [{
    preset: 'nps-places-pois',
    unitCodes: [
      'yell'
    ]
  }],
  zoom: 9
};

(function () {
  var s = document.createElement('script');
  s.src = '{{ path }}/outerspatial-bootstrap.js';
  document.body.appendChild(s);
})();
