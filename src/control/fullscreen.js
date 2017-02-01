/* global L */

'use strict';

var util = require('../util/util');
var FullscreenControl = L.Control.extend({
  initialize: function (options) {
    this._frame = null;
    this._supported = true;

    if ((window.self !== window.top) && document.referrer !== '') {
      // The map is in an iframe.
      try {
        this._frame = window.frameElement;

        if (this._frame) {
          this._frameBody = this._getParentDocumentBody(this._frame);
        }
      } catch (exception) {
        this._supported = false;
      }
    }

    // TODO: Also add ARIA attributes.
    this._li = L.DomUtil.create('li', '');
    this._button = L.DomUtil.create('button', 'fullscreen enter', this._li);
    this._button.setAttribute('alt', 'Enter fullscreen');
    L.DomEvent.addListener(this._button, 'click', this.fullscreen, this);

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
    var toolbar = util.getChildElementsByClassName(map.getContainer().parentNode.parentNode, 'outerspatial-toolbar')[0];

    toolbar.childNodes[1].appendChild(this._li);
    toolbar.style.display = 'block';
    this._container = toolbar.parentNode.parentNode;
    this._isFullscreen = false;
    this._map = map;
    util.getChildElementsByClassName(this._container.parentNode, 'outerspatial-map-wrapper')[0].style.top = '28px';
    return this;
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
    L.DomEvent.preventDefault(e);

    if (this._supported) {
      var body = document.body;
      var utils;

      if (this._isFullscreen) {
        if (this._frame) {
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
        }

        body.style.margin = this._bodyMargin;
        body.style.overflow = this._bodyOverflow;
        body.style.padding = this._bodyPadding;
        this._container.style.left = this._containerLeft;
        this._container.style.position = this._containerPosition;
        this._container.style.top = this._containerTop;
        L.DomEvent.removeListener(document, 'keyup', this._onKeyUp);
        this._isFullscreen = false;
        L.DomUtil.removeClass(this._button, 'exit');
        L.DomUtil.addClass(this._button, 'enter');
        this._button.setAttribute('alt', 'Enter fullscreen');
        this._map.fire('exitfullscreen');

        if (this._frame && window.postMessage) {
          window.parent.postMessage('exitfullscreen', '*');

          if (this._frameBody) {
            utils = window.parent.OuterSpatialUtils;

            if (utils && utils.fullscreenControl && utils.fullscreenControl.listeners && typeof utils.fullscreenControl.listeners.exitfullscreen === 'function') {
              utils.fullscreenControl.listeners.exitfullscreen();
            }
          }
        }
      } else {
        // TODO: You should probably capture each margin and padding side individually (e.g. padding-left).

        if (this._frame) {
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
        }

        this._bodyMargin = body.style.margin;
        this._bodyOverflow = body.style.overflow;
        this._bodyPadding = body.style.padding;
        body.style.margin = '0';
        body.style.overflow = 'hidden';
        body.style.padding = '0';
        this._containerLeft = this._container.style.left;
        this._containerPosition = this._container.style.position;
        this._containerTop = this._container.style.top;
        this._container.style.left = '0';
        this._container.style.position = 'fixed';
        this._container.style.top = '0';
        L.DomEvent.addListener(document, 'keyup', this._onKeyUp, this);
        this._isFullscreen = true;
        L.DomUtil.removeClass(this._button, 'enter');
        L.DomUtil.addClass(this._button, 'exit');
        this._button.setAttribute('alt', 'Exit fullscreen');
        this._map.fire('enterfullscreen');

        if (this._frame && window.postMessage) {
          window.parent.postMessage('enterfullscreen', '*');

          if (this._frameBody) {
            utils = window.parent.OuterSpatialUtils;

            if (utils && utils.fullscreenControl && utils.fullscreenControl.listeners && typeof utils.fullscreenControl.listeners.enterfullscreen === 'function') {
              utils.fullscreenControl.listeners.enterfullscreen();
            }
          }
        }
      }

      this._map.invalidateSize();
    } else {
      window.alert('Sorry, but the fullscreen tool does not work for maps that are loaded in an iframe hosted on another domain.');
    }
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
