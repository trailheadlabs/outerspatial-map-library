var NPMap = {
  div: 'map',
  overlays: [{
    attribution: 'NOAA',
    format: 'image/png',
    layers: '1',
    transparent: true,
    type: 'wms',
    url: 'https://idpgis.ncep.noaa.gov/arcgis/services/NWS_Observations/radar_base_reflectivity/MapServer/WMSServer'
  }]
};

(function () {
  var s = document.createElement('script');
  s.src = '{{ path }}/npmap-bootstrap.js';
  document.body.appendChild(s);
})();
