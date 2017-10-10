window.OuterSpatial = {
  div: 'map',
  hooks: {
    init: function (callback) {
      setTimeout(callback, 10000);
    }
  }
};

(function () {
  var s = document.createElement('script');
  s.src = '{{ path }}/outerspatial-bootstrap.js';
  document.body.appendChild(s);
})();
