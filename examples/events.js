var el = document.getElementById('events');

function addMessage (message) {
  el.innerHTML += message + '<br>';
  el.scrollTop = el.scrollHeight;
}

window.OuterSpatial = {
  div: 'map',
  events: [{
    fn: function () {
      addMessage('movend');
    },
    type: 'moveend'
  }],
  maxZoom: 13,
  overlays: [{
    attribution: 'NPMap Team',
    events: [{
      fn: function (error) {
        addMessage(error.message);
      },
      type: 'error'
    }, {
      fn: function () {
        addMessage('ready');
      },
      type: 'ready'
    }, {
      fn: function () {
        addMessage('tileloadstart');
      },
      type: 'tileloadstart'
    }],
    name: 'Parks',
    popup: {
      description: {
        format: 'table'
      },
      title: '{{alphacode}}'
    },
    styles: {
      'fill': '#7c117c'
    },
    table: 'parks',
    type: 'cartodb',
    user: 'nps'
  }]
};

(function () {
  var s = document.createElement('script');
  s.src = '{{ path }}/outerspatial-bootstrap.js';
  document.body.appendChild(s);
})();
