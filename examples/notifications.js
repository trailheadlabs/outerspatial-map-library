var NPMap = {
  div: 'map',
  hooks: {
    init: function (callback) {
      NPMap.config.L.notify
        .success('Good Job!')
        .info('Some helpful information.')
        .warning('Something may go wrong.')
        .danger('Danger!');
      callback();
    }
  }
};

(function () {
  var s = document.createElement('script');
  s.src = '{{ path }}/npmap-bootstrap.js';
  document.body.appendChild(s);
})();
