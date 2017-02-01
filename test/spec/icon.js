/* global afterEach, beforeEach, describe, sinon */

describe('L.outerspatial.icon', function () {
  var element;
  var server;

  afterEach(function () {
    element = null;
    server.restore();
  });
  beforeEach(function () {
    element = document.createElement('div');
    server = sinon.fakeServer.create();
  });
  describe('maki', function () {

  });
  describe('npmap', function () {

  });
});
