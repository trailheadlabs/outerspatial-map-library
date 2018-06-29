/* global L */

'use strict';

require('leaflet.markercluster');

var ClusterLayer = L.MarkerClusterGroup.extend({
  options: {
    showCoverageOnHover: false
  },
  initialize: function (options) {
    var me = this;
    var interval;

    L.Util.setOptions(this, options);

    if (options.cluster === true) {
      options.cluster = {};
    }

    options.cluster.iconCreateFunction = new this.IconCreateFunction(options.cluster.clusterIcon);
    L.Util.setOptions(this, options.cluster);
    options.clustered = options.cluster.iconCreateFunction('getInfo');
    delete options.cluster;
    this._markercluster = L.MarkerClusterGroup.prototype.initialize.call(this);
    this._currentShownBounds = null;
    this._featureGroup = L.featureGroup();
    this._featureGroup.addEventParent(this);
    this._inZoomAnimation = 0;
    this._needsClustering = [];
    this._needsRemoving = [];
    this._nonPointGroup = L.featureGroup();
    this._nonPointGroup.addEventParent(this);
    this._queue = [];

    if (options.preset === 'outerspatial') {
      this.L = L.outerspatial.preset.outerspatial(options);
    } else {
      this.L = L.outerspatial.layer[options.type](options);
    }

    interval = setInterval(function () {
      if (me.L._loaded) {
        clearInterval(interval);
        me.addLayer(me.L);
        me.fire('ready');
        me.readyFired = true;
        me._loaded = true;
      }
    }, 0);

    return this;
  },
  onAdd: function (map) {
    this._map = map;
    this._addAttribution();

    if (this.options.zoomToBounds) {
      this.L.on('ready', function () {
        map.fitBounds(this.getBounds());
      });
    }

    L.MarkerClusterGroup.prototype.onAdd.call(this, map);
  },
  onRemove: function (map) {
    this._removeAttribution();
    L.MarkerClusterGroup.prototype.onRemove.call(this, map);
    delete this._map;
  },
  _addAttribution: function () {
    var attribution = this.options.attribution;

    if (attribution && this._map.attributionControl) {
      this._map.attributionControl.addAttribution(attribution);
    }
  },
  _removeAttribution: function () {
    var attribution = this.options.attribution;

    if (attribution && this._map.attributionControl) {
      this._map.attributionControl.removeAttribution(attribution);
    }
  },
  IconCreateFunction: function (settings) {
    var defaultSettings = [{
      color: '#000',
      fontColor: '#fff',
      maxNodes: 9,
      name: 'small',
      outerRing: 22,
      size: 23
    }, {
      color: '#000',
      fontColor: '#fff',
      maxNodes: 99,
      name: 'medium',
      outerRing: 24,
      size: 30
    }, {
      color: '#000',
      fontColor: '#fff',
      maxNodes: Infinity,
      name: 'large',
      outerRing: 26,
      size: 37
    }];

    function addStyles () {
      var head = document.head || document.getElementsByTagName('head')[0];
      var style = document.createElement('style');
      var text = '' +
        '.leaflet-cluster-anim .leaflet-marker-icon, .leaflet-cluster-anim .leaflet-marker-shadow {' +
          'transition: transform 0.2s ease-out, opacity 0.2s ease-in;' +
        '}' +
      '';

      style.type = 'text/css';

      for (var i = 0; i < defaultSettings.length; i++) {
        var currStyle = settings ? createOldStyle(defaultSettings[i]) : createNewStyle(defaultSettings[i]);

        for (var styleType in currStyle) {
          text += '.' + 'marker-cluster-custom-' + defaultSettings[i].maxNodes.toString() + ' ' + (styleType === 'main' ? '' : styleType) + ' {' + currStyle[styleType] + '}\n';
        }
      }

      if (style.styleSheet) {
        style.styleSheet.cssText = text;
      } else {
        style.appendChild(document.createTextNode(text));
      }

      head.appendChild(style);
    }
    function autoTextColor (rgb) {
      if (Object.prototype.toString.call(rgb) !== '[object Array]') {
        rgb = hexToArray(rgb);
      }

      if (rgb) {
        var brightness = (((rgb[0] * 299) + (rgb[1] * 587) + (rgb[2] * 144)) / 1000);

        if (brightness > 127) {
          return '#000';
        } else {
          return '#fff';
        }
      } else {
        return false;
      }
    }
    function cssStyle (fields) {
      var returnValue = [];

      for (var field in fields) {
        returnValue.push(field + ': ' + fields[field] + '; ');
      }

      return returnValue.join('');
    }
    function createNewStyle (style) {
      var styles = {
        main: {
          'background-image': 'url("' + window.L.Icon.Default.imagePath + '/clusters/unrounded-triple.png")',
          'background-repeat': 'no-repeat',
          'background-size': 'contain'
        },
        div: {
          'height': style.size + 'px',
          'text-align': 'center',
          'width': style.size + 'px'
        },
        span: {
          'color': '#fff',
          'display': 'block',
          'font': '14px "PT Sans Narrow","Helvetica Neue",helvetica,arial,sans-serif',
          'line-height': style.size + 'px'
        }
      };

      return styleLoop(styles, cssStyle);
    }
    function createOldStyle (style) {
      var styles = {
        main: {
          'background-clip': 'padding-box',
          'background': supportsRgba('rgba(' + hexToArray(style.color)[0] + ', ' + hexToArray(style.color)[1] + ', ' + hexToArray(style.color)[2] + ', 0.4)'),
          'border-radius': ((style.size + style.outerRing) * 0.5) + 'px'
        },
        div: {
          'background': supportsRgba('rgba(' + hexToArray(style.color)[0] + ', ' + hexToArray(style.color)[1] + ', ' + hexToArray(style.color)[2] + ', 0.9)'),
          'border-radius': (style.size / 2) + 'px',
          'height': style.size + 'px',
          'margin-left': (style.outerRing / 2) + 'px',
          'margin-top': (style.outerRing / 2) + 'px',
          'text-align': 'center',
          'width': style.size + 'px'
        },
        span: {
          'color': 'rgb(' + hexToArray(style.fontColor)[0] + ', ' + hexToArray(style.fontColor)[1] + ', ' + hexToArray(style.fontColor)[2] + ')',
          'display': 'block',
          'font': '14px "PT Sans Narrow","Helvetica Neue",helvetica,arial,sans-serif',
          'line-height': style.size + 'px'
        }
      };

      return styleLoop(styles, cssStyle);
    }
    function customIconCreateFunction (cluster) {
      if (cluster === 'getInfo') {
        return defaultSettings;
      }

      var childCount = cluster.getChildCount();
      var className;
      var size;

      for (var i = 0; i < defaultSettings.length; i++) {
        var defaultSetting = defaultSettings[i];

        if (childCount <= defaultSetting.maxNodes) {
          className = 'marker-cluster-custom-' + defaultSetting.maxNodes.toString();
          size = defaultSetting.size + (settings ? defaultSetting.outerRing : 0);
          break;
        }
      }

      return new L.DivIcon({
        className: className,
        html: '<div><span>' + childCount + '</span></div>',
        iconSize: new L.Point(size, size)
      });
    }
    function hexToArray (hexValue) {
      var returnValue = false;

      if (typeof hexValue === 'string') {
        hexValue = hexValue.replace('#', '');

        if (hexValue.length === 3) {
          hexValue = hexValue.replace(/(.)(.)(.)/g, '$1$1$2$2$3$3');
        }

        if (hexValue.match(/[\da-fA-F]{6}$/)) {
          returnValue = [
            parseInt(hexValue.substr(0, 2), 16),
            parseInt(hexValue.substr(2, 2), 16),
            parseInt(hexValue.substr(4, 2), 16)
          ];
        }
      }

      return returnValue;
    }
    function styleLoop (fields, process) {
      var returnValue = {};

      for (var field in fields) {
        returnValue[field] = process(fields[field]);
      }

      return returnValue;
    }
    function supportsRgba (color) {
      var returnValue = false;
      var rgbaTestVal = 'rgba(0,0,0,0.1)';
      var testDiv = document.createElement('div');
      var newColor;

      try {
        testDiv.style.color = rgbaTestVal;

        if (testDiv.style.color.substr(0, 4) === 'rgba') {
          returnValue = true;
        }
      } catch (e) {}

      if (color) {
        if (returnValue) {
          return color;
        } else {
          newColor = color.replace(/^rgba\(/g, 'rgb(,').replace(')', '').split(',');
          newColor[1] = Math.floor(parseInt(newColor[1], 10) + (255 * (1 - parseFloat(newColor[4], 10))));
          newColor[2] = Math.floor(parseInt(newColor[2], 10) + (255 * (1 - parseFloat(newColor[4], 10))));
          newColor[3] = Math.floor(parseInt(newColor[3], 10) + (255 * (1 - parseFloat(newColor[4], 10))));

          if (newColor[1] > 255) {
            newColor[1] = 255;
          }

          if (newColor[2] > 255) {
            newColor[2] = 255;
          }

          if (newColor[3] > 255) {
            newColor[3] = 255;
          }

          newColor = newColor.slice(0, 4).join(',').replace('(,', '(') + ')';

          return newColor;
        }
      } else {
        return returnValue;
      }
    }
    function updateDefaults (newSettings) {
      for (var j = 0; j < defaultSettings.length; j++) {
        if (defaultSettings[j].name && newSettings[defaultSettings[j].name]) {
          L.Util.extend(defaultSettings[j], newSettings[defaultSettings[j].name]);

          if (!newSettings[defaultSettings[j].name].fontColor && newSettings[defaultSettings[j].name].color) {
            defaultSettings[j].fontColor = autoTextColor(hexToArray(newSettings[defaultSettings[j].name].color));
          }
        }
      }
    }

    if (settings) {
      if (typeof settings === 'string') {
        updateDefaults({
          small: {
            color: settings
          },
          medium: {
            color: settings
          },
          large: {
            color: settings
          }
        });
      } else if (Object.prototype.toString.call(settings) === '[object Object]') {
        updateDefaults(settings);
      } else if (Object.prototype.toString.call(settings) === '[object Array]') {
        defaultSettings = settings;
      }
    }

    addStyles();

    return customIconCreateFunction;
  }
});

module.exports = function (options) {
  return new ClusterLayer(options);
};
