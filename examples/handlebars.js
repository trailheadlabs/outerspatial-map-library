window.OuterSpatial = {
  div: 'map',
  overlays: [{
    attribution: '<a href="https://www.nps.gov/npmap/" target="_blank">NPMap</a>',
    name: 'Parks',
    opacity: 1,
    popup: {
      description: '' +
        '<ul>' +
          '<li>Is National Park?: {{#ifCond designation \'===\' \'National Park\'}}Yes{{else}}No, is a {{designation}}{{/ifCond}}</li>' +
          '<li>Unit Code: {{toUpperCase unit_code}}</li>' +
        '</ul>' +
      '',
      title: '<a href="{{url}}" target="_blank">{{display_name}}</a>'
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
    id: '0ATnNuieqRyM7RYsOFdaHoTNOtoFy9Xq4',
    name: 'Denali Sled Dogs',
    popup: {
      description: 'The dateFormat date/time is: <span style="background-color:yellow;">{{dateFormat "dddd, mmmm dS, yyyy, h:MM:ss TT" dateTime}}</span>. This was generated using the dateFormat handlebars helper.',
      title: '{{dateTime}}'
    },
    styles: {
      point: {
        'marker-color': '#000000',
        'marker-library': 'maki',
        'marker-size': 'medium'
      }
    },
    type: 'spot',
    zoomToBounds: true
  }]
};

(function () {
  var s = document.createElement('script');
  s.src = '{{ path }}/outerspatial-bootstrap.js';
  document.body.appendChild(s);
})();
