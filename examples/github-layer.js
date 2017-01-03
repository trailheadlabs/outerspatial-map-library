var NPMap = {
  center: {
    lat: 37.82551432799189,
    lng: -119.57931518554688
  },
  div: 'map',
  overlays: [{
    attribution: 'Land Resources Division',
    branch: 'gh-pages',
    path: 'base_data/boundaries/parks/yose.topojson',
    popup: {
      title: 'Yosemite National Park'
    },
    repo: 'data',
    style: 'parks',
    type: 'github',
    user: 'nationalparkservice'
  }],
  zoom: 10
};

(function () {
  var s = document.createElement('script');
  s.src = '{{ path }}/npmap-bootstrap.js';
  document.body.appendChild(s);
})();
