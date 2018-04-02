/* global L */
/* jshint camelcase: false */

'use strict';

var colorPresets = require('../preset/colors.json');
var topojson = require('../util/topojson');
var util = require('../util/util');
var color = require('color');

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
      var map = null;

      // TODO: If typeof config.onEachFeature === 'function', save it and call it.
      config.onEachFeature = function (feature, layer) {
        var clicks = 0;
        var geometry = layer.feature.geometry;

        function createBuffer (layer, latLngs) {
          var polyline;

          if (latLngs === undefined) {
            latLngs = layer.getLatLngs();
          }

          polyline = L.polyline(latLngs, {
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

        function mouseout (e) {
          var layer = e.target;

          if (!layer._map._isCurrentlySelected(layer)) {
            layer.deselectLayer();
          }
        }

        function mouseover (e) {
          var layer = e.target;
          var tooltipConfig = config.tooltip;

          if (!layer.isSelected) {
            layer.selectLayer();
          }

          if (tooltipConfig) {
            var properties = feature.properties;
            var tip;

            if (typeof tooltipConfig === 'function') {
              tip = tooltipConfig(properties);
            } else if (typeof tooltipConfig === 'string') {
              tip = util.handlebars(tooltipConfig, properties);
            }

            if (tip) {
              var target = e.target;
              var obj = {
                html: tip,
                layerId: target._leaflet_id
              };

              target._map._tooltips.push(obj);
              activeTip = obj;
            }
          }
        }

        layer.overlay = me;
        layer.deselectLayer = function () {
          if (layer.feature.geometry.type !== 'Point') {
            this.overlay.resetStyle(this);
          } else {
            if (this._circle) {
              this._circle.removeFrom(this._map);
              delete this._circle;
            }
          }

          this.isSelected = false;
        };

        layer.selectLayer = function () {
          if (this._map._isCurrentlySelected(this)) {
            this._map.clearSelectedLayer();
          } else if (!this.isSelected) {
            if (this.feature.geometry.type !== 'Point') {
              var options = this.feature.geometry.type === 'GeometryCollection' ? this.getLayers()[0].options : this.options;
              var selectedColor = color(options.color);

              if (selectedColor.luminosity() === 0 || selectedColor.luminosity() === 1) {
                selectedColor = color('grey');
              } else if (selectedColor.isDark()) {
                selectedColor = selectedColor.whiten(0.5);
              } else {
                selectedColor = selectedColor.blacken(0.5);
              }

              this.setStyle({
                stroke: true,
                opacity: 1,
                color: selectedColor.hex(),
                weight: Number(options.weight) + 3
              });
            } else {
              if (!this._circle) {
                this._circle = L.circleMarker(layer.getLatLng(), {radius: 10, color: 'yellow', fillColor: 'yellow', fillOpacity: 0.2});
              }

              this._circle.addTo(this._map);
            }

            this.isSelected = true;
          }
        };

        if (layer.feature.geometry.type === 'Point') {
          layer.on('movestart', function (e) {
            this.deselectLayer();
            this.off('mouseover', mouseover);
            this.off('mouseout', mouseout);
          });
          layer.on('moveend', function (e) {
            this.on('mouseover', mouseover);
            this.on('mouseout', mouseout);
          });
        }

        layer.on('mouseover', mouseover);
        layer.on('mouseout', mouseout);
        layer.on('click', function (e) {
          var layer = e.target;

          if (!map) {
            map = layer._map;
          }

          L.DomEvent.stop(e);
          if (map._isCurrentlySelected(layer)) {
            if (map.isDockedPopupOpen) {
              map.closeDockedPopup();
            }
          } else {
            map.setSelectedLayer(layer);
            detectAvailablePopupSpace = map.options.detectAvailablePopupSpace;

            if (map._controllingInteractivity === 'map') {
              clicks = 0;

              setTimeout(function () {
                if (!clicks) {
                  var properties = feature.properties;
                  var html = L.outerspatial.popup()._resultToHtml(properties, config.popup, null, null, map.options.popup);

                  if (typeof html === 'string') {
                    html = util.unescapeHtml(html);
                  }

                  if (config.dockedPopup) {
                    map.setDockedPopupContent(html);
                    map.openDockedPopup();
                  } else {
                    var popupWidth = (detectAvailablePopupSpace ? (util._getAvailableHorizontalSpace(map) < 300 ? util._getAvailableHorizontalSpace(map) : 300) : 300);
                    var popup = L.outerspatial.popup({
                      maxHeight: (detectAvailablePopupSpace ? util._getAvailableVerticalSpace(map) : undefined),
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
                    }
                  }
                }
              }, 200);
            } else {
              map.fireEvent('click', e);
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

        if (geometry.type === 'MultiLineString' || geometry.type === 'LineString' || geometry.type === 'GeometryCollection') {
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
