/* globals L */

'use strict';

var Module = L.Class.extend({
  initialize: function (options) {
    var content;
    var title;

    this._container = document.createElement('div');
    content = L.DomUtil.create('div', 'content', this._container);
    content.innerHTML = options.content;
    title = L.DomUtil.create('h2', 'title', this._container);
    title.innerHTML = options.title;

    // TODO: Also add button.

    return this._container;
  },
  addTo: function (map) {
    this._map = map;
    console.log(map);

    return this;
  }
});

module.exports = function (options) {
  return new Module(options);
};
