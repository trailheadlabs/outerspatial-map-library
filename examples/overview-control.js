var OuterSpatial = {
  div: 'map',
  overviewControl: {
    layer: 'mapbox-light'
  }
};

(function () {
  var s = document.createElement('script');
  s.src = '{{ path }}/outerspatial-bootstrap.js';
  document.body.appendChild(s);
})();
