var NPMap = {
  center: {
    lat: 39.37,
    lng: -105.7
  },
  div: 'map',
  overlays: [{
    popup: {
      description: 'Zip Code: {{zip}}',
      title: '{{name}}'
    },
    styles: {
      point: {
        'marker-library': 'npmapsymbollibrary',
        'marker-size': 'small',
        'marker-symbol': 'dot-white'
      }
    },
    type: 'csv',
    url: 'data/colorado-cities.csv'
  }],
  zoom: 7
};

(function () {
  var s = document.createElement('script');
  s.src = '{{ path }}/npmap-bootstrap.js';
  document.body.appendChild(s);
})();
