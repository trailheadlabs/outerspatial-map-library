var NPMap = {
  baseLayers: [
    'bing-aerialLabels'
  ],
  center: {
    lat: 41.3517117,
    lng: -108.7706916
  },
  div: 'map',
  measureControl: {
    units: {
      area: [
        'ac'
      ],
      distance: [
        'mi',
        'ft'
      ]
    }
  },
  zoom: 14
};

(function () {
  var s = document.createElement('script');
  s.src = '{{ path }}/npmap-bootstrap.js';
  document.body.appendChild(s);
})();
