/* global L */

'use strict';

var util = require('../../util/util');

var ArcGisServerTiledLayer = L.TileLayer.extend({
  includes: [
    require('../../mixin/esri')
  ],
  options: {
    errorTileUrl: L.Util.emptyImageUrl
  },
  initialize: function (options) {
    L.Util.setOptions(this, options);
    util.strict(options.url, 'string');
    this._serviceUrl = this._cleanUrl(options.url);
    this.tileUrl = this._cleanUrl(options.url) + 'tile/{z}/{y}/{x}';

    if (options.clickable === false) {
      this._hasInteractivity = false;
    }

    L.TileLayer.prototype.initialize.call(this, this.tileUrl, options);
    this._getMetadata();
  }
});

module.exports = function (options) {
  options = options || {};

  if (!options.type) {
    options.type = 'arcgisserver';
  }

  return new ArcGisServerTiledLayer(options);
};
