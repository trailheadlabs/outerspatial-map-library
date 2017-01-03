var NPMap = {
  div: 'map',
  overviewControl: {
    layer: 'mapbox-light'
  }
};

(function () {
  var s = document.createElement('script');
  s.src = '{{ path }}/npmap-bootstrap.js';
  document.body.appendChild(s);
})();
