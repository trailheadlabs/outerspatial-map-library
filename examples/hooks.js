var OuterSpatial = {
  div: 'map',
  hooks: {
    preinit: function (callback) {
      window.alert('preinit');
      callback();
    },
    init: function (callback) {
      window.alert('init');
      callback();
    }
  }
};

(function () {
  var s = document.createElement('script');
  s.src = '{{ path }}/outerspatial-bootstrap.js';
  document.body.appendChild(s);
})();
