var OuterSpatial =  {
  baseLayers: [
    'outerspatial-outdoors',
    'bing-aerial',
    'bing-aerialLabels',
    'bing-roads',
    'cartodb-darkMatter',
    'cartodb-darkMatterNoLabels',
    'cartodb-positron',
    'cartodb-positronNoLabels',
    'esri-gray',
    'esri-imagery',
    'esri-nationalGeographic',
    'esri-oceans',
    'esri-streets',
    'esri-topographic',
    'mapbox-dark',
    'mapbox-emerald',
    'mapbox-highContrast',
    'mapbox-landsatLive',
    'mapbox-light',
    'mapbox-outdoors',
    'mapbox-pencil',
    'mapbox-runBikeAndHike',
    'mapbox-satellite',
    'mapbox-satelliteLabels',
    'mapbox-streets',
    'mapbox-terrain',
    'openstreetmap',
    'stamen-terrain',
    'stamen-toner',
    'stamen-watercolor'
  ],
  div: 'map',
  events: [{
    fn: function (e) {
      console.log(e);
    },
    type: 'baselayerchange'
  }]
};

(function () {
  var s = document.createElement('script');
  s.src = '{{ path }}/outerspatial-bootstrap.js';
  document.body.appendChild(s);
})();
