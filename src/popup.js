/* global L */
/* jshint camelcase: false */

'use strict';

var util = require('./util/util');

var Popup = L.Popup.extend({
  options: {
    autoPanPadding: null,
    autoPanPaddingBottomRight: [
      70,
      70
    ],
    autoPanPaddingTopLeft: [
      70,
      70
    ],
    offset: [
      0,
      -1
    ]
  },
  _data: [],
  _html: null,
  _results: [],
  initialize: function (options) {
    L.Util.setOptions(this, options);

    L.Popup.prototype.initialize.call(this, this.options);
  },
  onAdd: function (map) {
    var me = this;
    var interval = setInterval(function () {
      if (me._closeButton) {
        clearInterval(interval);
        me._closeButton.innerHTML = '' +
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">' +
            '<g class="nc-icon-wrapper" fill="#ffffff">' +
              '<path fill="#ffffff" d="M19.7,4.3c-0.4-0.4-1-0.4-1.4,0L12,10.6L5.7,4.3c-0.4-0.4-1-0.4-1.4,0s-0.4,1,0,1.4l6.3,6.3l-6.3,6.3 c-0.4,0.4-0.4,1,0,1.4C4.5,19.9,4.7,20,5,20s0.5-0.1,0.7-0.3l6.3-6.3l6.3,6.3c0.2,0.2,0.5,0.3,0.7,0.3s0.5-0.1,0.7-0.3 c0.4-0.4,0.4-1,0-1.4L13.4,12l6.3-6.3C20.1,5.3,20.1,4.7,19.7,4.3z"></path>' +
            '</g>' +
          '</svg>' +
        '';
      }
    }, 0);

    if (window.addEventListener) {
      this._content.addEventListener('DOMMouseScroll', this._handleMouseWheel, false);
    }

    this._content.onmousewheel = this._handleMouseWheel;

    L.Popup.prototype.onAdd.apply(this, [
      map
    ]);
  },
  setContent: function (content) {
    if (typeof content === 'string') {
      var node = document.createElement('div');

      node.innerHTML = content;
      content = node;
    }

    L.Popup.prototype.setContent.call(this, content);
    return this;
  },
  _back: function () {
    this.setContent(this._html).update();
    this._html = null;
  },
  _createAction: function (config, data, div, layer) {
    var a = document.createElement('a');
    var li = document.createElement('li');
    var me = this;

    li.appendChild(a);

    if (config.type && config.type === 'directions') {
      config.handler = function () {
        var latLng;

        if (layer) {
          latLng = layer._latlng;
        } else {
          latLng = me.getLatLng();
        }
        var lat = latLng.lat;
        var lng = latLng.lng;

        if (L.Browser.mobile && L.Browser.safari) {
          window.open('https://maps.apple.com/?daddr=' + lat + '%2c' + lng, '_blank');
        } else {
          window.open('https://maps.google.com/maps?daddr=' + lat + '%2c' + lng, '_blank');
        }
      };
      config.text = 'Get Directions';
    }

    if (config.menu) {
      var menu = L.DomUtil.create('ul', 'menu', div);

      for (var i = 0; i < config.menu.length; i++) {
        (function () {
          var item = config.menu[i];
          var itemA = document.createElement('a');
          var itemLi = document.createElement('li');

          itemA.innerHTML = util.handlebars(item.text, data);
          L.DomEvent.addListener(itemA, 'click', function () {
            var data = null;

            try {
              data = this.parentNode.parentNode.parentNode.parentNode.outerspatial_data;
            } catch (exception) {}

            menu.style.display = 'none';
            item.handler(data);
          });
          itemLi.appendChild(itemA);
          menu.appendChild(itemLi);
        })();
      }

      L.DomEvent.addListener(a, 'click', function (e) {
        this._toggleMenu(menu, e);
      }, this);
    } else if (config.handler) {
      L.DomEvent.addListener(a, 'click', function () {
        var data = null;

        try {
          data = this.parentNode.parentNode.parentNode.parentNode.outerspatial_data;
        } catch (exception) {}

        config.handler(data);
      });
    }

    a.innerHTML = util.handlebars(config.text, data);

    return li;
  },
  _handleMouseWheel: function (e) {
    if (e) {
      var delta = e.wheelDelta;
      var parentNode = this.parentNode;

      if (L.DomUtil.hasClass(parentNode, 'leaflet-popup-scrolled')) {
        if (parentNode.scrollTop === 0 && delta > 0) {
          util.cancelEvent();
        } else if ((parentNode.scrollTop === parentNode.scrollHeight - util.getOuterDimensions(parentNode).height) && delta < 0) {
          util.cancelEvent();
        }
      }
    }
  },
  _handleResults: function (results, mapPopupConfig) {
    var div;

    function getLayerConfig (layer) {
      if (layer.options && layer.options.popup) {
        return layer.options.popup;
      } else {
        return null;
      }
    }

    if (mapPopupConfig && typeof mapPopupConfig === 'function') {
      var html = mapPopupConfig(results);

      div = document.createElement('div');

      if (typeof html === 'string') {
        div.innerHTML = html;
      } else {
        div = html;
      }
    } else {
      if (results.length > 1) {
        div = this._resultsToHtml(results);
      } else {
        var all = [];
        var result = results[0];
        var theseResults = result.results;
        var i;

        if (theseResults && theseResults.length) {
          for (i = 0; i < theseResults.length; i++) {
            all.push({
              layerConfig: getLayerConfig(result.layer),
              result: theseResults[i],
              resultConfig: null
            });
          }
        } else if (result.subLayers && result.subLayers.length) {
          for (i = 0; i < result.subLayers.length; i++) {
            var subLayer = result.subLayers[i];

            if (subLayer.results && subLayer.results.length) {
              for (var j = 0; j < subLayer.results.length; j++) {
                all.push({
                  layerConfig: getLayerConfig(result.layer),
                  result: subLayer.results[j],
                  resultConfig: subLayer.popup || null
                });
              }
            }
          }
        }

        if (all.length === 1) {
          var first = all[0];

          div = this._resultToHtml(first.result, first.layerConfig, first.resultConfig);
        } else {
          div = this._resultsToHtml(results);
        }
      }
    }

    return div;
  },
  _more: function (index) {
    this._html = this.getContent();
    this.setContent(this._results[index]).update();
  },
  _resultToHtml: function (result, layerConfig, resultConfig, addBack, mapConfig, layer) {
    var div;

    if (mapConfig && typeof mapConfig === 'function') {
      var html = mapConfig(result);

      div = document.createElement('div');

      if (typeof html === 'string') {
        div.innerHTML = html;
      } else {
        div = html;
      }

      return div;
    } else if (layerConfig && typeof layerConfig === 'function') {
      div = L.DomUtil.create('div', 'layer');
      div.innerHTML = layerConfig(result);
      div.outerspatial_data = result;
      return div;
    } else {
      var config = layerConfig;
      var actions;
      var description;
      var divContent;
      var image;
      var media;
      var obj;
      var responsiveContainer;
      var title;
      var ul;

      div = L.DomUtil.create('div', 'layer');
      div.outerspatial_data = result;

      if (!config) {
        if (resultConfig) {
          config = resultConfig;
        } else {
          config = {
            description: {
              format: 'table'
            }
          };
        }
      } else if (!config.description) {
        config.description = {
          format: 'table'
        };
      }

      if (config.title) {
        obj = null;

        if (typeof config.title === 'function') {
          obj = config.title(result);
        } else {
          obj = config.title;
        }

        title = L.DomUtil.create('div', 'title', div);

        if (obj && typeof obj === 'string') {
          title.innerHTML = '<h3>' + util.unescapeHtml(util.handlebars(obj, result)) + '</h3>';
        } else if (obj && typeof obj === 'object') {
          title.innerHTML = '' +
            '<h3>' + util.unescapeHtml(util.handlebars(obj.title, result)) + '</h3>' +
            (obj.subtitle ? '<h5>' + util.unescapeHtml(util.handlebars(obj.subtitle, result)) + '</h5>' : '') +
            (obj.image ? util.unescapeHtml(util.handlebars(obj.image, result)) : '') +
          '';
        }
      }

      if (config.image) {
        if (typeof config.image === 'function') {
          obj = config.image(result);
        } else {
          obj = config.image;
        }

        if (obj) {
          responsiveContainer = L.DomUtil.create('div', 'responsive-container', div);
          image = L.DomUtil.create('img', undefined, responsiveContainer);
          image.src = obj.url;
          image.draggable = false;

          if (obj.caption !== '') {
            image.alt = obj.caption;
          }
        }
      }

      if (config.description) {
        obj = null;

        if (typeof config.description === 'function') {
          obj = config.description(result);
        } else {
          obj = config.description;
        }

        if (obj) {
          if (obj.format === 'list') {
            obj = util.dataToList(result, obj.fields);
          } else if (obj.format === 'table') {
            obj = util.dataToTable(result, obj.fields);
          }

          divContent = L.DomUtil.create('div', 'content', div);
          description = L.DomUtil.create('div', 'description', divContent);

          if (typeof obj === 'string') {
            description.innerHTML = util.unescapeHtml(util.handlebars(obj, result));
          } else if ('nodeType' in obj) {
            description.appendChild(obj);
          }
        }
      }

      if (config.media) {
        media = [];

        for (var i = 0; i < config.media.length; i++) {
          if (result[config.media[i].id.replace('{{', '').replace('}}', '')]) {
            media.push(config.media[i]);
          }
        }

        if (media.length) {
          var mediaDiv = util.mediaToList(result, media);

          if (mediaDiv) {
            if (!divContent) {
              divContent = L.DomUtil.create('div', 'content', div);
            }

            mediaDiv.className = 'clearfix media';
            divContent.appendChild(mediaDiv);
          }
        }
      }

      if (config.actions) {
        obj = null;

        if (typeof config.actions === 'function') {
          obj = config.actions(result);
        } else {
          obj = config.actions;
        }

        if (obj) {
          actions = L.DomUtil.create('div', 'actions', div);

          if (L.Util.isArray(obj)) {
            ul = document.createElement('ul');
            actions.appendChild(ul);

            for (var j = 0; j < obj.length; j++) {
              ul.appendChild(this._createAction(obj[j], result, actions, layer));
            }
          } else if (typeof obj === 'string') {
            actions.innerHTML = util.unescapeHtml(util.handlebars(obj, result));
          } else if ('nodeType' in obj) {
            actions.appendChild(obj);
          }
        }
      }

      if (addBack) {
        var a = document.createElement('a');
        var li = document.createElement('li');

        L.DomEvent.addListener(a, 'click', this._back, this);
        a.innerHTML = '&#171; Back';
        li.appendChild(a);

        if (actions) {
          actions.childNodes[0].insertBefore(li, actions.childNodes[0].childNodes[0]);
        } else {
          ul = document.createElement('ul');
          ul.appendChild(li);
          L.DomUtil.create('div', 'actions', div).appendChild(ul);
        }
      }

      return div;
    }
  },
  _resultsToHtml: function (results) {
    var div = document.createElement('div');
    var index = 0;
    var me = this;

    function listener () {
      me._more(this.id);
    }

    for (var i = 0; i < results.length; i++) {
      var divLayer = L.DomUtil.create('div', 'layer', div);
      var divLayerTitle = L.DomUtil.create('div', 'title', divLayer);
      var resultLayer = results[i];
      var a;
      var childNode;
      var divLayerContent;
      var j;
      var k;
      var layerConfig;
      var li;
      var more;
      var resultConfig;
      var single;
      var ul;

      if (resultLayer.layer.options) {
        if (resultLayer.layer.options.popup) {
          layerConfig = resultLayer.layer.options.popup;
        }

        if (resultLayer.layer.options.name) {
          divLayerTitle.innerHTML = resultLayer.layer.options.name;
        } else {
          divLayerTitle.innerHTML = 'Unnamed';
        }
      }

      if (resultLayer.results && resultLayer.results.length) {
        divLayerContent = L.DomUtil.create('div', 'content', divLayer);
        ul = document.createElement('ul');

        for (j = 0; j < resultLayer.results.length; j++) {
          var result = resultLayer.results[j];

          a = document.createElement('a');
          li = document.createElement('li');
          single = this._resultToHtml(result, layerConfig, resultConfig, true);

          for (k = 0; k < single.childNodes.length; k++) {
            childNode = single.childNodes[k];

            if (L.DomUtil.hasClass(childNode, 'title')) {
              more = util.stripHtml(childNode.innerHTML);
              break;
            }
          }

          if (!more) {
            more = 'Untitled';
          }

          L.DomEvent.addListener(a, 'click', function () {
            me._more(this.id);
          });
          this._results[index] = single;
          a.id = index;
          a.innerHTML = more;
          li.appendChild(a);
          ul.appendChild(li);
          divLayerContent.appendChild(ul);
          index++;
        }
      } else if (resultLayer.subLayers && resultLayer.subLayers.length) {
        divLayerContent = L.DomUtil.create('div', 'content', divLayer);

        for (j = 0; j < resultLayer.subLayers.length; j++) {
          var divSubLayer = L.DomUtil.create('div', 'sublayer', divLayerContent);
          var divSubLayerTitle = L.DomUtil.create('div', 'title', divSubLayer);
          var divSubLayerContent = L.DomUtil.create('div', 'content', divSubLayer);
          var resultSubLayer = resultLayer.subLayers[j];

          divSubLayerTitle.innerHTML = resultSubLayer.name;
          ul = document.createElement('ul');
          divSubLayerContent.appendChild(ul);

          for (k = 0; k < resultSubLayer.results.length; k++) {
            var resultFinal = resultSubLayer.results[k];

            if (resultSubLayer.popup) {
              resultConfig = resultSubLayer.popup;
            }

            a = document.createElement('a');
            li = document.createElement('li');
            single = this._resultToHtml(resultFinal, layerConfig, resultConfig, true);

            for (var l = 0; l < single.childNodes.length; l++) {
              childNode = single.childNodes[l];

              if (L.DomUtil.hasClass(childNode, 'title')) {
                more = util.stripHtml(childNode.innerHTML);
                break;
              }
            }

            if (!more) {
              more = 'Untitled';
            }

            L.DomEvent.addListener(a, 'click', listener);
            this._results[index] = single;
            a.id = index;
            a.innerHTML = more;
            li.appendChild(a);
            ul.appendChild(li);
            index++;
          }
        }
      }
    }

    return div;
  },
  _toggleMenu: function (menu, e) {
    if (!menu.style.display || menu.style.display === 'none') {
      menu.style.bottom = '20px';
      menu.style.display = 'block';
    } else {
      menu.style.display = 'none';
    }
  }
});

module.exports = function (options) {
  return new Popup(options);
};
