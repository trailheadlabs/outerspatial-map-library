var OuterSpatial = {
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
        var map = OuterSpatial.config.L;
        console.log("ready")
        map.editControl._modes.marker.handler.setOptions({guideLayers: layers});

        map.on('draw:created', function (e) {
          var marker;
          
          console.log("drawcreated")

          if (e.layerType && e.layerType === 'marker') {
            marker = e.layer;
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
    js: '{{ path }}/plugins/Leaflet.GeometryUtil/0.7.1/plugin.min.js'
  }, {
    js: '{{ path }}/plugins/Leaflet.Snap/0.4.0/plugin.min.js'
  }],
  zoom: 9
};

(function () {
  var s = document.createElement('script');
  s.src = '{{ path }}/outerspatial-bootstrap.js';
  document.body.appendChild(s);
})();
