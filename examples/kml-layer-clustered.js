var OuterSpatial = {
  div: 'map',
  overlays: [{
    cluster: true,
    popup: {
      title: '{{alphacode}}'
    },
    type: 'kml',
    url: 'data/national-parks.kml'
  }, {
    cluster: true,
    popup: {
      title: '{{name}}'
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
