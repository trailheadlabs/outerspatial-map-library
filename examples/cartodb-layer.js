window.OuterSpatial = {
  div: 'map',
  maxZoom: 13,
  overlays: [{
    attribution: 'NPMap Team',
    name: 'Parks',
    popup: {
      description: {
        format: 'table'
      },
      title: '{{display_name}}'
    },
    styles: {
      'fill': '#7c117c'
    },
    table: 'parks',
    type: 'cartodb',
    user: 'nps'
  }, {
    attribution: 'NPMap Team',
    name: 'Yellowstone Roads',
    popup: {
      description: {
        format: 'table'
      },
      title: '{{name_segment}}'
    },
    styles: {
      'stroke': '#d39800',
      'stroke-opacity': 0.8,
      'stroke-width': 3
    },
    table: 'roads',
    type: 'cartodb',
    user: 'nps-yell'
  }]
};

(function () {
  var s = document.createElement('script');
  s.src = '{{ path }}/outerspatial-bootstrap.js';
  document.body.appendChild(s);
})();
