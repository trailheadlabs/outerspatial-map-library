var OuterSpatial = {
  baseLayers: [
    'outerspatial-outdoors',
    'mapbox-satellite'
  ],
  center: {
    lat: 35.65,
    lng: -118.75
  },
  div: 'map',
  geocoderControl: true,
  overlays: [{
    locationType: 'points_of_interest',
    organizationId: 6372,
    preset: 'outerspatial',
    searchable: true
  }, {
    locationType: 'campgrounds',
    organizationId: 6372,
    preset: 'outerspatial',
    searchable: true
  }, {
    locationType: 'trailheads',
    organizationId: 6372,
    preset: 'outerspatial',
    searchable: true
  }, {
    locationType: 'trails',
    organizationId: 6372,
    preset: 'outerspatial',
    searchable: true
  }, {
    locationType: 'areas',
    organizationId: 6372,
    preset: 'outerspatial',
    searchable: true
  }],
  zoom: 7
};

(function () {
  var s = document.createElement('script');
  s.src = '{{ path }}/outerspatial-bootstrap.js';
  document.body.appendChild(s);
})();
