/* global L */

'use strict';

var util = require('../util/util');
var FullscreenControl = L.Control.extend({
  options: {
    position: 'topright'
  },
  initialize: function (options) {
    this._crossOrigin = false;
    this._embeddedInIframe = false;
    this._frame = null;

    if ((window.self !== window.top) && document.referrer !== '') {
      this._embeddedInIframe = true;

      // The map is in an iframe.
      try {
        this._frame = window.frameElement;

        if (this._frame) {
          this._frameBody = this._getParentDocumentBody(this._frame);
        } else {
          this._crossOrigin = true;
        }
      } catch (exception) {
        this._crossOrigin = true;
      }

      // TODO: Also add ARIA attributes.

      this._li = L.DomUtil.create('li', undefined);
      this._button = L.DomUtil.create('button', undefined, this._li);
      this._setIcon('enterFullscreen');
      this._button.setAttribute('alt', 'Enter fullscreen');
      L.DomEvent.addListener(this._button, 'click', this.fullscreen, this);

      if (this._crossOrigin) {
        console.warn('This map is in an iframe embedded in a web page hosted from a domain other than outerspatial.com. To get the fullscreen control to work, you\'ll need to either listen for window.postMessage(\'outerspatial_map_library-enterfullscreen\') and window.postMessage(\'outerspatial_map_library-exitfullscreen\') and implement fullscreen yourself or install the OuterSpatial Embed Helpers (https://github.com/trailheadlabs/outerspatial-embed-helpers/) in the parent page.');
      }
    }

    return this;
  },
  _onKeyUp: function (e) {
    if (!e) {
      e = window.event;
    }

    if (this._isFullscreen === true && e.keyCode === 27) {
      this.fullscreen();
    }
  },
  addTo: function (map) {
    // TODO: This should probably be based on available width of map and not on whether map is embedded in an iframe or not
    if (this._embeddedInIframe === true) {
      var toolbar = util.getChildElementsByClassName(map.getContainer().parentNode.parentNode, 'outerspatial-toolbar')[0];

      this._container = this._li;
      toolbar.childNodes[1].appendChild(this._li);
      toolbar.style.display = 'block';
      this._outerspatialContainer = toolbar.parentNode.parentNode;
      this._isFullscreen = false;
      this._map = map;
      util.getChildElementsByClassName(this._outerspatialContainer.parentNode, 'outerspatial-map-wrapper')[0].style.top = '40px';
    } else {
      L.Control.prototype.addTo.call(this, map);
    }

    this._scrollWheelEnabled = map.options.scrollWheelZoom;

    return this;
  },
  onAdd: function (map) {
    // TODO: This should probably be based on available width of map and not on whether map is embedded in an iframe or not
    if (this._embeddedInIframe === false) {
      this._container = L.DomUtil.create('div', 'leaflet-bar leaflet-bar-single leaflet-control');
      this._button = L.DomUtil.create('button', undefined, this._container);
      this._setIcon('enterFullscreen');
      this._button.setAttribute('alt', 'Enter fullscreen');
      L.DomEvent.addListener(this._button, 'click', this.fullscreen, this);
      this._isFullscreen = false;
      this._map = map;

      return this._container;
    }
  },
  _setIcon: function (icon) {
    if (icon === 'enterFullscreen') {
      this._button.innerHTML = '' +
        '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="2 2 14 14">' +
          '<g class="icon-svg-path">' +
            '<path d="M4.5 11H3v4h4v-1.5H4.5V11zM3 7h1.5V4.5H7V3H3v4zm10.5 6.5H11V15h4v-4h-1.5v2.5zM11 3v1.5h2.5V7H15V3h-4z"/>' +
          '</g>' +
        '</svg>' +
      '';
    } else if (icon === 'exitFullscreen') {
      this._button.innerHTML = '' +
        '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="2 2 14 14">' +
          '<g class="icon-svg-path">' +
            '<path d="M3 12.5h2.5V15H7v-4H3v1.5zm2.5-7H3V7h4V3H5.5v2.5zM11 15h1.5v-2.5H15V11h-4v4zm1.5-9.5V3H11v4h4V5.5h-2.5z"/>' +
          '</g>' +
        '</svg>' +
      '';
    }
  },
  _getParentDocumentBody: function (el) {
    while (el.parentNode) {
      el = el.parentNode;

      if (el.tagName.toLowerCase() === 'body') {
        return el;
      }
    }

    return null;
  },
  fullscreen: function (e) {
    var body = document.body;

    L.DomEvent.preventDefault(e);

    if (this._frame === null) {
      this._outerspatialContainer = this._container.parentNode.parentNode.parentNode;
    }

    if (this._isFullscreen) {
      if (this._embeddedInIframe) {
        if (!this._crossOrigin && this._frame) {
          this._frameBody.style.height = this._frameBodyHeight;
          this._frameBody.style.margin = this._frameBodyMargin;
          this._frameBody.style.overflow = this._frameBodyOverflow;
          this._frameBody.style.padding = this._frameBodyPadding;
          this._frameBody.style.width = this._frameBodyWidth;
          this._frame.height = this._frameHeight;
          this._frame.style.height = this._frameHeightStyle;
          this._frame.style.left = this._frameLeft;
          this._frame.style.margin = this._frameMargin;
          this._frame.style.padding = this._framePadding;
          this._frame.style.position = this._framePosition;
          this._frame.style.top = this._frameTop;
          this._frame.style.width = this._frameWidthStyle;
          this._frame.style.zIndex = this._frameZindex;
          this._frame.width = this._frameWidth;
        } else {
          window.parent.postMessage({
            id: 'outerspatial_map_library-exitfullscreen',
            location: window.location.href
          }, '*');
        }
      }

      body.style.margin = this._bodyMargin;
      body.style.overflow = this._bodyOverflow;
      body.style.padding = this._bodyPadding;
      this._outerspatialContainer.parentNode.className = this._outerspatialContainer.parentNode.className.replace(' fullscreen', '');
      this._outerspatialContainer.style.left = this._containerLeft;
      this._outerspatialContainer.style.position = this._containerPosition;
      this._outerspatialContainer.style.top = this._containerTop;
      L.DomEvent.removeListener(document, 'keyup', this._onKeyUp);
      this._isFullscreen = false;
      this._setIcon('enterFullscreen');
      this._button.setAttribute('alt', 'Enter fullscreen');
      this._map.fire('exitfullscreen');

      if (!this._scrollWheelEnabled) {
        this._map.scrollWheelZoom.disable();
      }
    } else {
      // TODO: You should probably capture each margin and padding side individually (e.g. padding-left).

      if (this._embeddedInIframe) {
        if (!this.crossOrigin && this._frame) {
          this._frameBodyHeight = this._frameBody.style.height;
          this._frameBodyMargin = this._frameBody.style.margin;
          this._frameBodyOverflow = this._frameBody.style.overflow;
          this._frameBodyPadding = this._frameBody.style.padding;
          this._frameBodyWidth = this._frameBody.style.width;
          this._frameBody.style.height = '100%';
          this._frameBody.style.margin = '0';
          this._frameBody.style.overflow = 'hidden';
          this._frameBody.style.padding = '0';
          this._frameBody.style.width = '100%';
          this._frameHeight = this._frame.height;
          this._frameHeightStyle = this._frame.style.height;
          this._frameLeft = this._frame.style.left;
          this._frameMargin = this._frame.style.margin;
          this._framePadding = this._frame.style.padding;
          this._framePosition = this._frame.style.position;
          this._frameTop = this._frame.style.top;
          this._frameWidth = this._frame.width;
          this._frameWidthStyle = this._frame.style.width;
          this._frameZindex = this._frame.style.zIndex;
          this._frame.height = '100%';
          this._frame.style.height = '100%';
          this._frame.style.left = '0';
          this._frame.style.margin = '0';
          this._frame.style.padding = '0';
          this._frame.style.position = 'fixed';
          this._frame.style.top = '0';
          this._frame.style.width = '100%';
          this._frame.style.zIndex = 9999999999;
          this._frame.width = '100%';
        } else {
          window.parent.postMessage({
            id: 'outerspatial_map_library-enterfullscreen',
            location: window.location.href
          }, '*');
        }
      }

      this._bodyMargin = body.style.margin;
      this._bodyOverflow = body.style.overflow;
      this._bodyPadding = body.style.padding;
      body.style.margin = '0';
      body.style.overflow = 'hidden';
      body.style.padding = '0';
      this._containerLeft = this._outerspatialContainer.style.left;
      this._containerPosition = this._outerspatialContainer.style.position;
      this._containerTop = this._outerspatialContainer.style.top;
      this._outerspatialContainer.parentNode.className += ' fullscreen';
      this._outerspatialContainer.style.left = '0';
      this._outerspatialContainer.style.position = 'fixed';
      this._outerspatialContainer.style.top = '0';
      L.DomEvent.addListener(document, 'keyup', this._onKeyUp, this);
      this._isFullscreen = true;
      this._setIcon('exitFullscreen');
      this._button.setAttribute('alt', 'Exit fullscreen');
      this._map.fire('enterfullscreen');

      this._map.scrollWheelZoom.enable();
    }

    this._map.invalidateSize();
  }
});

L.Map.mergeOptions({
  fullscreenControl: false
});
L.Map.addInitHook(function () {
  if (this.options.fullscreenControl) {
    var options = {};

    if (typeof this.options.fullscreenControl === 'object') {
      options = this.options.fullscreenControl;
    }

    this.fullscreenControl = L.outerspatial.control.fullscreen(options).addTo(this);
  }
});

module.exports = function (options) {
  return new FullscreenControl(options);
};
