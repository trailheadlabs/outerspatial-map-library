/* globals L, module, require */

'use strict';

var geocode = require('../util/geocode');
var reqwest = require('reqwest');
var util = require('../util/util');
var GeocoderControl = L.Control.extend({
  _bounds: {},
  _cache: {},
  _centroids: {},
  _pois: {},
  includes: L.Evented.prototype,
  options: {
    position: 'topright',
    provider: 'esri',
    searchPlaces: false
  },
  statics: {
    ATTRIBUTIONS: {
      BING: 'Geocoding by Microsoft',
      ESRI: 'Geocoding by Esri',
      MAPBOX: 'Geocoding by Mapbox',
      MAPQUEST: 'Geocoding by MapQuest',
      MAPZEN: 'Geocoding by Mapzen',
      NOMINATIM: [
        'Geocoding by Nominatim',
        '&copy; <a href=\'https://openstreetmap.org/copyright\'>OpenStreetMap</a> contributors'
      ]
    }
  },
  initialize: function (options) {
    L.Util.setOptions(this, options);
    return this;
  },
  onAdd: function (map) {
    var attribution = GeocoderControl.ATTRIBUTIONS[this.options.provider.toUpperCase()];
    var container = L.DomUtil.create('div', 'leaflet-control-geocoder');
    var stopPropagation = L.DomEvent.stopPropagation;

    this._button = L.DomUtil.create('button', 'search', container);
    this._input = L.DomUtil.create('input', '', container);
    this._ul = L.DomUtil.create('ul', 'leaflet-control', container);
    this._initalizeNpsIndex();
    L.DomEvent.disableClickPropagation(this._button);
    L.DomEvent.disableClickPropagation(this._input);
    L.DomEvent.disableClickPropagation(this._ul);
    L.DomEvent
      .on(this._button, 'click', this._geocodeRequest, this)
      .on(this._button, 'mousewheel', stopPropagation)
      .on(this._input, 'focus', function () {
        this.value = this.value;
      })
      .on(this._input, 'mousewheel', stopPropagation)
      .on(this._ul, 'mousewheel', stopPropagation);

    this._container = container;
    this._button.setAttribute('alt', 'Search');
    this._input.setAttribute('aria-activedescendant', null);
    this._input.setAttribute('aria-autocomplete', 'list');
    this._input.setAttribute('aria-expanded', false);
    this._input.setAttribute('aria-label', 'Geocode');
    this._input.setAttribute('aria-owns', 'geocoder_listbox');
    this._input.setAttribute('placeholder', 'Find a location');
    this._input.setAttribute('role', 'combobox');
    this._input.setAttribute('type', 'text');
    this._ul.setAttribute('id', 'geocoder_listbox');
    this._ul.setAttribute('role', 'listbox');

    if (attribution) {
      if (L.Util.isArray(attribution)) {
        for (var i = 0; i < attribution.length; i++) {
          map.attributionControl.addAttribution(attribution[i]);
        }
      } else {
        map.attributionControl.addAttribution(attribution);
      }
    }

    return container;
  },
  onRemove: function (map) {
    var attribution = GeocoderControl.ATTRIBUTIONS[this.options.provider.toUpperCase()];

    if (attribution) {
      if (L.Util.isArray(attribution)) {
        for (var i = 0; i < attribution.length; i++) {
          map.attributionControl.removeAttribution(attribution[i]);
        }
      } else {
        map.attributionControl.removeAttribution(attribution);
      }
    }
  },
  _checkScroll: function () {
    if (this._selected) {
      var top = util.getPosition(this._selected).top;
      var bottom = top + util.getOuterDimensions(this._selected).height;
      var scrollTop = this._ul.scrollTop;
      var visible = [
        scrollTop,
        scrollTop + util.getOuterDimensions(this._ul).height
      ];

      if (top < visible[0]) {
        this._ul.scrollTop = top - 10;
      } else if (bottom > visible[1]) {
        this._ul.scrollTop = top - 10;
      }
    }
  },
  _clearResults: function () {
    this._ul.innerHTML = '';
    this._ul.scrollTop = 0;
    this._ul.style.display = 'none';
    this._input.setAttribute('aria-activedescendant', null);
    this._input.setAttribute('aria-expanded', false);
    this._selected = null;
    this._oldValue = '';
  },
  _debounce: function (fn, delay) {
    var timer = null;

    return function () {
      var args = arguments;
      var context = this;

      clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(context, args);
      }, delay);
    };
  },
  _geocodeRequest: function (e) {
    var value = this._input.value;

    if (typeof e === 'object') {
      L.DomEvent.preventDefault(e);
    }

    if (value.length) {
      var me = this;

      me._clearResults();
      me._showLoading();
      geocode[me.options.provider](value, function (result) {
        me._hideLoading();

        if (result && result.success) {
          if (result.results && result.results.length) {
            var first = result.results[0];

            if (first.bounds) {
              me._map.fitBounds(first.bounds);
            } else if (first.latLng) {
              me._map.setView(first.latLng, 17);
            } else {
              me._map.notify.danger('There was an error finding that location. Please try again.');
            }
          } else {
            if (result.message) {
              me._map.notify.danger(result.message);
            } else {
              me._map.notify.danger('There was an error finding that location. Please try again.');
            }
          }
        } else {
          me._map.notify.danger('There was an error finding that location. Please try again.');
        }
      });
    }
  },
  _handleSelect: function (li) {
    var id = li.id;
    var me = this;

    this._clearResults();
    this._isDirty = false;
    this._input.focus();
    this._input.setAttribute('aria-activedescendant', id);

    if (isNaN(id) === false) {
      var poi = this._pois[parseInt(id, 10)];

      this._input.value = this._oldValue = poi.n;
      me._map.setView({
        lat: poi.y,
        lng: poi.x
      }, 17);
    } else {
      this._input.value = this._oldValue = id;

      if (me._bounds[id]) {
        me._map.fitBounds(me._bounds[id].getBounds());
      } else if (me._centroids[id]) {
        me._map.setView(me._centroids[id], 17);
      } else {
        reqwest({
          success: function (response) {
            if (response && response.total_rows) {
              var row = response.rows[0];

              if (row.b) {
                me._bounds[id] = new L.GeoJSON(JSON.parse(row.b));
                me._map.fitBounds(me._bounds[id].getBounds());
              } else {
                me._centroids[id] = {
                  lat: row.l,
                  lng: row.n
                };
                me._map.setView(me._centroids[id], 14);
              }
            } else {
              me._map.notify.danger('There was an error getting the bounds for that park.');
            }
          },
          type: 'jsonp',
          url: 'https://nps.cartodb.com/api/v2/sql?q=' + window.encodeURIComponent('SELECT ST_AsGeoJSON(ST_Extent(the_geom)) AS b,max(label_lat) AS l,max(label_lng) AS n FROM places_parks_v2 WHERE full_name=\'' + id.replace('\'', '\'\'') + '\'')
        });
      }
    }
  },
  _hideLoading: function () {
    L.DomEvent.on(this._button, 'click', this._geocodeRequest, this);
    L.DomUtil.addClass(this._button, 'search');
    L.DomUtil.removeClass(this._button, 'working');
  },
  _initalizeNpsIndex: function () {
    var me = this;

    reqwest({
      success: function (response) {
        if (response && response.total_rows) {
          me._oldValue = me._input.value;

          for (var i = 0; i < response.rows.length; i++) {
            me._bounds[response.rows[i].n] = null;
          }

          L.DomEvent.on(me._input, 'keydown', function (e) {
            switch (e.keyCode) {
              case 13:
                if (me._selected) {
                  me._handleSelect(me._selected);
                } else {
                  me._geocodeRequest();
                }
                break;
              case 27:
                // Escape
                me._clearResults();
                break;
              case 38:
                // Up
                if (me._ul.style.display === 'block') {
                  if (me._selected) {
                    L.DomUtil.removeClass(me._selected, 'selected');
                    me._selected = util.getPreviousSibling(me._selected);
                  }

                  if (!me._selected) {
                    me._selected = me._ul.childNodes[me._ul.childNodes.length - 1];
                  }

                  L.DomUtil.addClass(me._selected, 'selected');
                  me._checkScroll();
                }

                L.DomEvent.preventDefault(e);
                break;
              case 40:
                // Down
                if (me._ul.style.display === 'block') {
                  if (me._selected) {
                    L.DomUtil.removeClass(me._selected, 'selected');
                    me._selected = util.getNextSibling(me._selected);
                  }

                  if (!me._selected) {
                    me._selected = me._ul.childNodes[0];
                  }

                  L.DomUtil.addClass(me._selected, 'selected');
                  me._checkScroll();
                }

                L.DomEvent.preventDefault(e);
                break;
            }
          });
          L.DomEvent.on(me._input, 'keyup', me._debounce(function (e) {
            var value = this.value;

            if (value) {
              var keyCode = e.keyCode;

              if (keyCode !== 13 && keyCode !== 27 && keyCode !== 38 && keyCode !== 40) {
                if (value !== me._oldValue) {
                  me._isDirty = true;
                  me._oldValue = value;

                  if (value.length) {
                    var results = [];

                    for (var key in me._bounds) {
                      if (key.toLowerCase().indexOf(value.toLowerCase()) !== -1) {
                        results.push({
                          d: key
                        });
                      }
                    }

                    if (me.options.searchPlaces === true) {
                      if (me._cache[value]) {
                        for (var j = 0; j < me._cache[value].length; j++) {
                          results.push(me._cache[value][j]);
                        }

                        me._resultsReady(value, results);
                      } else {
                        me._showLoading();
                        reqwest({
                          success: function (response) {
                            if (response && response.total_rows) {
                              me._cache[value] = response.rows;

                              for (var j = 0; j < response.rows.length; j++) {
                                var row = response.rows[j];
                                var c = row.c;

                                results.push(row);

                                if (!me._pois[c]) {
                                  me._pois[c] = row;
                                }
                              }
                            }

                            me._resultsReady(value, results);
                            me._hideLoading();
                          },
                          type: 'jsonp',
                          url: 'https://nps.cartodb.com/api/v2/sql?q=SELECT cartodb_id AS c,name AS n,type AS t,st_x(the_geom) AS x,st_y(the_geom) AS y FROM points_of_interest WHERE name IS NOT NULL AND name ILIKE \'%25' + value.replace(/'/g, '\'\'') + '%25\' ORDER BY name LIMIT(10)'
                        });
                      }
                    } else {
                      me._resultsReady(value, results);
                    }
                  }
                }
              }
            } else {
              me._clearResults();
            }
          }, 250));
        } else {
          me._map.notify.danger('There was an error getting the bounds for that park.');
        }
      },
      type: 'jsonp',
      url: 'https://nps.cartodb.com/api/v2/sql?q=SELECT full_name AS n FROM places_parks_v2 WHERE the_geom IS NOT NULL OR (label_lat IS NOT NULL AND label_lng IS NOT NULL) ORDER BY full_name'
    });
  },
  _resultsReady: function (value, results) {
    var me = this;

    if (results.length > 0) {
      me._clearResults();

      for (var i = 0; i < results.length; i++) {
        var li = L.DomUtil.create('li', null, me._ul);
        var result = results[i];
        var d = result.d;
        var j;
        var type;

        if (d) {
          li.className = 'outerspatial-geocoder-result-park';
          li.id = d;
          type = 'park';
        } else {
          d = result.n;
          li.className = 'outerspatial-geocoder-result-poi';
          li.id = result.c;
          type = 'poi';
        }

        j = d.toLowerCase().indexOf(value.toLowerCase());
        li.innerHTML = (d.slice(0, j) + '<strong>' + d.slice(j, j + value.length) + '</strong>' + d.slice(j + value.length) + (me.options.searchPlaces ? ('<br>' + (type === 'park' ? 'NPS Unit' : result.t)) : ''));
        L.DomEvent.on(li, 'click', function () {
          me._handleSelect(this);
        });
      }

      me._ul.style.display = 'block';
      me._input.setAttribute('aria-expanded', true);
    } else {
      me._clearResults();
    }
  },
  _showLoading: function () {
    L.DomEvent.off(this._button, 'click', this._geocodeRequest);
    L.DomUtil.removeClass(this._button, 'search');
    L.DomUtil.addClass(this._button, 'working');
  }
});

L.Map.mergeOptions({
  geocoderControl: false
});
L.Map.addInitHook(function () {
  if (this.options.geocoderControl) {
    var options = {};

    if (typeof this.options.geocoderControl === 'object') {
      options = this.options.geocoderControl;
    }

    this.geocoderControl = L.outerspatial.control.geocoder(options).addTo(this);
  }
});

module.exports = function (options) {
  return new GeocoderControl(options);
};
