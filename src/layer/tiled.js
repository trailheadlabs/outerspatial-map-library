/* global L */

'use strict';

var util = require('../util/util');
var TiledLayer;

TiledLayer = L.TileLayer.extend({
  options: {
    errorTileUrl: L.Util.emptyImageUrl
  },
  initialize: function (options) {
    util.strict(options.url, 'string');

    if (L.Browser.retina && options.retinaId) {
      options.url = options.url.replace('{{retina}}', options.retinaId);
    } else {
      options.url = options.url.replace('{{retina}}', '');
    }

    if (options.supportsSsl) {
      options.url = options.url.replace('{{protocol}}', 'https://');
    } else {
      options.url = options.url.replace('{{protocol}}', 'http://');
    }

    L.Util.setOptions(this, options);
    L.TileLayer.prototype.initialize.call(this, options.url, options);
    this.fire('ready');
    this.readyFired = true;
    return this;
  }
});

module.exports = function (options) {
  options = options || {};

  if (!options.type) {
    options.type = 'tiled';
  }

  return new TiledLayer(options);
};
