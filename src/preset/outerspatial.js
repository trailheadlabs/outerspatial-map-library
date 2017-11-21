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

    type = singularTypes[this.options.locationType];

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

        config.images = function (properties) {
          var images = [];

          if (properties.image_attachments && properties.image_attachments.length > 0) {
            properties.image_attachments.forEach(function (imageAttachment) {
              var image = {};

              if (window.innerWidth <= 320) {
                image.src = imageAttachment.image.versions.small_square.url;
              } else {
                image.src = imageAttachment.image.versions.medium_square.url;
              }

              image.caption = imageAttachment.image.caption;
              image.description = imageAttachment.image.description;
              images.push(image);
            });
            return images;
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
        var obj;

        if (response && response.responseText) {
          var geojson = JSON.parse(response.responseText);

          if (me.options.formatPopups) {
            me._collapseFeatureAttributes(geojson.features);
          }

          L.GeoJSON.prototype.initialize.call(me, geojson, me.options);
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
