/* global L */
/* jshint camelcase: false */

'use strict';

var reqwest = require('reqwest');
var util = require('../util/util');

var CartoDbLayer = L.TileLayer.extend({
  includes: [
    require('../mixin/grid')
  ],
  options: {
    errorTileUrl: L.Util.emptyImageUrl,
    format: 'png',
    subdomains: [
      0,
      1,
      2,
      3
    ]
  },
  statics: {
    GEOMETRY_TYPES: {
      'st_linestring': 'line',
      'st_multilinestring': 'line',
      'st_multipoint': 'point',
      'st_multipolygon': 'polygon',
      'st_point': 'point',
      'st_polygon': 'polygon'
    }
  },
  _update: function () {
    if (this._urlTile) {
      L.TileLayer.prototype._update.call(this);
    }
  },
  initialize: function (options) {
    var me = this;

    if (!L.Browser.retina || !options.detectRetina) {
      options.detectRetina = false;
    }

    L.Util.setOptions(this, options);
    util.strict(this.options.table, 'string');
    util.strict(this.options.user, 'string');
    L.TileLayer.prototype.initialize.call(this, undefined, this.options);
    this._urlApi = 'https://' + this.options.user + '.cartodb.com/api/v2/sql';
    reqwest({
      crossOrigin: true,
      error: function (error) {
        error.message = JSON.parse(error.response).error[0];
        me.fire('error', error);
        me.errorFired = error;
      },
      success: function (response) {
        if (response) {
          var layer = {
            options: {},
            type: 'cartodb'
          };
          var queryFields = [];

          if (me.options.cartocss) {
            me._cartocss = me.options.cartocss;
          } else if (me.options.styles) {
            me._cartocss = me._stylesToCartoCss(me.options.styles);
          }

          me._hasInteractivity = false;
          me._interactivity = null;

          if (me.options.interactivity) {
            me._interactivity = me.options.interactivity.split(',');
          } else if (me.options.clickable !== false && response.rows) {
            me._interactivity = [];

            for (var prop in response.fields) {
              if (prop === 'the_geom' || prop === 'the_geom_webmercator') {
                queryFields.push(prop);
              } else {
                if (response.fields[prop].type === 'date') {
                  me._interactivity.push(prop);
                  queryFields.push('to_char(' + prop + ', \'YYYY-MM-DD-THH24:MI:SS TZ\') AS ' + prop);
                } else {
                  me._interactivity.push(prop);
                  queryFields.push(prop);
                }
              }
            }
          }

          if (L.Util.isArray(me._interactivity) && me._interactivity.length) {
            me._hasInteractivity = true;
          }

          layer.options.sql = me._sql = (me.options.sql || ('SELECT ' + queryFields.join(',') + ' FROM ' + me.options.table + ';'));

          if (me._cartocss) {
            layer.options.cartocss = me._cartocss;
            layer.options.cartocss_version = '2.1.1';
          }

          if (me._interactivity) {
            layer.options.interactivity = me._interactivity;
          }

          reqwest({
            crossOrigin: true,
            error: function (response) {
              var obj = {};

              if (response && response.responseText) {
                response = JSON.parse(response.responseText);

                if (response.errors && response.errors.length) {
                  obj.message = response.errors[0];
                } else {
                  obj.message = 'An unspecified error occured.';
                }
              } else {
                obj.message = 'An unspecified error occured.';
              }

              me.fire('error', obj);
            },
            success: function (response) {
              if (response) {
                // This is the only layer handler that we don't default everything to https for.
                // This is because CartoDB's SSL endpoint doesn't support subdomains, so there is a performance hit for when using https.
                // If the web page is using https, however, we do want to default to it - even if it means taking a performance hit.
                var root = (window.location.protocol === 'https:' ? 'https://' : 'http://{s}.') + response.cdn_url[window.location.protocol === 'https:' ? 'https' : 'http'] + '/' + me.options.user + '/api/v1/map/' + response.layergroupid;
                var template = '{z}/{x}/{y}';

                if (me._hasInteractivity && me._interactivity.length) {
                  me._urlGrid = root + '/0/' + template + '.grid.json';
                }

                me._urlTile = root + '/' + template + '.png';
                me.setUrl(me._urlTile);
                me.redraw();
                me.fire('ready');
                me.readyFired = true;

                return me;
              } else {
                me.fire('error', {
                  msg: 'No response was received.'
                });
              }
            },
            type: 'json',
            url: util.buildUrl('https://' + me.options.user + '.cartodb.com/api/v1/map', {
              config: JSON.stringify({
                layers: [
                  layer
                ],
                version: '1.0.1'
              })
            })
          });
        }
      },
      type: 'json',
      url: util.buildUrl(this._urlApi, {
        q: 'SELECT * FROM ' + this.options.table + ' LIMIT 1;'
      })
    });
    reqwest({
      crossOrigin: true,
      success: function (response) {
        me._geometryTypes = [];

        if (response && response.rows && response.rows.length) {
          var geometryType = response.rows[0].st_geometrytype;

          if (geometryType) {
            me._geometryTypes.push(CartoDbLayer.GEOMETRY_TYPES[geometryType.toLowerCase()]);
          }
        }
      },
      type: 'json',
      url: util.buildUrl(this._urlApi, {
        q: 'select ST_GeometryType(the_geom) from ' + this.options.table + ' where the_geom IS NOT NULL limit 1;'
      })
    });
  },
  _getGridData: function (latLng, callback) {
    var me = this;

    if (this._urlGrid) {
      this._getTileGrid(L.Util.template(this._urlGrid, L.Util.extend({
        s: this.options.subdomains[Math.floor(Math.random() * this.options.subdomains.length)]
      }, this._getTileCoords(latLng))), latLng, function (resultData, gridData) {
        if (resultData === 'loading') {
          callback({
            layer: me,
            results: 'loading'
          });
        } else {
          if (gridData) {
            callback({
              layer: me,
              results: [
                gridData
              ]
            });
          } else {
            callback({
              layer: me,
              results: null
            });
          }
        }
      });
    } else {
      callback({
        layer: me,
        results: null
      });
    }
  },
  _stylesToCartoCss: function (styles) {
    var cartoCss = {};
    var match = {
      'fill': 'polygon-fill',
      'fill-opacity': 'polygon-opacity',
      'marker-color': 'marker-fill',
      'marker-size': function (value) {
        var size = 8;

        if (value === 'large') {
          size = 16;
        } else if (value === 'medium') {
          size = 12;
        }

        cartoCss['marker-height'] = size;
        cartoCss['marker-width'] = size;
      },
      'stroke': 'line-color',
      'stroke-opacity': 'line-opacity',
      'stroke-width': 'line-width'
    };

    for (var property in styles) {
      var value = styles[property];

      if (typeof match[property] === 'function') {
        match[property](value);
      } else if (typeof match[property] === 'string') {
        cartoCss[match[property]] = value;
      }
    }

    return '#layer' + JSON.stringify(cartoCss).replace(/"/g, '').replace(/,/g, ';');
  }
});

module.exports = function (options) {
  options = options || {};

  if (!options.type) {
    options.type = 'cartodb';
  }

  return new CartoDbLayer(options);
};
