/* global afterEach, beforeEach, describe, sinon */

describe('L.outerspatial.preset', function () {
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
});
