window.OuterSpatial = {
  baseLayers: [
    'outerspatial-landscape',
    'outerspatial-satellite'
  ],
  center: {
    lat: 45.53,
    lng: -122.49
  },
  div: 'map',
  dockedPopups: true,
  geocoderControl: true,
  overlays: [{
    cluster: true,
    locationType: 'trailheads',
    name: 'City of Portland Parks and Recreation Trailheads',
    organizationId: 6029,
    preset: 'outerspatial'
  }],
  zoom: 11
};

(function () {
  var s = document.createElement('script');
  s.src = '{{ path }}/outerspatial-bootstrap.js';
  document.body.appendChild(s);
})();
