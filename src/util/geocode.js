/* globals L */
/* jshint camelcase: false */

'use strict';

var keys = require('../../keys.json');
var reqwest = require('reqwest');
var util = require('../util/util');

module.exports = ({
  _formatBingResult: function (result) {
    var bbox = result.bbox;
    var coordinates = result.geocodePoints[0].coordinates;

    return {
      bounds: [
        [
          bbox[0],
          bbox[1]
        ],
        [
          bbox[2],
          bbox[3]
        ]
      ],
      latLng: [
        coordinates[0],
        coordinates[1]
      ],
      name: result.name
    };
  },
  _formatEsriResult: function (result) {
    var extent = result.extent;
    var geometry = result.feature.geometry;

    return {
      bounds: [
        [
          extent.ymin,
          extent.xmin
        ],
        [
          extent.ymax,
          extent.xmax
        ]
      ],
      latLng: [
        geometry.y,
        geometry.x
      ],
      name: result.name
    };
  },
  _formatMapboxResult: function (result) {
    var bbox = result.bbox;
    var center = result.center;

    return {
      bounds: (function () {
        if (bbox) {
          return [
            [
              bbox[1],
              bbox[0]
            ],
            [
              bbox[3],
              bbox[2]
            ]
          ];
        } else {
          return null;
        }
      })(),
      latLng: [
        center[1],
        center[0]
      ],
      name: result.place_name
    };
  },
  _formatMapquestResult: function (result) {
    var city = result.adminArea5 || null;
    var county = result.adminArea4 || null;
    var country = result.adminArea1 || null;
    var street = result.street || null;
    var state = result.adminArea3 || null;
    var name = (street ? street + ', ' : '') + (city || county) + ', ' + state + ' ' + country;

    return {
      bounds: null,
      latLng: [
        result.latLng.lat,
        result.latLng.lng
      ],
      name: name
    };
  },
  _formatMapzenResult: function (result) {
    var coordinates = result.geometry.coordinates;
    var properties = result.properties;

    return {
      bounds: null,
      latLng: [
        coordinates[1],
        coordinates[0]
      ],
      name: properties.label || properties.name
    };
  },
  _formatNominatimResult: function (result) {
    var bbox = result.boundingbox;

    return {
      bounds: [
        [
          bbox[0],
          bbox[3]
        ],
        [
          bbox[1],
          bbox[2]
        ]
      ],
      latLng: [
        result.lat,
        result.lon
      ],
      name: result.display_name
    };
  },
  bing: function (value, callback) {
    var me = this;

    reqwest({
      error: function () {
        callback({
          message: 'The location search failed. Please check your network connection.',
          success: false
        });
      },
      jsonpCallback: 'jsonp',
      success: function (response) {
        var obj = {};

        if (response) {
          var results = [];

          for (var i = 0; i < response.resourceSets[0].resources.length; i++) {
            results.push(me._formatBingResult(response.resourceSets[0].resources[i]));
          }

          obj.results = results;
          obj.success = true;
        } else {
          obj.message = 'The response from the Bing service was invalid. Please try again.';
          obj.success = false;
        }

        callback(obj);
      },
      type: 'jsonp',
      url: util.buildUrl('https://dev.virtualearth.net/REST/v1/Locations', {
        include: 'queryParse',
        includeNeighborhood: 1,
        key: keys.bing.key,
        query: value
      })
    });
  },
  esri: function (value, callback, options) {
    var me = this;
    var defaults = {
      // bbox: options && options.bbox ? options.bbox : null,
      // center: me._map.getCenter(),
      // distance: Math.min(Math.max(center.distanceTo(ne), 2000), 50000),
      f: 'json',
      // location: options && options.center ? options.center.lat + ',' + options.center.lng : null,
      // maxLocations: 5,
      // outFields: 'Subregion, Region, PlaceName, Match_addr, Country, Addr_type, City',
      text: value
    };

    options = options ? L.extend(defaults, options) : defaults;

    reqwest({
      error: function () {
        callback({
          message: 'The location search failed. Please check your network connection.',
          success: false
        });
      },
      success: function (response) {
        var obj = {};

        if (response) {
          var results = [];

          for (var i = 0; i < response.locations.length; i++) {
            results.push(me._formatEsriResult(response.locations[i]));
          }

          obj.results = results;
          obj.success = true;
        } else {
          obj.message = 'The response from the Esri service was invalid. Please try again.';
          obj.success = false;
        }

        callback(obj);
      },
      type: 'jsonp',
      url: util.buildUrl('https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/find', options)
    });
  },
  mapbox: function (value, callback) {
    var me = this;

    console.log(value);

    reqwest({
      error: function () {
        callback({
          message: 'The location search failed. Please check your network connection.',
          success: false
        });
      },
      success: function (response) {
        console.log(response);

        if (response) {
          if (response.features && response.features.length) {
            var results = [];

            for (var i = 0; i < response.features.length; i++) {
              results.push(me._formatMapboxResult(response.features[i]));
            }

            callback({
              results: results,
              success: true
            });
          } else {
            callback({
              message: 'No locations found.',
              success: true
            });
          }
        } else {
          callback({
            message: 'The geocode failed. Please try again.',
            success: false
          });
        }
      },
      type: 'json',
      url: util.buildUrl('https://api.mapbox.com/geocoding/v5/mapbox.places/' + value.replace(/ /g, '+').replace(/,/g, '+') + '.json', {
        access_token: keys.mapbox.access_token
      })
    });
  },
  mapquest: function (value, callback) {
    var me = this;

    console.info('The MapQuest Geocoding API is limited to 15,000 transactions a month. We recommend using the `esri` provider, as it supports much higher limits for NPS maps.');
    reqwest({
      error: function () {
        callback({
          message: 'The location search failed. Please check your network connection.',
          success: false
        });
      },
      success: function (response) {
        if (response) {
          if (response.results && response.results[0] && response.results[0].locations && response.results[0].locations.length) {
            var results = [];

            for (var i = 0; i < response.results[0].locations.length; i++) {
              results.push(me._formatMapquestResult(response.results[0].locations[i]));
            }

            callback({
              results: results,
              success: true
            });
          } else {
            callback({
              message: 'No locations found.',
              success: true
            });
          }
        } else {
          callback({
            message: 'The geocode failed. Please try again.',
            success: false
          });
        }
      },
      type: 'jsonp',
      url: util.buildUrl('https://www.mapquestapi.com/geocoding/v1/address', {
        key: keys.mapquest.key,
        location: value,
        thumbMaps: false
      })
    });
  },
  mapzen: function (value, callback) {
    var me = this;

    reqwest({
      error: function () {
        callback({
          message: 'The location search failed. Please check your network connection.',
          success: false
        });
      },
      success: function (response) {
        if (response) {
          if (response.features && response.features.length) {
            var results = [];

            for (var i = 0; i < response.features.length; i++) {
              results.push(me._formatMapzenResult(response.features[i]));
            }

            callback({
              results: results,
              success: true
            });
          } else {
            callback({
              message: 'No locations found.',
              success: true
            });
          }
        } else {
          callback({
            message: 'The geocode failed. Please try again.',
            success: false
          });
        }
      },
      type: 'json',
      url: util.buildUrl('https://search.mapzen.com/v1/search', {
        api_key: keys.mapzen.api_key,
        text: value
      })
    });
  },
  nominatim: function (value, callback) {
    var me = this;

    console.info('The MapQuest Nominatim API is limited to 15,000 transactions a month. We recommend using the `esri` provider, as it supports much higher limits for NPS maps.');
    reqwest({
      error: function () {
        callback({
          message: 'The location search failed. Please check your network connection.',
          success: false
        });
      },
      jsonpCallback: 'json_callback',
      success: function (response) {
        var obj = {};

        if (response) {
          var results = [];

          for (var i = 0; i < response.length; i++) {
            results.push(me._formatNominatimResult(response[i]));
          }

          obj.results = results;
          obj.success = true;
        } else {
          obj.message = 'The response from the Nominatim service was invalid. Please try again.';
          obj.success = false;
        }

        callback(obj);
      },
      type: 'jsonp',
      url: util.buildUrl('https://open.mapquestapi.com/nominatim/v1/search.php', {
        addressdetails: 1,
        dedupe: 1,
        format: 'json',
        key: keys.mapquest.key,
        q: value
      })
    });
  }
});
