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

    button.innerHTML = '' +
      '<svg width="18" height="18" viewBox="-0.75 -0.75 18 18" xmlns="http://www.w3.org/2000/svg">' +
        '<g class="home">' +
          '<polyline points="13.6949153 7.45762712 13.6949153 15.8644068 9.62711864 15.8644068 9.62711864 11.5254237 6.37288136 11.5254237 6.37288136 15.8644068 2.30508475 15.8644068 2.30508475 7.45762712"/>' +
          '<polyline points="0.13559322 6.91525424 8 0.13559322 15.8644068 6.91525424"/>' +
        '</g>' +
      '</svg>';
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
