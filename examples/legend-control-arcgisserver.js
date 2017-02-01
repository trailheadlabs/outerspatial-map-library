var OuterSpatial = {
  baseLayers: [
    'stamen-toner'
  ],
  div: 'map',
  hooks: {
    preinit: function (callback) {
      window.L.npmap.util._.reqwest({
        success: function (response) {
          var html = '';
          var i;

          for (i = 0; i < response.layers.length; i++) {
            var layer = response.layers[i];
            var legend = layer.legend;
            var title = layer.layerName;

            if (title.indexOf('Labels') !== -1) {
              html = '';
            } else {
              html += '<h2 class="legend-title"><em>' + title + '</em></h2><ul class="legend-labels">';
            }

            if (html !== '') {
              for (i = 0; i < legend.length; i++) {
                var item = legend[i];
                var image = item.imageData;
                var imgType = item.contentType;
                var label = item.label;

                if (label === '') {
                  html = '<ul class="legend-labels"><li><img src="data:' + imgType + ';base64,' + image + '">&nbsp;' + title + '</li>';
                } else {
                  html += '<li><img src="data:' + imgType + ';base64,' + image + '">&nbsp;' + label + '</li>';
                }
              }
            }
          }

          OuterSpatial.config.legendControl = {
            html: '<h1 class="layer name">National Park Info</h1>' + html + '</ul>',
            position: 'bottomright'
          };

          callback();
        },
        type: 'jsonp',
        url: 'https://mapservices.nps.gov/arcgis/rest/services/LandResourcesDivisionTractAndBoundaryService/MapServer/legend?f=json'
      });
    }
  },
  overlays: [{
    attribution: 'Esri',
    layers: '0',
    name: 'National Park Info',
    opacity: 0.5,
    popup: {
      description: {
        fields: [
          '',
          ''
        ],
        format: 'table'
      }
    },
    tiled: false,
    type: 'arcgisserver',
    url: 'https://mapservices.nps.gov/arcgis/rest/services/LandResourcesDivisionTractAndBoundaryService/MapServer'
  }],
  zoom: 7
};

(function () {
  var s = document.createElement('script');
  s.src = '{{ path }}/outerspatial-bootstrap.js';
  document.body.appendChild(s);
})();
