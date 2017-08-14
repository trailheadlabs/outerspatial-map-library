/* global document, L */
/* jslint node: true */

'use strict';

var keys = require('../../../keys.json');

var MapboxStyledLayer = L.TileLayer.extend({
  includes: [],
  options: {
    accessToken: (function () {
      if (keys && keys.mapbox && keys.mapbox.access_token) {
        return keys.mapbox.access_token;
      } else {
        return null;
      }
    })(),
    subdomains: [
      'a',
      'b',
      'c',
      'd'
    ]
  },
  initialize: function (options) {
    if (!options.id) {
      throw new Error('Mapbox vector layers require an "id" property.');
    }

    L.TileLayer.prototype.initialize.call(this, 'https://{s}.tiles.mapbox.com/styles/v1/' + options.id.replace('.', '/') + '/tiles/{z}/{x}/{y}{r}?access_token=' + this.options.accessToken, L.extend({}, options, {
      minNativeZoom: 0,
      tileSize: 512,
      tms: false,
      zoomOffset: -1
    }));
  },
  setUrl: null
});

module.exports = function (options) {
  options = options || {};

  if (!options.type) {
    options.type = 'mapbox';
  }

  return new MapboxStyledLayer(options);
};
