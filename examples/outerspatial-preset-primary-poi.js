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
    locationType: 'primary_points_of_interest',
    organizationId: 6372,
    preset: 'outerspatial',
    dockedPopup: true,
    searchable: true,
    popup: {
      actions: [{
        type: 'directions'
      }]
    }
  }, {
    locationType: 'trails',
    organizationId: 6372,
    dockedPopup: true,
    preset: 'outerspatial',
    searchable: true
  }, {
    locationType: 'areas',
    dockedPopup: true,
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
