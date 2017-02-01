/* global L */

'use strict';

var reqwest = require('reqwest');
var util = require('../util/util');

var GitHubLayer = L.GeoJSON.extend({
  includes: [
    require('../mixin/geojson')
  ],
  options: {
    branch: 'master'
  },
  initialize: function (options) {
    var me = this;
    var supportsCors = util.supportsCors();

    L.Util.setOptions(this, this._toLeaflet(options));

    // If ID <=8 and protocol is http.
    if (window.location.protocol === 'http:' && (window.attachEvent && !window.addEventListener)) {
      var obj = {
        message: 'The data cannot load from GitHub because you are using an old browser.'
      };

      me.fire('error', obj);
      me.errorFired = obj;
    } else {
      if (typeof options.data === 'object') {
        this._create(options, options.data);
      } else {
        util.strict(options.path, 'string');
        util.strict(options.repo, 'string');
        util.strict(options.user, 'string');
        reqwest({
          crossOrigin: supportsCors === 'yes',
          error: function (error) {
            var obj = L.extend(error, {
              message: 'There was an error loading the data from GitHub.'
            });

            me.fire('error', obj);
            me.errorFired = obj;
          },
          success: function (response) {
            var data = response.content || response.data.content;

            me._create(options, JSON.parse(window.atob(data.replace(/\s/g, ''))));
          },
          type: 'json' + (supportsCors === 'yes' ? '' : 'p'),
          url: 'https://api.github.com/repos/' + options.user + '/' + options.repo + '/contents/' + options.path + '?ref=' + options.branch + (supportsCors === 'yes' ? '' : '?callback=?')
        });
      }
    }
  },
  _create: function (options, data) {
    L.GeoJSON.prototype.initialize.call(this, data, options);
    this.fire('ready');
    this.readyFired = true;
    this._loaded = true;
    return this;
  }
});

module.exports = function (options) {
  options = options || {};

  if (!options.type) {
    options.type = 'github';
  }

  if (options.cluster) {
    return L.outerspatial.layer._cluster(options);
  } else {
    return new GitHubLayer(options);
  }
};
