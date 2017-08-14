/* global afterEach, beforeEach, describe, expect, it, L, sinon */

describe('L.outerspatial.control', function () {
  var element, server;

  afterEach(function () {
    element = null;
    server.restore();
  });
  beforeEach(function () {
    element = document.createElement('div');
    server = sinon.fakeServer.create();
  });
  describe('fullscreenControl', function () {
    it('creates a fullscreenControl when option "fullscreenControl: true"', function () {
      var map = L.outerspatial.map({
        div: element,
        fullscreenControl: true
      });

      expect(map.fullscreenControl).to.be.ok();
    });
    it('does not create a fullscreenControl when option "fullscreenControl: false" or "fullscreenControl: undefined"', function () {
      var map = L.outerspatial.map({
        div: element
      });

      expect(map.fullscreenControl).to.be(undefined);
    });
  });
  describe('geocoderControl', function () {
    it('creates a geocoderControl when option "geocoderControl: true"', function () {
      var map = L.outerspatial.map({
        div: element,
        geocoderControl: true
      });

      expect(map.geocoderControl).to.be.ok();
    });
    it('does not create a geocoderControl when option "geocoderControl: false" or "geocoderControl: undefined"', function () {
      var map = L.outerspatial.map({
        div: element
      });

      expect(map.geocoderControl).to.be(undefined);
    });
  });
  describe('hashControl', function () {
    it('creates a hashControl when option "hashControl: true"', function () {
      var map = L.outerspatial.map({
        div: element,
        hashControl: true
      });

      expect(map.hashControl).to.be.ok();
    });
    it('does not create a hashControl when option "hashControl: false" or "hashControl: undefined"', function () {
      var map = L.outerspatial.map({
        div: element
      });

      expect(map.hashControl).to.be(undefined);
    });
    it('sets a hash when the map is moved', function (done) {
      var map = L.outerspatial.map({
        div: document.createElement('div')
      });

      L.outerspatial.control.hash().addTo(map);
      window.setTimeout(function () {
        map.setView([
          51.505,
          -0.09
        ], 13);
        expect(window.location.hash).to.be('#13/51.5050/-0.0900');
        done();
      }, 300);
    });
    it('uses a hash set initially on the page', function (done) {
      var map = L.outerspatial.map({
        div: document.createElement('div')
      });

      window.location.hash = '#13/10/40';
      L.outerspatial.control.hash().addTo(map);
      window.setTimeout(function () {
        expect(Math.round(map.getCenter().lat)).to.be(10);
        expect(Math.round(map.getCenter().lng)).to.be(40);
        done();
      }, 300);
    });
    it('responds to a hash change after an initial hash is set', function (done) {
      var map = L.outerspatial.map({
        div: document.createElement('div')
      });

      map.setView([
        51.505,
        -0.09
      ], 13);
      window.location.hash = '#13/20/40';
      L.outerspatial.control.hash().addTo(map);
      window.setTimeout(function () {
        expect(Math.round(map.getCenter().lat)).to.be(20);
        expect(Math.round(map.getCenter().lng)).to.be(40);
        done();
      }, 300);
    });
    /*
    it('unbinds events when removed', function () {
      var map = L.outerspatial.map({
        div: document.createElement('div')
      });
      var hash;

      window.location.hash = '';
      hash = L.outerspatial.control.hash().addTo(map);
      map.removeControl(hash);
      map.setView([51.505, -0.09], 13);
      expect(window.location.hash).to.be('');
    });
    */
  });
  describe('homeControl', function () {
    it('creates a homeControl by default', function () {
      var map = L.outerspatial.map({
        div: element
      });

      expect(map.homeControl).to.be.ok();
    });
    it('does not create a homeControl when option "homeControl: false"', function () {
      var map = L.outerspatial.map({
        div: element,
        homeControl: false
      });

      expect(map.homeControl).to.be(undefined);
    });
  });







  
  describe('overviewControl', function () {
    it('creates an overviewControl when a valid "overviewControl" object is provided', function () {
      var map = L.outerspatial.map({
        div: element,
        overviewControl: {
          layer: 'mapbox-light'
        }
      });

      expect(map.overviewControl).to.be.ok();
    });
    it('does not create an overviewControl when option "overviewControl: false" or "overviewControl: undefined"', function () {
      var map = L.outerspatial.map({
        div: element
      });

      expect(map.overviewControl).to.be(undefined);
    });
  });
  describe('scaleControl', function () {
    it('creates a scaleControl when option "scaleControl: true"', function () {
      var map = L.outerspatial.map({
        div: element,
        scaleControl: true
      });

      expect(map.scaleControl).to.be.ok();
    });
    it('does not create a scaleControl when option "scaleControl: false" or "scaleControl: undefined"', function () {
      var map = L.outerspatial.map({
        div: element
      });

      expect(map.scaleControl).to.be(undefined);
    });
  });
  describe('smallzoomControl', function () {
    it('creates a smallzoomControl by default', function () {
      var map = L.outerspatial.map({
        div: element
      });

      expect(map.smallzoomControl).to.be.ok();
    });
    it('does not create a smallzoomControl when option "smallzoomControl: false"', function () {
      var map = L.outerspatial.map({
        div: element,
        smallzoomControl: false
      });

      expect(map.smallzoomControl).to.be(undefined);
    });
  });
  describe('switcherControl', function () {
    it('creates a switcherControl when more than one baseLayer is present', function () {
      var map = L.outerspatial.map({
        baseLayers: [
          'esri-imagery',
          'mapbox-terrain'
        ],
        div: element
      });

      expect(map.switcherControl).to.be.ok();
    });
    it('does not create a switcherControl when less than two baseLayers are present', function () {
      var map = L.outerspatial.map({
        baseLayers: false,
        div: element
      });

      expect(map.switcherControl).to.be(undefined);
    });
  });
});
