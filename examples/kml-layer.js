window.OuterSpatial = {
  div: 'map',
  overlays: [{
    popup: {
      title: '{{alphacode}}'
    },
    type: 'kml',
    url: 'data/national-parks.kml'
  }, {
    popup: {
      title: '{{name}}'
    },
    styles: {
      point: {
        'marker-color': '#d59d0e'
      }
    },
    type: 'kml',
    url: 'data/dc.kml'
  }]
};

(function () {
  var s = document.createElement('script');
  s.src = '{{ path }}/outerspatial-bootstrap.js';
  document.body.appendChild(s);
})();
