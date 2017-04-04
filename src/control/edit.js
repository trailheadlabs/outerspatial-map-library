/* global L */

'use strict';

// Modified options to support passing a layer in.

require('leaflet-draw');
require('../icon/maki');
require('../icon/outerspatialsymbollibrary');

var EditControl = L.Control.extend({
  includes: L.Mixin.Events,
  options: {
    circle: {
      shapeOptions: {
        color: '#d46655',
        fillOpacity: 0.4,
        opacity: 1,
        weight: 4
      }
    },
    layer: undefined,
    marker: {
      icon: {
        'marker-color': '#d46655',
        'marker-library': 'maki',
        'marker-size': 'medium'
      }
    },
    polygon: {
      shapeOptions: {
        color: '#d46655',
        fillOpacity: 0.4,
        opacity: 1,
        weight: 4
      }
    },
    polyline: {
      shapeOptions: {
        color: '#d46655',
        opacity: 1,
        weight: 4
      }
    },
    position: 'topleft',
    rectangle: {
      shapeOptions: {
        color: '#d46655',
        fillOpacity: 0.4,
        opacity: 1,
        weight: 4
      }
    },
    toolbar: true
  },
  initialize: function (options) {
    L.Util.setOptions(this, options);
    this._activeMode = null;
    this._featureGroup = (options && options.layer ? options.layer : new L.FeatureGroup());
    this._modes = {};
    return this;
  },
  onAdd: function (map) {
    var container = L.DomUtil.create('div', 'leaflet-control-edit leaflet-bar');
    var me = this;
    var options = this.options;
    var editId;
    var editShape;

    if (options.marker) {
      if (options.marker.icon && options.marker.icon['marker-library']) {
        options.marker.icon = L.outerspatial.icon[options.marker.icon['marker-library']](options.marker.icon);
      }

      this._initializeMode(container, new L.Draw.Marker(map, options.marker), 'Draw a marker');
    }

    if (options.polyline) {
      this._initializeMode(container, new L.Draw.Polyline(map, options.polyline), 'Draw a line');
    }

    if (options.polygon) {
      this._initializeMode(container, new L.Draw.Polygon(map, options.polygon), 'Draw a polygon');
    }

    if (options.rectangle) {
      this._initializeMode(container, new L.Draw.Rectangle(map, options.rectangle), 'Draw a rectangle');
    }

    if (options.circle) {
      this._initializeMode(container, new L.Draw.Circle(map, options.circle), 'Draw a circle');
    }

    this._map = map;
    this._featureGroup.on('click', function (e) {
      var editing = e.layer.editing;
      var leafletId;

      if (editing) {
        if (!editing._marker) {
          if (editing._poly) {
            leafletId = editing._poly._leaflet_id;
          } else {
            leafletId = editing._shape._leaflet_id;
          }

          if (editId === leafletId) {
            editing.disable();
            editId = null;
            editShape = null;
          } else {
            if (editShape) {
              editShape.editing.disable();
            }

            editing.enable();
            editId = leafletId;
            editShape = e.layer;
          }
        }
      } else {
        if (editShape) {
          editShape.editing.disable();
          editId = null;
          editShape = null;
        }
      }
    });
    map
      .addLayer(this._featureGroup)
      .on('click', function () {
        if (editShape) {
          editShape.editing.disable();
          editId = null;
          editShape = null;
        }
      })
      .on('draw:created', function (e) {
        if (me._activeMode) {
          me._featureGroup.addLayer(e.layer);

          if (e.layerType === 'marker') {
            e.layer.dragging.enable();
            e.layer.on('dragstart', function () {
              if (editShape) {
                editShape.editing.disable();
                editId = null;
                editShape = null;
              }
            });
          }
        }
      })
      .on('draw:drawstart', function () {
        if (editShape) {
          editShape.editing.disable();
          editId = null;
          editShape = null;
        }
      });

    return container;
  },
  _handlerActivated: function (e) {
    var map = this._map;

    if (map._controllingInteractivity !== 'map') {
      map[map._controllingInteractivity + 'Control'].deactivate();
    }

    if (this._activeMode && this._activeMode.handler.enabled()) {
      this._activeMode.handler.disable();
    }

    this._activeMode = this._modes[e.handler];

    if (this._activeMode.button) {
      L.DomUtil.addClass(this._activeMode.button, 'pressed');
    }

    map._controllingInteractivity = 'edit';
    this.fire('activated');
    map.closePopup();
  },
  _handlerDeactivated: function () {
    if (this._activeMode.button) {
      L.DomUtil.removeClass(this._activeMode.button, 'pressed');
    }

    this._activeMode = null;
    this._map._controllingInteractivity = 'map';
    this.fire('deactivated');
  },
  _initializeMode: function (container, handler, title) {
    var button = null;
    var me = this;
    var type = handler.type;

    this._modes[type] = {};
    this._modes[type].handler = handler;

    if (this.options.toolbar) {
      button = L.DomUtil.create('button', type, container);
      button.setAttribute('alt', title);
      L.DomEvent
        .disableClickPropagation(button)
        .on(button, 'click', function () {
          if (me._activeMode && me._activeMode.handler.type === type) {
            me._modes[type].handler.disable();
          } else {
            me._modes[type].handler.enable();
          }
        }, this._modes[type].handler);
    }

    this._modes[type].button = button;
    this._modes[type].handler
      .on('disabled', this._handlerDeactivated, this)
      .on('enabled', this._handlerActivated, this);
  },
  activateMode: function (type) {
    this._modes[type].handler.enable();
  },
  clearShapes: function () {
    this._featureGroup.clearLayers();
  },
  deactivate: function () {
    this.deactivateMode(this._activeMode.handler.type);
  },
  deactivateMode: function (type) {
    this._modes[type].handler.disable();
  }
});

L.Map.mergeOptions({
  editControl: false
});
L.Map.addInitHook(function () {
  if (this.options.editControl) {
    var options = {};

    if (typeof this.options.editControl === 'object') {
      options = this.options.editControl;
    }

    this.editControl = L.outerspatial.control.edit(options).addTo(this);
  } else {
    var edit = false;
    var overlays = this.options.overlays;

    if (overlays && L.Util.isArray(overlays)) {
      for (var i = 0; i < overlays.length; i++) {
        if (overlays[i].edit) {
          edit = true;
          break;
        }
      }
    }

    if (edit) {
      this.editControl = L.outerspatial.control.edit({
        toolbar: false
      }).addTo(this);
    }
  }
});

module.exports = function (options) {
  return new EditControl(options);
};
