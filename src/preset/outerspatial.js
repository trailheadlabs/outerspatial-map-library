/* global L */

'use strict';

var reqwest = require('reqwest');

var OuterSpatialLayer = L.GeoJSON.extend({
  _include: [{
    maxZoom: 22,
    minZoom: 7,
    minZoomFactor: 0,
    priority: 2,
    symbol: 'campground',
    type: 'Campground'
  }, {
    maxZoom: 22,
    minZoom: 14,
    priority: 4,
    symbol: 'drinking-water',
    type: 'Drinking Water'
  }, {
    maxZoom: 22,
    minZoom: 4,
    minZoomFactor: 0,
    priority: 1,
    symbol: 'entrance-station',
    type: 'Entrance'
  }, {
    maxZoom: 22,
    minZoom: 14,
    priority: 4,
    symbol: 'food-service',
    type: 'Food Service'
  }, {
    maxZoom: 22,
    minZoom: 14,
    priority: 4,
    symbol: 'information',
    type: 'Information'
  }, {
    maxZoom: 22,
    minZoom: 14,
    priority: 4,
    symbol: 'interpretive-exhibit',
    type: 'Interpretive Exhibit'
  }, {
    maxZoom: 22,
    minZoom: 14,
    priority: 4,
    symbol: 'parking',
    type: 'Parking'
  }, {
    maxZoom: 22,
    minZoom: 14,
    priority: 4,
    symbol: 'playground',
    type: 'Playground'
  }, {
    maxZoom: 22,
    minZoom: 14,
    priority: 4,
    symbol: null,
    type: 'POI'
  }, {
    maxZoom: 22,
    minZoom: 14,
    priority: 3,
    symbol: 'restrooms',
    type: 'Restrooms'
  }, {
    maxZoom: 22,
    minZoom: 14,
    priority: 4,
    symbol: 'sanitary-disposal-station',
    type: 'Sanitary Disposal Station'
  }, {
    maxZoom: 22,
    minZoom: 14,
    priority: 4,
    symbol: 'showers',
    type: 'Showers'
  }, {
    maxZoom: 22,
    minZoom: 14,
    minZoomFactor: 0,
    priority: 3,
    symbol: 'store',
    type: 'Store'
  }, {
    maxZoom: 22,
    minZoom: 7,
    minZoomFactor: 0,
    priority: 3,
    symbol: 'trailhead',
    type: 'Trailhead'
  }, {
    maxZoom: 22,
    minZoom: 4,
    minZoomFactor: 0,
    priority: 1,
    symbol: 'visitor-center',
    type: 'Visitor Center'
  }],
  includes: [
    require('../mixin/geojson')
  ],
  options: {
    environment: 'production',
    formatPopups: true, // TODO: Just check for "popups" config property
    searchable: true
  },
  initialize: function (options) {
    var me = this;
    var singularTypes = {
      areas: 'Area',
      campgrounds: 'Campground',
      points_of_interest: 'Point of Interest',
      trail_segments: 'Trail Segment',
      trailheads: 'Trailhead',
      trails: 'Trail'
    };

    function fetch (environment, organizationId, locationType) {
      if (locationType === 'campgrounds' || locationType === 'trailheads') {
        locationType = 'points_of_interest';
      }

      return reqwest({
        type: 'json',
        url: 'https://' + (environment === 'production' ? '' : 'staging-') + 'cdn.outerspatial.com/static_data/organizations/' + organizationId + '/api_v2/' + locationType + '.geojson'
      });
    }
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

    L.Util.setOptions(this, this._toLeaflet(options));

    if (!this.options.locationType) {
      console.error('The "locationType" property is required for the OuterSpatial preset.');
    }

    if (!this.options.organizationId) {
      console.error('The "organizationId" property is required for the OuterSpatial preset.');
    }

    if (this.options.formatPopups) {
      var popupConfig = {};

      if (options.popup) {
        popupConfig = options.popup;
      }

      if (!popupConfig.description && !popupConfig.title) {
        popupConfig.description = function (properties) {
          var accessibilityDescription = properties.accessibility_description;
          var address = properties.address;
          var content = '';
          var contentBlocks = properties.content_blocks;
          var description = properties.description;
          var length = properties.length;
          var tags = properties.tags;
          var website = properties.website;

          if (description && description !== null && description !== '') {
            content = content + '' +
              '<section>' + description + '</section>' +
            '';
          }

          if (tags) {
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
              Trail: [
                'Accessibility',
                'Allowed Use',
                'Difficulty',
                'Status',
                'Trail Type'
              ],
              Trailhead: [
                'Accessibility',
                'Amenities',
                'Status'
              ],
              TrailSegment: [
                'Accessibility',
                'Allowed Use',
                'Difficulty',
                'Status',
                'Trail Type'
              ]
            };
            var tagSections = {};

            tags.forEach(function (tag) {
              if (tag.categories.length > 0 && tag.value === 'yes') {
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
              if (key !== 'Status') {
                content = content + '' +
                  '<section>' +
                    '<h5>' + key + '</h5>' +
                    '<span style="color:#7da836;">' + tagSections[key].sort().join(', ') + '</span>' +
                  '</section>' +
                '';
              }
            }
          }

          if (accessibilityDescription && accessibilityDescription !== '') {
            content = content + '' +
              '<section>' +
                '<h5>Accessibility Description</h5>' +
                accessibilityDescription +
              '</section>' +
            '';
          }

          if (contentBlocks) {
            contentBlocks.forEach(function (contentBlock) {
              content = content + '' +
                '<section>' +
                  '<h5>' + contentBlock.title + '</h5>' +
                  contentBlock.body +
                '</section>' +
              '';
            });
          }

          if (length && length !== '') {
            var miles = (length / 1609.34).toFixed(1);

            content = content + '' +
              '<section>' +
                '<h5>Length</h5>' +
                (miles < 0.1 ? '< 0.1' : miles) + ' mi' +
              '</section>' +
            '';
          }

          if (address && address !== '') {
            try {
              address = JSON.parse(address).label;
            } catch (e) {
              // Address is not JSON
            }

            content = content + '' +
              '<section>' +
                '<h5>Address</h5>' +
                '<div class="url">' +
                  '<a href="https://maps.google.com/maps?daddr=' + address + '" target="_blank">' + address + '</a>' +
                '</div>' +
              '</section>' +
            '';
          }

          if (website && website !== '') {
            content = content + '' +
              '<section>' +
                '<h5>Website</h5>' +
                '<div class="url">' +
                  '<a href="' + properties.website + '" target="_blank">' + properties.website + '</a>' +
                '</div>' +
              '</section>' +
            '';
          }

          if (content === '') {
            return null;
          } else {
            return content;
          }
        };
        popupConfig.image = function (properties) {
          var imageAttachments = properties.image_attachments;

          if (imageAttachments && imageAttachments.length > 0) {
            var imageAttachment = imageAttachments[0];
            var image = {
              caption: imageAttachment.image.caption
            };

            if (window.innerWidth <= 320) {
              image.url = imageAttachment.image.versions.small_square.url;
            } else {
              image.url = imageAttachment.image.versions.medium_square.url;
            }

            return image;
          } else {
            return null;
          }
        };
        popupConfig.title = function (properties) {
          var banner = '';
          var className = properties.class_name;
          var subtitle;
          var title;
          var type;

          if (className === 'PointOfInterest') {
            type = properties.point_type ? properties.point_type : 'Point of Interest';
          } else if (className === 'TrailSegment') {
            type = 'Trail Segment';
          } else {
            type = className;
          }

          subtitle = (className === 'Area' || className === 'TrailSegment' ? type : type + (properties.area_id ? ' in ' + properties.area.name : ''));

          if (properties.name) {
            title = '{{name}}';
          } else {
            title = 'Unnamed';
          }

          if (properties['tag:Status:closed'] === 'yes') {
            banner = '' +
              '<img alt="Closed banner" class="banner" src="' + window.L.Icon.Default.imagePath + '/outerspatial/closed-indicator-right' + (L.Browser.retina ? '@2x' : '') + '.png" style="height:20px;width:51px;" />' +
            '';
          }

          return {
            image: banner,
            subtitle: subtitle,
            title: title
          };
        };
      }

      options.popup = popupConfig;
    }

    if (this.options.locationType === 'campgrounds' || this.options.locationType === 'points_of_interest' || this.options.locationType === 'trailheads') {
      this.options.prioritization = true;

      if (this.options.locationType === 'campgrounds' || this.options.locationType === 'trailheads') {
        var config = (function () {
          var c;

          for (var j = 0; j < me._include.length; j++) {
            if (me._include[j].type === singularTypes[me.options.locationType]) {
              c = me._include[j];
              break;
            }
          }

          if (c) {
            return c;
          }
        })();

        if (!options.styles) {
          options.styles = {
            point: {
              'marker-library': 'outerspatialsymbollibrary',
              'marker-symbol': (function () {
                if (config && config.symbol) {
                  return config.symbol + '-white';
                } else {
                  return undefined;
                }
              })()
            }
          };
        }

        options.zIndexOffset = config.priority * -1000;
      }
    }

    if (this.options.searchable) {
      options.search = function (value) {
        var re = new RegExp(value, 'i');
        var results = [];
        var layers;

        if (this.L.options.cluster) {
          layers = this.L.L.getLayers();
        } else {
          layers = this.L.getLayers();
        }

        if (me._removedLayers) {
          layers = layers.concat(me._removedLayers);
        }

        for (var key in layers) {
          var layer = layers[key];

          if (layers.hasOwnProperty(key) && layer.hasOwnProperty('feature')) {
            if (re.test(layer.feature.properties.name)) {
              var className = layers[key].feature.properties.class_name;
              var obj;
              var type;

              if (className === 'PointOfInterest') {
                type = 'Point of Interest';
              } else if (className === 'TrailSegment') {
                type = 'Trail Segment';
              } else {
                type = className;
              }

              obj = {
                bounds: null,
                latLng: null,
                layer: layer,
                name: layers[key].feature.properties.name,
                type: type + (function () {
                  if (type === 'Area') {
                    return '';
                  } else {
                    var areaName = layer.feature.properties.area ? layer.feature.properties.area.name : undefined;

                    if (areaName && typeof areaName === 'string' && areaName.length) {
                      return ' in ' + areaName;
                    } else {
                      return '';
                    }
                  }
                })()
              };

              if (layer.feature.geometry.type.toLowerCase() === 'point') {
                obj.latLng = layer.getLatLng();
              } else {
                obj.bounds = layer.getBounds();
              }

              results.push(obj);
            }
          }
        }

        return results;
      };
    }

    L.Util.setOptions(this, this._toLeaflet(options));

    if (this.options.locationType === 'primary_points_of_interest') {
      var campgrounds = fetch(me.options.environment, me.options.organizationId, 'campgrounds').then(function (geojson) {
        geojson.features = geojson.features.filter(function (feature) {
          return feature.properties.point_type === 'Campground';
        });

        return geojson;
      });
      var pointsOfInterest = fetch(me.options.environment, me.options.organizationId, 'points_of_interest').then(function (geojson) {
        geojson.features = geojson.features.filter(function (feature) {
          var poiType = feature.properties.point_type;

          return (poiType === 'Entrance' || poiType === 'Visitor Center');
        });

        return geojson;
      });
      var trailheads = fetch(me.options.environment, me.options.organizationId, 'trailheads').then(function (geojson) {
        geojson.features = geojson.features.filter(function (feature) {
          return feature.properties.point_type === 'Trailhead';
        });

        return geojson;
      });

      Promise.all([
        campgrounds,
        pointsOfInterest,
        trailheads
      ]).then(function (values) {
        var geojson = {
          features: [],
          type: 'FeatureCollection'
        };

        values.forEach(function (value) {
          geojson.features = geojson.features.concat(value.features);
        });
        me._collapseFeatureAttributes(geojson.features);
        L.GeoJSON.prototype.initialize.call(me, geojson, me.options);
        me.getLayers().forEach(function (layer) {
          config = (function () {
            var type = layer.feature.properties.point_type ? layer.feature.properties.point_type : layer.feature.properties.class_name;
            var c;

            for (var i = 0; i < me._include.length; i++) {
              if (me._include[i].type === type) {
                c = me._include[i];
                break;
              }
            }

            if (c) {
              return c;
            }
          })();

          if (layer.options.styles) {
            if (typeof layer.options.styles === 'function') {
              layer.options.styles = layer.options.styles(layer.feature.properties);
            }
          } else {
            layer.options.styles = {
              point: {
                'marker-library': 'outerspatialsymbollibrary',
                'marker-symbol': (function () {
                  if (config && config.symbol) {
                    return config.symbol + '-white';
                  } else {
                    return undefined;
                  }
                })()
              }
            };
          }

          layer.setIcon(L.outerspatial.icon.outerspatialsymbollibrary(layer.options.styles.point));

          if (config) {
            layer.setZIndexOffset(config.priority * -1000);
          }
        });
        me.fire('ready');
        me._loaded = true;
        me.readyFired = true;

        if (me.options.prioritization) {
          me._update();
        }
      }, function (error) {
        var obj = L.extend(error, {
          message: 'There was an error loading the data from OuterSpatial.'
        });

        me.fire('error', obj);
        me.errorFired = obj;
      });
    } else {
      fetch(me.options.environment, me.options.organizationId, me.options.locationType).then(function (geojson) {
        switch (me.options.locationType) {
          case 'campgrounds':
            geojson.features = geojson.features.filter(function (feature) {
              return feature.properties.point_type === 'Campground';
            });
            break;
          case 'points_of_interest':
            geojson.features = geojson.features.filter(function (feature) {
              return feature.properties.point_type !== 'Campground' && feature.properties.point_type !== 'Trailhead';
            });
            break;
          case 'trailheads':
            geojson.features = geojson.features.filter(function (feature) {
              return feature.properties.point_type === 'Trailhead';
            });
            break;
        }

        L.GeoJSON.prototype.initialize.call(me, geojson, me.options);

        if (me.options.locationType === 'points_of_interest') {
          me.getLayers().forEach(function (layer) {
            config = (function () {
              // Default
              var c = null;

              for (var i = 0; i < me._include.length; i++) {
                if (me._include[i].type === layer.feature.properties.point_type) {
                  c = me._include[i];
                  break;
                }
              }

              if (c === null) {
                layer.feature.properties.point_type = 'POI';
                c = me._include.filter(function (obj) {
                  return obj.type === 'POI';
                })[0];
              }

              return c;
            })();

            if (layer.options.styles) {
              if (typeof layer.options.styles === 'function') {
                layer.options.styles = layer.options.styles(layer.feature.properties);
              }
            } else {
              layer.options.styles = {
                point: {
                  'marker-library': 'outerspatialsymbollibrary',
                  'marker-symbol': (function () {
                    if (config && config.symbol) {
                      return config.symbol + '-white';
                    } else {
                      return undefined;
                    }
                  })()
                }
              };
            }

            layer.setIcon(L.outerspatial.icon.outerspatialsymbollibrary(layer.options.styles.point));

            if (config) {
              layer.setZIndexOffset(config.priority * -1000);
            }
          });
        }

        me.fire('ready');
        me._loaded = true;
        me.readyFired = true;

        if (me.options.prioritization) {
          me._update();
        }
      }, function (error) {
        var obj = L.extend(error, {
          message: 'There was an error loading the data from OuterSpatial.'
        });

        me.fire('error', obj);
        me.errorFired = obj;
      });
    }
  },
  onAdd: function (map) {
    var me = this;

    if (this.options.prioritization) {
      map.on('moveend', function () {
        me._update();
      });
    }

    L.GeoJSON.prototype.onAdd.call(this, this._map);
  },
  _collapseFeatureAttributes: function (features) {
    features.forEach(function (feature) {
      var area = feature.properties.area;
      var contentBlocks = feature.properties.content_blocks;
      var tags = feature.properties.tags;

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

    if (me._map) {
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
          pointType = marker.feature.properties.class_name;
        }

        if (active.indexOf(pointType) === -1 || !bounds.contains(marker.getLatLng())) {
          me._removedLayers.push(marker);
          marker.deselectLayer();
          me.removeLayer(marker);
        }
      }

      removedLayersClone = me._removedLayers.slice(0);

      for (var j = 0; j < removedLayersClone.length; j++) {
        var index;
        var type;

        marker = removedLayersClone[j];

        if (marker.feature.properties.point_type !== undefined) {
          type = marker.feature.properties.point_type;
        } else {
          type = pointType = marker.feature.properties.class_name;
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
