var NPMap = {
  center: {
    lat: 45.3058,
    lng: -116.7187
  },
  div: 'map',
  overlays: [{
    attribution: 'NPMap Team',
    popup: {
      title: '{{Description}}'
    },
    tooltip: '{{Name}}',
    type: 'geojson',
    url: 'data/rectangle.geojson'
  }, {
    attribution: 'NPMap Team',
    styles: {
      'fill': '#d39800',
      'fill-opacity': 0.2,
      'stroke': '#d39800',
      'stroke-opacity': 0.8,
      'stroke-width': 3
    },
    table: 'parks',
    tooltip: 'Alpha code: {{unit_code}}',
    type: 'cartodb',
    user: 'nps'
  }, {
    attribution: 'Land Resources Division',
    popup: {
      description: 'The alpha code is {{Code}}.',
      title: '{{Name}}'
    },
    styles: {
      point: {
        'marker-color': '#609321',
        'marker-symbol': 'park'
      }
    },
    tooltip: 'Center point for {{Code}}',
    type: 'geojson',
    url: 'data/national-parks.geojson'
  }],
  zoom: 6
};

(function () {
  var s = document.createElement('script');
  s.src = '{{ path }}/npmap-bootstrap.js';
  document.body.appendChild(s);
})();
