/* global L */

'use strict';

var baselayerPresets = require('../preset/baselayers.json');
var util = require('../util/util');
var OverviewControl = L.Control.extend({
  options: {
    autoToggleDisplay: false,
    height: 100,
    position: 'bottomright',
    toggleDisplay: true,
    width: 140,
    zoomAnimation: false,
    zoomLevelFixed: false,
    zoomLevelOffset: -5
  },
  addTo: function (map) {
    L.Control.prototype.addTo.call(this, map);
    this._miniMap.setView(this._mainMap.getCenter(), this._decideZoom(true));
    this._setDisplay(this._decideMinimized());
    return this;
  },
  initialize: function (options) {
    util.strict(options, 'object');

    if (options.layer) {
      var type;

      if (typeof options.layer === 'string') {
        var name = options.layer.split('-');

        options.layer = util.clone(baselayerPresets[name[0]][name[1]]);
      }

      type = options.layer.type;
      L.Util.setOptions(this, options);

      if (type === 'arcgisserver') {
        this._layer = options.layer.L = L.outerspatial.layer[type][options.layer.tiled === true ? 'tiled' : 'dynamic'](options.layer);
      } else if (type === 'mapbox') {
        this._layer = options.layer.L = L.outerspatial.layer[type][options.layer.styled === true ? 'styled' : 'tiled'](options.layer);
      } else {
        this._layer = options.layer.L = L.outerspatial.layer[type](options.layer);
      }

      return this;
    } else {
      throw new Error('The overview control must have a layer specified.');
    }
  },
  onAdd: function (map) {
    // TODO: The hidden-* classes needs to be triggered by the width of the map itself.

    this._container = L.DomUtil.create('div', 'outerspatial-hidden-xs leaflet-control-overview');
    this._container.style.width = this.options.width + 'px';
    this._container.style.height = this.options.height + 'px';
    L.DomEvent.disableClickPropagation(this._container);
    L.DomEvent.on(this._container, 'mousewheel', L.DomEvent.stopPropagation);
    this._mainMap = map;
    this._attributionContainer = this._mainMap.attributionControl._container;
    // this._container.style.margin = '0 0 ' + -this._attributionContainer.offsetHeight + 'px 0';
    this._miniMap = this.L = new L.Map(this._container, {
      attributionControl: false,
      autoToggleDisplay: this.options.autoToggleDisplay,
      boxZoom: !this.options.zoomLevelFixed,
      crs: map.options.crs,
      doubleClickZoom: !this.options.zoomLevelFixed,
      homeControl: false,
      keyboard: false,
      scrollWheelZoom: !this.options.zoomLevelFixed,
      smallzoomControl: false,
      touchZoom: !this.options.zoomLevelFixed,
      zoomAnimation: this.options.zoomAnimation,
      zoomControl: false
    });
    this._attributionContainer.style.marginRight = (this.options.width + 3) + 'px';
    this._miniMap.addLayer(this._layer);
    this._mainMapMoving = false;
    this._miniMapMoving = false;
    this._userToggledDisplay = false;
    this._minimized = false;
    this._transitioning = false;

    if (this.options.toggleDisplay) {
      this._addToggleButton();
    }

    this._miniMap.whenReady(L.Util.bind(function () {
      this._aimingRect = L.rectangle(this._mainMap.getBounds(), {
        clickable: false,
        color: '#d29700',
        weight: 3
      }).addTo(this._miniMap);
      this._shadowRect = L.rectangle(this._mainMap.getBounds(), {
        clickable: false,
        color: '#454545',
        fillOpacity: 0,
        opacity: 0,
        weight: 3
      }).addTo(this._miniMap);
      this._mainMap.on('moveend', this._onMainMapMoved, this);
      this._mainMap.on('move', this._onMainMapMoving, this);
      this._miniMap.on('movestart', this._onMiniMapMoveStarted, this);
      this._miniMap.on('move', this._onMiniMapMoving, this);
      this._miniMap.on('moveend', this._onMiniMapMoved, this);
    }, this));

    return this._container;
  },
  onRemove: function () {
    this._mainMap.off('moveend', this._onMainMapMoved, this);
    this._mainMap.off('move', this._onMainMapMoving, this);
    this._miniMap.off('moveend', this._onMiniMapMoved, this);
    this._miniMap.removeLayer(this._layer);
    this._attributionContainer.style.marginRight = '0';
  },
  _addToggleButton: function () {
    this._toggleDisplayButton = this._createButton('', 'Hide Overview', null, this._container, this._toggleDisplayButtonClicked, this);
    this._toggleDisplayButtonImage = L.DomUtil.create('span', null, this._toggleDisplayButton);
  },
  _createButton: function (html, title, className, container, fn, context) {
    var button = L.DomUtil.create('button', className, container);
    var stop = L.DomEvent.stopPropagation;

    button.innerHTML = html;
    button.setAttribute('alt', title);
    L.DomEvent
      .on(button, 'click', stop)
      .on(button, 'mousedown', stop)
      .on(button, 'dblclick', stop)
      .on(button, 'click', L.DomEvent.preventDefault)
      .on(button, 'click', fn, context);

    return button;
  },
  _decideMinimized: function () {
    if (this._userToggledDisplay) {
      return this._minimized;
    }

    if (this.options.autoToggleDisplay) {
      if (this._mainMap.getBounds().contains(this._miniMap.getBounds())) {
        return true;
      }

      return false;
    }

    return this._minimized;
  },
  _decideZoom: function (fromMaintoMini) {
    if (!this.options.zoomLevelFixed) {
      if (fromMaintoMini) {
        var zoom = this._mainMap.getZoom() + this.options.zoomLevelOffset;

        if (zoom < 0) {
          zoom = 0;
        }

        return zoom;
      } else {
        var currentDiff = this._miniMap.getZoom() - this._mainMap.getZoom();
        var proposedZoom = this._miniMap.getZoom() - this.options.zoomLevelOffset;
        var toRet;

        if (currentDiff > this.options.zoomLevelOffset && this._mainMap.getZoom() < this._miniMap.getMinZoom() - this.options.zoomLevelOffset) {
          if (this._miniMap.getZoom() > this._lastMiniMapZoom) {
            toRet = this._mainMap.getZoom() + 1;
            this._miniMap.setZoom(this._miniMap.getZoom() - 1);
          } else {
            toRet = this._mainMap.getZoom();
          }
        } else {
          toRet = proposedZoom;
        }

        this._lastMiniMapZoom = this._miniMap.getZoom();
        return toRet;
      }
    } else {
      if (fromMaintoMini) {
        return this.options.zoomLevelFixed;
      } else {
        return this._mainMap.getZoom();
      }
    }
  },
  _minimize: function () {
    var me = this;
    me._transitioning = true;
    me._attributionContainer.style.marginRight = '50px';
    me._container.style.width = '47px';
    me._container.style.height = '47px';
    me._minimized = true;
    me._toggleDisplayButton.style.display = 'none';
    me._toggleDisplayButton.style.height = '47px';
    me._toggleDisplayButton.style.width = '47px';
    me._toggleDisplayButtonImage.className += ' minimized';
    me._toggleDisplayButtonImage.style.bottom = 'auto';
    me._toggleDisplayButtonImage.style.right = 'auto';
    me._toggleDisplayButtonImage.style.left = '10px';
    me._toggleDisplayButtonImage.style.top = '10px';
    setTimeout(function () {
      me._toggleDisplayButton.style.display = 'block';
      me._toggleDisplayButton.focus();
      me._aimingRect.setStyle({
        fillOpacity: 0,
        opacity: 0
      });
      me._miniMap.invalidateSize();
      me._transitioning = false;
    }, 200);
  },
  _onMainMapMoved: function () {
    if (!this._transitioning) {
      if (!this._miniMapMoving) {
        this._mainMapMoving = true;
        this._miniMap.setView(this._mainMap.getCenter(), this._decideZoom(true));
        this._setDisplay(this._decideMinimized());
      } else {
        this._miniMapMoving = false;
      }
    }

    this._aimingRect.setBounds(this._mainMap.getBounds());
  },
  _onMainMapMoving: function () {
    this._aimingRect.setBounds(this._mainMap.getBounds());
  },
  _onMiniMapMoved: function () {
    if (!this._transitioning) {
      if (!this._mainMapMoving) {
        this._miniMapMoving = true;
        this._mainMap.setView(this._miniMap.getCenter(), this._decideZoom(false));
        this._shadowRect.setStyle({
          fillOpacity: 0,
          opacity: 0
        });
      } else {
        this._mainMapMoving = false;
      }
    } else {
      if (!this._mainMapMoving) {
        this._shadowRect.setStyle({
          fillOpacity: 0,
          opacity: 0
        });
      }
    }
  },
  _onMiniMapMoveStarted: function () {
    var lastAimingRect = this._aimingRect.getBounds();

    this._lastAimingRectPosition = {
      sw: this._miniMap.latLngToContainerPoint(lastAimingRect.getSouthWest()),
      ne: this._miniMap.latLngToContainerPoint(lastAimingRect.getNorthEast())
    };
  },
  _onMiniMapMoving: function () {
    if (!this._mainMapMoving && this._lastAimingRectPosition) {
      this._shadowRect.setBounds(new L.LatLngBounds(this._miniMap.containerPointToLatLng(this._lastAimingRectPosition.sw), this._miniMap.containerPointToLatLng(this._lastAimingRectPosition.ne)));
      this._shadowRect.setStyle({
        fillOpacity: 0.3,
        opacity: 1
      });
    }
  },
  _restore: function () {
    var me = this;

    me._transitioning = true;
    me._toggleDisplayButton.style.display = 'none';
    me._toggleDisplayButton.style.height = '20px';
    me._toggleDisplayButton.style.bottom = '0';
    me._toggleDisplayButton.style.left = 'auto';
    me._toggleDisplayButton.style.position = 'absolute';
    me._toggleDisplayButton.style.right = '0';
    me._toggleDisplayButton.style.top = 'auto';
    me._toggleDisplayButton.style.width = '20px';
    me._toggleDisplayButtonImage.className = me._toggleDisplayButtonImage.className.replace(/(?:^|\s)minimized(?!\S)/g, '');
    me._toggleDisplayButtonImage.style.bottom = '10px';
    me._toggleDisplayButtonImage.style.left = 'auto';
    me._toggleDisplayButtonImage.style.right = '10px';
    me._toggleDisplayButtonImage.style.top = 'auto';
    me._container.style.width = me.options.width + 'px';
    me._container.style.height = me.options.height + 'px';
    me._attributionContainer.style.marginRight = (me.options.width + 3) + 'px';
    me._minimized = false;
    setTimeout(function () {
      me._toggleDisplayButton.style.display = 'block';
      me._toggleDisplayButton.focus();
      me._aimingRect.setStyle({
        fillOpacity: 0.2,
        opacity: 0.5
      });
      me._miniMap.invalidateSize();
      me._transitioning = false;
    }, 200);
  },
  _setDisplay: function (minimize) {
    if (minimize !== this._minimized) {
      if (!this._minimized) {
        this._minimize();
      } else {
        this._restore();
      }
    }
  },
  _toggleDisplayButtonClicked: function (e) {
    this._userToggledDisplay = true;

    L.DomEvent.preventDefault(e);

    if (!this._minimized) {
      this._minimize();
      this._toggleDisplayButton.setAttribute('alt', 'Show Overview');
    } else {
      this._restore();
      this._toggleDisplayButton.setAttribute('alt', 'Hide Overview');
    }
  }
});

L.Map.mergeOptions({
  overviewControl: false
});
L.Map.addInitHook(function () {
  if (this.options.overviewControl) {
    var options = {};
    var container;
    var childNodes;

    if (typeof this.options.overviewControl === 'object') {
      options = this.options.overviewControl;
    }

    this.overviewControl = L.outerspatial.control.overview(options).addTo(this);
    container = this.overviewControl._container.parentNode;
    childNodes = container.childNodes;

    if (childNodes.length > 1) {
      container.insertBefore(this.overviewControl._container, null);
    }
  }
});

module.exports = function (options) {
  return new OverviewControl(options);
};
