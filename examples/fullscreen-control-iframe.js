window.OuterSpatialUtils = {
  fullscreenControl: {
    listeners: {
      enterfullscreen: function () {
        window.alert('enter');
      },
      exitfullscreen: function () {
        window.alert('exit');
      }
    }
  }
};
