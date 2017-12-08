/* global L */
/* jshint camelcase: false */

'use strict';

var baselayerPresets = require('./preset/baselayers.json');
var colorPresets = require('./preset/colors.json');
var humane = require('humane-js');
var Nanobar = require('nanobar');
var overlayPresets = require('./preset/overlays.json');
var util = require('./util/util');
var MapExt;

require('./popup.js');

(function () {
  var style = colorPresets.gold;

  L.Circle.mergeOptions(style);
  L.CircleMarker.mergeOptions(style);
  L.Control.Attribution.mergeOptions({
    position: 'bottomleft',
    prefix: '&copy; <a href="https://www.outerspatial.com/" target="_blank">OuterSpatial</a>'
  });
  L.Map.addInitHook(function () {
    var attributionTextWidth;
    var container = this.getContainer();
    var elAttribution = util.getChildElementsByClassName(container, 'leaflet-control-attribution')[0];
    var me = this;
    var span;

    function resize () {
      var containerWidth = container.offsetWidth;
      var overviewControl = util.getChildElementsByClassName(container, 'leaflet-control-overview')[0];

      if (overviewControl && !util.isHidden(overviewControl)) {
        elAttribution.style['margin-right'] = util.getOuterDimensions(overviewControl).width + 'px';
      } else {
        elAttribution.style['margin-right'] = 0;
      }

      if (attributionTextWidth + 45 > containerWidth) {
        elAttribution.style['width'] = containerWidth + 'px';
        elAttribution.style['max-width'] = (attributionTextWidth + 45) + 'px';
        L.DomUtil.addClass(elAttribution, 'collapsed');
      } else {
        elAttribution.style['width'] = 'auto';
        elAttribution.style['max-width'] = (util.getOuterDimensions(container).width - 45) + 'px';
        L.DomUtil.removeClass(elAttribution, 'collapsed');
      }
    }

    if (this.options.attributionControl) {
      this.attributionControl._update = function () {
        var attribs = [];
        var prefixAndAttribs = [];

        for (var attribution in this._attributions) {
          if (this._attributions[attribution] > 0) {
            var i = -1;

            if (attribution) {
              for (var j = 0; j < attribs.length; j++) {
                if (attribs[j] === attribution) {
                  i = j;
                  break;
                }
              }

              if (i === -1) {
                attribs.push(attribution);
              }
            }
          }
        }

        if (this.options.prefix) {
          prefixAndAttribs.push(this.options.prefix);
        }

        if (attribs.length) {
          prefixAndAttribs.push(attribs.join(' | '));
        }

        this._container.innerHTML = '';
        span = document.createElement('span');
        this._container.appendChild(span);
        span.innerHTML = prefixAndAttribs.join(' | ');

        if (typeof me._updateImproveLinks === 'function') {
          me._updateImproveLinks();
        }

        attributionTextWidth = span.offsetWidth + 29;
        resize();
      };
      this.on('resize', resize);
    }

    if (typeof me._updateImproveLinks === 'function') {
      me.on('moveend', me._updateImproveLinks);
    }
  });
  L.Polygon.mergeOptions(style);
  L.Polyline.mergeOptions({
    color: style.color,
    opacity: style.opacity,
    weight: style.weight
  });
})();
MapExt = L.Map.extend({
  options: {
    bounceAtZoomLimits: false,
    detectAvailablePopupSpace: true,
    wheelPxPerZoomLevel: 120,
    worldCopyJump: true,
    zoomDelta: 0.5,
    zoomSnap: 0.5
  },
  initialize: function (options) {
    var baseLayerSet = false;
    var container = L.DomUtil.create('div', 'outerspatial-container');
    var map = L.DomUtil.create('div', 'outerspatial-map');
    var mapWrapper = L.DomUtil.create('div', 'outerspatial-map-wrapper');
    var me = this;
    var modules = L.DomUtil.create('div', 'outerspatial-modules');
    var outerspatial = L.DomUtil.create('div', 'outerspatial' + ((L.Browser.ie6 || L.Browser.ie7) ? ' outerspatial-oldie' : '') + (L.Browser.retina ? ' outerspatial-retina' : ''));
    var toolbar = L.DomUtil.create('div', 'outerspatial-toolbar');
    var toolbarLeft = L.DomUtil.create('ul', 'left');
    var toolbarRight = L.DomUtil.create('ul', 'right');
    var zoomifyMode = false;

    options = me._toLeaflet(options);
    L.Util.setOptions(this, options);
    options.div.insertBefore(outerspatial, options.div.hasChildNodes() ? options.div.childNodes[0] : null);
    outerspatial.appendChild(modules);
    outerspatial.appendChild(container);
    toolbar.appendChild(toolbarLeft);
    toolbar.appendChild(toolbarRight);
    container.appendChild(toolbar);
    container.appendChild(mapWrapper);
    mapWrapper.appendChild(map);
    options.div = map;
    options.zoomControl = false;
    L.Map.prototype.initialize.call(me, options.div, options);
    me._addEvents(me, options);
    me._controllingCursor = 'map';
    me._controllingInteractivity = 'map';
    me._defaultCursor = me.getContainer().style.cursor;
    me._frame = null;
    me._selectedLayer = null;

    if ((window.self !== window.top) && document.referrer !== '') {
      me._frame = window.frameElement;

      if (me.options.meta && me.options.meta.title) {
        var outerspatialContainer = container.parentNode.parentNode;
        var titleContainer = L.DomUtil.create('li', 'title');
        var title = L.DomUtil.create('h1', 'title');

        titleContainer.appendChild(title);
        toolbar.childNodes[0].appendChild(titleContainer);
        title.innerHTML = me.options.meta.title;
        toolbar.style.display = 'block';
        util.getChildElementsByClassName(outerspatialContainer, 'outerspatial-map-wrapper')[0].style.top = '40px';
      }
    }

    me.on('popupclose', function (e) {
      if (e.target._selectedLayer) {
        this.clearSelectedLayer();
      }
    });
    me.on('autopanstart', function () {
      me._setCursor('');
    });
    me.notify = humane.create({
      baseCls: 'humane-bootstrap',
      container: map
    });
    me.notify.danger = me.notify.spawn({
      addnCls: 'humane-bootstrap-danger'
    });
    me.notify.info = me.notify.spawn({
      addnCls: 'humane-bootstrap-info'
    });
    me.notify.success = me.notify.spawn({
      addnCls: 'humane-bootstrap-success'
    });
    me.notify.warning = me.notify.spawn({
      addnCls: 'humane-bootstrap-warning'
    });
    me._progress = new Nanobar({
      bg: '#67cdf6',
      id: 'outerspatial-progress',
      target: map
    });

    if (options.bounds) {
      me.fitBounds(options.bounds);
    } else {
      me.setView(options.center, options.zoom);
    }

    if (options.baseLayers.length) {
      var zoomify = [];
      var baseLayer;
      var i;

      for (i = 0; i < options.baseLayers.length; i++) {
        baseLayer = options.baseLayers[i];

        if (baseLayer.type === 'zoomify') {
          zoomify.push(baseLayer);
        }
      }

      if (zoomify.length) {
        zoomifyMode = true;

        for (i = 0; i < zoomify.length; i++) {
          baseLayer = zoomify[i];

          if (baseLayer.visible || typeof baseLayer.visible === 'undefined') {
            baseLayer.visible = true;
            baseLayer.L = L.outerspatial.layer.zoomify(baseLayer);
            me._addEvents(baseLayer.L, baseLayer);
            baseLayer.L.addTo(me);
            break;
          }
        }
      } else {
        for (i = 0; i < options.baseLayers.length; i++) {
          baseLayer = options.baseLayers[i];
          baseLayer.zIndex = 0;

          if (!baseLayerSet && (baseLayer.visible || typeof baseLayer.visible === 'undefined')) {
            baseLayer.visible = true;
            baseLayerSet = true;

            if (baseLayer.type === 'arcgisserver') {
              baseLayer.L = me._createArcGisServerLayer(baseLayer);
            } else if (baseLayer.type === 'mapbox') {
              baseLayer.L = me._createMapboxLayer(baseLayer);
            } else {
              baseLayer.L = L.outerspatial.layer[baseLayer.type](baseLayer);
            }

            me._addEvents(baseLayer.L, baseLayer);
            me.addLayer(baseLayer.L);
          } else {
            baseLayer.visible = false;
          }
        }
      }
    }

    if (!zoomifyMode && options.overlays.length) {
      var zIndex = 401;

      for (var j = 0; j < options.overlays.length; j++) {
        var overlay = options.overlays[j];

        if (typeof overlay === 'string') {
          // TODO: Support preset strings that are passed in.
        } else if (overlay.type === 'zoomify') {
          throw new Error('Zoomify layers can only be added in the "baseLayers" config property.');
        } else {
          if (overlay.visible || typeof overlay.visible === 'undefined') {
            var pane;
            var paneName;

            overlay.visible = true;
            paneName = overlay.name ? overlay.name.replace(/ /g, '-').toLowerCase() : String(zIndex);
            pane = me.createPane(paneName);
            pane.style.zIndex = zIndex;
            overlay.pane = paneName;

            if (overlay.preset) {
              switch (overlay.preset) {
                case 'nps-places-pois':
                  overlay.L = L.outerspatial.preset.places.pois(overlay);
                  break;
                case 'outerspatial':
                  overlay.L = L.outerspatial.preset.outerspatial(overlay);
                  break;
              }
            } else if (overlay.type === 'arcgisserver') {
              overlay.L = me._createArcGisServerLayer(overlay);
            } else if (overlay.type === 'mapbox') {
              overlay.L = me._createMapboxLayer(overlay);
            } else {
              overlay.L = L.outerspatial.layer[overlay.type](overlay);
            }

            me._addEvents(overlay.L, overlay);
            me.addLayer(overlay.L);
            zIndex++;
          } else {
            overlay.visible = false;
          }
        }
      }
    }

    me._initializeModules();
    me._setupPopup();
    me._setupTooltip();

    return this;
  },
  _addEvents: function (obj, config) {
    if (config.events && config.events.length) {
      for (var i = 0; i < config.events.length; i++) {
        var e = config.events[i];
        var context = e.context || null;

        if (e.single === true) {
          obj.once(e.type, e.fn, context);
        } else {
          obj.on(e.type, e.fn, context);
        }

        if (e.type === 'error' && obj.errorFired) {
          obj.fire('error', obj.errorFired);
        } else if (e.type === 'load' && obj._loaded) {
          obj.fire('load');
        } else if (e.type === 'ready' && obj.readyFired) {
          obj.fire('ready');
        }
      }
    }
  },
  _createArcGisServerLayer: function (config) {
    return L.outerspatial.layer[config.type][config.tiled === true ? 'tiled' : 'dynamic'](config);
  },
  _createMapboxLayer: function (config) {
    return L.outerspatial.layer[config.type][config.styled === true ? 'styled' : 'tiled'](config);
  },
  _initializeModules: function () {
    if (this.options && this.options.modules && L.Util.isArray(this.options.modules) && this.options.modules.length) {
      var initialize = null;
      var me = this;
      var modules = this.options.modules;
      var width = 0;
      var button;
      var i;

      this._divWrapper = this._container.parentNode.parentNode;
      this._divModules = util.getChildElementsByClassName(this._divWrapper.parentNode.parentNode, 'outerspatial-modules')[0];
      this._divModuleButtons = L.DomUtil.create('div', 'outerspatial-modules-buttons', this._container.parentNode);
      this._buttonCloseModules = L.DomUtil.create('button', 'outerspatial-modules-buttons-button', this._divModuleButtons);
      this._buttonCloseModules.style.backgroundImage = 'url(' + window.L.Icon.Default.imagePath + '/font-awesome/times' + (L.Browser.retina ? '@2x' : '') + '.png)';
      this._buttonCloseModules.setAttribute('alt', 'Close');
      L.DomEvent.addListener(this._buttonCloseModules, 'click', me.closeModules, this);

      for (i = 0; i < modules.length; i++) {
        var div = L.DomUtil.create('div', 'module', this._divModules);
        var divTitle = L.DomUtil.create('h2', 'title', div);
        var divContent = L.DomUtil.create('div', 'content', div);
        var module = modules[i];
        var content;
        var icon;
        var title;

        if (module.type !== 'custom') {
          this.options.modules[i] = module = L.outerspatial.module[module.type](module).addTo(this);
        }

        content = module.content;
        icon = module.icon;
        title = divTitle.innerHTML = module.title;

        if (typeof content === 'string') {
          divContent.innerHTML = content;
        } else if ('nodeType' in content) {
          divContent.appendChild(content);
        }

        button = L.DomUtil.create('button', 'outerspatial-modules-buttons-button', this._divModuleButtons);
        button.id = 'outerspatial-modules-buttons_' + title.replace(/ /g, '_');
        button.setAttribute('alt', title);
        button.style.backgroundImage = 'url(' + window.L.Icon.Default.imagePath + '/font-awesome/' + icon + (L.Browser.retina ? '@2x' : '') + '.png)';
        div.id = 'outerspatial-module_' + title.replace(/ /g, '_');

        if (typeof module.width === 'number') {
          if (module.width > width) {
            width = module.width;
          }
        }

        L.DomEvent.addListener(button, 'click', function () {
          me.showModule(this.id.replace('outerspatial-modules-buttons_', ''));
        });

        if (!initialize && module.visible === true) {
          initialize = title;
        }
      }

      if (width !== 0) {
        this._divModules.style.width = width + 'px';
      }

      if (initialize) {
        this.showModule(initialize);
      } else {
        for (i = 1; i < this._divModuleButtons.childNodes.length; i++) {
          button = this._divModuleButtons.childNodes[i];
          button.style.display = 'inline-block';
        }
      }
    }
  },
  _isCurrentlySelected: function (layer) {
    if (layer._map._selectedLayer && (layer._map._selectedLayer._leaflet_id === layer._leaflet_id)) {
      return true;
    } else {
      return false;
    }
  },
  _setCursor: function (type) {
    this._container.style.cursor = type;
  },
  _setupPopup: function () {
    var clicks = 0;
    var detectAvailablePopupSpace = this.options.detectAvailablePopupSpace;
    var me = this;
    var canceled;
    var changed;
    var hasArcGisServer;

    function done () {
      me
        .off('click', setCanceled)
        .off('dragstart', setChanged)
        .off('movestart', setChanged)
        .off('zoomstart', setChanged);

      if (hasArcGisServer) {
        me._progress.go(100);
        me._setCursor('');
      }
    }
    function go (e) {
      var queryable = [];
      var layer;

      canceled = false;
      changed = false;
      me
        .on('click', setCanceled)
        .on('dragstart', setChanged)
        .on('movestart', setChanged)
        .on('zoomstart', setChanged);

      for (var layerId in me._layers) {
        layer = me._layers[layerId];

        if (typeof layer.options === 'object' && (typeof layer.options.popup === 'undefined' || layer.options.popup !== false) && typeof layer._handleClick === 'function' && layer._hasInteractivity !== false) {
          queryable.push(layer);
        }
      }

      if (queryable.length) {
        var completed = 0;
        var intervals = 0;
        var latLng = e.latlng.wrap();
        var results = [];
        var i;
        var interval;

        hasArcGisServer = false;

        for (i = 0; i < queryable.length; i++) {
          layer = queryable[i];

          if (layer.options && layer.options.type === 'arcgisserver') {
            hasArcGisServer = true;
          }

          layer._handleClick(latLng, function (result) {
            if (result) {
              results.push(result);
            }

            completed++;
          });
        }

        if (hasArcGisServer) {
          me._progress.go(1);
          me._setCursor('wait');
        }

        interval = setInterval(function () {
          intervals++;

          if (hasArcGisServer) {
            me._progress.go(intervals);
          }

          if (canceled || changed) {
            clearInterval(interval);
            done();
          } else if ((queryable.length === completed) || intervals > 98) {
            clearInterval(interval);
            done();

            if (intervals > 98) {
              me.notify.danger('One or more servers failed to respond.');
            }

            if (results.length) {
              var actual = [];

              for (var i = 0; i < results.length; i++) {
                var result = results[i];

                if (typeof result.results !== 'undefined') {
                  if (result.results && result.results !== 'loading') {
                    actual.push(result);
                  }
                } else {
                  actual.push(result);
                }
              }

              if (actual.length && !me._popup) {
                var popup = L.outerspatial.popup({
                  maxHeight: (detectAvailablePopupSpace ? util._getAvailableVerticalSpace(me) : undefined),
                  maxWidth: (detectAvailablePopupSpace ? (util._getAvailableHorizontalSpace(me) < 300 ? util._getAvailableHorizontalSpace(me) : 300) : 300)
                });

                popup
                  .setContent(popup._handleResults(actual, me.options.popup))
                  .setLatLng(latLng).openOn(me);
              }
            }
          }
        }, 100);
      }
    }
    function setCanceled () {
      canceled = true;
    }
    function setChanged () {
      changed = true;
    }

    me.on('dblclick', function () {
      clicks++;
    });
    me.on('click', function (e) {
      clicks = 0;

      if (me._controllingInteractivity === 'map') {
        setTimeout(function () {
          if (!clicks) {
            go(e);
          }
        }, 200);
      }
    });
  },
  _setupTooltip: function () {
    var me = this;
    var overData = [];
    var tooltip = (me.infoboxControl ? me.infoboxControl : L.outerspatial.tooltip({
      map: me
    }));

    function handle () {
      if (me._controllingCursor === 'map') {
        updateCursor();
      }

      if (me._tooltips.length) {
        var changed = false;
        var childNodes = tooltip._container.childNodes;
        var html = '';
        var i;
        var obj;

        if (childNodes.length) {
          var remove = [];

          for (i = 0; i < childNodes.length; i++) {
            var childNode = childNodes[i];
            var removeNode = true;

            for (var j = 0; j < me._tooltips.length; j++) {
              obj = me._tooltips[j];

              // Also do comparison of html to see.
              if (obj.added && (obj.layerId === parseInt(childNode.id.replace('tooltip-', ''), 10))) {
                removeNode = false;
                break;
              }
            }

            if (removeNode) {
              remove.push(childNode);
            }
          }

          if (remove.length) {
            for (i = 0; i < remove.length; i++) {
              var div = remove[i];

              div.parentNode.removeChild(div);
            }

            changed = true;
          }

          html = tooltip.getHtml();
        }

        for (i = 0; i < me._tooltips.length; i++) {
          obj = me._tooltips[i];

          if (!obj.added) {
            changed = true;
            html += '<div id="tooltip-' + obj.layerId + '">' + util.unescapeHtml(obj.html) + '</div>';
            obj.added = true;
          }
        }

        if (tooltip.isVisible()) {
          if (changed) {
            tooltip.setHtml(html);
          }

          tooltip.setPosition(me._cursorEvent.containerPoint);
        } else {
          tooltip.show(me._cursorEvent.containerPoint, html);
        }
      } else {
        tooltip.hide();
        tooltip.setHtml('');
      }
    }
    function removeOverData (layerId) {
      var remove = [];
      var i;

      for (i = 0; i < overData.length; i++) {
        if (overData[i] === layerId) {
          remove.push(layerId);
        }
      }

      if (remove.length) {
        for (i = 0; i < remove.length; i++) {
          overData.splice(overData.indexOf(remove[i]), 1);
        }
      }
    }
    function removeTooltip (layerId) {
      var remove = [];
      var i;

      for (i = 0; i < me._tooltips.length; i++) {
        var obj = me._tooltips[i];

        if (obj.layerId === layerId) {
          remove.push(obj);
        }
      }

      if (remove.length) {
        for (i = 0; i < remove.length; i++) {
          me._tooltips.splice(me._tooltips.indexOf(remove[i]), 1);
        }
      }
    }
    function updateCursor () {
      if (overData.length) {
        me._setCursor('pointer');
      } else {
        if (me.getContainer().style.cursor !== 'wait') {
          me._setCursor('');
        }
      }
    }

    me._tooltips = [];
    L.DomEvent.on(util.getChildElementsByClassName(me.getContainer(), 'leaflet-popup-pane')[0], 'mousemove', function (e) {
      L.DomEvent.stopPropagation(e);
      tooltip.hide();
    });
    me.on('mousemove', function (e) {
      me._cursorEvent = e;

      if (me._controllingCursor === 'map') {
        handle();

        for (var layerId in me._layers) {
          var layer = me._layers[layerId];

          if (typeof layer._handleMousemove === 'function' && layer._hasInteractivity !== false) {
            layer._handleMousemove(me._cursorEvent.latlng.wrap(), function (result) {
              if (result.results !== 'loading') {
                var l = result.layer;
                var leafletId = l._leaflet_id;

                removeOverData(leafletId);
                removeTooltip(leafletId);

                if (result.results) {
                  overData.push(leafletId);

                  if (l.options && l.options.tooltip) {
                    for (var i = 0; i < result.results.length; i++) {
                      var data = result.results[i];
                      var tip;

                      if (typeof l.options.tooltip === 'function') {
                        tip = util.handlebars(l.options.tooltip(data));
                      } else if (typeof l.options.tooltip === 'string') {
                        tip = util.unescapeHtml(util.handlebars(l.options.tooltip, data));
                      }

                      if (tip && me._tooltips.indexOf(tip) === -1) {
                        me._tooltips.push({
                          html: tip,
                          layerId: leafletId
                        });
                      }
                    }
                  }
                }

                handle();
              }
            });
          }
        }
      }
    });
    me.on('mouseout', function () {
      tooltip.hide();
    });
  },
  _toLeaflet: function (config) {
    if (!config.div) {
      throw new Error('The map config object must have a div property');
    } else if (typeof config.div !== 'string' && typeof config.div !== 'object') {
      throw new Error('The map config object must be either a string or object');
    }

    if (config.baseLayers === false || (L.Util.isArray(config.baseLayers) && !config.baseLayers.length)) {
      config.baseLayers = [];
    } else {
      config.baseLayers = (function () {
        var visible = false;

        if (config.baseLayers && L.Util.isArray(config.baseLayers) && config.baseLayers.length) {
          for (var i = 0; i < config.baseLayers.length; i++) {
            var baseLayer = config.baseLayers[i];

            if (typeof baseLayer === 'string') {
              var name = baseLayer.split('-');

              if (name[1]) {
                baseLayer = util.clone(baselayerPresets[name[0]][name[1]]);
              } else {
                baseLayer = util.clone(baselayerPresets[name]);
              }
            }

            if (baseLayer.visible === true || typeof baseLayer.visible === 'undefined') {
              if (visible) {
                baseLayer.visible = false;
              } else {
                baseLayer.visible = true;
                visible = true;
              }
            } else {
              baseLayer.visible = false;
            }

            baseLayer.zIndex = 0;
            config.baseLayers[i] = baseLayer;
          }
        }

        if (visible) {
          return config.baseLayers;
        } else {
          var active = util.clone(baselayerPresets.mapbox.outdoors);
          active.visible = true;
          active.zIndex = 0;
          return [
            active
          ];
        }
      })();
    }

    config.center = (function () {
      var c = config.center;

      if (c) {
        return new L.LatLng(c.lat, c.lng);
      } else {
        return new L.LatLng(39.06, -96.02);
      }
    })();

    if (typeof config.div === 'string') {
      config.div = document.getElementById(config.div);
    }

    if (config.layers && L.Util.isArray(config.layers) && config.layers.length) {
      config.overlays = config.layers;

      for (var j = 0; j < config.overlays.length; j++) {
        var overlay = config.overlays[j];

        if (typeof overlay === 'string') {
          overlay = config.overlays[j] = util.clone(overlayPresets[overlay]);
        }
      }
    } else if (!config.overlays || !L.Util.isArray(config.overlays)) {
      config.overlays = [];
    }

    if (typeof config.maxZoom === 'number') {
      this._initialMaxZoom = config.maxZoom;
    }

    if (typeof config.minZoom === 'number') {
      this._initialMinZoom = config.minZoom;
    }

    if (config.baseLayers.length !== 0 && config.maxZoom > config.baseLayers[0].maxZoom) {
      config.maxZoom = config.baseLayers[0].maxZoom;
    }

    delete config.layers;
    config.zoom = typeof config.zoom === 'number' ? config.zoom : 4;

    if (config.baseLayers.length !== 0) {
      if (config.baseLayers[0].minZoom > config.zoom) {
        config.zoom = config.baseLayers[0].minZoom;
      } else if (config.baseLayers[0].maxZoom < config.zoom) {
        config.zoom = config.baseLayers[0].maxZoom;
      }
    }

    return config;
  },
  _updateImproveLinks: function () {
    // TODO: Need to create a new page on OuterSpatial Map Library and link to it
    if (this.attributionControl) {
      var els = util.getChildElementsByClassName(this.attributionControl._container, 'improve-park-tiles');

      if (els && els.length) {
        var center = this.getCenter();
        var el = els[0];
        var lat = center.lat.toFixed(5);
        var lng = center.lng.toFixed(5);
        var zoom = this.getZoom();

        el.href = 'https://www.nps.gov/npmap/tools/park-tiles/improve/#' + zoom + '/' + lat + '/' + lng;
      }
    }
  },
  clearSelectedLayer: function () {
    if (this._selectedLayer !== null) {
      this._selectedLayer.deselectLayer();
      this._selectedLayer = null;
    }
  },
  closeModules: function () {
    var buttons = this._divModuleButtons.childNodes;

    this._buttonCloseModules.style.display = 'none';
    this._divWrapper.style.left = '0';
    this._divModules.style.display = 'none';

    for (var i = 1; i < buttons.length; i++) {
      var button = buttons[i];

      L.DomUtil.removeClass(button, 'active');
      button.style.display = 'inline-block';
    }

    this.invalidateSize();
  },
  setSelectedLayer: function (layer) {
    var map = layer._map;

    if (!this._isCurrentlySelected(layer)) {
      this.clearSelectedLayer(map);
      layer.selectLayer();
      map._selectedLayer = layer;
    }
  },
  showModule: function (title) {
    var divModules = this._divModules;
    var childNodes = divModules.childNodes;
    var modules = this.options.modules;
    var i;

    title = title.replace(/_/g, ' ');

    for (i = 0; i < modules.length; i++) {
      var m = modules[i];
      var visibility = 'none';

      if (m.title === title) {
        visibility = 'block';
      }

      m.visible = (visibility === 'block');
      childNodes[i].style.display = visibility;
    }

    divModules.style.display = 'block';
    this._divWrapper.style.left = util.getOuterDimensions(divModules).width + 'px';
    this.invalidateSize();

    for (i = 0; i < this._divModuleButtons.childNodes.length; i++) {
      var button = this._divModuleButtons.childNodes[i];

      if (i === 0) {
        button.style.display = 'inline-block';
      } else {
        if (modules.length > 1) {
          button.style.display = 'inline-block';
        } else {
          button.style.display = 'none';
        }
      }

      if (button.id.replace('outerspatial-modules-buttons_', '').replace(/_/g, ' ') === title) {
        L.DomUtil.addClass(button, 'active');
      } else {
        L.DomUtil.removeClass(button, 'active');
      }
    }

    // TODO: Fire module 'show' event.
  },
  showModules: function () {
    var buttons = this._divModuleButtons.childNodes;

    this._buttonCloseModules.style.display = 'inline-block';
    this._divModules.style.display = 'block';
    this._divWrapper.style.left = util.getOuterDimensions(this._divModules).width + 'px';

    for (var i = 1; i < buttons.length; i++) {
      buttons[i].style.display = 'inline-block';
    }

    this.invalidateSize();
  }
});

module.exports = function (config) {
  return new MapExt(config);
};
