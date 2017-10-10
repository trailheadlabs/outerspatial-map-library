/* global L */

'use strict';

var reqwest = require('reqwest');

var OuterSpatialLayer = L.GeoJSON.extend({
  includes: [
    require('../mixin/geojson')
  ],
  options: {
    environment: 'production'
  },
  initialize: function (options) {
    var me = this;
    var environment;
    var locationType;
    var organizationId;

    L.Util.setOptions(this, this._toLeaflet(options));

    if (this.options.locationType) {
      locationType = this.options.locationType;
    } else {
      console.error('The "locationType" property is required for the OuterSpatial preset.');
    }

    if (this.options.organizationId) {
      organizationId = this.options.organizationId;
    } else {
      console.error('The "organizationId" property is required for the OuterSpatial preset.');
    }

    environment = this.options.environment;

    reqwest({
      error: function (error) {
        var obj = L.extend(error, {
          message: 'There was an error loading the data from OuterSpatial.'
        });

        me.fire('error', obj);
        me.errorFired = obj;
      },
      success: function (response) {
        var obj;

        if (response && response.responseText) {
          L.GeoJSON.prototype.initialize.call(me, JSON.parse(response.responseText), options);
          me.fire('ready');
          me._loaded = true;
          me.readyFired = true;
        } else {
          obj = {
            message: 'There was an error loading the data from OuterSpatial.'
          };

          me.fire('error', obj);
          me.errorFired = obj;
        }

        return me;
      },
      url: 'https://' + (environment === 'production' ? '' : 'staging-') + 'cdn.outerspatial.com/static_data/organizations/' + organizationId + '/' + locationType + '.geojson'
    });
  }
});

module.exports = function (options) {
  options = options || {};

  if (!options.type) {
    options.type = 'geojson';
  }

  if (options.cluster) {
    return L.outerspatial.layer._cluster(options);
  } else {
    return new OuterSpatialLayer(options);
  }
};
