var attribution = '<a href="https://www.mapbox.com/about/maps" target="_blank">MapBox</a>, &copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors';
var NPMap = {
  baseLayers: [{
    attribution: attribution,
    id: 'mapbox.geography-class',
    popup: {
      description: '<div style="text-align:center;"><img src="data:image/png;base64,{{flag_png}}"></div>',
      title: '{{admin}}'
    },
    tooltip: '{{admin}}',
    type: 'mapbox'
  }],
  div: 'map',
  maxZoom: 8,
  overlays: [{
    attribution: attribution,
    clickable: false,
    id: 'mapbox.va-quake-aug',
    popup: false,
    type: 'mapbox'
  }]
};

(function () {
  var s = document.createElement('script');
  s.src = '{{ path }}/npmap-bootstrap.js';
  document.body.appendChild(s);
})();
