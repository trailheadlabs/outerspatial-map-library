var NPMap = {
  center: {
    lat: 44.32,
    lng: -110.42
  },
  div: 'map',
  hooks: {
    init: function (callback) {
      var bounds = NPMap.config.L.getBounds();

      window.L.npmap.layer.geojson({
        attribution: '<a href="https://www.mapillary.com">Mapillary</a>',
        popup: {
          description: '<img src="https://d1cuyjsrcm0gby.cloudfront.net/{{key}}/thumb-320.jpg" style="height:240px;width:320px;">'
        },
        url: 'https://a.mapillary.com/v2/search/im/geojson?client_id=REVmc0hVYk13NF82NDlGcDQ3VVI2Zzo1ZjljYTA2MTQ4NWI2ZjEx&max_lat=' + bounds.getNorth() + '&max_lon=' + bounds.getEast() + '&min_lat=' + bounds.getSouth() + '&min_lon=' + bounds.getWest() + '&limit=100&page=0'
      }).addTo(NPMap.config.L);
      callback();
    }
  },
  zoom: 8
};

(function () {
  var s = document.createElement('script');
  s.src = '{{ path }}/npmap-bootstrap.js';
  document.body.appendChild(s);
})();
