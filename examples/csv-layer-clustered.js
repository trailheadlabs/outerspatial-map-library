var OuterSpatial = {
  center: {
    lat: 39.37,
    lng: -105.7
  },
  div: 'map',
  overlays: [{
    cluster: true,
    popup: {
      description: 'Zip Code: {{zip}}',
      title: '{{name}}'
    },
    type: 'csv',
    url: 'data/colorado-cities.csv'
  }],
  zoom: 7
};

(function () {
  var s = document.createElement('script');
  s.src = '{{ path }}/outerspatial-bootstrap.js';
  document.body.appendChild(s);
})();
