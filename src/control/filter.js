/* globals L, module, require */

'use strict';

var FilterControl = L.Control.extend({
  options: {
    filters: [],
    position: 'topleft'
  },
  initialize: function (options) {
    L.Util.setOptions(this, options);

    return this;
  },
  onAdd: function (map) {
    var filters = this.options.filters;

    this._container = L.DomUtil.create('div', 'leaflet-control-filter');

    if (filters && filters.length) {
      var actionsDiv = L.DomUtil.create('div');
      // var me = this;
      var labelDiv = L.DomUtil.create('div');
      var lis = '';
      var ul = L.DomUtil.create('ul');

      labelDiv.innerHTML = 'Filter:';

      if (filters.length > 3) {
        this._nextButton = L.DomUtil.create('button', 'more more-next');
        this._nextButton.innerHTML = '' +
          '<image src="data:image/svg+xml;base64,' + window.btoa('<svg width="11" height="13" xmlns="http://www.w3.org/2000/svg"><path d="M.64.425L10.36 6.5.64 12.575z" stroke="#444" stroke-width=".81" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"/></svg>') + '" title="More"></image>' +
        '';
        this._nextButton.onclick = function () {
          var children = ul.children;
          var countVisibleButtons = 0;
          var firstHiddenButtonIndex = -1;

          for (var i = 0; i < children.length; i++) {
            if (children[i].style.display === 'none') {
              if (firstHiddenButtonIndex === -1) {
                firstHiddenButtonIndex = i;
              }
            } else {
              countVisibleButtons++;
            }
          }

          ul.children[firstHiddenButtonIndex + 1].style.display = 'none';

          // me._previousButton // Remove disabled class

          if (countVisibleButtons === 5) {
            // me._nextButton; // Add disabled class
          }
        };
        this._previousButton = L.DomUtil.create('button', 'more more-previous');
        this._previousButton.innerHTML = '' +
          '<image src="data:image/svg+xml;base64,' + window.btoa('<svg width="12" height="14" xmlns="http://www.w3.org/2000/svg"><path d="M10.607 12.925L.887 6.85l9.72-6.075z" stroke="#444" stroke-width=".81" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"/></svg>') + '" title="More"></image>' +
        '';
        this._previousButton.onclick = function () {
          var children = ul.children;
          var firstHiddenButtonIndex = -1;

          for (var i = 0; i < children.length; i++) {
            if (children[i].style.display === 'none' && (!children[i + 1].style.display || children[i + 1].style.display === 'block')) {
              firstHiddenButtonIndex = i;
              break;
            }
          }

          if (firstHiddenButtonIndex > -1) {
            ul.children[firstHiddenButtonIndex].style.display = 'block';
            // me._nextButton // Remove disabled class

            if (firstHiddenButtonIndex === 1) {
              // me._previousButton // Add disabled class
            }
          }
        };

        actionsDiv.appendChild(this._previousButton);
        actionsDiv.appendChild(this._nextButton);
      }

      actionsDiv.appendChild(ul);
      this._container.appendChild(labelDiv);
      this._container.appendChild(actionsDiv);

      filters.forEach(function (filter) {
        lis += '' +
          '<li>' +
            '<button>' +
              '<image src="data:image/svg+xml;base64,' + window.btoa(filter.svg) + '" title="' + filter.title + '"></image>' +
            '</button>' +
          '</li>' +
        '';
      });

      ul.innerHTML = lis;
      ul.style.width = filters.length * 45.75 + 'px';

      L.DomEvent.disableClickPropagation(this._container);
      L.DomEvent.disableScrollPropagation(this._container);
      this._updateMoreButtons();
    }

    return this._container;
  },
  onRemove: function (map) {},

  _updateMoreButtons: function () {
    /*
    if (this.options.filters && this.options.filters.length > 4) {
      this._nextButton.style.display = 'block';
    }
    */
  }
});

L.Map.mergeOptions({
  filterControl: false
});
L.Map.addInitHook(function () {
  if (this.options.filterControl) {
    var options = {};

    if (typeof this.options.filterControl === 'object') {
      options = this.options.filterControl;
    }

    this.filterControl = L.outerspatial.control.filter(options).addTo(this);
  }
});

module.exports = function (options) {
  return new FilterControl(options);
};
