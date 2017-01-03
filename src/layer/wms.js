/* global L */

'use strict';

var util = require('../util/util');

var WmsLayer = L.TileLayer.WMS.extend({
  initialize: function (options) {
    util.strict(options.layers, 'string');
    util.strict(options.url, 'string');
    L.TileLayer.WMS.prototype.initialize.call(this, options.url, options);
    this.fire('ready');
    this.readyFired = true;
    return this;
  }
});

module.exports = function (options) {
  options = options || {};

  if (!options.type) {
    options.type = 'wms';
  }

  return new WmsLayer(options);
};
