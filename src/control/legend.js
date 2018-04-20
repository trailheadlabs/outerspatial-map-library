/* globals L */

'use strict';

var LegendControl = L.Control.extend({
  options: {
    html: null,
    position: 'topright'
  },
  initialize: function (options) {
    L.Util.setOptions(this, options);

    return this;
  },
  onAdd: function (map) {
    this._container = L.DomUtil.create('div', 'outerspatial-control-legend', null);
    this._titleDiv = L.DomUtil.create('div', null, this._container);
    this._button = L.DomUtil.create('button', null, this._container);

    var title = L.DomUtil.create('h5', null, this._titleDiv);
    var legendContent = L.DomUtil.create('div', 'outerspatial-control-legend-content', map.getContainer());
    var modalBackdrop = L.DomUtil.create('div', 'outerspatial-modal-backdrop', map.getContainer());

    this._button.innerHTML = 'View';
    title.innerHTML = 'LEGEND';
    this._titleDiv.style.float = 'left';

    if (map.switcherControl) {
      this._container.style.borderTop = '1px solid #d8d8d8';
      this._container.style.marginTop = (map.switcherControl ? '0' : '16px');
      this._container.style.zIndex = 1;
    }

    L.DomEvent.disableClickPropagation(this._container);
    L.DomEvent.disableClickPropagation(legendContent);
    L.DomEvent.disableClickPropagation(modalBackdrop);
    L.DomEvent.disableScrollPropagation(this._container);
    L.DomEvent.disableScrollPropagation(legendContent);
    L.DomEvent.disableScrollPropagation(modalBackdrop);

    if (map.getContainer().offsetWidth < 600) {
      this.collapse();
    }

    legendContent.innerHTML = this.options.html;

    this._button.onclick = function (e) {
      map._hideAllControls();

      legendContent.style.display = 'block';
      modalBackdrop.style.display = 'block';

      // TODO: Also close regular popup.
      if (map.isDockedPopupOpen) {
        map.closeDockedPopup();
      }
    };
    map.on('resize', function (e) {
      if (e.newSize.x > 598) {
        this.expand();
      } else {
        this.collapse();
      }
    }, this);
    L.DomEvent.addListener(modalBackdrop, 'click', function () {
      legendContent.style.display = 'none';
      modalBackdrop.style.display = 'none';
      map._showAllControls();
    });

    return this._container;
  },
  _collapse: function () {
    this._container.style.width = '73.750px';
    this._button.innerHTML = 'Legend';
    this._button.style.width = '63.750px';
    this._titleDiv.style.display = 'none';
  },
  _expand: function () {
    this._container.style.width = '280px';
    this._button.innerHTML = 'View';
    this._button.style.width = '53.53px';
    this._titleDiv.style.display = 'block';
  }
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

    this.legendControl = L.outerspatial.control.legend(options).addTo(this);
  }
});

module.exports = function (options) {
  return new LegendControl(options);
};
