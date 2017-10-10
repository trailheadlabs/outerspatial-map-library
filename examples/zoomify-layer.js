window.OuterSpatial = {
  baseLayers: [{
    attribution: 'Harpers Ferry Center',
    height: 6738,
    type: 'zoomify',
    url: 'https://www.nps.gov/parkmaps/yell/img/{g}/{z}-{x}-{y}.jpg',
    width: 5069
  }],
  div: 'map'
};

(function () {
  var s = document.createElement('script');
  s.src = '{{ path }}/outerspatial-bootstrap.js';
  document.body.appendChild(s);
})();
