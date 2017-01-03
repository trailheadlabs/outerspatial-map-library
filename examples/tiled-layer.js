var NPMap = {
  baseLayers: false,
  div: 'map',
  maxZoom: 13,
  overlays: [{
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://cartodb.com/attributions">CartoDB</a>',
    icon: 'street',
    name: 'CartoDB Dark Matter',
    retinaId: '@2x',
    type: 'tiled',
    url: 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}{{retina}}.png'
  }]
};

(function () {
  var s = document.createElement('script');
  s.src = '{{ path }}/npmap-bootstrap.js';
  document.body.appendChild(s);
})();
