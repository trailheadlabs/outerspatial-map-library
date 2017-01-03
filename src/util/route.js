'use strict';

var keys = require('../../keys.json');
var reqwest = require('reqwest');

module.exports = ({
  mapbox: (function () {
    return {
      route: function (latLngs, callback, mode) {
        var locations = '';

        mode = mode || 'driving';

        for (var i = 0; i < latLngs.length; i++) {
          var latLng = latLngs[i];

          if (i) {
            locations += ';';
          }

          locations += latLng.lng + ',' + latLng.lat;
        }

        reqwest({
          crossOrigin: true,
          error: function () {
            callback({
              message: 'The route failed. Please check your network connection.',
              success: false
            });
          },
          success: function (response) {
            callback(response);
          },
          type: 'json',
          url: 'https://api.mapbox.com/v4/directions/mapbox.' + mode + '/' + locations + '.json?access_token=' + keys.mapbox.access_token + '&alternatives=false&instructions=html'
        });
      }
    };
  })()
});
