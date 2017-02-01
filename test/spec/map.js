/* global afterEach, beforeEach, describe, expect, it, L, sinon */

describe('L.outerspatial.map', function () {
  var element;
  var server;

  afterEach(function () {
    element = null;
    server.restore();
  });
  beforeEach(function () {
    element = document.createElement('div');
    element.id = 'map';
    server = sinon.fakeServer.create();
  });
  describe('constructor', function () {
    it('passes options to constructor when called without new', function () {
      var map = L.outerspatial.map({
        div: element,
        smallzoomControl: false
      });

      expect(map.options.smallzoomControl).to.equal(false);
    });
    it('creates the map when the div property is an object', function () {
      var map = L.outerspatial.map({
        div: element
      });

      expect(map).to.be.ok();
    });
    it('sets a default center for the map if none is specified', function () {
      var map = L.outerspatial.map({
        div: element
      });

      expect(map.getCenter().lat).to.be.ok();
    });
    it('sets a default zoom for the map if none is specified', function () {
      var map = L.outerspatial.map({
        div: element
      });

      expect(map.getZoom()).to.be.ok();
    });
    it('adds a default baseLayer if none is specified', function () {
      var map = L.outerspatial.map({
        div: element
      });

      expect(map.options.baseLayers.length).to.be(1);
    });
    it('renames the "layers" property "overlays", if specified', function () {
      var map = L.outerspatial.map({
        div: element,
        layers: [{
          table: 'parks',
          type: 'cartodb',
          user: 'nps'
        }]
      });

      expect(map.options.overlays.length).to.be(1);
    });
    it('switches preset layers in when specified in the baseLayers property', function () {
      var map = L.outerspatial.map({
        baseLayers: [
          'mapbox-outdoors'
        ],
        div: element
      });

      expect(map.options.baseLayers[0].L).to.be.ok();
    });
  });
});
