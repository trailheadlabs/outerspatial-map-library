/* global L */

'use strict';

var ScaleControl = L.Control.Scale.extend({
  options: {
    metric: false
  }
});

L.Map.mergeOptions({
  scaleControl: false
});
L.Map.addInitHook(function () {
  if (this.options.scaleControl) {
    var options = {};

    if (typeof this.options.scaleControl === 'object') {
      options = this.options.scaleControl;
    }

    this.scaleControl = L.outerspatial.control.scale(options).addTo(this);
  }
});

module.exports = function (options) {
  return new ScaleControl(options);
};
