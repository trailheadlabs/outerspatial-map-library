/* global L */
/* jshint camelcase: false */

'use strict';

var util = require('../util/util');
var SwitcherControl = L.Control.extend({
  options: {
    position: 'topright'
  },
  statics: {
    SELECTED_ID: 'basemap_listbox_selected'
  },
  initialize: function (baseLayers) {
    this._baseLayers = baseLayers;
  },
  _addLi: function (baseLayer) {
    var li = L.DomUtil.create('li', (baseLayer.visible ? 'selected' : null));

    if (baseLayer.visible) {
      li.setAttribute('id', SwitcherControl.SELECTED_ID);
      this._active.setAttribute('aria-activedescendant', SwitcherControl.SELECTED_ID);
    }

    li.innerHTML = baseLayer.name;
    li.layerId = L.stamp(baseLayer);
    this._list.appendChild(li);
  },
  _initLayout: function () {
    var container = this._container = L.DomUtil.create('div', 'outerspatial-control-switcher');

    L.DomEvent.disableClickPropagation(container);
    L.DomEvent.disableScrollPropagation(container);


    //   '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 32 32">' +
    //     '<g class="icon-svg-path">' +
    //       '<path vector-effect="non-scaling-stroke" d="M16 0C7.178 0 0 7.178 0 16s7.178 16 16 16 16-7.178 16-16S24.822 0 16 0zM2.05 17H6.46c.076 2.153.395 4.175.915 6h-3.48c-1.038-1.79-1.688-3.825-1.842-6zM17 7V2.143c1.872.482 3.55 2.276 4.742 4.857H17zm5.512 2c.578 1.8.943 3.838 1.03 6H17V9h5.512zM15 2.143V7h-4.742C11.45 4.42 13.128 2.625 15 2.143zM15 9v6H8.457c.087-2.162.453-4.2 1.03-6H15zm-8.542 6H2.05c.156-2.175.806-4.21 1.845-6h3.478c-.52 1.825-.84 3.847-.915 6zm2 2H15v6H9.488c-.578-1.8-.944-3.838-1.03-6zM15 25v4.857c-1.872-.48-3.55-2.275-4.742-4.857H15zm2 4.857V25h4.742c-1.192 2.58-2.87 4.375-4.742 4.857zM17 23v-6h6.543c-.087 2.162-.453 4.2-1.03 6H17zm8.542-6h4.407c-.156 2.175-.806 4.21-1.845 6h-3.478c.52-1.825.84-3.847.915-6zm0-2c-.076-2.153-.395-4.175-.915-6h3.478c1.04 1.79 1.69 3.825 1.844 6H25.54zm1.166-8H23.96c-.567-1.415-1.272-2.65-2.076-3.686 1.866.87 3.513 2.128 4.824 3.686zM10.116 3.314C9.312 4.35 8.606 5.584 8.04 7H5.292c1.31-1.558 2.958-2.817 4.824-3.686zM5.292 25H8.04c.567 1.415 1.272 2.65 2.076 3.686-1.866-.87-3.513-2.128-4.824-3.686zm16.592 3.686c.804-1.036 1.51-2.27 2.076-3.686h2.748c-1.31 1.558-2.958 2.817-4.824 3.686z"/>' +
    //     '</g>' +
    //   '</svg>' +
    // '';


    this._active = L.DomUtil.create('div', undefined, container);
    this._active.setAttribute('aria-expanded', false);
    this._active.setAttribute('aria-haspopup', true);
    this._active.setAttribute('aria-label', 'Switch base maps');
    this._active.setAttribute('aria-owns', 'basemap_listbox');
    // this._active.setAttribute('role', 'combobox');
    this._list = L.DomUtil.create('ul', null, this._active);
    this._list.setAttribute('id', 'basemap_listbox');
    this._list.setAttribute('role', 'listbox');
    this._list.style.display = 'none';
    // this._activeIcon = L.DomUtil.create('span', null, this._active);
    L.DomUtil.create('ico', null, this._activeIcon);
    var activeContainer = L.DomUtil.create('div', 'current-baselayer', this._active);
    var title = L.DomUtil.create('div', 'title', activeContainer);
    title.innerHTML = 'BASE LAYER';
    this._activeText = L.DomUtil.create('div', 'baselayer-name', activeContainer);
    this._button = L.DomUtil.create('button', undefined, container);
    this._button.innerHTML = 'Change';

    // this._activeDropdown = L.DomUtil.create('span', null, this._active);
    L.DomEvent.addListener(this._button, 'click', this._toggleList, this);
  },
  _onClick: function (e) {
    var target = util.getEventObjectTarget(e);

    this._button.style.display = 'inline';

    if (!L.DomUtil.hasClass(target, 'selected')) {
      var added = false;
      var children = util.getChildElementsByNodeName(this._list, 'li');
      var removed = false;
      var selectedId = SwitcherControl.SELECTED_ID;
      var i;

      for (i = 0; i < children.length; i++) {
        var li = children[i];

        if (L.DomUtil.hasClass(li, 'selected')) {
          li.removeAttribute('id');
          L.DomUtil.removeClass(li, 'selected');
          break;
        }
      }

      target.setAttribute('id', selectedId);
      this._active.setAttribute('aria-activedescendant', selectedId);

      for (i = 0; i < this._baseLayers.length; i++) {
        var baseLayer = this._baseLayers[i];

        if (baseLayer.L) {
          this._map.removeLayer(baseLayer.L);
          baseLayer.visible = false;
          removed = true;
          delete baseLayer.L;
        } else if (target.layerId === baseLayer._leaflet_id) {
          baseLayer.visible = true;

          if (baseLayer.type === 'arcgisserver') {
            baseLayer.L = L.outerspatial.layer[baseLayer.type][baseLayer.tiled === true ? 'tiled' : 'dynamic'](baseLayer);
          } else if (baseLayer.type === 'mapbox') {
            baseLayer.L = L.outerspatial.layer[baseLayer.type][baseLayer.styled === true ? 'styled' : 'tiled'](baseLayer);
          } else {
            baseLayer.L = L.outerspatial.layer[baseLayer.type](baseLayer);
          }

          if (this._map.getZoom() < baseLayer.minZoom) {
            this._map.setView(this._map.getCenter(), baseLayer.minZoom);
          } else if (this._map.getZoom() > baseLayer.maxZoom) {
            this._map.setView(this._map.getCenter(), baseLayer.maxZoom);
          }

          if (!this._map.options.maxZoom) {
            if (baseLayer.maxZoom) {
              this._map.options.maxZoom = baseLayer.maxZoom;
            } else {
              this._map.options.maxZoom = 19;
            }
          }

          this._map.addLayer(baseLayer.L);
          L.DomUtil.addClass(target, 'selected');
          this._setActive(baseLayer);
          added = baseLayer.L;
        }

        if (added && removed) {
          this._map.fire('baselayerchange', {
            layer: added
          });
          break;
        }
      }
    }

    this._toggleList();
  },
  _setActive: function (baseLayer) {
    // var active = this._activeIcon.childNodes[0];
    // var icon = baseLayer.icon;

    // if (!icon) {
    //   icon = 'generic';
    // }

    // active.className = '';
    // L.DomUtil.addClass(active, icon + '-small');
    this._activeText.innerHTML = baseLayer.name;
  },
  _toggleList: function () {
    if (this._list.style.display && this._list.style.display === 'none') {
      this._list.style.display = 'block';
      // L.DomUtil.addClass(this._activeDropdown, 'open');
      this._active.setAttribute('aria-expanded', true);
      this._button.style.display = 'none';
    } else {
      this._list.style.display = 'none';
      // L.DomUtil.removeClass(this._activeDropdown, 'open');
      this._active.setAttribute('aria-expanded', false);
      this._button.style.display = 'block';
    }
  },
  _update: function () {
    var children;
    var i;

    // this._activeIcon.childNodes[0].innerHTML = '';
    this._activeText.innerHTML = '';
    this._list.innerHTML = '';

    for (i = 0; i < this._baseLayers.length; i++) {
      var baseLayer = this._baseLayers[i];

      this._addLi(baseLayer);

      if (baseLayer.visible) {
        this._setActive(baseLayer);
      }
    }

    children = util.getChildElementsByNodeName(this._list, 'li');

    for (i = 0; i < children.length; i++) {
      L.DomEvent.addListener(children[i], 'click', this._onClick, this);
    }
  },
  onAdd: function (map) {
    this._initLayout();
    this._update();

    return this._container;
  }
});

L.Map.addInitHook(function () {
  if (this.options.baseLayers && this.options.baseLayers.length > 1) {
    this.switcherControl = L.outerspatial.control.switcher(this.options.baseLayers).addTo(this);
  }
});

module.exports = function (baseLayers) {
  return new SwitcherControl(baseLayers);
};
