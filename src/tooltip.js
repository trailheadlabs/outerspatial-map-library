/* globals L */

'use strict';

var util = require('./util/util');

var Tooltip = L.Class.extend({
  initialize: function (options) {
    L.setOptions(this, options);
    this._map = this.options.map;

    if (!this._map) {
      throw new Error('No map configured for tooltip');
    }

    this._container = L.DomUtil.create('div', 'leaflet-tooltip');
    this._map._tooltipContainer.appendChild(this._container);
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
    if (typeof html === 'string') {
      this._container.innerHTML = util.unescapeHtml(html);
    } else {
      while (this._container.hasChildNodes()) {
        this._container.removeChild(this._container.firstChild);
      }

      this._container.appendChild(this._content);
    }

    this._sizeChanged = true;
  },
  setPosition: function (point) {
    var container = this._container;
    var containerSize = util.getOuterDimensions(container);
    var mapSize = this._map.getSize();
    var offset = L.point(15, 0);

    if (point.x + containerSize.width > mapSize.x - offset.x - 5) {
      container.style.left = 'auto';
      container.style.right = (mapSize.x - point.x + (offset.x - 5)) + 'px';
    } else {
      container.style.left = point.x + offset.x + 'px';
      container.style.right = 'auto';
    }

    if (point.y + containerSize.height > mapSize.y) {
      container.style.top = 'auto';
      container.style.bottom = (mapSize.y - point.y) + 'px';
    } else {
      container.style.top = point.y + 'px';
      container.style.bottom = 'auto';
    }
  },
  show: function (point, html) {
    if (this._map.activeTip && (this._map.activeTip !== this)) {
      this._map.activeTip._hide();
    }

    this._map.activeTip = this;

    if (html) {
      this.setHtml(html);
    }

    this.setPosition(point);
    this._show();
  }
});

L.Map.addInitHook(function () {
  this._tooltipContainer = L.DomUtil.create('div', 'leaflet-tooltip-container', this._container);
});

module.exports = function (options) {
  return new Tooltip(options);
};
