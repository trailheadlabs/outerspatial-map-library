/* global L */
/* jshint camelcase: false */

var version = require('./package.json').version;

window.L.Icon.Default.imagePath = 'https://www.nps.gov/lib/npmap.js/' + version + '/images';
L.npmap = module.exports = {
  VERSION: version,
  // Preserve order of controls because it affects the display hierarchy.
  control: {
    geocoder: require('./src/control/geocoder'),
    download: require('./src/control/download'),
    home: require('./src/control/home'),
    smallzoom: require('./src/control/smallzoom'),
    locate: require('./src/control/locate'),
    measure: require('./src/control/measure'),
    edit: require('./src/control/edit'),
    fullscreen: require('./src/control/fullscreen'),
    hash: require('./src/control/hash'),
    infobox: require('./src/control/infobox'),
    legend: require('./src/control/legend'),
    overview: require('./src/control/overview'),
    print: require('./src/control/print'),
    scale: require('./src/control/scale'),
    share: require('./src/control/share'),
    switcher: require('./src/control/switcher'),
    zoomdisplay: require('./src/control/zoomdisplay')
  },
  icon: {
    maki: require('./src/icon/maki'),
    npmapsymbollibrary: require('./src/icon/npmapsymbollibrary')
  },
  layer: {
    _cluster: require('./src/layer/cluster'),
    arcgisserver: {
      dynamic: require('./src/layer/arcgisserver/dynamic'),
      tiled: require('./src/layer/arcgisserver/tiled')
    },
    bing: require('./src/layer/bing'),
    cartodb: require('./src/layer/cartodb'),
    csv: require('./src/layer/csv'),
    geojson: require('./src/layer/geojson'),
    github: require('./src/layer/github'),
    kml: require('./src/layer/kml'),
    mapbox: require('./src/layer/mapbox'),
    spot: require('./src/layer/spot'),
    tiled: require('./src/layer/tiled'),
    wms: require('./src/layer/wms'),
    zoomify: require('./src/layer/zoomify')
  },
  map: require('./src/map'),
  module: {
    directions: require('./src/module/directions')
  },
  popup: require('./src/popup'),
  preset: {
    baselayers: require('./src/preset/baselayers.json'),
    colors: require('./src/preset/colors.json'),
    maki: require('./node_modules/maki/_includes/maki.json'),
    npmapsymbollibrary: require('./node_modules/npmap-symbol-library/www/npmap-builder/npmap-symbol-library.json'),
    overlays: require('./src/preset/overlays.json'),
    places: {
      pois: require('./src/preset/places/pois')
    }
  },
  tooltip: require('./src/tooltip'),
  util: {
    _: require('./src/util/util'),
    geocode: require('./src/util/geocode'),
    route: require('./src/util/route'),
    topojson: require('./src/util/topojson')
  }
};
