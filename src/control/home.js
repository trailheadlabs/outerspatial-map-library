/* global L */

'use strict';

var HomeControl = L.Control.extend({
  options: {
    position: 'topright'
  },
  initialize: function (options) {
    L.Util.extend(this.options, options);
    return this;
  },
  onAdd: function () {
    var container = L.DomUtil.create('div', 'leaflet-bar leaflet-bar-single leaflet-control');
    var button = L.DomUtil.create('button', undefined, container);

    button.innerHTML = '' +
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="18" height="18">' +
        '<g class="icon-svg-line">' +
          '<polyline vector-effect="non-scaling-stroke" points="26 16 26 30 19 30 19 22 13 22 13 30 6 30 6 16"/>' +
          '<polyline vector-effect="non-scaling-stroke" points="1 15 16 2 31 15"/>' +
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

    if (options.initialBounds) {
      map.fitBounds(options.initialBounds);
    } else {
      map.setView(options.center, options.zoom);
    }

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
