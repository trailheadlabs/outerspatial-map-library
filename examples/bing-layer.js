var OuterSpatial = {
  baseLayers: false,
  div: 'map',
  maxZoom: 13,
  overlays: [{
    layer: 'aerialWithLabels',
    maxZoom: 19,
    minZoom: 0,
    type: 'bing'
  }]
};

(function () {
  var s = document.createElement('script');
  s.src = '{{ path }}/outerspatial-bootstrap.js';
  document.body.appendChild(s);
})();
