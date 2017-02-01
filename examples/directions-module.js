var OuterSpatial = {
  div: 'map',
  homeControl: {
    position: 'topright'
  },
  locateControl: {
    position: 'topright'
  },
  modules: [{
    type: 'directions',
    visible: true
  }],
  smallzoomControl: {
    position: 'topright'
  }
};

(function () {
  var s = document.createElement('script');
  s.src = '{{ path }}/outerspatial-bootstrap.js';
  document.body.appendChild(s);
})();
