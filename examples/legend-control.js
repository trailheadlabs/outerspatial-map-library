window.OuterSpatial = {
  baseLayers: [
    'outerspatial-outdoors',
    'mapbox-satellite'
  ],
  div: 'map',
  legendControl: {
    html: '' +
      '<h3>Legend</h3>' +
      '<ul>' +
        '<li>Item 1</li>' +
        '<li>Item 2</li>' +
      '</ul>' +
    ''
  }
};

(function () {
  var s = document.createElement('script');
  s.src = '{{ path }}/outerspatial-bootstrap.js';
  document.body.appendChild(s);
})();
