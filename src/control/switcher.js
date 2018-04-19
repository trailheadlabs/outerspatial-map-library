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
    var description;
    var img;
    var imgFileName;
    var imgContainer;
    var name;
    var section = L.DomUtil.create('section', (baseLayer.visible ? 'selected' : null));

    baseLayer.name.split(' ').forEach(function (word, index) {
      if (index === 0) {
        imgFileName = word.toLowerCase();
      } else if (index === 1) {
        imgFileName = imgFileName + '-' + word.toLowerCase();
      } else {
        imgFileName = imgFileName + word.charAt(0).toUpperCase() + word.slice(1);
      }
    });
    imgFileName = imgFileName.replace(/[(),]/g, '');

    if (baseLayer.visible) {
      section.setAttribute('id', SwitcherControl.SELECTED_ID);
      this._button.setAttribute('aria-activedescendant', SwitcherControl.SELECTED_ID);
    }

    imgContainer = L.DomUtil.create('div', 'baselayer-image-container', section);
    img = L.DomUtil.create('img', 'baselayer-image', imgContainer);
    img.src = window.L.Icon.Default.imagePath + '/control/switcher/' + imgFileName + '.png';
    name = L.DomUtil.create('div', 'baselayer-name', section);
    name.innerHTML = baseLayer.name;
    description = L.DomUtil.create('div', 'baselayer-description', section);
    description.innerHTML = baseLayer.description ? baseLayer.description : '';
    section.layerId = L.stamp(baseLayer);
    this._list.appendChild(section);
  },
  _initLayout: function () {
    var container = this._container = L.DomUtil.create('div', 'outerspatial-control-switcher');
    var title;

    L.DomEvent.disableClickPropagation(container);
    L.DomEvent.disableScrollPropagation(container);
    this._listShadowBox = L.DomUtil.create('div', 'outerspatial-modal-backdrop', this._map.getContainer());
    this._list = L.DomUtil.create('div', 'list-container', container);
    this._list.style.visibility = 'hidden';
    this._list.setAttribute('id', 'basemap_listbox');
    this._list.setAttribute('role', 'listbox');
    this._activeContainer = L.DomUtil.create('div', 'current-baselayer', container);
    title = L.DomUtil.create('div', 'title', this._activeContainer);
    title.innerHTML = 'BASEMAP';
    this._activeText = L.DomUtil.create('div', 'baselayer-name', this._activeContainer);
    this._button = L.DomUtil.create('button', undefined, container);
    this._button.innerHTML = 'Change';
    this._button.setAttribute('aria-expanded', false);
    this._button.setAttribute('aria-haspopup', true);
    this._button.setAttribute('aria-label', 'Switch base maps');
    this._button.setAttribute('aria-owns', 'basemap_listbox');
    this._button.setAttribute('role', 'combobox');
    L.DomEvent.addListener(this._button, 'click', this._toggleList, this);
    L.DomEvent.addListener(this._listShadowBox, 'click', this._toggleList, this);

    if (this._map.getContainer().clientWidth < 600) {
      this.collapse();
    }
  },
  collapse: function () {
    this._activeContainer.style.display = 'none';
    this.getContainer().style.minWidth = 0;
    this._button.innerHTML = 'Basemap';
  },
  expand: function () {
    this._activeContainer.style.display = 'block';
    this.getContainer().style.minWidth = '280px';
    this._button.innerHTML = 'Change';
  },
  _onClick: function (e) {
    var target = util.getEventObjectTarget(e);

    if (!L.DomUtil.hasClass(target, 'selected')) {
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

      target.setAttribute('id', selectedId);
      this._button.setAttribute('aria-activedescendant', selectedId);

      for (i = 0; i < this._baseLayers.length; i++) {
        var baseLayer = this._baseLayers[i];

        if (baseLayer.L) {
          this._map.removeLayer(baseLayer.L);
          this._map.attributionControl.removeAttribution(baseLayer.attribution);
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
    this._activeText.innerHTML = baseLayer.name;
  },
  _toggleList: function () {
    var bottomControls = document.getElementsByClassName('leaflet-bottom');
    var topLeftControls = document.getElementsByClassName('leaflet-top leaflet-left');
    var topRightControls = document.getElementsByClassName('leaflet-top leaflet-right');
    var i;

    this._list.style.height = this._map.getContainer().offsetHeight + 'px';

    if (this._list.style.visibility && this._list.style.visibility === 'hidden') {
      for (i = 0; i < bottomControls.length; i++) {
        bottomControls[i].style.display = 'none';
      }

      for (i = 0; i < topLeftControls.length; i++) {
        topLeftControls[i].style.visibility = 'hidden';
      }

      for (i = 0; i < topRightControls.length; i++) {
        topRightControls[i].style.visibility = 'hidden';
      }

      this._list.setAttribute('aria-expanded', true);
      this._list.style.visibility = 'visible';
      this._listShadowBox.style.display = 'block';
    } else {
      for (i = 0; i < bottomControls.length; i++) {
        bottomControls[i].style.display = '';
      }

      for (i = 0; i < topLeftControls.length; i++) {
        topLeftControls[i].style.visibility = 'visible';
      }

      for (i = 0; i < topRightControls.length; i++) {
        topRightControls[i].style.visibility = 'visible';
      }

      this._list.setAttribute('aria-expanded', false);
      this._list.style.visibility = 'hidden';
      this._listShadowBox.style.display = 'none';
    }
  },
  _update: function () {
    var children;
    var i;

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

    this.on('resize', function (e) {
      if (e.newSize.x > 598) {
        this.switcherControl.expand();
      } else {
        this.switcherControl.collapse();
      }
    });
  }
});

module.exports = function (baseLayers) {
  return new SwitcherControl(baseLayers);
};
