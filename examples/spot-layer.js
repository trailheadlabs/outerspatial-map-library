window.OuterSpatial = {
  baseLayers: [
    'mapbox-satelliteLabels'
  ],
  div: 'map',
  homeControl: false,
  overlays: [{
    id: '0ATnNuieqRyM7RYsOFdaHoTNOtoFy9Xq4',
    popup: {
      description: '{{dateTime}}',
      title: '{{messengerName}}'
    },
    styles: {
      point: {
        'marker-symbol': 'dog-park'
      }
    },
    type: 'spot',
    zoomToBounds: true
  }]
};

(function () {
  var s = document.createElement('script');
  s.src = '{{ path }}/outerspatial-bootstrap.js';
  document.body.appendChild(s);
})();
