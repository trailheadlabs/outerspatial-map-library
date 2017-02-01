/* global afterEach, beforeEach, describe, expect, it, L, sinon */

describe('L.outerspatial.layer', function () {
  var element, server;

  afterEach(function () {
    element = null;
    server.restore();
  });
  beforeEach(function () {
    element = document.createElement('div');
    server = sinon.fakeServer.create();
  });
  describe('arcgisserver', function () {
    it('creates a dynamic layer and adds it to the map', function () {
      var map = L.outerspatial.map({
        baseLayers: false,
        div: element,
        overlays: [{
          tiled: false,
          type: 'arcgisserver',
          url: 'http://sampleserver6.arcgisonline.com/arcgis/rest/services/Hurricanes/MapServer'
        }]
      });

      expect(map.options.overlays[0].L).to.be.ok();
    });
    it('fires the \'ready\' event for a dynamic layer', function (done) {
      L.outerspatial.map({
        baseLayers: false,
        div: element,
        overlays: [{
          events: [{
            fn: function () {
              done();
            },
            type: 'ready'
          }],
          tiled: false,
          type: 'arcgisserver',
          url: 'http://sampleserver6.arcgisonline.com/arcgis/rest/services/Hurricanes/MapServer'
        }]
      });
    });
    it('creates a tiled layer and adds it to the map', function () {
      var map = L.outerspatial.map({
        baseLayers: false,
        div: element,
        overlays: [{
          tiled: true,
          type: 'arcgisserver',
          url: 'http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'
        }]
      });

      expect(map.options.overlays[0].L).to.be.ok();
    });
    it('fires the \'ready\' event for a tiled layer', function (done) {
      L.outerspatial.map({
        baseLayers: false,
        div: element,
        overlays: [{
          events: [{
            fn: function () {
              done();
            },
            type: 'ready'
          }],
          tiled: true,
          type: 'arcgisserver',
          url: 'http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'
        }]
      });
    });
  });
  describe('bing', function () {
    it('creates a layer and adds it to the map', function () {
      var map = L.outerspatial.map({
        baseLayers: false,
        div: element,
        overlays: [{
          layer: 'aerialWithLabels',
          maxZoom: 19,
          minZoom: 0,
          type: 'bing'
        }]
      });

      expect(map.options.overlays[0].L).to.be.ok();
    });
    /*
    it('fires the \'ready\' event', function (done) {
      L.outerspatial.map({
        baseLayers: false,
        div: element,
        overlays: [{
          events: [{
            fn: function () {
              done();
            },
            type: 'ready'
          }],
          layer: 'aerialWithLabels',
          maxZoom: 19,
          minZoom: 0,
          type: 'bing'
        }]
      });
    });
    */
  });
  describe('cartodb', function () {
    it('creates a layer and adds it to the map', function () {
      var map = L.outerspatial.map({
        baseLayers: false,
        div: element,
        overlays: [{
          table: 'parks',
          type: 'cartodb',
          user: 'nps'
        }]
      });

      expect(map.options.overlays[0].L).to.be.ok();
    });
    /*
    it('fires the \'ready\' event for a layer', function (done) {
      L.outerspatial.map({
        baseLayers: false,
        div: element,
        overlays: [{
          events: [{
            fn: function () {
              done();
            },
            type: 'ready'
          }],
          table: 'parks',
          type: 'cartodb',
          user: 'nps'
        }]
      });
    });
    */
  });
  describe('csv', function () {

  });
  describe('geojson', function () {

  });
  describe('github', function () {

  });
  describe('kml', function () {

  });
  describe('mapbox', function () {

  });
  describe('spot', function () {

  });
  describe('tiled', function () {

  });
  describe('wms', function () {

  });
  describe('zoomify', function () {

  });
});
