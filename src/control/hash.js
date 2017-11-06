/* global L */

'use strict';

var util = require('../util/util');
var HashControl = L.Class.extend({
  addTo: function (map) {
    var me = this;

    this._map = map;

    // A bit of a hack to give map.js time to setup the DOM. Really only needed when the modules pane is set to visible = true.
    setTimeout(function () {
      me._onHashChange(true);
      me._startListening();
    }, 250);
    return this;
  },
  initialize: function () {
    this._crossOrigin = false;
    this._embeddedInIframe = false;
    this._window = window;

    if ((window.self !== window.top) && document.referrer !== '') {
      this._embeddedInIframe = true;

      if (util.parseDomainFromUrl(document.referrer) === util.parseDomainFromUrl(window.location.href)) {
        try {
          this._window = window.top;

          if (!window.frameElement) {
            this._crossOrigin = true;
          }
        } catch (exception) {
          this._crossOrigin = true;
        }
      }
    }

    this._supportsHashChange = (function () {
      var docMode = window.documentMode;

      return ('onhashchange' in window) && (docMode === undefined || docMode > 7);
    })();

    if (this._crossOrigin) {
      console.warn('This map is in an iframe embedded in a web page hosted from a domain other than outerspatial.com. To get the hash control to work, you\'ll need to either listen for window.postMessage(\'outerspatial_map_library-moveend\') and implement the hash functionality yourself or install the OuterSpatial Embed Helpers (https://github.com/trailheadlabs/outerspatial-embed-helpers/) in the parent page.');
    }

    return this;
  },
  removeFrom: function () {
    if (this._changeTimeout) {
      clearTimeout(this._changeTimeout);
    }

    if (this.isListening) {
      this._stopListening();
    }

    delete this._map.hashControl;
    this._map = null;
  },
  _changeDefer: 100,
  _changeTimeout: null,
  _hashChangeInterval: null,
  _isListening: false,
  _lastHash: null,
  _movingMap: false,
  _formatHash: function (map) {
    var center = map.getCenter();
    var zoom = map.getZoom();
    var precision = Math.max(0, Math.ceil(Math.log(zoom) / Math.LN2));

    return '#' + [
      zoom,
      center.lat.toFixed(precision),
      center.lng.toFixed(precision)
    ].join('/');
  },
  _getParentDocumentWindow: function (el) {
    while (el.parentNode) {
      el = el.parentNode;

      if (el.tagName.toLowerCase() === 'window') {
        return el;
      }
    }

    return null;
  },
  _onHashChange: function (skipTimeout) {
    if (skipTimeout) {
      this._update();
    } else if (!this._changeTimeout) {
      var me = this;

      this._changeTimeout = setTimeout(function () {
        me._changeTimeout = null;
        me._update();
      }, this._changeDefer);
    }
  },
  _onMapMove: function () {
    var hash;

    if (this._movingMap || !this._map._loaded) {
      return false;
    }

    hash = this._formatHash(this._map);

    if (this._lastHash !== hash) {
      this._window.history.replaceState(undefined, undefined, hash);

      if (this._embeddedInIframe && this._crossOrigin) {
        window.parent.postMessage({
          hash: hash,
          id: 'outerspatial_map_library-hashchange',
          location: window.location.href
        }, '*');
      }

      this._lastHash = hash;
    }
  },
  _parseHash: function (hash) {
    var args;

    if (hash.indexOf('#') === 0) {
      hash = hash.substr(1);
    }

    args = hash.split('/');

    if (args.length === 3) {
      var lat = parseFloat(args[1]);
      var lng = parseFloat(args[2]);
      var zoom = parseFloat(args[0]);

      if (isNaN(zoom) || isNaN(lat) || isNaN(lng)) {
        return false;
      } else {
        return {
          center: new L.LatLng(lat, lng),
          zoom: zoom
        };
      }
    } else {
      return false;
    }
  },
  _startListening: function () {
    var me = this;

    this._map.on('moveend', this._onMapMove, this);

    if (this._supportsHashChange) {
      L.DomEvent.addListener(this._window, 'hashchange', function () {
        me._onHashChange(me);
      });
    } else {
      clearInterval(this._hashChangeInterval);
      this._hashChangeInterval = setInterval(function () {
        me._onHashChange(me);
      }, 50);
    }

    this._isListening = true;
  },
  _stopListening: function () {
    this._map.off('moveend', this._onMapMove, this);

    if (this._supportsHashChange) {
      L.DomEvent.removeListener(this._window, 'hashchange', this._onHashChange, this);
    } else {
      clearInterval(this._hashChangeInterval);
      this._hashChangeInterval = null;
    }

    this._isListening = false;
  },
  _update: function () {
    var hash = this._window.location.hash;
    var parsed;

    if (hash === this._lastHash) {
      return;
    }

    parsed = this._parseHash(hash);

    if (parsed) {
      this._movingMap = true;
      this._map.setView(parsed.center, parsed.zoom);
      this._movingMap = false;
    } else {
      this._onMapMove(this._map);
    }
  }
});

L.Map.addInitHook(function () {
  if (this.options.hashControl) {
    this.hashControl = L.outerspatial.control.hash(this.options.hashControl).addTo(this);
  }
});

module.exports = function (options) {
  return new HashControl(options);
};
