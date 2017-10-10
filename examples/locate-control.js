window.OuterSpatial = {
  div: 'map',
  locateControl: true
};

(function () {
  var s = document.createElement('script');
  s.src = '{{ path }}/outerspatial-bootstrap.js';
  document.body.appendChild(s);
})();
