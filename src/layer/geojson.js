/* global L */

'use strict';

var util = require('../util/util');

var GeoJsonLayer = L.GeoJSON.extend({
  includes: [
    require('../mixin/geojson')
  ],
  initialize: function (options) {
    L.Util.setOptions(this, this._toLeaflet(options));

    if (typeof options.data === 'object') {
      this._create(options, options.data);
    } else if (typeof options.url === 'string') {
      var me = this;
      var url = options.url;

      util.loadFile(url, 'json', function (response) {
        if (response) {
          // TODO: Do a check to make sure the GeoJSON is valid, and fire error event if it isn't.
          me._create(options, response);
        } else {
          var obj = {
            message: 'There was an error loading the GeoJSON file.'
          };

          me.fire('error', obj);
          me.errorFired = obj;
        }
      });
    } else {
      this._create(options);
    }
  },
  _create: function (options, data) {
    var me = this;

    try {
      L.GeoJSON.prototype.initialize.call(me, data, options);
      me.fire('ready');
      me.readyFired = true;
      me._loaded = true;
    } catch (e) {
      var obj = {
        message: 'The response was not a valid GeoJSON object.'
      };

      me.fire('error', obj);
      me.errorFired = obj;
    }

    return me;
  }
});

module.exports = function (options) {
  options = options || {};

  if (!options.type) {
    options.type = 'geojson';
  }

  if (options.cluster) {
    return L.npmap.layer._cluster(options);
  } else {
    return new GeoJsonLayer(options);
  }
};
