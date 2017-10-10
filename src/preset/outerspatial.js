/* global L */

'use strict';

var reqwest = require('reqwest');

var OuterSpatialLayer = L.GeoJSON.extend({
  includes: [
    require('../mixin/geojson')
  ],
  options: {
    environment: 'production',
    search: this._search
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
  /*

      areas: "id":"23132","name":"Humber Park","steward_id":"6372","segment_ids":"","osm_tags":"","outerspatial":{"id":"23132","steward_id":"6372","segment_ids":[]}

      campgrounds: "audio_description":null,"description":"<p>Dry camping area with quick access to the Ocotillo Wells Badlands, Truckhaven, and northern sections of the park. Each site has a shade ramada, picnic table, and a fire ring. This area is also conveniently located near Salton City businesses that offer, food, fuel, and more.</p>\n<p>All camping in Ocotillo Wells SVRA is free, and on a first come, first serve basis.</p><p><br></p>","created_at":"2017-08-01T22:57:56.201Z","id":225,"name":"Crossover Camp North","updated_at":"2017-10-03T17:25:30.967Z"

      points_of_interest: "audio_description":null,"description":"","created_at":"2017-08-14T19:03:24.453Z","id":1330,"name":"Clay Flats","point_type":null,"updated_at":"2017-09-08T19:21:38.889Z"

      trailheads: "id":"23132","name":"Humber Park","steward_id":"6372","segment_ids":"","osm_tags":"","outerspatial":{"id":"23132","steward_id":"6372","segment_ids":[]}

      trails: "id":"149490","steward_id":null,"osm_tags":"","ot_id":"149490","name":"Stone Creek Trail","os_length":1318.06848534449,"os_last_modified":"2017-09-08T19:22:10.017Z","os_id":"149490","os_steward_id":"6372"

  */
  /*
  _search: function (phrase) {
    var match = [];

    switch this.options.locationType:
      case 'areas':
        match = [
          'name'
        ];
        break;
      case 'campgrounds':
        match = [
          'name'
        ];
        break;
      case 'points_of_interest',
        match = [

        ]
  }
  */
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
