window.OuterSpatial = {
  div: 'map',
  overviewControl: {
    layer: 'mapbox-outdoors'
  }
};

(function () {
  var s = document.createElement('script');
  s.src = '{{ path }}/outerspatial-bootstrap.js';
  document.body.appendChild(s);
})();
