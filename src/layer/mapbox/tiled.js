/* global document, L */
/* jslint node: true */

'use strict';

var keys = require('../../../keys.json');
var reqwest = require('reqwest');
var util = require('../../util/util');

var MapboxTiledLayer = L.TileLayer.extend({
  _formatPattern: /\.((?:png|jpg)\d*)(?=$|\?)/,
  includes: [
    require('../../mixin/grid')
  ],
  options: {
    accessToken: (function () {
      if (keys && keys.mapbox && keys.mapbox.access_token) {
        return keys.mapbox.access_token;
      } else {
        return null;
      }
    })(),
    errorTileUrl: L.Util.emptyImageUrl,
    format: 'png',
    subdomains: [
      'a',
      'b',
      'c',
      'd'
    ]
  },
  statics: {
    FORMATS: [
      'jpg',
      'jpg70',
      'jpg80',
      'jpg90',
      'png',
      'png32',
      'png64',
      'png128',
      'png256'
    ]
  },
  initialize: function (options) {
    var load;

    if (!options.id && !options.tileJson) {
      throw new Error('Mapbox layers require either an "id" or a "tileJson" property.');
    }

    if (options.format) {
      util.strictOneOf(options.format, MapBoxLayer.FORMATS);
    }

    load = options.tileJson || options.id;
    L.Util.setOptions(this, options);
    L.TileLayer.prototype.initialize.call(this, undefined, options);
    this._hasInteractivity = false;
    this._loadTileJson(load);
  },
  getTileUrl: function (tilePoint) {
    var tiles = this.options.tiles;
    var templated = L.Util.template(tiles[Math.floor(Math.abs(tilePoint.x + tilePoint.y) % tiles.length)], tilePoint);

    if (!templated) {
      return templated;
    } else {
      return templated.replace(this._formatPattern, (L.Browser.retina ? '@2x' : '') + '.' + this.options.format);
    }
  },
  onAdd: function onAdd (map) {
    this._map = map;
    L.TileLayer.prototype.onAdd.call(this, this._map);
  },
  onRemove: function onRemove () {
    L.TileLayer.prototype.onRemove.call(this, this._map);
    delete this._map;
  },
  _getGridData: function (latLng, callback) {
    var me = this;

    me._getTileGrid(me._getTileGridUrl(latLng), latLng, function (resultData, gridData) {
      if (resultData === 'loading') {
        callback({
          layer: me,
          results: 'loading'
        });
      } else {
        if (gridData) {
          callback({
            layer: me,
            results: [
              gridData
            ]
          });
        } else {
          callback({
            layer: me,
            results: null
          });
        }
      }
    });
  },
  _loadTileJson: function (from) {
    if (typeof from === 'string') {
      var me = this;

      reqwest({
        crossOrigin: true,
        error: function (error) {
          var obj = L.extend(error, {
            message: 'There was an error loading the data from Mapbox.'
          });

          me.fire('error', obj);
          me.errorFired = obj;
        },
        success: function (response) {
          me._setTileJson(response);
        },
        type: 'json',
        // To make CORS work in IE9.
        url: (window.location.protocol === 'https:' ? 'https://api.mapbox.com/v4/' + from + '.json?access_token=' + me.options.accessToken + '&secure=1' : 'http://a.tiles.mapbox.com/v4/' + from + '.json?access_token=' + me.options.accessToken)
      });
    } else if (typeof from === 'object') {
      this._setTileJson(from);
    }
  },
  _setTileJson: function (json) {
    var me = this;
    var extend;

    util.strict(json, 'object');

    extend = {
      attribution: (function () {
        if (me.options.attribution) {
          return me.options.attribution;
        } else if (json.attribution) {
          return json.attribution;
        } else {
          return null;
        }
      })(),
      bounds: json.bounds ? this._toLeafletBounds(json.bounds) : null,
      grids: json.grids ? json.grids : null,
      maxZoom: json.maxzoom,
      minZoom: json.minzoom,
      tiles: json.tiles,
      tms: json.scheme === 'tms'
    };

    if (typeof this.options.attribution === 'undefined') {
      extend.attribution = json.attribution;
    }

    if (this.options.clickable !== false) {
      this._hasInteractivity = typeof json.grids === 'object';
    }

    if (typeof this.options.maxZoom === 'undefined') {
      extend.maxZoom = json.maxzoom;
    }

    if (typeof this.options.minZoom === 'undefined') {
      extend.minZoom = json.minzoom;
    }

    this.options.format = this.options.format || json.tiles[0].match(this._formatPattern)[1];
    L.extend(this.options, extend);
    this.tileJson = json;
    this.redraw();
    me.fire('ready');
    me.readyFired = true;
    return this;
  },
  _toLeafletBounds: function (_) {
    return new L.LatLngBounds([[_[1], _[0]], [_[3], _[2]]]);
  },
  _update: function () {
    if (this.options.tiles) {
      L.TileLayer.prototype._update.call(this);
    }
  }
});

module.exports = function (options) {
  options = options || {};

  if (!options.type) {
    options.type = 'mapbox';
  }

  return new MapboxTiledLayer(options);
};
