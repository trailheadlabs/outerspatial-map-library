'use strict';

module.exports = ({
  lat2tile: function (lat, zoom) {
    return (Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom)));
  },
  long2tile: function (lon, zoom) {
    return (Math.floor((lon + 180) / 360 * Math.pow(2, zoom)));
  },
  tile2lat: function (y, z) {
    var n = Math.PI - 2 * Math.PI * y / Math.pow(2, z);

    return (180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))));
  },
  tile2long: function (x, z) {
    return (x / Math.pow(2, z) * 360 - 180);
  }
});
