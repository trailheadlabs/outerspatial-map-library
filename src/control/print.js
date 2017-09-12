/* global L */

'use strict';

var util = require('../util/util');
var PrintControl = L.Control.extend({
  options: {
    position: 'topright',
    ui: true,
    url: 'https://www.trailheadlabs.com/labs/outerspatial-map-library/print/'
  },
  initialize: function (options) {
    L.Util.setOptions(this, options);

    // if (this.options.ui === true) {
    //   this._li = L.DomUtil.create('li', '');
    //   this._button = L.DomUtil.create('button', 'print', this._li);
    //   this._button.setAttribute('alt', 'Print the map');
    //   L.DomEvent.addListener(this._button, 'click', this.print, this);
    // }

    return this;
  },
  // addTo: function (map) {
  //   if (this.options.ui === true) {
  //     var toolbar = util.getChildElementsByClassName(map.getContainer().parentNode.parentNode, 'outerspatial-toolbar')[0];
  //     toolbar.childNodes[1].appendChild(this._li);
  //     toolbar.style.display = 'block';
  //     this._container = toolbar.parentNode.parentNode;
  //     util.getChildElementsByClassName(this._container.parentNode, 'outerspatial-map-wrapper')[0].style.top = '28px';
  //   }
  //
  //   this._map = map;
  //   return this;
  // },
  onAdd: function () {
    var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
    var button = L.DomUtil.create('button', undefined, container);
    button.innerHTML = '' +
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">' +
        '<g class="icon-svg-line">' +
          '<polyline data-color="color-2" points="6 6 6 1 18 1 18 6"/>' +
          '<path d="M5,18H1v-7c0-2.8,2.2-5,5-5 h12c2.8,0,5,2.2,5,5v7h-4"/>' +
          '<line x1="17" y1="10" x2="18" y2="10"/>' +
          '<rect x="6" y="14" width="12" height="9"/>' +
        '</g>' +
      '</svg>';
    button.setAttribute('alt', 'Print the map');
    L.DomEvent.addListener(button, 'click', this.print, this);
    return container;
  },
  _clean: function (layer) {
    delete layer.L;

    // TODO: Move layer type-specific code.
    switch (layer.type) {
      case 'arcgisserver':
        delete layer.service;
        break;
    }

    if (layer.popup) {
      delete layer.popup.actions;

      if (typeof layer.popup.description === 'string') {
        layer.popup.description = util.escapeHtml(layer.popup.description);
      }

      if (typeof layer.popup.title === 'string') {
        layer.popup.title = util.escapeHtml(layer.popup.title);
      }
    }

    if (layer.tooltip) {
      layer.tooltip = util.escapeHtml(layer.tooltip);
    }
  },
  _guid: (function () {
    function s4 () {
      return Math.floor((1 + Math.random()) * 0x10000)
       .toString(16)
       .substring(1);
    }

    return function () {
      return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    };
  })(),
  print: function (e) {
    var map = this._map;
    var mapId = (function () {
      var options = map.options;

      if (typeof options.id !== 'undefined') {
        return options.id;
      } else if (typeof options.mapId !== 'undefined') {
        return options.mapId;
      } else if (typeof options.meta === 'object') {
        var meta = options.meta;

        if (typeof meta.id !== 'undefined') {
          return meta.id;
        } else if (typeof meta.mapId !== 'undefined') {
          return meta.mapId;
        }
      }

      return null;
    })();
    var me = this;
    var center = map.getCenter();
    var url;
    var win;

    L.DomEvent.preventDefault(e);

    if (mapId) {
      url = 'https://www.outerspatial.com/builder_maps/' + mapId + '/print/';
    } else {
      url = me.options.url;
    }

    url += (url.indexOf('?') === -1 ? '?' : '&') + 'lat=' + center.lat.toFixed(4) + '&lng=' + center.lng.toFixed(4) + '&zoom=' + map.getZoom();

    if (!mapId) {
      var options = map.options;
      var config = {
        baseLayers: [],
        center: options.center,
        overlays: [],
        zoom: options.zoom
      };
      var params = {
        action: 'save',
        key: this._guid()
      };
      var supportsCors = (window.location.protocol.indexOf('https:') === 0 ? true : (util.supportsCors() === 'yes'));
      var active;
      var i;
      var layer;

      for (i = 0; i < options.baseLayers.length; i++) {
        layer = options.baseLayers[i];

        if (typeof layer.L === 'object') {
          active = L.extend({}, layer);
          me._clean(active);
          config.baseLayers.push(active);
          break;
        }
      }

      for (i = 0; i < options.overlays.length; i++) {
        layer = options.overlays[i];

        if (typeof layer.L === 'object') {
          active = L.extend({}, layer);
          me._clean(active);
          config.overlays.push(active);
        }
      }

      params.value = window.btoa(JSON.stringify(config));
      url += '&printId=' + params.key;
      L.outerspatial.util._.reqwest({
        crossOrigin: supportsCors,
        type: 'json' + (supportsCors ? '' : 'p'),
        url: 'https://outerspatial-utilities.herokuapp.com/session/' + L.Util.getParamString(params)
      });
    }

    win = window.open(url, '_blank');

    // Needed because this throws an error in Internet Explorer 8.
    try {
      win.focus();
    } catch (e) {}
  }
});

L.Map.addInitHook(function () {
  if (this.options.printControl) {
    var options = {};

    if (typeof this.options.printControl === 'object') {
      options = this.options.printControl;
    }

    this.printControl = L.outerspatial.control.print(options).addTo(this);
  }
});

module.exports = function (options) {
  return new PrintControl(options);
};
