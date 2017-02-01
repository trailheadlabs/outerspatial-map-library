var OuterSpatial = {
  center: {
    lat: 44.51511,
    lng: -110.46066
  },
  div: 'map',
  overlays: [{
    attribution: 'NPMap Team',
    events: [{
      fn: function () {
        window.L.outerspatial.layer.geojson({
          color: '#7570b3',
          dashArray: '4,5',
          data: this.toGeoJSON(),
          lineCap: 'square',
          weight: 3,
          opacity: 1
        }).addTo(OuterSpatial.config.L);
        window.L.outerspatial.layer.geojson({
          color: '#7570b3',
          dashArray: '4,5',
          data: this.toGeoJSON(),
          lineCap: 'square',
          weight: 3,
          lineOpacity: 1
        }).addTo(OuterSpatial.config.L);
      },
      type: 'ready'
    }],
    name: 'Roads',
    styles: {
      line: {
        'stroke': '#e4cd17',
        'stroke-width': 5,
        'stroke-opacity': 1
      }
    },
    type: 'geojson',
    url: 'https://nps-yell.cartodb.com/api/v2/sql?format=GeoJSON&q=SELECT * FROM roads'
  }],
  zoom: 9
};

(function () {
  var s = document.createElement('script');
  s.src = '{{ path }}/outerspatial-bootstrap.js';
  document.body.appendChild(s);
})();
