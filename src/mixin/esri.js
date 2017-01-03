/* global L */
/* jshint camelcase: false */

'use strict';

var reqwest = require('reqwest');

module.exports = {
  _boundsToExtent: function (bounds) {
    var ne = bounds.getNorthEast();
    var sw = bounds.getSouthWest();

    return {
      spatalReference: {
        wkid: 4326
      },
      xmax: ne.lng,
      xmin: sw.lng,
      ymax: ne.lat,
      ymin: sw.lat
    };
  },
  _cleanUrl: function (url) {
    url = L.Util.trim(url);

    if (url[url.length - 1] !== '/') {
      url += '/';
    }

    return url;
  },
  _getMetadata: function () {
    var me = this;

    reqwest({
      success: function (response) {
        if (response.error) {
          me.fire('error', response.error);
          me.errorFired = response.error;
        } else {
          var capabilities = response.capabilities;

          if (typeof capabilities === 'string' && capabilities.toLowerCase().indexOf('query') === -1) {
            me._hasInteractivity = false;
          }

          me._metadata = response;
          me.fire('ready', response);
          me.readyFired = true;
        }
      },
      type: 'jsonp',
      url: me._serviceUrl + '?f=json'
    });
  },
  _handleClick: function (latLng, callback) {
    var me = this;

    me.identify(latLng, function (response) {
      if (response) {
        var results = response.results;

        if (results && results.length) {
          var obj = {
            layer: me,
            subLayers: []
          };

          for (var i = 0; i < results.length; i++) {
            var active = null;
            var result = results[i];

            for (var j = 0; j < obj.subLayers.length; j++) {
              var subLayer = obj.subLayers[j];

              if (subLayer.name === result.layerName) {
                active = subLayer;
                break;
              }
            }

            if (active) {
              active.results.push(result.attributes);
            } else {
              obj.subLayers.push({
                name: result.layerName,
                popup: {
                  description: {
                    format: 'table'
                  },
                  title: '{{[' + result.displayFieldName + ']}}'
                },
                results: [
                  result.attributes
                ]
              });
            }
          }

          callback(obj);
        } else {
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  },
  _updateAttribution: function () {
    var map = this._map;
    var bounds = map.getBounds();
    var include = [];
    var zoom = map.getZoom();

    if (this.options.attribution) {
      this._map.attributionControl.removeAttribution(this.options.attribution);
    }

    for (var i = 0; i < this._dynamicAttributionData.length; i++) {
      var contributor = this._dynamicAttributionData[i];

      for (var j = 0; j < contributor.coverageAreas.length; j++) {
        var coverageArea = contributor.coverageAreas[j];
        var coverageBounds = coverageArea.bbox;

        if (zoom >= coverageArea.zoomMin && zoom <= coverageArea.zoomMax) {
          if (bounds.intersects(L.latLngBounds(L.latLng(coverageBounds[0], coverageBounds[3]), L.latLng(coverageBounds[2], coverageBounds[1])))) {
            include.push(contributor.attribution);
            break;
          }
        }
      }
    }

    if (include.length) {
      this.options.attribution = include.join(', ');
      map.attributionControl.addAttribution(this.options.attribution);
    }
  },
  getLayers: function () {
    if (this._layerParams) {
      return this._layerParams.layers.split(':')[1];
    } else {
      return this.options.layers;
    }
  },
  identify: function (latLng, callback) {
    var map = this._map;
    var size = map.getSize();
    var params = {
      f: 'json',
      geometry: JSON.stringify({
        spatialReference: {
          wkid: 4326
        },
        x: latLng.lng,
        y: latLng.lat
      }),
      geometryType: 'esriGeometryPoint',
      imageDisplay: size.x + ',' + size.y + ',96',
      layers: 'visible:' + this.getLayers(),
      mapExtent: JSON.stringify(this._boundsToExtent(map.getBounds())),
      returnGeometry: false,
      sr: '4326',
      tolerance: 6
    };

    reqwest({
      data: params,
      error: function () {
        callback(null);
      },
      success: function (response) {
        callback(response);
      },
      type: 'jsonp',
      url: this._serviceUrl + 'identify'
    });
  }
};
