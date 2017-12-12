/* global L */

'use strict';

var reqwest = require('reqwest');

var OuterSpatialLayer = L.GeoJSON.extend({
  _include: [{
    type: 'Visitor Center',
    symbol: 'visitor-center',
    minZoom: 4,
    minZoomFactor: 0,
    maxZoom: 22,
    priority: 1
  }, {
    type: 'Entrance',
    symbol: 'entrance-station',
    minZoom: 4,
    minZoomFactor: 0,
    maxZoom: 22,
    priority: 1
  }, {
    type: 'Campground',
    symbol: 'campground',
    minZoom: 7,
    minZoomFactor: 0,
    maxZoom: 22,
    priority: 2
  }, {
    type: 'Trailhead',
    symbol: 'trailhead',
    minZoom: 7,
    minZoomFactor: 0,
    maxZoom: 22,
    priority: 3
  }, {
    type: 'Store',
    symbol: 'store',
    minZoom: 7,
    minZoomFactor: 0,
    maxZoom: 22,
    priority: 3
  }, {
    type: 'Restrooms',
    symbol: 'restrooms',
    minZoom: 12,
    maxZoom: 22,
    priority: 3
  }, {
    type: 'Drinking Water',
    symbol: 'drinking-water',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Food Service',
    symbol: 'food-service',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Information',
    symbol: 'information',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Interpretive Exhibit',
    symbol: 'interpretive-exhibit',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Parking',
    symbol: 'parking',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Playground',
    symbol: 'playground',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'POI',
    symbol: 'playground',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Sanitary Disposal Station',
    symbol: 'sanitary-disposal-station',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: 'Showers',
    symbol: 'showers',
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: null,
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }, {
    type: '',
    symbol: null,
    minZoom: 16,
    maxZoom: 22,
    priority: 4
  }],
  includes: [
    require('../mixin/geojson')
  ],
  options: {
    environment: 'production',
    formatPopups: true,
    searchable: false
  },
  initialize: function (options) {
    var me;
    var singularTypes = {
      points_of_interest: 'Point of Interest',
      trail_segments: 'Trail Segment',
      areas: 'Area',
      trails: 'Trail',
      trailheads: 'Trailhead',
      campgrounds: 'Campground'
    };
    var type;

    L.Util.setOptions(this, this._toLeaflet(options));

    if (!this.options.locationType) {
      console.error('The "locationType" property is required for the OuterSpatial preset.');
    }

    if (!this.options.organizationId) {
      console.error('The "organizationId" property is required for the OuterSpatial preset.');
    }

    type = this._singularType = singularTypes[this.options.locationType];

    if (type === 'Point of Interest' || type === 'Trailhead' || type === 'Campground') {
      this.options.prioritization = true;
    }

    if (this.options.searchable) {
      options.search = function (value) {
        var layers;
        var re = new RegExp(value, 'i');
        var results = [];

        if (this.L.options.cluster) {
          layers = this.L.L._layers;
        } else {
          layers = this.L._layers;
        }

        for (var key in layers) {
          var layer = layers[key];

          if (layers.hasOwnProperty(key) && layer.hasOwnProperty('feature')) {
            if (re.test(layer.feature.properties.name)) {
              if (layer.feature.geometry.type.toLowerCase() === 'point') {
                results.push({
                  bounds: null,
                  latLng: layer.getLatLng(),
                  layer: layer,
                  name: layers[key].feature.properties.name,
                  type: type
                });
              } else {
                results.push({
                  bounds: layer.getBounds(),
                  latLng: null,
                  layer: layer,
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

    if (this.options.formatPopups) {
      var config;

      if (this.options.popup) {
        config = this.options.popup;
      } else {
        config = {};
      }

      if (!config.title && !config.description) {
        config.title = function (properties) {
          var banner = '';

          if (properties['tag:Status:closed'] === 'yes') {
            banner = '<img class="banner" width=51 height=20 alt="Closed banner" src="' + window.L.Icon.Default.imagePath + '/outerspatial/closed-indicator-right' + (L.Browser.retina ? '@2x' : '') + '.png"/>';
          }

          return {
            title: '{{name}}',
            subtitle: (type === 'Area' || type === 'Trail Segment' ? type : type + (properties.area_id ? ' in ' + properties.area.name : '')),
            image: banner
          };
        };

        config.image = function (properties) {
          if (properties.image_attachments && properties.image_attachments.length > 0) {
            var image = {
              caption: properties.image_attachments[0].image.caption
            };

            if (window.innerWidth <= 320) {
              image.url = properties.image_attachments[0].image.versions.small_square.url;
            } else {
              image.url = properties.image_attachments[0].image.versions.medium_square.url;
            }

            return image;
          } else {
            return null;
          }
        };

        config.description = function (properties) {
          var accessibilityDescription = properties.accessibility_description;
          var address = properties.address;
          var content = '';
          var description = properties.description;
          var length = properties.length;
          var tags = properties.tags;
          var website = properties.website;
          var contentBlocks = properties.content_blocks;

          if (description && description !== '' && description !== null) {
            content = content + '<section>' + description + '</section>';
          }

          if (tags) {
            var tagSections = {};
            var tagCategories = {
              Area: [
                'Activities',
                'Good For',
                'Status'
              ],
              Campground: [
                'Accessibility',
                'Amenities',
                'Status'
              ],
              PointOfInterest: [
                'Accessibility',
                'Status'
              ],
              Trailhead: [
                'Accessibility',
                'Amenities',
                'Status'
              ],
              Trail: [
                'Accessibility',
                'Allowed Use',
                'Difficulty',
                'Status',
                'Trail Type'
              ],
              TrailSegment: [
                'Accessibility',
                'Allowed Use',
                'Difficulty',
                'Status',
                'Trail Type'
              ]
            };

            tags.forEach(function (tag) {
              if (tag.value === 'yes' && tag.categories.length > 0) {
                tag.categories.forEach(function (category) {
                  if (tagCategories[properties.class_name].indexOf(category.name) > -1) {
                    if (!tagSections.hasOwnProperty(category.name)) {
                      tagSections[category.name] = [];
                    }

                    tagSections[category.name].push(handleTag(tag.key));
                  }
                });
              }
            });

            for (var key in tagSections) {
              if (key === 'Status') {
                continue;
              }
              content = content + '<section><h5>' + key + '</h5><span style="color: #7da836">' + tagSections[key].sort().join(', ') + '</span></section>';
            }
          }

          if (accessibilityDescription && accessibilityDescription !== '' && accessibilityDescription !== null) {
            content = content + '<section><h5>Accessibility Description</h5>' + accessibilityDescription + '</section>';
          }

          if (contentBlocks) {
            contentBlocks.forEach(function (contentBlock) {
              content = content + '<section><h5>' + contentBlock.title + '</h5>' + contentBlock.body + '</section>';
            });
          }

          if (length && length !== '' && length !== null) {
            content = content + '<section><h5>Length</h5>' + (length / 1609.34).toFixed(1) + ' mi</section>';
          }

          if (address && address !== '' && address !== null) {
            try {
              address = JSON.parse(address).label;
            } catch (e) {
              // address is not JSON
            }

            content = content + '<section><h5>' + properties.class_name + ' Address</h5>' + address + '</section>';
          }

          if (website && website !== '' && website !== null) {
            content = content + '<section><h5>Website</h5><a href="' + properties.website + '" target="_blank">' + properties.website + '</section>';
          }

          if (content === '') {
            return null;
          } else {
            return content;
          }
        };
      }

      this.options.popup = config;
      L.Util.setOptions(this, this._toLeaflet(this.options));
    }

    me = this;

    reqwest({
      error: function (error) {
        var obj = L.extend(error, {
          message: 'There was an error loading the data from OuterSpatial.'
        });

        me.fire('error', obj);
        me.errorFired = obj;
      },
      success: function (response) {
        var config;
        var obj;

        if (response && response.responseText) {
          var geojson = JSON.parse(response.responseText);

          if (me.options.formatPopups) {
            me._collapseFeatureAttributes(geojson.features);
          }

          if (me.options.locationType === 'campgrounds' || me.options.locationType === 'trailheads') {
            config = (function () {
              var c;

              for (var j = 0; j < me._include.length; j++) {
                if (me._include[j].type === type) {
                  c = me._include[j];
                  break;
                }
              }

              if (c) {
                return c;
              }
            })();
            L.extend(me.options, {
              zIndexOffset: config.priority * -1000
            });
            L.GeoJSON.prototype.initialize.call(me, geojson, me.options);
          } else if (me.options.locationType === 'points_of_interest') {
            L.GeoJSON.prototype.initialize.call(me, geojson, me.options);

            me.getLayers().forEach(function (layer) {
              config = (function () {
                var c;

                for (var i = 0; i < me._include.length; i++) {
                  if (me._include[i].type === layer.feature.properties.point_type) {
                    c = me._include[i];
                    break;
                  }
                }

                if (c) {
                  return c;
                }
              })();
              layer.setZIndexOffset(config.priority * -1000);
            });
          } else {
            L.GeoJSON.prototype.initialize.call(me, geojson, me.options);
          }

          me.fire('ready');
          me._loaded = true;
          me.readyFired = true;

          if (me.options.prioritization) {
            me._update();
          }
        } else {
          obj = {
            message: 'There was an error loading the data from OuterSpatial.'
          };

          me.fire('error', obj);
          me.errorFired = obj;
        }

        return me;
      },
      url: 'https://' + (me.options.environment === 'production' ? '' : 'staging-') + 'cdn.outerspatial.com/static_data/organizations/' + me.options.organizationId + '/api_v2/' + me.options.locationType + '.geojson' + '?_=' + new Date().getTime()
    });

    function handleTag (key) {
      return key
        .toLowerCase()
        .split('_')
        .map(function (word) {
          if (word === 'rv') {
            return word.toUpperCase();
          } else {
            return word[0].toUpperCase() + word.substr(1);
          }
        })
        .join(' ');
    }
  },
  onAdd: function () {
    var me = this;

    if (me.options.prioritization) {
      me._map.on('moveend', function () {
        me._update();
      });
    }

    L.GeoJSON.prototype.onAdd.call(this, this._map);
  },
  _collapseFeatureAttributes: function (features) {
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
      }

      tags.forEach(function (tag) {
        tag.categories.forEach(function (category) {
          feature.properties['tag:' + category.name + ':' + tag.key] = tag.value;
        });
      });

      if (contentBlocks) {
        contentBlocks.forEach(function (contentBlock) {
          feature.properties['contentBlock:' + contentBlock.title] = contentBlock.body;
        });
      }
    });
  },
  _update: function () {
    var me = this;
    var active = [];
    var bounds = me._map.getBounds().pad(0.1);
    var layers = me.getLayers();
    var config;
    var i;
    var marker;
    var removedLayersClone;

    if (!me._removedLayers) {
      me._removedLayers = [];
    }

    for (i = 0; i < me._include.length; i++) {
      config = me._include[i];

      if (me._map.getZoom() >= config.minZoom) {
        active.push(config.type);
      }
    }

    i = layers.length;

    while (i--) {
      var pointType;
      marker = layers[i];

      if (marker.feature.properties.point_type !== undefined) {
        pointType = marker.feature.properties.point_type;
      } else {
        pointType = me._singularType;
      }

      if (active.indexOf(pointType) === -1 || !bounds.contains(marker.getLatLng())) {
        me._removedLayers.push(marker);
        marker.deselectLayer();
        me.removeLayer(marker);
      }
    }

    removedLayersClone = me._removedLayers.slice(0);

    for (var j = 0; j < removedLayersClone.length; j++) {
      var type;
      var index;

      marker = removedLayersClone[j];

      if (marker.feature.properties.point_type !== undefined) {
        type = marker.feature.properties.point_type;
      } else {
        type = me._singularType;
      }

      if (active.indexOf(type) > -1) {
        if (bounds.contains(marker.getLatLng())) {
          var factor;

          config = (function () {
            var c;

            for (var j = 0; j < me._include.length; j++) {
              if (me._include[j].type === type) {
                c = me._include[j];
                break;
              }
            }

            if (c) {
              return c;
            }
          })();
          factor = config.minZoomFactor;

          if (typeof factor === 'number') {
            var minZoom = config.minZoom;
            var zoom = 16;

            if (typeof minZoom === 'number' && ((minZoom + factor) < 16)) {
              zoom = minZoom + factor;
            }

            if (me._map.getZoom() >= zoom) {
              me.addLayer(marker);
              index = me._removedLayers.indexOf(marker);

              if (index > -1) {
                me._removedLayers.splice(index, 1);
              }
            } else if (me.hasLayer(marker)) {
              me._removedLayers.push(marker);
              marker.deselectLayer();
              me.removeLayer(marker);
            }
          } else if (!me.hasLayer(marker)) {
            me.addLayer(marker);
            index = me._removedLayers.indexOf(marker);

            if (index > -1) {
              me._removedLayers.splice(index, 1);
            }
          }
        }
      }
    }
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
