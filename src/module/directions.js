/* globals L */

'use strict';

var geocode = require('../util/geocode');
var route = require('../util/route');
var util = require('../util/util');

require('../icon/maki');

var DirectionsModule = L.Class.extend({
  options: {
    visible: true
  },
  includes: [
    require('../mixin/module')
  ],
  initialize: function (options) {
    var buttonAddStop = document.createElement('button');
    var buttonClear = document.createElement('button');
    var buttonOptions = document.createElement('button');
    var div = document.createElement('div');
    var me = this;
    var p = document.createElement('p');

    L.Util.setOptions(this, options);
    p.innerHTML = 'Search for a location by address or name. Drag stops to reorder.';
    div.appendChild(p);
    this._ul = document.createElement('ul');
    div.appendChild(this._ul);
    this._actions = document.createElement('div');
    this._actions.className = 'actions';
    this._options = document.createElement('div');
    this._options.className = 'clearfix';
    buttonAddStop.className = buttonOptions.className = 'btn btn-link';
    buttonOptions.innerHTML = 'Options';
    L.DomEvent.addListener(buttonAddStop, 'click', function () {
      this._addLi();
    }, this);
    this._options.appendChild(buttonAddStop);
    this._options.appendChild(buttonOptions);
    this._actions.appendChild(this._options);
    this._buttonPrimary = document.createElement('button');
    this._buttonPrimary.className = 'btn btn-primary';
    this._buttonPrimary.innerHTML = buttonAddStop.innerHTML = 'Add Stop';
    L.DomEvent.addListener(this._buttonPrimary, 'click', function () {
      if (me._buttonPrimary.innerHTML === 'Add Stop') {
        var value = me._getFirstValue();

        me._ul.innerHTML = '';
        me._addLi(value);
        me._addLi();
      } else {
        // TODO: Route.
      }
    }, this);
    this._actions.appendChild(this._buttonPrimary);
    buttonClear.className = 'btn btn-link';
    buttonClear.innerHTML = 'clear';
    L.DomEvent.addListener(buttonClear, 'click', this._clear, this);
    this._actions.appendChild(buttonClear);
    div.appendChild(this._actions);
    this._directions = document.createElement('div');
    this._directions.className = 'directions';
    this._directions.style.display = 'none';
    div.appendChild(this._directions);
    this._disclaimer = document.createElement('p');
    this._disclaimer.className = 'disclaimer';
    this._disclaimer.innerHTML = 'DISCLAIMER: These directions are for planning purposes only. While the National Park Service strives to provide the most accurate information possible, please use caution when driving in unfamiliar locations and check directions against the content provided by each Park\'s website. The National Park Service assumes no responsibility for information provided by NPS partners.';
    div.appendChild(this._disclaimer);
    this.content = div;
    this.icon = 'car';
    this.title = this.type = 'Directions';
    this.visible = (options && options.visible) || false;
    this._addLiFirst();
    this._addDraggableListeners();

    return this;
  },
  _dragSource: null,
  _icon: {
    iconAnchor: [13.5, 37],
    iconRetinaUrl: window.L.Icon.Default.imagePath + '/module/directions/stop-{{letter}}@2x.png',
    iconSize: [27, 37],
    iconUrl: window.L.Icon.Default.imagePath + '/module/directions/stop-{{letter}}.png',
    popupAnchor: [0, -40]
  },
  _letters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
  _markers: [],
  _route: [],
  _styles: [{
    color: '#818171',
    opacity: 1,
    weight: 6
  }, {
    color: '#c16b2b',
    opacity: 1,
    weight: 4
  }],
  _addDraggableListeners: function () {
    for (var i = 0; i < this._ul.childNodes.length; i++) {
      var li = this._ul.childNodes[i];

      L.DomEvent
        .addListener(li, 'dragend', this._handleDragEnd, this)
        .addListener(li, 'dragenter', this._handleDragEnter, this)
        .addListener(li, 'dragleave', this._handleDragLeave, this)
        .addListener(li, 'dragover', this._handleDragOver, this)
        .addListener(li, 'dragstart', this._handleDragStart, this);
    }
  },
  _addLi: function (value, focus) {
    var backgroundImage = 'url(' + window.L.Icon.Default.imagePath + '/module/directions/times' + (L.Browser.retina ? '@2x' : '') + '.png)';
    var button = document.createElement('button');
    var div = document.createElement('div');
    var input = document.createElement('input');
    var label = document.createElement('label');
    var letter = this._letters[this._ul.childNodes.length];
    var li = document.createElement('li');
    var me = this;

    div.className = 'remove';
    label.htmlFor = 'stop-' + letter;
    label.innerHTML = letter;
    li.appendChild(label);
    li.draggable = true;
    input.id = 'stop-' + letter;
    input.onkeypress = function (e) {
      if (e.keyCode === 13 && input.value && input.value.length > 0) {
        geocode.esri(input.value, function (response) {
          if (response && response.results) {
            var result = response.results[0];

            if (result) {
              input.value = result.name;
              result.letter = letter;
              me._addMarker(result);

              if (me._markers.length > 1) {
                me.route();
              }
            }
          }
        });
      }
    };
    input.type = 'text';

    if (value) {
      input.value = value;
    }

    div.appendChild(input);
    button.className = 'ir remove';
    button.innerHTML = 'Remove stop';
    L.DomEvent
      .addListener(button, 'click', function () {
        var li = this.parentNode;
        var letter = li.childNodes[0].innerHTML;
        var refresh = false;
        var ul = li.parentNode;

        ul.removeChild(li);

        if (ul.childNodes.length === 0) {
          me._clear();
        } else {
          if (ul.childNodes.length === 1) {
            var value = me._getFirstValue();

            ul.innerHTML = '';
            me._addLiFirst(value);
          }

          for (var i = 0; i < me._markers.length; i++) {
            var marker = me._markers[i];

            if (marker._letter === letter) {
              refresh = true;
              me._map.removeLayer(marker);
              me._markers.splice(i, 1);
              break;
            }
          }

          if (refresh) {
            me._clearRoute();

            if (me._markers.length > 1) {
              me.route();
            }
          }

          me._refreshLetters();
        }
      })
      .addListener(button, 'onmouseout', function () {
        this.style.backgroundImage = backgroundImage;
      })
      .addListener(button, 'onmouseover', function () {
        this.style.backgroundImage = 'url(' + window.L.Icon.Default.imagePath + '/module/directions/times-over' + (L.Browser.retina ? '@2x' : '') + '.png)';
      });
    button.style.backgroundImage = backgroundImage;
    li.appendChild(div);
    li.appendChild(button);
    this._ul.appendChild(li);
    this._options.style.display = 'block';
    this._buttonPrimary.innerHTML = 'Get Directions';

    if (focus) {
      input.focus();
    }
  },
  _addLiFirst: function (value) {
    var button = document.createElement('button');
    var divLi = document.createElement('div');
    var input = document.createElement('input');
    var label = document.createElement('label');
    var li = document.createElement('li');
    var me = this;

    label.htmlFor = 'stop-A';
    label.innerHTML = 'A';
    li.appendChild(label);
    input.className = 'search';
    input.id = 'stop-A';
    input.type = 'text';
    input.onkeypress = function (e) {
      if (e.keyCode === 13 && input.value && input.value.length > 0) {
        geocode.esri(input.value, function (response) {
          if (response && response.results) {
            var result = response.results[0];

            if (result) {
              result.letter = 'A';
              me._ul.innerHTML = '';
              me._addLi(result.name);
              me._addLi(null, true);
              me._addMarker(result);
            }
          }
        });
      }
    };
    divLi.appendChild(input);
    button.className = 'search ir';
    button.innerHTML = 'Search for a location';
    button.style.backgroundImage = 'url(' + window.L.Icon.Default.imagePath + '/font-awesome/search' + (L.Browser.retina ? '@2x' : '') + '.png)';
    L.DomEvent.addListener(button, 'click', function () {
      if (input.value && input.value.length > 0) {
        me._geocode(input);
      }
    });
    divLi.appendChild(button);
    li.appendChild(divLi);
    li.draggable = true;
    this._ul.appendChild(li);
    this._options.style.display = 'none';
    this._buttonPrimary.innerHTML = 'Add Stop';

    if (value) {
      input.value = value;
    }
  },
  _addMarker: function (result) {
    var icon = L.extend({}, this._icon);
    var latLng = result.latLng;
    var letter = result.letter;
    var marker;

    L.extend(icon, {
      iconRetinaUrl: util.handlebars(icon.iconRetinaUrl, {
        letter: letter
      }),
      iconUrl: util.handlebars(icon.iconUrl, {
        letter: letter
      })
    });
    marker = new L.Marker({
      lat: latLng[0],
      lng: latLng[1]
    }, {
      icon: new L.Icon(icon)
    });
    marker._letter = letter;
    marker._name = result.name;
    this._markers.push(marker.bindPopup('<div class="title">' + result.name + '</div>').addTo(this._map));
  },
  _clear: function () {
    this._directions.innerHTML = '';
    this._directions.style.display = 'none';
    this._ul.innerHTML = '';
    this._addLiFirst();

    for (var i = 0; i < this._markers.length; i++) {
      this._map.removeLayer(this._markers[i]);
    }

    this._clearRoute();
  },
  _clearRoute: function () {
    if (this._route.length) {
      for (var i = 0; i < this._route.length; i++) {
        this._map.removeLayer(this._route[i]);
      }

      this._directions.innerHTML = '';
      this._directions.style.display = 'none';
      this._route = [];
    }
  },
  _formatDistance: function (meters) {
    var distance = Math.round(meters / 1609.344) / 10;

    if (distance === 0) {
      return Math.round(meters * 3.28084) + ' ft';
    } else {
      return distance + ' mi';
    }
  },
  _getFirstValue: function () {
    return this._ul.childNodes[0].childNodes[1].childNodes[0].value || null;
  },
  _handleDragEnd: function (e) {
    e.target.style.opacity = '1';
  },
  _handleDragEnter: function (e) {
    e.target.classList.add('over');
  },
  _handleDragLeave: function (e) {
    e.target.classList.remove('over');
  },
  _handleDrop: function (e) {
    var target = e.target;

    if (e.stopPropagation) {
      e.stopPropagation();
    }

    if (target._dragSource != target) {
      target._dragSource.innerHTML = target.innerHTML;
      target.innerHTML = e.dataTransfer.getData('text/html');
    }

    return false;
  },
  _handleDragOver: function (e) {
    if (e.preventDefault) {
      e.preventDefault();
    }

    e.dataTransfer.dropEffect = 'move';

    return false;
  },
  _handleDragStart: function (e) {
    var target = e.target;

    target.style.opacity = '0.4';
    target._dragSource = target;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', target.innerHTML);
  },
  _refreshLetters: function () {
    for (var i = 0; i < this._ul.childNodes.length; i++) {
      var childNodes = this._ul.childNodes[i].childNodes;
      var icon = L.extend({}, this._icon);
      var label = childNodes[0];
      var letter = this._letters[i];
      var marker = this._markers[i];
      var id = 'stop-' + letter;

      label.htmlFor = id;
      label.innerHTML = letter;
      childNodes[1].childNodes[0].id = id;

      if (marker) {
        marker._letter = letter;
        L.extend(icon, {
          iconRetinaUrl: util.handlebars(icon.iconRetinaUrl, {
            letter: letter
          }),
          iconUrl: util.handlebars(icon.iconUrl, {
            letter: letter
          })
        });
        marker.setIcon(new L.Icon(icon));
      }
    }
  },
  route: function () {
    var latLngs = [];
    var me = this;

    for (var i = 0; i < me._markers.length; i++) {
      latLngs.push(me._markers[i].getLatLng());
    }

    route.mapbox.route(latLngs, function (route) {
      if (route && route.routes && route.routes.length) {
        var first = route.routes[0];
        var steps = first.steps;
        var html = '<div class="maneuver-header"><h2>Driving Directions to ' + me._markers[me._markers.length - 1]._name + '</h2><span class="info">ROUTE: ' + Math.round(first.distance / 1609.344) + ' MI, ' + Math.round(first.duration / 60) + ' MIN </span><h3 class="location"><span class="identifier">A</span><span class="name">' + me._markers[0]._name + '</span></h3></div><ol class="maneuvers">';
        var i;

        for (i = 0; i < me._styles.length; i++) {
          var line = new L.GeoJSON({
            geometry: route.routes[0].geometry,
            properties: {},
            type: 'Feature'
          }, L.extend({
            clickable: false
          }, me._styles[i]));

          me._route.push(line);
          line.addTo(me._map);
        }

        for (i = 0; i < steps.length; i++) {
          var step = steps[i];

          html += '<li>' + step.maneuver.instruction + (typeof step.distance === 'undefined' ? '' : '<span class="distance">' + me._formatDistance(step.distance) + '</span>') + '</li>';
        }

        me._directions.innerHTML = html + '</ol><div class="maneuver-footer"><h3 class="location"><span class="identifier">B</span><span class="name">' + me._markers[me._markers.length - 1]._name + '</span></h3></div>';
        me._directions.style.display = 'block';

        me._map.fitBounds(me._route[0].getBounds(), {
          paddingBottomRight: [15, 0],
          paddingTopLeft: [15, 30]
        });
      }
    });
  }
});

module.exports = function (options) {
  return new DirectionsModule(options);
};
