/* global L */
/* jshint camelcase: false */

// 'use strict';

var colorPresets = require('../preset/colors.json');
var topojson = require('../util/topojson');
var util = require('../util/util');

module.exports = {
  _types: {
    'GeometryCollection': 'collection',
    'LineString': 'line',
    'MultiLineString': 'line',
    'MultiPoint': 'point',
    'MultiPolygon': 'polygon',
    'Point': 'point',
    'Polygon': 'polygon'
  },
  addData: function (feature) {
    if (/\btopology\b/i.test(feature.type)) {
      for (var prop in feature.objects) {
        var geojson = topojson.feature(feature, feature.objects[prop]);

        this._checkGeometryType(geojson);
        L.GeoJSON.prototype.addData.call(this, geojson);
      }
    } else {
      this._checkGeometryType(feature);
      L.GeoJSON.prototype.addData.call(this, feature);
    }
  },
  onAdd: function (map) {
    this._map = map;
    this._addAttribution();

    if (this.options.zoomToBounds) {
      this.on('ready', function () {
        map.fitBounds(this.getBounds());
      });
    }

    L.GeoJSON.prototype.onAdd.call(this, map);
  },
  onRemove: function (map) {
    delete this._map;
    this._removeAttribution();
    L.GeoJSON.prototype.onRemove.call(this, map);
  },
  _addAttribution: function () {
    var attribution = this.options.attribution;

    if (attribution && this._map.attributionControl) {
      this._map.attributionControl.addAttribution(attribution);
    }
  },
  _checkGeometryType: function (feature) {
    if (!this._geometryTypes) {
      this._geometryTypes = [];
    }

    if (feature.geometry && feature.geometry.type) {
      var type = this._types[feature.geometry.type];

      if (type === 'collection') {
        for (var i = 0; i < feature.geometry.geometries.length - 1; i++) {
          var geometry = feature.geometry.geometries[i];

          type = (function () {
            var t = geometry.type.toLowerCase();

            if (t.indexOf('line') !== -1) {
              return 'line';
            } else if (t.indexOf('point') !== -1) {
              return 'point';
            } else if (t.indexOf('polygon') !== -1) {
              return 'polygon';
            } else if (t === 'geometrycollection') {
              return 'collection';
            }
          })();

          if (this._geometryTypes.indexOf(type) === -1) {
            this._geometryTypes.push(type);
          }
        }
      } else {
        if (this._geometryTypes.indexOf(type) === -1) {
          this._geometryTypes.push(type);
        }
      }
    }
  },
  _removeAttribution: function () {
    var attribution = this.options.attribution;

    if (attribution && this._map.attributionControl) {
      this._map.attributionControl.removeAttribution(attribution);
    }
  },
  _toLeaflet: function (config) {
    // TODO: Support preset colors. Setup a "colorProperties" array that contains the name of the properties that can contain colors, then use those to pull in presets.
    // TODO: Support handlebars templates.
    var matchSimpleStyles = {
      'fill': 'fillColor',
      'fill-opacity': 'fillOpacity',
      'stroke': 'color',
      'stroke-opacity': 'opacity',
      'stroke-width': 'weight'
    };
    var configStyles;
    var me = this;

    if (typeof config.clickable === 'undefined' || config.clickable === true) {
      var activeTip = null;
      var detectAvailablePopupSpace = false;

      // TODO: Move up
      function createBuffer (layer, latLngs) {
        var polyline;

        if (latLngs === undefined) {
          latLngs = layer.getLatLngs();
        }

        polyline = new L.Polyline(latLngs, {
          opacity: 0,
          pane: me.options.pane,
          weight: 15
        });
        polyline.on('click', function (e) {
          layer.fire('click', e);
        });
        polyline.on('mouseover', function (e) {
          layer.fire('mouseover', e);
        });
        polyline.on('mouseout', function (e) {
          layer.fire('mouseout', e);
        });

        return polyline;
      }
      // TODO: Move up
      function mouseout (e) {
        var target = e.target;

        if (!target._map._isCurrentlySelected(target)) {
          target.deselectLayer();
        }
      }
      // TODO: Move up
      function mouseover (e) {
        var target = e.target;
        var tooltipConfig = config.tooltip;

        if (!target.isSelected) {
          target.selectLayer();
        }

        if (tooltipConfig) {
          var properties = target.feature.properties;
          var tip;

          if (typeof tooltipConfig === 'function') {
            tip = tooltipConfig(properties);
          } else if (typeof tooltipConfig === 'string') {
            tip = util.handlebars(tooltipConfig, properties);
          }

          if (tip) {
            target = e.target;

            var obj = {
              html: tip,
              layerId: target._leaflet_id
            };

            target._map._tooltips.push(obj);
            activeTip = obj;
          }
        }
      }

      // TODO: Needs a lot of clean up.
      // TODO: If typeof config.onEachFeature === 'function', save it and call it.
      config.onEachFeature = function (feature, layer) {
        var clicks = 0;
        var geometry = layer.feature.geometry;

        layer.deselectLayer = function () {
          var map = me._map;

          if (!map) {
            map = layer._map;
          }

          if (geometry.type === 'Point') {
            if (this._circle) {
              this._circle.removeFrom(map);
              delete this._circle;
            }
          } else {
            me.resetStyle(this);
          }

          this.isSelected = false;
        };
        layer.selectLayer = function () {
          var map = me._map;

          if (!map) {
            map = layer._map;
          }

          if (!map._isCurrentlySelected(this) && !this.isSelected) {
            if (this.feature.geometry.type === 'Point') {
              if (!this._circle) {
                var color = 'black';

                // TODO: Also support functions
                if (layer.options && layer.options.styles && layer.options.styles.point && layer.options.styles.point['marker-color'] && typeof layer.options.styles.point['marker-color'] === 'string') {
                  color = layer.options.styles.point['marker-color'];
                }

                this._circle = new L.CircleMarker(layer.getLatLng(), {
                  color: color,
                  fillColor: color,
                  fillOpacity: 0.2,
                  radius: 10
                });
              }

              this._circle.addTo(map);
            } else {
              var options = this.feature.geometry.type === 'GeometryCollection' ? this.getLayers()[0].options : this.options;
              var weight = Number(options.weight);

              this.setStyle({
                color: options.color,
                opacity: 1,
                stroke: true,
                weight: weight + (weight * 0.66)
              });
              this.bringToFront();
            }

            this.isSelected = true;
          }
        };

        layer.on('click', function (e) {
          var layer = e.target;

          L.DomEvent.stop(e);

          if (layer._map._isCurrentlySelected(layer)) {
            if (layer._map._controllingInteractivity === 'map') {
              clicks = 0;

              setTimeout(function () {
                if (!clicks) {
                  if (layer._map.isDockedPopupOpen) {
                    layer._map.closeDockedPopup();
                  }
                }
              }, 200);
            }
          } else {
            if (layer._map._controllingInteractivity === 'map') {
              clicks = 0;

              setTimeout(function () {
                if (!clicks) {
                  var properties = feature.properties;
                  var html = L.outerspatial.popup()._resultToHtml(properties, config.popup, null, null, layer._map.options.popup, layer);

                  layer._map.setSelectedLayer(layer);
                  detectAvailablePopupSpace = layer._map.options.detectAvailablePopupSpace;

                  if (typeof html === 'string') {
                    html = util.unescapeHtml(html);
                  }

                  if (layer._map.options.dockedPopups === true) {
                    layer._map._divDockedPopupContent.innerHTML = '';
                    layer._map.setDockedPopupContent(html);
                    layer._map.openDockedPopup();
                  } else {
                    var popupWidth = (detectAvailablePopupSpace ? (util._getAvailableHorizontalSpace(layer._map) < 300 ? util._getAvailableHorizontalSpace(layer._map) : 300) : 300);
                    var popup = L.outerspatial.popup({
                      maxHeight: (detectAvailablePopupSpace ? util._getAvailableVerticalSpace(layer._map) : undefined),
                      maxWidth: popupWidth,
                      minWidth: popupWidth
                    });

                    if (html) {
                      if (feature.geometry.type === 'Point') {
                        popup.setContent(html);
                        layer
                          .bindPopup(popup)
                          .openPopup()
                          .unbindPopup(popup);
                      } else {
                        popup
                          .setContent(html)
                          .setLatLng(e.latlng.wrap())
                          .openOn(layer._map);
                      }

                      layer._popup = popup;
                    }
                  }
                }
              }, 200);
            } else {
              layer._map.fireEvent('click', e);
            }
          }
        });
        layer.on('dblclick', function (e) {
          clicks++;
          e.containerPoint = e.target._map.latLngToContainerPoint(e.latlng);
          e.target._map.fireEvent('dblclick', e);
        });
        layer.on('mouseout', function (e) {
          if (activeTip) {
            var removeIndex = null;
            var tooltips = e.target._map._tooltips;

            for (var i = 0; i < tooltips.length; i++) {
              var obj = tooltips[i];

              if (activeTip.layerId === obj.layerId) {
                removeIndex = i;
                break;
              }
            }

            if (removeIndex !== null) {
              tooltips.splice(removeIndex, 1);
            }

            activeTip = null;
          }
        });
        layer.on('mouseout', mouseout);
        layer.on('mouseover', mouseover);
        layer.on('remove', function (e) {
          if (this.isSelected) {
            var map = me._map;

            if (!map) {
              map = layer._map;
            }

            if (this._circle) {
              this._circle.removeFrom(map);
              delete this._circle;
            }

            if (layer._popup) {
              layer._popup.remove();
            } else if (layer._map.options.dockedPopups === true) {
              layer._map.closeDockedPopup();
            }
          }
        });

        if (geometry.type === 'Point') {
          layer
            .on('moveend', function (e) {
              this.on('mouseover', mouseover);
              this.on('mouseout', mouseout);
            })
            .on('movestart', function (e) {
              this.deselectLayer();
              this.off('mouseover', mouseover);
              this.off('mouseout', mouseout);
            });
        }

        if (geometry.type === 'GeometryCollection' || geometry.type === 'LineString' || geometry.type === 'MultiLineString') {
          if (geometry.geometries) {
            geometry.geometries.forEach(function (geometry) {
              if (geometry.type === 'MultiLineString') {
                geometry.coordinates.forEach(function (line) {
                  me.addLayer(createBuffer(layer, L.GeoJSON.coordsToLatLngs(line)));
                });
              } else {
                me.addLayer(createBuffer(layer, L.GeoJSON.coordsToLatLngs(geometry.coordinates)));
              }
            });
          } else {
            me.addLayer(createBuffer(layer));
          }
        }
      };
    }

    config.pointToLayer = function (feature, latLng) {
      // TODO: Support L.CircleMarker and L.Icon
      var configStyles;
      var icon = {
        'marker-color': '#000000',
        'marker-size': 'medium',
        'marker-library': 'maki',
        'marker-symbol': null
      };
      var properties = feature.properties;
      var property;
      var value;

      configStyles = typeof config.styles === 'function' ? config.styles(properties) : config.styles;

      if (!configStyles || !configStyles.point) {
        for (property in icon) {
          value = properties[property];

          if (value) {
            icon[property] = value;
          }
        }

        icon = L.outerspatial.icon[icon['marker-library']](icon);
      } else {
        configStyles = typeof configStyles.point === 'function' ? configStyles.point(properties) : configStyles.point;

        if (configStyles) {
          if (typeof configStyles.iconUrl === 'string') {
            icon = new L.Icon(configStyles);
          } else {
            for (property in icon) {
              value = configStyles[property];

              if (value) {
                icon[property] = value;
              }
            }

            if (!configStyles.ignoreFeatureStyles) {
              for (property in icon) {
                value = properties[property];

                if (value) {
                  icon[property] = value;
                }
              }
            }

            icon = L.outerspatial.icon[icon['marker-library']](icon);
          }
        } else {
          if (!configStyles.ignoreFeatureStyles) {
            for (property in icon) {
              value = properties[property];

              if (value) {
                icon[property] = value;
              }
            }
          }

          icon = L.outerspatial.icon[icon['marker-library']](icon);
        }
      }

      return new L.Marker(latLng, L.extend(config, {
        icon: icon,
        keyboard: false,
        riseOnHover: true
      }));
    };
    config.style = function (feature) {
      var type = (function () {
        var t = feature.geometry.type.toLowerCase();

        if (t.indexOf('line') !== -1) {
          return 'line';
        } else if (t.indexOf('point') !== -1) {
          return 'point';
        } else if (t.indexOf('polygon') !== -1) {
          return 'polygon';
        } else if (t === 'geometrycollection') {
          return 'collection';
        }
      })();

      if (type === 'collection') {
        var collectionTypes = [];

        feature.geometry.geometries.forEach(function (geometry) {
          if (collectionTypes.indexOf(geometry.type) === -1) {
            collectionTypes.push(geometry.type);
          }
        });

        if (collectionTypes.length === 1) {
          type = (function () {
            var t = collectionTypes[0].toLowerCase();

            if (t.indexOf('line') !== -1) {
              return 'line';
            } else if (t.indexOf('point') !== -1) {
              return 'point';
            } else if (t.indexOf('polygon') !== -1) {
              return 'polygon';
            } else if (t === 'geometrycollection') {
              return 'collection';
            }
          })();
        }
      }

      if (type !== 'point') {
        // TODO: Add support for passing Leaflet styles in.
        var count = 0;
        var style = colorPresets.gold;
        var properties;
        var property;

        if (type === 'line') {
          delete style.fill;
        }

        if (typeof feature.properties === 'object') {
          properties = feature.properties;
        } else {
          properties = {};
        }

        for (property in matchSimpleStyles) {
          if (typeof properties[property] !== 'undefined' && properties[property] !== null && properties[property] !== '') {
            style[matchSimpleStyles[property]] = properties[property];
          }
        }

        configStyles = typeof config.styles === 'function' ? config.styles(properties) : config.styles;

        if (configStyles) {
          if (type === 'collection') {
            if (configStyles.polygon) {
              configStyles = typeof configStyles.polygon === 'function' ? configStyles.polygon(properties) : configStyles.polygon;
            } else {
              configStyles = typeof configStyles.line === 'function' ? configStyles.line(properties) : configStyles.line;
            }
          } else {
            configStyles = typeof configStyles[type] === 'function' ? configStyles[type](properties) : configStyles[type];
          }

          if (configStyles) {
            for (property in matchSimpleStyles) {
              if (typeof configStyles[property] !== 'undefined' && configStyles[property] !== null && configStyles[property] !== '') {
                style[matchSimpleStyles[property]] = configStyles[property];
              }
            }
          }
        }

        for (property in style) {
          count++;
          break;
        }

        if (count) {
          return style;
        }
      }
    };

    return config;
  }
};
