/* global L */

'use strict';

var util = require('../util/util');
var DownloadControl = L.Control.extend({
  initialize: function () {
    this._li = L.DomUtil.create('li', '');
    this._button = L.DomUtil.create('button', 'download', this._li);
    this._button.setAttribute('alt', 'Download data');
    L.DomEvent.addListener(this._button, 'click', this.download, this);
    return this;
  },
  addTo: function (map) {
    var toolbar = util.getChildElementsByClassName(map.getContainer().parentNode.parentNode, 'outerspatial-toolbar')[0];

    toolbar.childNodes[1].appendChild(this._li);
    toolbar.style.display = 'block';
    this._container = toolbar.parentNode.parentNode;
    this._map = map;
    util.getChildElementsByClassName(this._container.parentNode, 'outerspatial-map-wrapper')[0].style.top = '40px';
    return this;
  },
  download: function (e) {
    L.DomEvent.preventDefault(e);
    window.alert('The download tool has not yet been implemented.');
  }
});

L.Map.mergeOptions({
  downloadControl: false
});
L.Map.addInitHook(function () {
  if (this.options.downloadControl) {
    var options = {};

    if (typeof this.options.downloadControl === 'object') {
      options = this.options.downloadControl;
    }

    this.downloadControl = L.outerspatial.control.download(options).addTo(this);
  }
});

module.exports = function (options) {
  return new DownloadControl(options);
};
