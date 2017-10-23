/* global L */

'use strict';

var reqwest = require('reqwest');

var OuterSpatialLayer = L.GeoJSON.extend({
  includes: [
    require('../mixin/geojson')
  ],
  options: {
    environment: 'production',
    searchable: false,
    formatPopups: true
  },
  _collapseFeatureAttributes: function (features, type) {
    features.forEach(function (feature) {
      var area = feature.properties.area;
      var tags = feature.properties.tags;
      var contentBlocks = feature.properties.content_blocks;

      if (area !== null) {
        for (var prop in area) {
          if (
            prop === 'address' ||
            prop === 'name' ||
            prop === 'area_type' ||
            prop === 'created_at' ||
            prop === 'description' ||
            prop === 'id' ||
            prop === 'updated_at' ||
            prop === 'slug' ||
            prop === 'phone_number' ||
            prop === 'website' ||
            prop === 'logo_image_id'
          ) {
            feature.properties['area:' + prop] = area[prop];
          }
        }

        delete feature.properties.area;
      }

      tags.forEach(function (tag) {
        tag.categories.forEach(function (category) {
          feature.properties['tag:' + category.name + ':' + tag.key] = tag.value;
        });
      });

      delete feature.properties.tags;

      if (contentBlocks) {
        contentBlocks.forEach(function (contentBlock) {
          feature.properties['contentBlock:' + contentBlock.title] = contentBlock.body;
        });
      }

      delete feature.properties.content_blocks;
    });
  },
  initialize: function (options) {
    var me = this;

    L.Util.setOptions(this, this._toLeaflet(options));
    options = this.options;

    if (!this.options.locationType) {
      console.error('The "locationType" property is required for the OuterSpatial preset.');
    }

    if (!this.options.organizationId) {
      console.error('The "organizationId" property is required for the OuterSpatial preset.');
    }

    if (this.options.searchable) {
      options.search = function (value) {
        var layers = this.L._layers;
        var re = new RegExp(value, 'i');
        var results = [];
        var type = options.locationType;

        if (type === 'points_of_interest') {
          type = 'Point of Interest';
        } else if (type === 'trail_segments') {
          type = 'Trail Segment';
        } else {
          type = type.charAt(0).toUpperCase() + type.slice(1, type.length - 1);
        }

        for (var key in layers) {
          var layer = layers[key];

          if (layers.hasOwnProperty(key) && layer.hasOwnProperty('feature')) {
            if (re.test(layer.feature.properties.name)) {
              if (layer.feature.geometry.type.toLowerCase() === 'point') {
                results.push({
                  bounds: null,
                  latLng: layer.getLatLng(),
                  name: layers[key].feature.properties.name,
                  type: type
                });
              } else {
                results.push({
                  bounds: layer.getBounds(),
                  latLng: null,
                  name: layers[key].feature.properties.name,
                  type: type
                });
              }
            }
          }
        }

        return results;
      };
    }

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
          var geojson = JSON.parse(response.responseText);

          if (options.formatPopups) {
            me._collapseFeatureAttributes(geojson.features);
          }

          L.GeoJSON.prototype.initialize.call(me, geojson, options);
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
      url: 'https://' + (options.environment === 'production' ? '' : 'staging-') + 'cdn.outerspatial.com/static_data/organizations/' + options.organizationId + '/api_v2/' + options.locationType + '.geojson'
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
