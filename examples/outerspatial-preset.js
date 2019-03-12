window.OuterSpatial = {
  baseLayers: [
    'outerspatial-landscape',
    'outerspatial-satellite'
  ],
  center: {
    lat: 35.65,
    lng: -118.75
  },
  div: 'map',
  geocoderControl: true,
  overlays: [{
    locationType: 'points_of_interest',
    organizationId: 6465,
    popup: {
      actions: [{
        type: 'directions'
      }]
    },
    preset: 'outerspatial'
  }, {
    locationType: 'campgrounds',
    organizationId: 6465,
    preset: 'outerspatial'
  }, {
    locationType: 'trailheads',
    organizationId: 6465,
    preset: 'outerspatial'
  }, {
    locationType: 'trails',
    organizationId: 6465,
    preset: 'outerspatial'
  }, {
    locationType: 'areas',
    organizationId: 6465,
    preset: 'outerspatial'
  }],
  zoom: 7
};

(function () {
  var s = document.createElement('script');
  s.src = '{{ path }}/outerspatial-bootstrap.js';
  document.body.appendChild(s);
})();
