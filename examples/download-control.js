var NPMap = {
  div: 'map',
  downloadControl: {
    files: [{
      type: 'csv',
      url: 'data/colorado-cities.csv'
    }]
  },
  overlays: [{
    cluster: true,
    type: 'csv',
    url: 'data/colorado-cities.csv'
  }]
};

(function () {
  var s = document.createElement('script');
  s.src = '{{ path }}/npmap-bootstrap.js';
  document.body.appendChild(s);
})();
