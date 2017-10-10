var OuterSpatial = {
  baseLayers: [
    'outerspatial-outdoors',
    'mapbox-satellite'
  ],
  center: {
    lat: 35.65,
    lng: -118.75
  },
  div: 'map',
  geocoderControl: true,
  overlays: [{
    locationType: 'trails',
    organizationId: 6372,
    preset: 'outerspatial',
    search: function (value) {
      var layers = this.L._layers;
      var re = new RegExp(value, 'i');
      var results = [];

      for (var key in layers) {
        if (layers.hasOwnProperty(key)) {
          if (layers[key].hasOwnProperty('feature')) {
            if (re.test(layers[key].feature.properties.name)) {
              results.push({
                bounds: layers[key].getBounds(),
                latLng: null,
                name: layers[key].feature.properties.name
              });
            }
          }
        }
      }

      return results;
    }
  }],
  zoom: 7
};

(function () {
  var s = document.createElement('script');
  s.src = '{{ path }}/outerspatial-bootstrap.js';
  document.body.appendChild(s);
})();
