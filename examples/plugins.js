var NPMap = {
  center: {
    lat: 44.617844,
    lng: -110.541687
  },
  div: 'map',
  editControl: true,
  overlays: [{
    attribution: 'Yellowstone National Park',
    events: [{
      fn: function () {
        var layers = this.getLayers();
        var map = NPMap.config.L;

        map.on('draw:created draw:drawstartmarker', function (e) {
          var marker;

          if (e.layerType && e.layerType === 'marker') {
            marker = e.layer;
          } else if (e.marker) {
            marker = e.marker;
          }

          if (marker) {
            marker.snap = new window.L.Handler.MarkerSnap(map, marker);

            for (var i = 0; i < layers.length; i++) {
              marker.snap.addGuideLayer(layers[i]);
            }

            marker.snap.enable();
          }
        });
      },
      type: 'ready'
    }],
    name: 'Yellowstone Roads',
    tooltip: '{{name}}',
    type: 'geojson',
    url: 'https://nps-yell.cartodb.com/api/v2/sql?q=SELECT * FROM roads&format=geojson'
  }],
  plugins: [{
    js: '{{ path }}/plugins/Leaflet.GeometryUtil/0.3.2/plugin.min.js'
  }, {
    js: '{{ path }}/plugins/Leaflet.Snap/0.0.1/plugin.min.js'
  }],
  zoom: 9
};

(function () {
  var s = document.createElement('script');
  s.src = '{{ path }}/npmap-bootstrap.js';
  document.body.appendChild(s);
})();
