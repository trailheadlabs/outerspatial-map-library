/* global L */

'use strict';

var SmallZoomControl = L.Control.extend({
  options: {
    position: 'topleft'
  },
  initialize: function (options) {
    L.Util.extend(this.options, options);
    return this;
  },
  onAdd: function (map) {
    this._container = L.DomUtil.create('div', 'leaflet-bar');
    this._zoomInButton = this._createButton('Zoom in', 'in', this._container, this._zoomIn, this);
    this._zoomOutButton = this._createButton('Zoom out', 'out', this._container, this._zoomOut, this);

    this._zoomInButton.innerHTML = '' +
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" width="18" height="18">' +
        '<g class="icon-svg-line">' +
          '<line x1="8.5" y1="1.5" x2="8.5" y2="15.5"/>' +
          '<line x1="1.5" y1="8.5" x2="15.5" y2="8.5"/>' +
        '</g>' +
      '</svg>';

    this._zoomOutButton.innerHTML = '' +
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" width="18" height="18">' +
        '<g class="icon-svg-line">' +
          '<line x1="1.5" y1="8.5" x2="15.5" y2="8.5"/>' +
        '</g>' +
      '</svg>';
    map.on('zoomend zoomlevelschange', this._updateDisabled, this);
    this._updateDisabled();
    return this._container;
  },
  onRemove: function (map) {
    map.off('zoomend zoomlevelschange', this._updateDisabled, this);
  },
  _createButton: function (title, clsName, container, handler, context) {
    var button = L.DomUtil.create('button', clsName, container);
    button.setAttribute('alt', title);
    L.DomEvent.disableClickPropagation(button);
    L.DomEvent
      .on(button, 'click', L.DomEvent.preventDefault)
      .on(button, 'click', handler, context);
    return button;
  },
  _updateDisabled: function () {
    var clsName = 'leaflet-disabled';
    var map = this._map;

    L.DomUtil.removeClass(this._zoomInButton, clsName);
    L.DomUtil.removeClass(this._zoomOutButton, clsName);

    if (map._zoom === map.getMinZoom()) {
      L.DomUtil.addClass(this._zoomOutButton, clsName);
    }
    if (map._zoom === map.getMaxZoom()) {
      L.DomUtil.addClass(this._zoomInButton, clsName);
    }
  },
  _zoomIn: function (e) {
    this._map.zoomIn(e.shiftKey ? 3 : 1);
  },
  _zoomOut: function (e) {
    this._map.zoomOut(e.shiftKey ? 3 : 1);
  }
});

L.Map.mergeOptions({
  smallzoomControl: true
});
L.Map.addInitHook(function () {
  if (this.options.smallzoomControl) {
    var options = {};

    if (typeof this.options.smallzoomControl === 'object') {
      options = this.options.smallzoomControl;
    }

    this.smallzoomControl = L.outerspatial.control.smallzoom(options).addTo(this);
  }
});

module.exports = function (options) {
  return new SmallZoomControl(options);
};
