/* globals L */
/* jshint camelcase: false */

(function () {
  L.Handler.MarkerSnap = L.Handler.extend({
    options: {
      snapDistance: 15,
      snapVertices: true
    },
    initialize: function (map, marker, options) {
      L.Handler.prototype.initialize.call(this, map);
      this._markers = [];
      this._guides = [];

      if (arguments.length === 2) {
        if (!(marker instanceof L.Class)) {
          options = marker;
          marker = null;
        }
      }

      L.Util.setOptions(this, options || {});

      if (marker) {
        if (!marker.dragging) {
          marker.dragging = new L.Handler.MarkerDrag(marker);
        }

        marker.dragging.enable();
        this.watchMarker(marker);
      }

      function computeBuffer() {
        this._buffer = map.layerPointToLatLng(new L.Point(0,0)).lat - map.layerPointToLatLng(new L.Point(this.options.snapDistance, 0)).lat;
      }

      map.on('zoomend', computeBuffer, this);
      map.whenReady(computeBuffer, this);
      computeBuffer.call(this);
    },
    enable: function () {
      this.disable();

      for (var i = 0; i<this._markers.length; i++) {
        this.watchMarker(this._markers[i]);
      }
    },
    disable: function () {
      for (var i = 0; i<this._markers.length; i++) {
        this.unwatchMarker(this._markers[i]);
      }
    },
    watchMarker: function (marker) {
      if (this._markers.indexOf(marker) === -1) {
        this._markers.push(marker);
      }

      marker.on('move', this._snapMarker, this);
    },
    unwatchMarker: function (marker) {
      marker.off('move', this._snapMarker, this);
      delete marker.snap;
    },
    addGuideLayer: function (layer) {
      for (var i = 0, n=this._guides.length; i < n; i++) {
        if (L.stamp(layer) === L.stamp(this._guides[i])) {
          return;
        }
      }

      this._guides.push(layer);
    },
    _snapMarker: function(e) {
      var marker = e.target,
        latlng = marker.getLatLng(),
        snaplist = [];

      function processGuide(guide) {
        if ((guide._layers !== undefined) && (typeof guide.searchBuffer !== 'function')) {
          for (var id in guide._layers) {
            processGuide(guide._layers[id]);
          }
        } else if (typeof guide.searchBuffer === 'function') {
          snaplist = snaplist.concat(guide.searchBuffer(latlng, this._buffer));
        } else {
          snaplist.push(guide);
        }
      }

      for (var i = 0, n = this._guides.length; i < n; i++) {
        processGuide.call(this, this._guides[i]);
      }

      var closest = this._findClosestLayerSnap(this._map, snaplist, latlng, this.options.snapDistance, this.options.snapVertices);

      closest = closest || {layer: null, latlng: null};
      this._updateSnap(marker, closest.layer, closest.latlng);
    },
    _findClosestLayerSnap: function (map, layers, latlng, tolerance, withVertices) {
      return L.GeometryUtil.closestLayerSnap(map, layers, latlng, tolerance, withVertices);
    },
    _updateSnap: function (marker, layer, latlng) {
      if (layer && latlng) {
        marker._latlng = L.latLng(latlng);
        marker.update();

        if (marker.snap != layer) {
          marker.snap = layer;

          if (marker._icon) {
            L.DomUtil.addClass(marker._icon, 'marker-snapped');
          }

          marker.fire('snap', {layer:layer, latlng: latlng});
        }
      } else {
        if (marker.snap) {
          if (marker._icon) {
            L.DomUtil.removeClass(marker._icon, 'marker-snapped');
          }

          marker.fire('unsnap', {layer:marker.snap});
        }

        delete marker.snap;
      }
    }
  });

  if (!L.Edit) {
    return;
  }

  L.Handler.PolylineSnap = L.Edit.Poly.extend({
    initialize: function (map, poly, options) {
      L.Edit.Poly.prototype.initialize.call(this, poly, options);
      this._snapper = new L.Handler.MarkerSnap(map, options);
    },
    _createMarker: function (latlng, index) {
      var marker = L.Edit.Poly.prototype._createMarker.call(this, latlng, index),
        isMiddle = index === undefined;

      if (isMiddle) {
        marker.on('dragstart', function () {
          this._snapper.watchMarker(marker);
        }, this);
      } else {
        this._snapper.watchMarker(marker);
      }

      return marker;
    },
    addGuideLayer: function (layer) {
      this._snapper.addGuideLayer(layer);
    }
  });
  L.Draw.Feature.SnapMixin = {
    _snap_initialize: function() {
      this
        .on('enabled', this._snap_on_enabled, this)
        .on('disabled', this._snap_on_disabled, this);
    },
    _snap_on_click: function () {
      if (this._markers) {
        if (this._mouseMarker.snap) {
          L.DomUtil.addClass(this._markers[this._markers.length - 1]._icon, 'marker-snapped');
        }
      }
    },
    _snap_on_disabled: function () {
      delete this._snapper;
    },
    _snap_on_enabled: function() {
      var icon, marker;

      if (!this.options.guideLayers) {
        return;
      }

      if (!this._mouseMarker) {
        return;
      }

      if (!this._snapper) {
        this._snapper = new L.Handler.MarkerSnap(this._map);

        if (this.options.snapDistance) {
          this._snapper.options.snapDistance = this.options.snapDistance;
        }

        if (this.options.snapVertices) {
          this._snapper.options.snapVertices = this.options.snapVertices;
        }
      }

      for (var i = 0, n = this.options.guideLayers.length; i < n; i++) {
        this._snapper.addGuideLayer(this.options.guideLayers[i]);
      }

      marker = this._mouseMarker;
      this._snapper.watchMarker(marker);
      icon = marker.options.icon;

      marker
        .on('snap', function() {
          marker
            .setIcon(this.options.icon)
            .setOpacity(1);
        }, this)
        .on('unsnap', function() {
          marker
            .setIcon(icon)
            .setOpacity(0);
        }, this)
        .on('click', this._snap_on_click, this);
    }
  };

  L.Draw.Feature.include(L.Draw.Feature.SnapMixin);
  L.Draw.Feature.addInitHook('_snap_initialize');
})();
