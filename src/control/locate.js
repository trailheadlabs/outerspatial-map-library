/* global L */

'use strict';

var LocateControl = L.Control.extend({
  options: {
    position: 'topright',
    // requestLocationAccessOnAdd: false,
    setViewToLocationOnAdd: false
  },
  initialize: function (options) {
    L.Util.setOptions(this, options);

    return this;
  },
  onAdd: function (map) {
    var container = L.DomUtil.create('div', 'leaflet-bar leaflet-bar-single leaflet-control');
    var me = this;

    this._button = L.DomUtil.create('button', undefined, container);
    this._button.setAttribute('alt', 'Show me where I am');
    this._layer = new L.LayerGroup().addTo(map);
    this._map = map;
    this._setIcon('default');
    this._tracking = false;
    L.DomEvent
      .on(this._button, 'click', function (e) {
        L.DomEvent.stopPropagation(e);
        me._setViewToInitialLocation = false;

        if (me._active) {
          L.DomUtil.removeClass(me._button, 'pressed');
          me._setIcon('default');
          me._stopLocate();
          me._tracking = false;
        } else {
          L.DomUtil.addClass(me._button, 'pressed');
          me._setIcon('requesting');
          me._startLocate();
          me._tracking = true;
        }
      })
      .on(this._button, 'dblclick', L.DomEvent.stop);
    map
      .on('dragstart', function (e) {
        if (me._active) {
          L.DomUtil.removeClass(me._button, 'pressed');
          me._setIcon('default');
          me._setViewToInitialLocation = false;
          me._stopLocate();
          me._tracking = false;
        }
      })
      .on('locationerror', function (e) {
        if (e.code === 3) {
          return;
        }

        L.DomUtil.removeClass(me._button, 'pressed');
        map.notify.danger(e.message);
        me._setIcon('default');
        me._stopLocate();
      })
      .on('locationfound', function (e) {
        var latLng = e.latlng;

        console.log(e);

        me._drawAndPositionCircle(latLng, e.accuracy);
        me._setIcon('default');

        if (map.options.maxBounds && !map.options.maxBounds.contains(latLng)) {
          L.DomUtil.removeClass(me._button, 'pressed');
          map.notify.danger('You seem to be located outside the boundary of the map.');
          me._stopLocate();
        } else {
          if (me._tracking || me._setViewToInitialLocation) {
            if (me._setViewToInitialLocation) {
              L.DomUtil.removeClass(me._button, 'pressed');
              me._setViewToInitialLocation = false;
            }

            if (map.getBounds().contains(latLng)) {
              if (map.getZoom() === 17) {
                map.panTo(latLng);
              } else {
                // TODO: Figure out a way to hook up to a callback after the flyTo
                // me._layer.remove();
                map.flyTo(latLng, 17);
                // me._layer.addTo(map);
              }
            } else {
              map.flyTo(latLng, 17);
            }
          }
        }
      });

    if (navigator.permissions) {
      navigator.permissions.query({
        name: 'geolocation'
      })
        .then(function (result) {
          if (result && result.state === 'granted') {
            me._hasPermission = true;
            me._startLocate();

            if (me.options.setViewToLocationOnAdd) {
              L.DomUtil.addClass(me._button, 'pressed');
              me._setIcon('requesting');
              me._setViewToInitialLocation = true;
            }
          } else {
            me._hasPermission = false;
          }
        })
        .catch(function () {});
    } else {
      me._hasPermission = false;
    }

    return container;
  },
  _drawAndPositionCircle: function (latLng, radius) {
    if (this._bigCircle && this._smallCircle) {
      this._bigCircle
        .setLatLng(latLng)
        .setRadius(radius);
      this._smallCircle.setLatLng(latLng);
    } else {
      this._bigCircle = new L.Circle(latLng, radius, {
        color: '#136aec',
        fillColor: '#136aec',
        fillOpacity: 0.15,
        interactive: false,
        opacity: 0.5,
        weight: 2
      }).addTo(this._layer);
      this._smallCircle = new L.Circle(latLng, 5, {
        color: '#136aec',
        fillColor: '#136aec',
        fillOpacity: 1,
        interactive: false,
        weight: 0
      }).addTo(this._layer);
    }
  },
  _setIcon: function (icon) {
    var html;

    if (icon === 'default') {
      html = '' +
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="2 0 32 32" width="18" height="18">' +
          '<g class="icon-svg-line">' +
            '<polygon transform="scale(-1,1) translate(-32, 0)" vector-effect="non-scaling-stroke" points="29 10 2 2 10 29 16 16"/>' +
          '</g>' +
        '</svg>' +
      '';
    } else if (icon === 'requesting') {
      html = '' +
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="18" height="18">' +
          '<g class="icon-svg-path">' +
            '<path vector-effect="non-scaling-stroke" d="M6,32C6,17.664,17.664,6,32,6c6.348,0,12.391,2.285,17.136,6.45l-6.843,6.843 c-0.271,0.271-0.363,0.673-0.238,1.035c0.126,0.362,0.447,0.62,0.828,0.665l17,2C59.922,22.998,59.961,23,60,23 c0.264,0,0.519-0.104,0.707-0.293c0.216-0.216,0.322-0.52,0.286-0.824l-2-17c-0.045-0.381-0.303-0.702-0.665-0.828 c-0.362-0.125-0.765-0.034-1.035,0.238l-5.326,5.326C46.462,4.703,39.412,2,32,2C15.458,2,2,15.458,2,32c0,1.104,0.896,2,2,2 S6,33.104,6,32z"/>' +
            '<path vector-effect="non-scaling-stroke" d="M60,30c-1.104,0-2,0.896-2,2c0,14.337-11.664,26-26,26c-6.348,0-12.391-2.285-17.135-6.451l6.842-6.842 c0.271-0.271,0.363-0.673,0.238-1.035c-0.126-0.362-0.447-0.62-0.828-0.665l-17-2c-0.306-0.036-0.608,0.07-0.824,0.286 c-0.216,0.217-0.322,0.52-0.286,0.824l2,17c0.045,0.38,0.303,0.702,0.665,0.827C5.779,59.981,5.89,60,6,60 c0.261,0,0.517-0.103,0.707-0.293l5.326-5.326C17.538,59.297,24.587,62,32,62c16.542,0,30-13.458,30-30C62,30.896,61.104,30,60,30z"/>' +
            '<animateTransform attributeType="xml" attributeName="transform" type="rotate" from="0 32 32" to="360 32 32" dur="1.0s" repeatCount="indefinite"/>' +
          '</g>' +
        '</svg>' +
      '';
    }

    this._button.innerHTML = html;
  },
  _startLocate: function () {
    this._active = true;
    this._map.locate({
      enableHighAccuracy: true,
      maximumAge: Infinity,
      timeout: 30000,
      watch: true
    });
  },
  _stopLocate: function () {
    this._active = false;
    this._map.stopLocate();
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
