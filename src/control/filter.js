/* globals L, module, require */
// Leaflet controller module...
// NAC map is passing config via filter control object and this is taking care of display, behaviour, et al.
// NOTE: When I make changes to this, I need to rebuild

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
    var filterLabelEnabled = this.options.filterLabelEnabled;

    this._container = L.DomUtil.create('div', 'leaflet-control-filter');

    if (filters && filters.length) {
      var actionsDiv = L.DomUtil.create('div', 'actions');
      var me = this;
      var labelDiv = L.DomUtil.create('div', 'filters-label');
      var lis = '';
      var ul = L.DomUtil.create('ul', 'leaflet-control-filter-button-wrapper');
      var numberOfVisibleFilters = 5; // Default state: no label, no previous/next buttons
      if (filterLabelEnabled) {
        numberOfVisibleFilters = 3;
      } else if (filters.length > numberOfVisibleFilters) {
        numberOfVisibleFilters = 4;
      }

      labelDiv.innerHTML = 'Filter:';

      // Add previous and next buttons, if needed
      if (filters.length > numberOfVisibleFilters) {
        this._nextButton = L.DomUtil.create('button', 'more more-next');
        this._nextButton.innerHTML = '' +
          '<image src="data:image/svg+xml;base64,' + window.btoa('<svg width="11" height="13" xmlns="http://www.w3.org/2000/svg"><path d="M.64.425L10.36 6.5.64 12.575z" stroke="#444" stroke-width=".81" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"/></svg>') + '" title="More"></image>' +
        '';
        this._nextButton.onclick = function () {
          var children = ul.children;
          var countVisibleButtons = 0;
          var lastHiddenButtonIndex = -1;

          for (var i = 0; i < children.length; i++) {
            if (children[i].style.display === 'none') {
              lastHiddenButtonIndex = i;
            } else {
              countVisibleButtons++;
            }
          }

          ul.children[lastHiddenButtonIndex + 1].style.display = 'none';
          countVisibleButtons--;

          me._previousButton.removeAttribute('disabled');

          if (countVisibleButtons === (numberOfVisibleFilters)) {
            me._nextButton.setAttribute('disabled', true);
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
            me._nextButton.removeAttribute('disabled');

            if (firstHiddenButtonIndex === 0) {
              me._previousButton.setAttribute('disabled', true);
            }
          }
        };
        this._previousButton.setAttribute('disabled', true);

        L.DomUtil.addClass(actionsDiv, 'more');

        actionsDiv.appendChild(this._previousButton);
        actionsDiv.appendChild(this._nextButton);
      } else {
        actionsDiv.style.width = filters.length * 45.75 + 'px';
      }

      actionsDiv.appendChild(ul);

      if (filterLabelEnabled) {
        this._container.appendChild(labelDiv);
        L.DomUtil.addClass(actionsDiv, 'has-label');
      }

      this._container.appendChild(actionsDiv);

      for (var j = 0; j < filters.length; j++) {
        var filter = filters[j];

        lis += '' +
          '<li>' +
            '<button data-index="' + j + '">' +
              '<image src="data:image/svg+xml;base64,' + window.btoa(filter.svg) + '" title="' + filter.title + '"></image>' +
            '</button>' +
          '</li>' +
        '';
      }

      ul.innerHTML = lis;
      ul.style.width = filters.length * 45.75 + 'px';

      // Hook up button click handlers
      for (var k = 0; k < ul.children.length; k++) {
        L.DomEvent.on(ul.children[k].children[0], 'click', function () {
          var filterFunction = filters[this.getAttribute('data-index')].filterFunction;
          var resetFilterFunction = filters[this.getAttribute('data-index')].resetFilterFunction;
          var activeClassName = 'active';
          var isActive = this.classList.contains(activeClassName);

          // Remove the active states on all of the siblings:
          var buttons = document.getElementsByClassName('leaflet-control-filter-button-wrapper')[0].children;
          for (var i = 0; i < buttons.length; i++) {
            L.DomUtil.removeClass(buttons[i].firstElementChild, activeClassName);
          }

          // Set the active state on the clicked filter
          if (!isActive && typeof filterFunction === 'function') {
            L.DomUtil.addClass(this, activeClassName);
            filterFunction();
          } else if (typeof resetFilterFunction === 'function') {
            resetFilterFunction();
          }
        }, ul.children[k].children[0]);
      }

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
