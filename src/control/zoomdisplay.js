/* global L */

'use strict';

var ZoomDisplayControl = L.Control.extend({
  options: {
    position: 'topright'
  },
  onAdd: function (map) {
    this._map = map;
    this._container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-zoomdisplay');
    this._control = L.DomUtil.create('div', undefined, this._container);
    this._control.setAttribute('alt', 'Current zoom level');
    this.updateZoom(map.getZoom());
    map.on('zoomend', this.onMapZoomEnd, this);
    return this._container;
  },
  onRemove: function (map) {
    map.off('zoomend', this.onMapZoomEnd, this);
  },
  onMapZoomEnd: function () {
    this.updateZoom(this._map.getZoom());
  },
  updateZoom: function (zoom) {
    if (typeof zoom === 'undefined') {
      zoom = '';
    }

    this._control.innerHTML = Math.floor(zoom);
  }
});

L.Map.addInitHook(function () {
  if (this.options.zoomdisplayControl) {
    var options = {};

    if (typeof this.options.zoomdisplayControl === 'object') {
      options = this.options.zoomdisplayControl;
    }

    this.zoomdisplayControl = L.outerspatial.control.zoomdisplay(options).addTo(this);
  }
});

module.exports = function (options) {
  return new ZoomDisplayControl(options);
};
