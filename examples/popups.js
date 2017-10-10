window.OuterSpatial = {
  center: {
    lat: 45.3058,
    lng: -116.7187
  },
  div: 'map',
  overlays: [{
    attribution: 'NPMap Team',
    name: 'Parks',
    popup: {
      actions: '<ul><li><a onclick="window.alert(\'Thanks for clicking!\');return false;">Click Me!</a></li></ul>',
      description: {
        format: 'list'
      },
      title: '{{unit_code}}'
    },
    styles: {
      'fill': '#d39800',
      'fill-opacity': 0.2,
      'stroke': '#d39800',
      'stroke-opacity': 0.8,
      'stroke-width': 3
    },
    table: 'parks',
    type: 'cartodb',
    user: 'nps'
  }, {
    attribution: 'NPMap Team',
    popup: {
      actions: '<ul><li><a>Clicking Me Won\'t Do Anything!</a></li></ul>',
      description: "I am {{#ifCond Name '===' 'A Rectangle'}}indeed{{else}}not{{/ifCond}} a rectangle! (Verified by a custom Handlebars helper.)",
      minWidth: 50,
      title: '{{toUpperCase Name}}'
    },
    type: 'geojson',
    url: 'data/rectangle.geojson'
  }, {
    attribution: 'Land Resources Division',
    popup: {
      description: '<p>The alpha code is {{Code}}.</p>',
      title: '{{Name}}'
    },
    styles: {
      point: {
        'marker-color': '#609321',
        'marker-symbol': 'park'
      }
    },
    type: 'geojson',
    url: 'data/national-parks.geojson'
  }],
  zoom: 6
};

(function () {
  var s = document.createElement('script');
  s.src = '{{ path }}/outerspatial-bootstrap.js';
  document.body.appendChild(s);
})();
