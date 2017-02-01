/* global DOMParser, L */

'use strict';

var togeojson = require('togeojson');
var util = require('../util/util');

var KmlLayer = L.GeoJSON.extend({
  includes: [
    require('../mixin/geojson')
  ],
  initialize: function (options) {
    var me = this;

    L.Util.setOptions(this, this._toLeaflet(options));

    if (typeof options.data === 'string') {
      me._create(options, options.data);
      return this;
    } else {
      var url = options.url;

      util.strict(url, 'string');
      util.loadFile(url, 'xml', function (response) {
        if (response) {
          me._create(options, response);
        } else {
          var obj = {
            message: 'There was an error loading the KML file.'
          };

          me.fire('error', obj);
          me.errorFired = obj;
        }
      });
    }
  },
  _create: function (options, data) {
    L.GeoJSON.prototype.initialize.call(this, togeojson.kml(new DOMParser().parseFromString(data, 'text/xml')), options);
    this.fire('ready');
    this.readyFired = true;
    this._loaded = true;
    return this;
  }
});

module.exports = function (options) {
  options = options || {};

  if (!options.type) {
    options.type = 'kml';
  }

  if (options.cluster) {
    return L.outerspatial.layer._cluster(options);
  } else {
    return new KmlLayer(options);
  }
};
