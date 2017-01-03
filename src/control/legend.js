/* globals L */

'use strict';

var LegendControl = L.Control.extend({
  options: {
    position: 'topright'
  },
  _html: null,
  initialize: function (options) {
    L.Util.setOptions(this, options);
    this._container = L.DomUtil.create('div', 'leaflet-control-legend');
    L.DomEvent.disableClickPropagation(this._container);

    if (options.html) {
      if (typeof options.html === 'string') {
        this._html = options.html;
        this._container.innerHTML = this._html;
      } else if (typeof options.html === 'function') {
        this._html = options.html();
        this._container.innerHTML = this._html;
      } else {
        this._html = options.html;
        this._container.appendChild(this._html);
      }
    } else if (options.overlays) {
      this._html = this._createLegend(options.overlays);
      this._container.innerHTML = this._html;
    }
  },
  onAdd: function (map) {
    this._map = map;

    if (!this._html) {
      // TODO: Add 'ready' event to map, then iterate through all baselayers and shapes, per individual overlay, on the map, dynamically building a legend.
    }

    return this._container;
  },
  _createLegend: function (overlays) {
    var html = '';
    var options = this.options;

    if (options.title) {
      html += '<h3>' + options.title + '</h3>';
    }

    for (var i = 0; i < overlays.length; i++) {
      var overlay = overlays[i];

      if (overlay.name) {
        html += '<h4>' + overlay.name + '</h4>';
      }

      if (overlay.icons) {
        html += '<ul>';

        for (var icon in overlay.icons) {
          html += '<li><span style="background-color:' + overlay.icons[icon] + ';">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span> ' + icon + '</li>';
        }
      }

      /*
      if (overlay.clustered) {
        var bottomValue = 0,
          clusterHtml = '<h6>Groups</h6>',
          lastColor = '',
          upperValue = 0;

        for (var group = 0; group < options.layers[layer].clustered.length; group++) {
          if (lastColor && options.layers[layer].clustered[group].color !== lastColor) {
            if (!lastColor.match(/^#/g)) {lastColor = '#' + lastColor;}
            clusterHtml += '<span style="background-color: ' + lastColor  + '; border-radius: 8px;">&nbsp;&nbsp;&nbsp;&nbsp;</span> ' + bottomValue + ' - ' + upperValue + ' points</br>';
            bottomValue = upperValue + 1;
          }
          upperValue = options.layers[layer].clustered[group].maxNodes;
          lastColor = options.layers[layer].clustered[group].color;
        }

        if (!lastColor.match(/^#/g)) {
          lastColor = '#' + lastColor;
        }

        if (bottomValue === 0) {
          clusterHtml = '<span style="background-color: ' + lastColor  + '; border-radius: 8px;">&nbsp;&nbsp;&nbsp;&nbsp;</span> Grouped Points</br>';
        } else {
          clusterHtml += '<span style="background-color: ' + lastColor  + '; border-radius: 8px;">&nbsp;&nbsp;&nbsp;&nbsp;</span> &gt; ' + bottomValue + ' points</br>';
        }

        html += clusterHtml;
      }
      */
    }

    return html;
  }
  /*
  _update: function() {
    function cssString(css) {
      var returnValue = '';

      for (var item in css) {
        returnValue += item + ': ' + css[item] + ';';
      }

      return returnValue;
    }

    if (this._div) {
      this._div.innerHTML = this._html;
      this._div.setAttribute('style', cssString(this.options.style));
    }

    return this;
  },
  _addLegend: function(html, options) {
    this.options.style = {
      'background-color': 'rgba(255,255,255,.8)',
      'background-color': '#fff',
      'padding': '5px'
    };

    options = L.Util.extend(this.options, options);
    html = html || this._html;
    this._html = html;

    return this._update();
  },
  */
});

L.Map.mergeOptions({
  legendControl: false
});
L.Map.addInitHook(function () {
  if (this.options.legendControl) {
    var options = {};

    if (typeof this.options.legendControl === 'object') {
      options = this.options.legendControl;
    }

    this.legendControl = L.npmap.control.legend(options).addTo(this);
  }
});

module.exports = function (options) {
  return new LegendControl(options);
};
