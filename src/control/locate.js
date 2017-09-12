/* global L */

'use strict';

var LocateControl = L.Control.extend({
  options: {
    circlePadding: [0, 0],
    circleStyle: {
      clickable: false,
      color: '#136aec',
      fillColor: '#136aec',
      fillOpacity: 0.15,
      opacity: 0.5,
      weight: 2
    },
    drawCircle: true,
    follow: false,
    followCircleStyle: {},
    followMarkerStyle: {},
    locateOptions: {},
    markerStyle: {
      clickable: false,
      color: '#136aec',
      fillColor: '#2a93ee',
      fillOpacity: 0.7,
      opacity: 0.9,
      radius: 5,
      weight: 2
    },
    metric: true,
    onLocationError: function (context, error) {
      context._map.notify.danger(error.message);
    },
    onLocationOutsideMapBounds: function (context) {
      context._map.notify.danger(context.options.strings.outsideMapBoundsMsg);
    },
    position: 'topleft',
    setView: true,
    stopFollowingOnDrag: true,
    strings: {
      outsideMapBoundsMsg: 'You seem to be located outside of the boundaries of the map',
      popup: 'You are within {distance} {unit} of this point',
      title: 'Show me where I am'
    }
  },
  onAdd: function (map) {
    var me = this;
    var obj = {};

    this._container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
    this._event = undefined;
    this._layer = new L.LayerGroup().addTo(map);
    this._locateOptions = {
      watch: true
    };
    this._map = map;
    L.extend(this._locateOptions, this.options.locateOptions);
    L.extend(this._locateOptions, {
      setView: false
    });
    L.extend(obj, this.options.markerStyle, this.options.followMarkerStyle);
    this.options.followMarkerStyle = obj;
    obj = {};
    L.extend(obj, this.options.circleStyle, this.options.followCircleStyle);
    this.options.followCircleStyle = obj;
    me._button = L.DomUtil.create('button', 'leaflet-bar-single', this._container);
    me._button.setAttribute('alt', this.options.strings.title);
    me.setIcon('default');
    L.DomEvent
      .on(me._button, 'click', L.DomEvent.stopPropagation)
      .on(me._button, 'click', L.DomEvent.preventDefault)
      .on(me._button, 'click', function () {
        if (me._active && (me._event === undefined || map.getBounds().contains(me._event.latlng) || !me.options.setView || isOutsideMapBounds())) {
          stopLocate();
        } else {
          locate();
        }
      })
      .on(me._button, 'dblclick', L.DomEvent.stopPropagation);

    function isOutsideMapBounds () {
      if (me._event === undefined) {
        return false;
      }

      return map.options.maxBounds && !map.options.maxBounds.contains(me._event.latlng);
    }
    function locate () {
      if (!me._event) {
        me.setIcon('requesting');
        L.DomUtil.addClass(me._button, 'pressed');
        L.DomUtil.removeClass(me._button, 'following');
      } else {
        visualizeLocation();
      }

      if (!me._active) {
        map.locate(me._locateOptions);
      }

      me._active = true;

      if (me.options.follow) {
        startFollowing();
      }

      if (me.options.setView) {
        me._locateOnNextLocationFound = true;
      }
    }
    function onLocationError (err) {
      if (err.code === 3 && me._locateOptions.watch) {
        return;
      }

      stopLocate();
      me.options.onLocationError(me, err);
    }
    function onLocationFound (e) {
      if (me._event && (me._event.latlng.lat === e.latlng.lat && me._event.latlng.lng === e.latlng.lng && me._event.accuracy === e.accuracy)) {
        return;
      }

      if (!me._active) {
        return;
      }

      me._event = e;

      if (me.options.follow && me._following) {
        me._locateOnNextLocationFound = true;
      }

      visualizeLocation();
    }
    function resetVariables () {
      me._active = false;
      me._following = false;
      me._locateOnNextLocationFound = me.options.setView;
    }
    function startFollowing () {
      map.fire('startfollowing');
      me._following = true;

      if (me.options.stopFollowingOnDrag) {
        map.on('dragstart', stopFollowing);
      }
    }
    function stopFollowing () {
      map.fire('stopfollowing');
      me._following = false;

      if (me.options.stopFollowingOnDrag) {
        map.off('dragstart', stopFollowing);
      }

      visualizeLocation();
    }
    function stopLocate () {
      map.stopLocate();
      map.off('dragstart', stopFollowing);
      L.DomUtil.removeClass(me._button, 'following');
      L.DomUtil.removeClass(me._button, 'pressed');
      me.setIcon('default');
      resetVariables();
      me._layer.clearLayers();
      me._circleMarker = undefined;
      me._circle = undefined;
    }
    function visualizeLocation () {
      var mStyle;
      var o;
      var radius;
      var style;

      if (me._event.accuracy === undefined) {
        me._event.accuracy = 0;
      }

      radius = me._event.accuracy;

      if (me._locateOnNextLocationFound) {
        if (isOutsideMapBounds()) {
          me.options.onLocationOutsideMapBounds(me);
        } else {
          map.fitBounds(me._event.bounds, {
            padding: me.options.circlePadding
          });
        }

        me._locateOnNextLocationFound = false;
      }

      if (me.options.drawCircle) {
        if (me._following) {
          style = me.options.followCircleStyle;
        } else {
          style = me.options.circleStyle;
        }

        if (!me._circle) {
          me._circle = L.circle(me._event.latlng, radius, style).addTo(me._layer);
        } else {
          me._circle.setLatLng(me._event.latlng).setRadius(radius);

          for (o in style) {
            me._circle.options[o] = style[o];
          }
        }
      }

      if (me._following) {
        mStyle = me.options.followMarkerStyle;
      } else {
        mStyle = me.options.markerStyle;
      }

      if (!me._circleMarker) {
        me._circleMarker = L.circleMarker(me._event.latlng, mStyle)
          .addTo(me._layer);
      } else {
        me._circleMarker.setLatLng(me._event.latlng);

        for (o in mStyle) {
          me._circleMarker.options[o] = mStyle[o];
        }
      }

      if (!me._container) {
        return;
      }

      me.setIcon('default');
      L.DomUtil.addClass(me._button, 'pressed');

      if (me._following) {
        L.DomUtil.addClass(me._button, 'following');
      } else {
        L.DomUtil.removeClass(me._button, 'following');
      }
    }

    resetVariables();
    map.on('locationerror', onLocationError, me);
    map.on('locationfound', onLocationFound, me);
    this.locate = locate;
    this.stopFollowing = stopFollowing;
    this.stopLocate = stopLocate;
    return this._container;
  },
  setIcon: function (icon) {
    if (icon === 'default') {
      this._button.innerHTML = '' +
        '<svg xmlns="http://www.w3.org/2000/svg" height="18" width="18" viewBox="-0.75 -0.75 18 18">' +
          '<g class="icon-svg-path">' +
          '<path d="M11.993 15.3l4-14c.2-.8-.5-1.5-1.3-1.3l-14 4c-.9.3-1 1.5-.1 1.9l6.6 2.9 2.8 6.6c.5.9 1.7.8 2-.1zm1.5-12.8l-2.7 9.5-1.9-4.4c-.1-.2-.3-.4-.5-.5l-4.4-1.9z"/>' +
          '</g>' +
        '</svg>';
    } else if (icon === 'requesting') {
      this._button.innerHTML = '' +
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="2 2 16 16" width="18" height="18">' +
          '<g class="icon-svg-path">' +
            '<path d="M8,3c1.179,0,2.311,0.423,3.205,1.17L8.883,6.492l6.211,0.539L14.555,0.82l-1.93,1.93 C11.353,1.632,9.71,1,8,1C4.567,1,1.664,3.454,1.097,6.834l1.973,0.331C3.474,4.752,5.548,3,8,3z"/>' +
            '<path d="M8,13c-1.179,0-2.311-0.423-3.205-1.17l2.322-2.322L0.906,8.969l0.539,6.211l1.93-1.93 C4.647,14.368,6.29,15,8,15c3.433,0,6.336-2.454,6.903-5.834l-1.973-0.331C12.526,11.248,10.452,13,8,13z" data-color="color-2"/>' +
            '<animateTransform attributeType="xml" attributeName="transform" type="rotate" from="0 9 9" to="360 9 9" dur="1.0s" repeatCount="indefinite"/>' +
          '</g>' +
        '</svg>';
    }
  }
});

L.Map.addInitHook(function () {
  if (this.options.locateControl) {
    var options = {};

    if (typeof this.options.locateControl === 'object') {
      options = this.options.locateControl;
    }

    this.locateControl = L.outerspatial.control.locate(options).addTo(this);
  }
});

module.exports = function (options) {
  return new LocateControl(options);
};
