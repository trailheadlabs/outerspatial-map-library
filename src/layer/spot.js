/* global L */

'use strict';

var reqwest = require('reqwest');
var util = require('../util/util');

var SpotLayer = L.GeoJSON.extend({
  includes: [
    require('../mixin/geojson')
  ],
  initialize: function (options) {
    var me = this;
    var supportsCors = util.supportsCors();
    var startDate;

    if (options.minutesAgo) {
      startDate = new Date(new Date() - options.minutesAgo * 60000).toISOString().slice(0, -5) + '-0000';
    }

    util.strict(options.id, 'string');
    L.Util.setOptions(this, this._toLeaflet(options));
    reqwest({
      crossOrigin: supportsCors === 'yes',
      success: function (response) {
        var message;

        if (response && response.data && response.data.response) {
          response = response.data.response;

          if (response.feedMessageResponse && response.feedMessageResponse.messages && response.feedMessageResponse.messages.message) {
            var geoJson = {
              features: [],
              type: 'FeatureCollection'
            };
            var messages = response.feedMessageResponse.messages.message;

            if (!L.Util.isArray(messages)) {
              messages = [messages];
            }

            for (var i = 0; i < messages.length; i++) {
              message = messages[i];
              geoJson.features.push({
                geometry: {
                  coordinates: [message.longitude, message.latitude],
                  type: 'Point'
                },
                properties: message,
                type: 'Feature'
              });
            }

            if (geoJson.features.length) {
              me._create(me.options, geoJson);
            } else {
              var obj;

              message = 'The SPOT service returned invalid data.';
              obj = {
                message: message
              };

              me.fire('error', obj);
              me.errorFired = obj;

              if (me._map) {
                me._map.notify.danger(message);
              }
            }
          } else {
            message = 'The SPOT service returned the following error message: ' + response.errors.error.text;

            me.fire('error', {
              message: message
            });

            if (me._map) {
              me._map.notify.danger(message);
            }
          }
        } else {
          message = 'The SPOT service is unresponsive.';
          me.fire('error', {
            message: message
          });

          if (me._map) {
            me._map.notify.danger(message);
          }
        }
      },
      type: 'json' + (supportsCors === 'yes' ? '' : 'p'),
      url: 'https://server-utils.herokuapp.com/proxy/?type=json&url=' + encodeURIComponent('https://api.findmespot.com/spot-main-web/consumer/rest-api/2.0/public/feed/' + options.id + (options.latest ? '/latest' : '/message') + '?dir=DESC&sort=timeInMili' + (options.password ? '&feedPassword=' + options.password : '') + (startDate ? '&startDate=' + startDate : '')) + (supportsCors === 'yes' ? '' : '&callback=?')
    });

    return this;
  },
  _create: function (options, data) {
    L.GeoJSON.prototype.initialize.call(this, data, options);
    this.fire('ready');
    this.readyFired = true;
    this._loaded = true;
    return this;
  }
});

module.exports = function (options) {
  options = options || {};

  if (!options.type) {
    options.type = 'spot';
  }

  if (options.cluster) {
    return L.outerspatial.layer._cluster(options);
  } else {
    return new SpotLayer(options);
  }
};
