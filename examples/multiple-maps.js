window.OuterSpatial = [{
  div: 'map-1',
  scrollWheelZoom: false
}, {
  div: 'map-2',
  scrollWheelZoom: false
}];

(function () {
  var s = document.createElement('script');
  s.src = '{{ path }}/outerspatial-bootstrap.js';
  document.body.appendChild(s);
})();
