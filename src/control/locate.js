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
    position: 'topright',
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
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="2 0 32 32" width="18" height="18">' +
          '<g class="icon-svg-line">' +
            '<polygon transform="scale(-1,1) translate(-32, 0)" vector-effect="non-scaling-stroke" points="29 10 2 2 10 29 16 16"/>' +
          '</g>' +
        '</svg>';
    } else if (icon === 'requesting') {
      this._button.innerHTML = '' +
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="18" height="18">' +
          '<g class="icon-svg-path">' +
            '<path vector-effect="non-scaling-stroke" d="M6,32C6,17.664,17.664,6,32,6c6.348,0,12.391,2.285,17.136,6.45l-6.843,6.843 c-0.271,0.271-0.363,0.673-0.238,1.035c0.126,0.362,0.447,0.62,0.828,0.665l17,2C59.922,22.998,59.961,23,60,23 c0.264,0,0.519-0.104,0.707-0.293c0.216-0.216,0.322-0.52,0.286-0.824l-2-17c-0.045-0.381-0.303-0.702-0.665-0.828 c-0.362-0.125-0.765-0.034-1.035,0.238l-5.326,5.326C46.462,4.703,39.412,2,32,2C15.458,2,2,15.458,2,32c0,1.104,0.896,2,2,2 S6,33.104,6,32z"/>' +
            '<path vector-effect="non-scaling-stroke" d="M60,30c-1.104,0-2,0.896-2,2c0,14.337-11.664,26-26,26c-6.348,0-12.391-2.285-17.135-6.451l6.842-6.842 c0.271-0.271,0.363-0.673,0.238-1.035c-0.126-0.362-0.447-0.62-0.828-0.665l-17-2c-0.306-0.036-0.608,0.07-0.824,0.286 c-0.216,0.217-0.322,0.52-0.286,0.824l2,17c0.045,0.38,0.303,0.702,0.665,0.827C5.779,59.981,5.89,60,6,60 c0.261,0,0.517-0.103,0.707-0.293l5.326-5.326C17.538,59.297,24.587,62,32,62c16.542,0,30-13.458,30-30C62,30.896,61.104,30,60,30z"/>' +
            '<animateTransform attributeType="xml" attributeName="transform" type="rotate" from="0 32 32" to="360 32 32" dur="1.0s" repeatCount="indefinite"/>' +
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
