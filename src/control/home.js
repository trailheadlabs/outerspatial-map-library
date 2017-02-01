/* global L */

'use strict';

var HomeControl = L.Control.extend({
  options: {
    position: 'topleft'
  },
  initialize: function (options) {
    L.Util.extend(this.options, options);
    return this;
  },
  onAdd: function () {
    var container = L.DomUtil.create('div', 'leaflet-control-home leaflet-bar leaflet-control');
    var button = L.DomUtil.create('button', 'leaflet-bar-single', container);

    button.setAttribute('alt', 'Pan/zoom to initial extent');
    L.DomEvent
      .disableClickPropagation(button)
      .on(button, 'click', L.DomEvent.preventDefault)
      .on(button, 'click', this.toHome, this);

    return container;
  },
  toHome: function () {
    var map = this._map;
    var options = map.options;

    map.setView(options.center, options.zoom);
    map.closePopup();
  }
});

L.Map.mergeOptions({
  homeControl: true
});
L.Map.addInitHook(function () {
  if (this.options.homeControl) {
    var options = {};

    if (typeof this.options.homeControl === 'object') {
      options = this.options.homeControl;
    }

    this.homeControl = L.outerspatial.control.home(options).addTo(this);
  }
});

module.exports = function (options) {
  return new HomeControl(options);
};
