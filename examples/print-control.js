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
    type: 'csv',
    url: 'https://nationalparkservice.github.io/data/demo/colorado_cities.csv'
  }],
  printControl: true,
  /*
  printControl: {
    url: 'print-control-test.html'
  },
  */
  zoom: 7
};

(function () {
  var s = document.createElement('script');
  s.src = '{{ path }}/npmap-bootstrap.js';
  document.body.appendChild(s);
})();
