/* global L */
/* jshint camelcase: false */

'use strict';

require('leaflet-draw');

var util = require('../util/util');
var MeasureControl = L.Control.extend({
  includes: L.Evented.prototype,
  options: {
    polygon: {
      allowIntersection: false,
      drawError: {
        color: '#f06eaa',
        message: 'Polygons can\'t overlap',
        timeout: 500
      },
      repeatMode: true,
      shapeOptions: {
        color: '#882255',
        fillOpacity: 0.4,
        opacity: 1,
        weight: 4
      }
    },
    polyline: {
      repeatMode: true,
      shapeOptions: {
        color: '#882255',
        opacity: 1,
        weight: 4
      }
    },
    position: 'topright',
    units: {
      area: [
        'ac',
        'ha'
      ],
      distance: [
        'mi',
        'ft',
        'm'
      ]
    }
  },
  // TODO: Also store conversion formulas here.
  units: {
    area: {
      'ac': 'Acres',
      'ha': 'Hectares'
    },
    distance: {
      'ft': 'Feet',
      'm': 'Meters',
      'mi': 'Miles'
    }
  },
  initialize: function (options) {
    L.Util.setOptions(this, options);
    this._featureGroup = new L.FeatureGroup();
    this._featureGroupTooltips = new L.FeatureGroup();
    this._modes = {};
    this._resetVariables();

    if (this.options && this.options.units) {
      var unit;

      if (this.options.units.area && this.options.units.area.length) {
        unit = this.options.units.area[0];

        if (this.units.area[unit]) {
          this._activeUnitArea = unit;
          this._lastUnitArea = unit;
        }
      }

      if (this.options.units.distance && this.options.units.distance.length) {
        unit = this.options.units.distance[0];

        if (this.units.distance[unit]) {
          this._activeUnitDistance = unit;
          this._lastUnitDistance = unit;
        }
      }
    }

    return this;
  },
  onAdd: function (map) {
    if (this._activeUnitArea || this._activeUnitDistance) {
      var liSelect = document.createElement('li');
      var html;
      var i;
      var unit;

      this._container = L.DomUtil.create('div', 'leaflet-bar leaflet-control outerspatial-control-measure');
      this._map = map;
      this._menu = L.DomUtil.create('ul', '', this._container);
      this._button = L.DomUtil.create('button', undefined, this._container);
      this._button.innerHTML = '' +
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">' +
          '<g class="icon-svg-line">' +
            '<line data-color="color-2" x1="11" y1="8" x2="12" y2="9"/>' +
            '<line data-color="color-2" x1="14" y1="5" x2="16" y2="7"/>' +
            '<line data-color="color-2" x1="8" y1="11" x2="10" y2="13"/>' +
            '<line data-color="color-2" x1="5" y1="14" x2="6" y2="15"/>' +
            '<rect x="1.393" y="8.464" transform="rotate(-45 12 12)" width="21.213" height="7.071"/>' +
          '</g>' +
        '</svg>' +
      '';

      this._menu.appendChild(liSelect);
      map
        .addLayer(this._featureGroup)
        .addLayer(this._featureGroupTooltips);

      if (this._activeUnitArea) {
        var liArea = L.DomUtil.create('li', '', this._menu);

        html = '';
        this._buttonArea = L.DomUtil.create('button', 'pressed', liArea);
        this._buttonArea.innerHTML = 'Area';
        this._selectUnitArea = L.DomUtil.create('select', '', liSelect);
        liArea.className = 'first';

        // TODO: Verify this is a supported unit.
        for (i = 0; i < this.options.units.area.length; i++) {
          unit = this.options.units.area[i];
          html += '<option value="' + unit + '"' + (i === 0 ? ' selected' : '') + '>' + this.units.area[unit] + '</option>';
        }

        this._selectUnitArea.innerHTML = html;
        this._initializeMode(this._buttonArea, new L.Draw.Polygon(map, this.options.polygon));
      }

      if (this._activeUnitDistance) {
        var liDistance = L.DomUtil.create('li', '', this._menu);
        var me = this;

        html = '';
        this._buttonDistance = L.DomUtil.create('button', (function () {
          if (me._buttonArea) {
            return '';
          } else {
            return 'pressed';
          }
        })(), liDistance);
        this._buttonDistance.innerHTML = 'Distance';
        this._selectUnitDistance = L.DomUtil.create('select', '', liSelect);
        liDistance.className = this._activeUnitArea ? 'second' : 'first';

        // TODO: Verify this is a supported unit.
        for (i = 0; i < this.options.units.distance.length; i++) {
          unit = this.options.units.distance[i];
          html += '<option value="' + unit + '"' + (i === 0 ? ' selected' : '') + '>' + this.units.distance[unit] + '</option>';
        }

        this._selectUnitDistance.innerHTML = html;
        this._initializeMode(this._buttonDistance, new L.Draw.Polyline(map, this.options.polyline));
      }

      this._setupListeners();

      return this._container;
    } else {
      throw new Error('No valid units specified for measure control!');
    }
  },
  _buildTooltipArea: function (total) {
    return '' +
      '<div class="leaflet-measure-tooltip-area">' +
        '<div class="leaflet-measure-tooltip-total">' +
          '<span>' +
            total.toFixed(2) + ' ' + this._activeUnitArea +
          '</span>' +
        '</div>' +
      '</div>' +
    '';
  },
  _buildTooltipDistance: function (total, difference) {
    var html = '' +
      '<div class="leaflet-measure-tooltip-distance">' +
        '<div class="leaflet-measure-tooltip-total">' +
          '<span>' +
            total.toFixed(2) + ' ' + this._activeUnitDistance +
          '</span>' +
          '<span>' +
            total +
          '</span>' +
        '</div>' +
      '' +
    '';

    if (typeof difference !== 'undefined' && (difference !== 0) && (difference !== total)) {
      html += '' +
        '' +
          '<div class="leaflet-measure-tooltip-difference">' +
            '<span>' +
              '(+' + difference.toFixed(2) + ' ' + this._activeUnitDistance + ')' +
            '</span>' +
            '<span>' +
              difference +
            '</span>' +
          '</div>' +
        '' +
      '';
    }

    return html + '</div>';
  },
  _buttonClick: function (e, manual) {
    var button = e.target;

    if (manual || !L.DomUtil.hasClass(button, 'pressed')) {
      var add;
      var mode;
      var remove;

      if (button.innerHTML.toLowerCase() === 'distance') {
        add = this._buttonDistance;
        mode = 'distance';

        if (this._selectUnitArea) {
          this._selectUnitArea.style.display = 'none';
          remove = this._buttonArea;
          this._modes.polygon.handler.disable();
        }

        this._selectUnitDistance.style.display = 'block';
        this._modes.polyline.handler.enable();
      } else {
        add = this._buttonArea;
        mode = 'area';

        if (this._selectUnitDistance) {
          this._selectUnitDistance.style.display = 'none';
          remove = this._buttonDistance;
          this._modes.polyline.handler.disable();
        }

        this._selectUnitArea.style.display = 'block';
        this._modes.polygon.handler.enable();
      }

      L.DomUtil.addClass(add, 'pressed');

      if (remove) {
        L.DomUtil.removeClass(remove, 'pressed');
      }

      this._startMeasuring(mode);
    }
  },
  _calculateArea: function (to, val, from) {
    from = from || 'm';

    if (from !== to) {
      if (from === 'ac') {
        switch (to) {
          case 'ha':
            val = val / 2.47105;
            break;
          case 'm':
            val = val * 4046.85642;
            break;
        }
      } else if (from === 'ha') {
        switch (to) {
          case 'ac':
            val = val * 2.47105;
            break;
          case 'm':
            val = val * 10000;
            break;
        }
      } else if (from === 'm') {
        switch (to) {
          case 'ac':
            val = val / 4046.85642;
            break;
          case 'ha':
            val = val / 10000;
            break;
        }
      }
    }

    return val;
  },
  _calculateDistance: function (to, val, from) {
    from = from || 'm';

    if (from !== to) {
      if (from === 'ft') {
        switch (to) {
          case 'm':
            val = val / 3.28084;
            break;
          case 'mi':
            val = val / 5280;
            break;
        }
      } else if (from === 'm') {
        switch (to) {
          case 'ft':
            val = val * 3.28084;
            break;
          case 'mi':
            val = val * 0.000621371192;
            break;
        }
      } else if (from === 'mi') {
        switch (to) {
          case 'ft':
            val = val * 5280;
            break;
          case 'm':
            val = val * 1609.344;
            break;
        }
      }
    }

    return val;
  },
  _createTooltip: function (latLng, text) {
    return new L.Marker(latLng, {
      clickable: false,
      icon: new L.DivIcon({
        className: 'leaflet-measure-tooltip',
        html: text,
        iconAnchor: [
          -5,
          -5
        ]
      })
    }).addTo(this._featureGroupTooltips);
  },
  _handlerActivated: function (e) {
    if (this._activeMode && this._activeMode.handler.enabled()) {
      this._activeMode.handler.disable();
    }

    this._activeMode = this._modes[e.handler];
    this.fire('activated');
  },
  _handlerDeactivated: function () {
    this._resetVariables();
    this.fire('deactivated');
  },
  _initializeMode: function (button, handler) {
    var type = handler.type;

    this._modes[type] = {
      button: button,
      handler: handler
    };
    this._modes[type].handler
      .on('disabled', this._handlerDeactivated, this)
      .on('enabled', this._handlerActivated, this);
  },
  // TODO: Add circlemarkers at the vertices, and make these clickable to finish the measurement.
  _mouseClickArea: function (e) {
    var latLng = e.latlng;

    if (this._activePolygon) {
      var latLngs;

      this._activePolygon.addLatLng(latLng);
      latLngs = this._activePolygon.getLatLngs()[0];

      if (latLngs.length > 2) {
        if (this._activeTooltip) {
          this._featureGroupTooltips.removeLayer(this._activeTooltip);
        }

        this._area = this._calculateArea(this._activeUnitArea, L.GeometryUtil.geodesicArea(latLngs));
        this._activeTooltip = this._createTooltip(latLng, this._buildTooltipArea(this._area));
      }
    } else {
      this._activePolygon = new L.Polygon([
        latLng
      ]);
      this._area = 0;
    }

    if (this._tempTooltip) {
      this._removeTempTooltip();
    }
  },
  // TODO: Add circlemarkers at the vertices, and make these clickable to finish the measurement.
  _mouseClickDistance: function (e) {
    var latLng = e.latlng;

    if (this._activePoint) {
      var distance = this._calculateDistance(this._activeUnitDistance, latLng.distanceTo(this._activePoint));

      this._distance = this._distance + distance;
      this._activeTooltip = this._createTooltip(latLng, this._buildTooltipDistance(this._distance, distance));
    } else {
      this._distance = 0;
    }

    this._activePoint = latLng;

    if (this._tempTooltip) {
      this._removeTempTooltip();
    }
  },
  _mouseMove: function (e) {
    var latLng = e.latlng;

    if (!latLng || !this._activePoint) {
      return;
    }

    if (!L.DomUtil.hasClass(this._buttonArea, 'pressed')) {
      this._mouseMoveDistance(latLng);
    }
  },
  _mouseMoveDistance: function (latLng) {
    var distance = this._calculateDistance(this._activeUnitDistance, latLng.distanceTo(this._activePoint));
    var html = this._buildTooltipDistance(this._distance + distance);

    if (this._tempTooltip) {
      this._updateTooltip(latLng, html, this._tempTooltip);
    } else {
      this._tempTooltip = this._createTooltip(latLng, html);
    }
  },
  _onKeyDown: function (e) {
    if (e.keyCode === 27) {
      this._toggleMeasure();
    }
  },
  _onSelectUnitArea: function () {
    var tooltips = util.getElementsByClassName('leaflet-measure-tooltip-area');

    this._lastUnitArea = this._activeUnitArea;
    this._activeUnitArea = this._selectUnitArea.options[this._selectUnitArea.selectedIndex].value;

    for (var i = 0; i < tooltips.length; i++) {
      var tooltip = tooltips[i];
      var node = tooltip.childNodes[0].childNodes[0];

      tooltip.parentNode.innerHTML = this._buildTooltipArea(this._calculateArea(this._activeUnitArea, parseFloat(node.innerHTML), this._lastUnitArea));
    }
  },
  _onSelectUnitDistance: function () {
    var tooltips = util.getElementsByClassName('leaflet-measure-tooltip-distance');

    this._lastUnitDistance = this._activeUnitDistance;
    this._activeUnitDistance = this._selectUnitDistance.options[this._selectUnitDistance.selectedIndex].value;

    for (var i = 0; i < tooltips.length; i++) {
      var tooltip = tooltips[i];
      var childNodes = tooltip.childNodes;
      var difference;
      var differenceNode;
      var total;
      var totalNode;

      if (childNodes.length === 2) {
        differenceNode = childNodes[1].childNodes[1];
        totalNode = childNodes[0].childNodes[1];
      } else {
        differenceNode = childNodes[0].childNodes[1];
      }

      difference = this._calculateDistance(this._activeUnitDistance, parseFloat(differenceNode.innerHTML), this._lastUnitDistance);

      if (totalNode) {
        total = this._calculateDistance(this._activeUnitDistance, parseFloat(totalNode.innerHTML), this._lastUnitDistance);
        tooltip.parentNode.innerHTML = this._buildTooltipDistance(total, difference);
      } else {
        tooltip.parentNode.innerHTML = this._buildTooltipDistance(difference);
      }
    }

    if (this._activeTooltip) {
      this._distance = parseFloat(this._activeTooltip._icon.childNodes[0].childNodes[0].childNodes[1].innerHTML);

      // TODO: You should really just update this._tempTooltip with the new distance.
      if (this._tempTooltip) {
        this._removeTempTooltip();
      }
    }
  },
  _removeListeners: function () {
    var map = this._map;

    L.DomEvent
      .off(document, 'keydown', this._onKeyDown, this)
      .off(map, 'click', this._mouseClickArea, this)
      .off(map, 'click', this._mouseClickDistance, this)
      .off(map, 'dblclick', this._handlerDeactivated, this)
      .off(map, 'mousemove', this._mouseMove, this);
  },
  _removeTempTooltip: function () {
    this._featureGroupTooltips.removeLayer(this._tempTooltip);
    this._tempTooltip = null;
  },
  _resetVariables: function () {
    this._activeMode = null;
    this._activePoint = null;
    this._activePolygon = null;
    this._activeTooltip = null;
    this._area = 0;
    this._currentCircles = [];
    this._distance = 0;
    this._layerGroupPath = null;
    this._tempTooltip = null;
  },
  _setupListeners: function () {
    var me = this;

    L.DomEvent
      .disableClickPropagation(this._button)
      .disableClickPropagation(this._menu)
      .on(this._button, 'click', this._toggleMeasure, this);

    if (this._buttonArea) {
      L.DomEvent
        .on(this._buttonArea, 'click', this._buttonClick, this)
        .on(this._selectUnitArea, 'change', this._onSelectUnitArea, this);
    }

    if (this._buttonDistance) {
      L.DomEvent
        .on(this._buttonDistance, 'click', this._buttonClick, this)
        .on(this._selectUnitDistance, 'change', this._onSelectUnitDistance, this);
    }

    this._map.on('draw:created', function (e) {
      if (L.DomUtil.hasClass(me._button, 'pressed')) {
        var added = [];
        var layers = me._featureGroupTooltips.getLayers();
        var i;

        me._featureGroup.addLayer(e.layer);

        for (i = 0; i < layers.length; i++) {
          added.push(layers[i]);
          me._featureGroup.addLayer(layers[i]);
        }

        for (i = 0; i < layers.length; i++) {
          me._featureGroupTooltips.removeLayer(layers[i]);
        }

        for (i = 0; i < added.length; i++) {
          added[i].addTo(me._map);
        }
      }
    });
  },
  _startMeasuring: function (type) {
    var map = this._map;

    map.closePopup();
    this._featureGroupTooltips.clearLayers();
    this._removeListeners();
    L.DomEvent
      .on(document, 'keydown', this._onKeyDown, this)
      .on(map, 'dblclick', this._handlerDeactivated, this)
      .on(map, 'mousemove', this._mouseMove, this);

    if (type === 'area') {
      L.DomEvent.on(map, 'click', this._mouseClickArea, this);
    } else {
      L.DomEvent.on(map, 'click', this._mouseClickDistance, this);
    }
  },
  _toggleMeasure: function () {
    var map = this._map;

    if (L.DomUtil.hasClass(this._button, 'pressed')) {
      L.DomUtil.removeClass(this._button, 'pressed');
      this._menu.style.display = 'none';
      this._removeListeners();
      this._featureGroup.clearLayers();
      this._featureGroupTooltips.clearLayers();
      map._controllingInteractivity = 'map';
      this._activeMode.handler.disable();
    } else {
      if (map._controllingInteractivity !== 'map') {
        map[map._controllingInteractivity + 'Control'].deactivate();
      }

      L.DomUtil.addClass(this._button, 'pressed');
      this._menu.style.display = 'block';

      if (this._buttonArea && L.DomUtil.hasClass(this._buttonArea, 'pressed')) {
        this._buttonClick({
          target: this._buttonArea
        }, true);
      } else {
        this._buttonClick({
          target: this._buttonDistance
        }, true);
      }

      map._controllingInteractivity = 'measure';
    }
  },
  _updateTooltip: function (latLng, html, tooltip) {
    tooltip = tooltip || this._activeTooltip;
    tooltip.setLatLng(latLng);
    tooltip._icon.innerHTML = html;
  },
  activate: function () {
    if (!L.DomUtil.hasClass(this._button, 'pressed')) {
      this._toggleMeasure();
    }
  },
  deactivate: function () {
    if (L.DomUtil.hasClass(this._button, 'pressed')) {
      this._toggleMeasure();
    }
  }
});

L.Map.mergeOptions({
  measureControl: false
});
L.Map.addInitHook(function () {
  if (this.options.measureControl) {
    var options = {};

    if (typeof this.options.measureControl === 'object') {
      options = this.options.measureControl;
    }

    this.measureControl = L.outerspatial.control.measure(options).addTo(this);
  }
});

module.exports = function (options) {
  return new MeasureControl(options);
};
