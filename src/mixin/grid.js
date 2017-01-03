/* globals L */

var reqwest = require('reqwest');
var tileMath = require('../util/tilemath');

module.exports = {
  _cache: {},
  _getTileCoords: function (latLng) {
    var zoom = this._map.getZoom();

    return {
      x: tileMath.long2tile(latLng.lng, zoom),
      y: tileMath.lat2tile(latLng.lat, zoom),
      z: zoom
    };
  },
  _getTileGrid: function (url, latLng, callback) {
    if (this._cache[url]) {
      var response = this._cache[url];

      if (response === 'empty') {
        callback(null, null);
      } else {
        var tileGridPoint = this._getTileGridPoint(latLng, response);

        // TODO: Handle if tileGridPoint contains an error.

        if (response === 'loading') {
          callback('loading', tileGridPoint);
        } else {
          callback(response, tileGridPoint);
        }
      }
    } else {
      var me = this;

      me._cache[url] = 'loading';
      reqwest({
        crossOrigin: true,
        error: function () {
          me._cache[url] = 'empty';
          callback(null, null);
        },
        success: function (response) {
          if (response) {
            me._cache[url] = response;
            callback(response, me._getTileGridPoint(latLng, response));
          } else {
            me._cache[url] = 'empty';
            callback(null, null);
          }
        },
        timeout: 2000,
        type: 'json',
        url: url
      });
    }
  },
  _getTileGridPoint: function (latLng, response) {
    var map = this._map;

    // TODO: Handle if response.error exists.

    if (map && typeof response === 'object') {
      var point = map.project(latLng.wrap());
      var resolution = 4;
      var tileSize = 256;
      var max = map.options.crs.scale(map.getZoom()) / tileSize;

      return (response.data[response.keys[this._utfDecode(response.grid[Math.floor((point.y - (((Math.floor(point.y / tileSize) + max) % max) * tileSize)) / resolution)].charCodeAt(Math.floor((point.x - (((Math.floor(point.x / tileSize) + max) % max) * tileSize)) / resolution)))]]);
    }

    return null;
  },
  _getTileGridUrl: function (latLng) {
    var grids = this.options.grids;
    var gridTileCoords = this._getTileCoords(latLng);

    return L.Util.template(grids[Math.floor(Math.abs(gridTileCoords.x + gridTileCoords.y) % grids.length)], gridTileCoords);
  },
  _handleClick: function (latLng, callback) {
    this._getGridData(latLng, callback);
  },
  _handleMousemove: function (latLng, callback) {
    this._getGridData(latLng, callback);
  },
  _utfDecode: function (key) {
    if (key >= 93) {
      key--;
    }

    if (key >= 35) {
      key--;
    }

    return key - 32;
  }
};
