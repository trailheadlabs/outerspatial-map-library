/* global L */

'use strict';

var util = require('../util/util');

var ZoomifyLayer = L.TileLayer.extend({
  options: {
    noWrap: true,
    tileGroupPrefix: 'TileGroup',
    tilesPerTileGroup: 256,
    tolerance: 1
  },
  initialize: function (url, options) {
    L.TileLayer.prototype.initialize.call(this, url, options);
    util.strict(options.height, 'number');
    util.strict(options.url, 'string');
    util.strict(options.width, 'number');
  },
  beforeAdd: function (map) {
    var imageSize = L.point(this.options.width, this.options.height);
    var maxNativeZoom;
    var maxX;
    var maxY;
    var maxZoomGrid;
    var northWest;
    var southEast;

    this._imageSize = [imageSize];
    this._gridSize = [this._getGridSize(imageSize)];

    while (imageSize.x > this.options.tileSize || imageSize.y > this.options.tileSize) {
      imageSize = imageSize.divideBy(2).floor();
      this._imageSize.push(imageSize);
      this._gridSize.push(this._getGridSize(imageSize));
    }

    this._imageSize.reverse();
    this._gridSize.reverse();
    maxNativeZoom = this._gridSize.length - 1;
    this.options.maxNativeZoom = maxNativeZoom;
    maxZoomGrid = this._gridSize[maxNativeZoom];
    maxX = maxZoomGrid.x * this.options.tileSize;
    maxY = maxZoomGrid.y * this.options.tileSize;
    northWest = map.unproject([0, 0], maxNativeZoom);
    southEast = map.unproject([maxX, maxY], maxNativeZoom);
    this.options.bounds = new L.LatLngBounds([northWest, southEast]);
    L.TileLayer.prototype.beforeAdd.call(this, map);
  },
  onAdd: function (map) {
    var mapSize = map.getSize();
    var zoom = this._getBestFitZoom(mapSize);
    var imageSize = this._imageSize[zoom];
    var center = map.options.crs.pointToLatLng(new L.Point(imageSize.x / 2, (imageSize.y + (map.getContainer().parentNode.parentNode.childNodes[0].style.display === 'block' ? 25 : 0)) / 2), zoom);

    L.TileLayer.prototype.onAdd.call(this, map);
    map.options.center = center;
    map.options.maxZoom = this.options.maxNativeZoom;
    map.options.zoom = zoom;
    map.setView(center, zoom, false);
    this.fire('ready');
    this.readyFired = true;
  },
  getBounds: function () {
    return this.options.bounds;
  },
  getTileUrl: function (coords) {
    this.options.g = this.options.tileGroupPrefix + this._getTileGroup(coords);
    return L.TileLayer.prototype.getTileUrl.call(this, coords);
  },
  _addTile: function (coords, container) {
    var imageSize = this._imageSize[this._getZoomForUrl()];
    var gridSize = this._gridSize[this._getZoomForUrl()];
    var realTileSize = L.GridLayer.prototype.getTileSize.call(this);
    var displayTileSize = L.TileLayer.prototype.getTileSize.call(this);
    var key = this._tileCoordsToKey(coords);
    var tile;
    var scaleFactor = L.point((imageSize.x % realTileSize.x), (imageSize.y % realTileSize.y)).unscaleBy(realTileSize);

    L.TileLayer.prototype._addTile.call(this, coords, container);
    tile = this._tiles[key].el;

    if ((imageSize.x % realTileSize.x) > 0 && coords.x === gridSize.x - 1) {
      tile.style.width = displayTileSize.scaleBy(scaleFactor).x + 'px';
    }

    if ((imageSize.y % realTileSize.y) > 0 && coords.y === gridSize.y - 1) {
      tile.style.height = displayTileSize.scaleBy(scaleFactor).y + 'px';
    }
  },
  _getBestFitZoom: function (mapSize) {
    var tolerance = this.options.tolerance;
    var zoom = this._imageSize.length - 1;
    var imageSize;

    while (zoom) {
      imageSize = this._imageSize[zoom];

      if (((imageSize.x * tolerance) < mapSize.x) && ((imageSize.y * tolerance) < mapSize.y)) {
        return zoom;
      }

      zoom--;
    }

    return zoom;
  },
  _getGridSize: function (imageSize) {
    var tileSize = this.options.tileSize;
    return L.point(Math.ceil(imageSize.x / tileSize), Math.ceil(imageSize.y / tileSize));
  },
  _getTileGroup: function (coords) {
    var zoom = this._getZoomForUrl();
    var num = 0;
    var gridSize;

    for (var z = 0; z < zoom; z++) {
      gridSize = this._gridSize[z];
      num += gridSize.x * gridSize.y;
    }

    num += coords.y * this._gridSize[zoom].x + coords.x;
    return Math.floor(num / this.options.tilesPerTileGroup);
  }
});

module.exports = function (options) {
  options = options || {};

  if (!options.type) {
    options.type = 'zoomify';
  }

  return new ZoomifyLayer(options.url, options);
};
