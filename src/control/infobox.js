/* global L */

'use strict';

var util = require('../util/util');
var InfoboxControl = L.Control.extend({
  options: {
    position: 'bottomleft'
  },
  initialize: function (options) {
    L.setOptions(this, options);
    return this;
  },
  onAdd: function () {
    this._container = L.DomUtil.create('div', 'leaflet-control-info leaflet-control');
    return this._container;
  },
  _hide: function () {
    this._container.style.display = 'none';
    L.DomUtil.removeClass(this._container, 'leaflet-tooltip-fade');

    if (this._map.activeTip === this) {
      delete this._map.activeTip;
    }
  },
  _show: function () {
    this._container.style.display = 'inline-block';
    L.DomUtil.addClass(this._container, 'leaflet-tooltip-fade');
  },
  getHtml: function () {
    return this._container.innerHTML;
  },
  hide: function () {
    this._hide();
  },
  isVisible: function () {
    return this._container.style.display !== 'none';
  },
  setHtml: function (html) {
    this._container.innerHTML = util.unescapeHtml(html);
  },
  setPosition: function () {
    return;
  },
  show: function (centerpoint, html) {
    if (this._map.activeTip && (this._map.activeTip !== this)) {
      this._map.activeTip._hide();
    }

    this._map.activeTip = this;

    if (html) {
      this.setHtml(html);
    }

    this._show();
  }
});

L.Map.mergeOptions({
  infoboxControl: false
});
L.Map.addInitHook(function () {
  if (this.options.infoboxControl) {
    var options = {};

    if (typeof this.options.infoboxControl === 'object') {
      options = this.options.infoboxControl;
    }

    this.infoboxControl = L.outerspatial.control.infobox(options).addTo(this);
  }
});

module.exports = function (options) {
  return new InfoboxControl(options);
};
