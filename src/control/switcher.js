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
  _addSection: function (baseLayer) {
    var section = L.DomUtil.create('section', (baseLayer.visible ? 'selected' : null));
    var imageFileName;

    baseLayer.name.split(' ').forEach(function (word, index) {
      if (index === 0) {
        imageFileName = word.toLowerCase();
      } else if (index === 1) {
        imageFileName = imageFileName + '-' + word.toLowerCase();
      } else {
        imageFileName = imageFileName + word.charAt(0).toUpperCase() + word.slice(1);
      }
    });
    imageFileName = imageFileName.replace(/[(),]/g, '');

    if (baseLayer.visible) {
      section.setAttribute('id', SwitcherControl.SELECTED_ID);
      this._button.setAttribute('aria-activedescendant', SwitcherControl.SELECTED_ID);
    }

    var img = L.DomUtil.create('img', 'baselayer-image', section);
    img.src = window.L.Icon.Default.imagePath + '/control/switcher/base-maps/' + imageFileName + '.png';
    var name = L.DomUtil.create('div', 'baselayer-name', section);
    name.innerHTML = baseLayer.name;
    var description = L.DomUtil.create('div', 'baselayer-description', section);
    description.innerHTML = 'Lorem ipsum dolor sit amet, sed nulla, maecenas libero ut. Urna purus justo, elit congue, facilisi auctor.';
    section.layerId = L.stamp(baseLayer);
    this._list.appendChild(section);
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

    this._listShadowBox = L.DomUtil.create('div', 'list-shadow', container);

    this._list = L.DomUtil.create('div', 'list-container', container);
    this._listShadowBox.style.visibility = 'hidden';
    this._list.style.visibility = 'hidden';
    this._list.setAttribute('id', 'basemap_listbox');
    this._list.setAttribute('role', 'listbox');
    // this._activeIcon = L.DomUtil.create('span', null, this._active);
    L.DomUtil.create('ico', null, this._activeIcon);
    this._activeContainer = L.DomUtil.create('div', 'current-baselayer', container);
    var title = L.DomUtil.create('div', 'title', this._activeContainer);
    title.innerHTML = 'BASE LAYER';
    this._activeText = L.DomUtil.create('div', 'baselayer-name', this._activeContainer);
    this._button = L.DomUtil.create('button', undefined, container);
    this._button.innerHTML = 'Change';
    this._button.setAttribute('aria-expanded', false);
    this._button.setAttribute('aria-haspopup', true);
    this._button.setAttribute('aria-label', 'Switch base maps');
    this._button.setAttribute('aria-owns', 'basemap_listbox');
    this._button.setAttribute('role', 'combobox');

    // this._activeDropdown = L.DomUtil.create('span', null, this._active);
    L.DomEvent.addListener(this._button, 'click', this._toggleList, this);
  },
  _onClick: function (e) {
    var target = util.getEventObjectTarget(e);

    if (!L.DomUtil.hasClass(target.parentNode, 'selected')) {
      var added = false;
      var children = util.getChildElementsByNodeName(this._list, 'section');
      var removed = false;
      var selectedId = SwitcherControl.SELECTED_ID;
      var i;

      for (i = 0; i < children.length; i++) {
        var section = children[i];

        if (L.DomUtil.hasClass(section, 'selected')) {
          section.removeAttribute('id');
          L.DomUtil.removeClass(section, 'selected');
          break;
        }
      }

      target.parentNode.setAttribute('id', selectedId);
      this._button.setAttribute('aria-activedescendant', selectedId);

      for (i = 0; i < this._baseLayers.length; i++) {
        var baseLayer = this._baseLayers[i];

        if (baseLayer.L) {
          this._map.removeLayer(baseLayer.L);
          this._map.attributionControl.removeAttribution(baseLayer.attribution);
          baseLayer.visible = false;
          removed = true;
          delete baseLayer.L;
        } else if (target.parentNode.layerId === baseLayer._leaflet_id) {
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

          if (this._map._initialMinZoom) {
            if (this._map._initialMinZoom < baseLayer.minZoom) {
              this._map.setMinZoom(baseLayer.minZoom);
            } else {
              this._map.setMinZoom(this._map._initialMinZoom);
            }
          }

          if (this._map._initialMaxZoom) {
            if (this._map._initialMaxZoom > baseLayer.maxZoom) {
              this._map.setMaxZoom(baseLayer.maxZoom);
            } else {
              this._map.setMaxZoom(this._map._initialMaxZoom);
            }
          }

          this._map.addLayer(baseLayer.L);
          L.DomUtil.addClass(target.parentNode, 'selected');
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
    var topRightControls = document.getElementsByClassName('leaflet-top leaflet-right');
    var i;
    var mapHeight = this._map.getContainer().offsetHeight;

    this._list.style.height = mapHeight + 'px';
    this._listShadowBox.style.height = mapHeight + 'px';

    if (this._list.style.visibility && this._list.style.visibility === 'hidden') {
      if (this._map.overviewControl) {
        this._map.overviewControl.remove();
      }

      this._map.attributionControl.remove();

      for (i = 0; i < topRightControls.length; i++) {
        topRightControls[i].style.visibility = 'hidden';
      }

      this._listShadowBox.style.visibility = 'visible';
      this._list.style.visibility = 'visible';
      // L.DomUtil.addClass(this._activeDropdown, 'open');
      this._list.setAttribute('aria-expanded', true);
    } else {
      if (this._map.overviewControl) {
        this._map.addControl(this._map.overviewControl);
      }

      this._map.addControl(this._map.attributionControl);

      for (i = 0; i < topRightControls.length; i++) {
        topRightControls[i].style.visibility = 'visible';
      }

      this._listShadowBox.style.visibility = 'hidden';
      this._list.style.visibility = 'hidden';
      // this._list.style.display = 'none';
      // L.DomUtil.removeClass(this._activeDropdown, 'open');
      this._list.setAttribute('aria-expanded', false);
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

      this._addSection(baseLayer);

      if (baseLayer.visible) {
        this._setActive(baseLayer);
      }
    }

    children = util.getChildElementsByNodeName(this._list, 'section');

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
