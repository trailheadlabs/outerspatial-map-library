window.OuterSpatial = {
  div: 'map',
  geocoderControl: true,
  overlays: [{
    filter: function (feature) {
      return feature.properties.park === 'Yellowstone';
    },
    popup: {
      actions: [{
        type: 'directions'
      }],
      title: '{{name}}'
    },
    styles: {
      point: {
        'marker-symbol': 'star'
      }
    },
    search: function (value) {
      var layers = this.L._layers;
      var re = new RegExp(value, 'i');
      var results = [];

      for (var key in layers) {
        if (layers.hasOwnProperty(key)) {
          if (layers[key].hasOwnProperty('feature')) {
            if (re.test(layers[key].feature.properties.name)) {
              results.push({
                bounds: null,
                latLng: layers[key].getLatLng(),
                name: layers[key].feature.properties.name
              });
            }
          }
        }
      }

      return results;
    },
    type: 'geojson',
    url: 'data/gateway-points-of-interest.geojson'
  }, {
    popup: {
      actions: [{
        type: 'directions'
      }],
      description: 'The alpha code is {{Code}}',
      title: '{{Name}}'
    },
    search: function (value) {
      var layers = this.L._layers;
      var re = new RegExp(value, 'i');
      var results = [];

      for (var key in layers) {
        if (layers.hasOwnProperty(key)) {
          if (layers[key].hasOwnProperty('feature')) {
            if (re.test(layers[key].feature.properties.Name)) {
              results.push({
                bounds: null,
                latLng: layers[key].getLatLng(),
                name: layers[key].feature.properties.Name
              });
            }
          }
        }
      }

      return results;
    },
    styles: {
      point: {
        'marker-color': '#609321',
        'marker-symbol': 'park'
      }
    },
    type: 'geojson',
    url: 'data/national-parks.geojson'
  }]
};

(function () {
  var s = document.createElement('script');
  s.src = '{{ path }}/outerspatial-bootstrap.js';
  document.body.appendChild(s);
})();
