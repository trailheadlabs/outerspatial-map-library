/* global L, XMLHttpRequest */

'use strict';

var dateFormat = require('helper-dateformat');
var handlebars = require('handlebars');
var reqwest = require('reqwest');

handlebars.registerHelper('dateFormat', dateFormat);
handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {
  switch (operator) {
    case '!=':
      return (v1 != v2) ? options.fn(this) : options.inverse(this);
    case '!==':
      return (v1 !== v2) ? options.fn(this) : options.inverse(this);
    case '==':
      return (v1 == v2) ? options.fn(this) : options.inverse(this);
    case '===':
      return (v1 === v2) ? options.fn(this) : options.inverse(this);
    case '<':
      return (v1 < v2) ? options.fn(this) : options.inverse(this);
    case '<=':
      return (v1 <= v2) ? options.fn(this) : options.inverse(this);
    case '>':
      return (v1 > v2) ? options.fn(this) : options.inverse(this);
    case '>=':
      return (v1 >= v2) ? options.fn(this) : options.inverse(this);
    case '&&':
      return (v1 && v2) ? options.fn(this) : options.inverse(this);
    case '||':
      return (v1 || v2) ? options.fn(this) : options.inverse(this);
    default:
      return options.inverse(this);
  }
});
handlebars.registerHelper('toInt', function (str) {
  return parseInt(str, 10);
});
handlebars.registerHelper('toLowerCase', function (str) {
  return str.toLowerCase();
});
handlebars.registerHelper('toUpperCase', function (str) {
  return str.toUpperCase();
});

// Shim for window.atob/window.btoa. Needed for IE9 support.
(function () {
  var decodeChars = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1];
  var encodeChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

  function base64decode (str) {
    var c1, c2, c3, c4, i, len, out;

    len = str.length;
    i = 0;
    out = '';

    while (i < len) {
      do {
        c1 = decodeChars[str.charCodeAt(i++) & 0xff];
      } while (i < len && c1 === -1);

      if (c1 === -1) {
        break;
      }

      do {
        c2 = decodeChars[str.charCodeAt(i++) & 0xff];
      } while (i < len && c2 === -1);

      if (c2 === -1) {
        break;
      }

      out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));

      do {
        c3 = str.charCodeAt(i++) & 0xff;

        if (c3 === 61) {
          return out;
        }

        c3 = decodeChars[c3];
      } while (i < len && c3 === -1);

      if (c3 === -1) {
        break;
      }

      out += String.fromCharCode(((c2 & 0XF) << 4) | ((c3 & 0x3C) >> 2));

      do {
        c4 = str.charCodeAt(i++) & 0xff;

        if (c4 === 61) {
          return out;
        }

        c4 = decodeChars[c4];
      } while (i < len && c4 === -1);

      if (c4 === -1) {
        break;
      }

      out += String.fromCharCode(((c3 & 0x03) << 6) | c4);
    }

    return out;
  }
  function base64encode (str) {
    var c1, c2, c3, i, len, out;

    len = str.length;
    i = 0;
    out = '';

    while (i < len) {
      c1 = str.charCodeAt(i++) & 0xff;

      if (i === len) {
        out += encodeChars.charAt(c1 >> 2);
        out += encodeChars.charAt((c1 & 0x3) << 4);
        out += '==';
        break;
      }

      c2 = str.charCodeAt(i++);

      if (i === len) {
        out += encodeChars.charAt(c1 >> 2);
        out += encodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
        out += encodeChars.charAt((c2 & 0xF) << 2);
        out += '=';
        break;
      }

      c3 = str.charCodeAt(i++);
      out += encodeChars.charAt(c1 >> 2);
      out += encodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
      out += encodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
      out += encodeChars.charAt(c3 & 0x3F);
    }

    return out;
  }

  if (!window.btoa) {
    window.btoa = base64encode;
  }

  if (!window.atob) {
    window.atob = base64decode;
  }
})();

module.exports = {
  _checkDisplay: function (node, changed) {
    if (node.style && node.style.display === 'none') {
      changed.push(node);
      node.style.display = 'block';
    }
  },
  _getAvailableHorizontalSpace: function (map) {
    return map.getContainer().clientWidth - 120;
  },
  _getAvailableVerticalSpace: function (map) {
    return map.getContainer().clientHeight - 320;
  },
  _lazyLoader: require('./lazyloader.js'),
  _parseLocalUrl: function (url) {
    return url.replace(window.location.origin, '');
  },
  appendCssFile: function (urls, callback) {
    if (typeof urls === 'string') {
      urls = [
        urls
      ];
    }

    this._lazyLoader(urls, callback);
  },
  appendJsFile: function (urls, callback) {
    if (typeof urls === 'string') {
      urls = [
        urls
      ];
    }

    this._lazyLoader(urls, callback);
  },
  buildUrl: function (base, params) {
    var returnArray = [];

    if (params) {
      returnArray.push(base + '?');
    } else {
      return base;
    }

    for (var param in params) {
      returnArray.push(encodeURIComponent(param));
      returnArray.push('=');
      returnArray.push(encodeURIComponent(params[param]));
      returnArray.push('&');
    }

    returnArray.pop();
    return returnArray.join('');
  },
  cancelEvent: function (e) {
    e = e || window.event;

    if (e.preventDefault) {
      e.preventDefault();
    }

    e.returnValue = false;
  },
  clone: function (obj) {
    // One problem with this: http://stackoverflow.com/questions/11491938/issues-with-date-when-using-json-stringify-and-json-parse/11491993#11491993.
    return JSON.parse(JSON.stringify(obj));
  },
  dataToList: function (data, fields) {
    var dl = document.createElement('dl');

    for (var prop in data) {
      var add = true;

      if (fields && L.Util.isArray(fields)) {
        if (fields.indexOf(prop) === -1) {
          add = false;
        }
      }

      if (add) {
        var dd = document.createElement('dd');
        var dt = document.createElement('dt');

        dt.innerHTML = prop;
        dd.innerHTML = data[prop];
        dl.appendChild(dt);
        dl.appendChild(dd);
      }
    }

    return dl;
  },
  // TODO: Needs a lot of cleanup, and also need to document fields option.
  dataToTable: function (data, fields) {
    var table = document.createElement('table');
    var tableBody = document.createElement('tbody');
    var field;
    var fieldTitles;

    table.appendChild(tableBody);

    if (L.Util.isArray(fields)) {
      fieldTitles = {};

      for (var i = 0; i < fields.length; i++) {
        field = fields[i];

        if (typeof field === 'string') {
          fieldTitles[field] = {
            'title': field
          };
        } else {
          fieldTitles[field.field] = field;
        }
      }
    }

    for (var prop in data) {
      var add = false;

      if (fieldTitles) {
        for (field in fieldTitles) {
          if (field === prop) {
            add = true;
            break;
          }
        }
      } else {
        add = true;
      }

      if (add) {
        var tdProperty = document.createElement('td');
        var tdValue = document.createElement('td');
        var tr = document.createElement('tr');

        if (fieldTitles) {
          tdProperty.innerHTML = fieldTitles[prop].title;
        } else {
          tdProperty.innerHTML = prop;
        }

        if (fieldTitles && fieldTitles[prop] && fieldTitles[prop].separator) {
          tdValue.innerHTML = data[prop].replace(fieldTitles[prop].separator, '<br/>');
        } else {
          tdValue.innerHTML = data[prop];
        }

        if (fieldTitles && fieldTitles[prop] && fieldTitles[prop].process) {
          tdValue.innerHTML = fieldTitles[prop].process(tdValue.innerHTML);
        }

        tr.appendChild(tdProperty);
        tr.appendChild(tdValue);
        tableBody.appendChild(tr);
      }
    }

    return table;
  },
  escapeHtml: function (unsafe) {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },
  getChildElementsByClassName: function (parentNode, className) {
    var children = parentNode.childNodes;
    var matches = [];

    function recurse (el) {
      var grandChildren = el.children;

      if (typeof el.className === 'string' && el.className.indexOf(className) !== -1) {
        var classNames = el.className.split(' ');

        for (var k = 0; k < classNames.length; k++) {
          if (classNames[k] === className) {
            matches.push(el);
            break;
          }
        }
      }

      if (grandChildren && grandChildren.length) {
        for (var j = 0; j < grandChildren.length; j++) {
          recurse(grandChildren[j]);
        }
      }
    }

    for (var i = 0; i < children.length; i++) {
      recurse(children[i]);
    }

    return matches;
  },
  getChildElementsByNodeName: function (parentNode, nodeName) {
    var children = parentNode.childNodes;
    var matches = [];

    nodeName = nodeName.toLowerCase();

    function recurse (el) {
      var grandChildren = el.children;

      if (typeof el.nodeName === 'string' && el.nodeName.toLowerCase() === nodeName) {
        matches.push(el);
      }

      if (grandChildren && grandChildren.length) {
        for (var j = 0; j < grandChildren.length; j++) {
          recurse(grandChildren[j]);
        }
      }
    }

    for (var i = 0; i < children.length; i++) {
      recurse(children[i]);
    }

    return matches;
  },
  getElementsByClassName: function (className) {
    var matches = [];
    var regex = new RegExp('(^|\\s)' + className + '(\\s|$)');
    var tmp = document.getElementsByTagName('*');

    for (var i = 0; i < tmp.length; i++) {
      if (regex.test(tmp[i].className)) {
        matches.push(tmp[i]);
      }
    }

    return matches;
  },
  getEventObject: function (e) {
    if (!e) {
      e = window.event;
    }

    return e;
  },
  getEventObjectTarget: function (e) {
    var target;

    if (e.target) {
      target = e.target;
    } else {
      target = e.srcElement;
    }

    if (target.nodeType === 3) {
      target = target.parentNode;
    }

    return target;
  },
  getNextSibling: function (el) {
    do {
      el = el.nextSibling;
    } while (el && el.nodeType !== 1);

    return el;
  },
  getOffset: function (el) {
    for (var lx = 0, ly = 0; el !== null; lx += el.offsetLeft, ly += el.offsetTop, el = el.offsetParent);

    return {
      left: lx,
      top: ly
    };
  },
  getOuterDimensions: function (el) {
    var height = 0;
    var width = 0;

    if (el) {
      var changed = [];
      var parentNode = el.parentNode;

      this._checkDisplay(el, changed);

      if (el.id !== 'outerspatial' && parentNode) {
        this._checkDisplay(parentNode, changed);

        while (parentNode.id && parentNode.id !== 'outerspatial' && parentNode.id !== 'outerspatial-map') {
          parentNode = parentNode.parentNode;

          if (parentNode) {
            this._checkDisplay(parentNode, changed);
          }
        }
      }

      height = el.offsetHeight;
      width = el.offsetWidth;

      changed.reverse();

      for (var i = 0; i < changed.length; i++) {
        changed[i].style.display = 'none';
      }
    }

    return {
      height: height,
      width: width
    };
  },
  getOuterHtml: function (el) {
    if (!el || !el.tagName) {
      return '';
    }

    var div = document.createElement('div');
    var ax;
    var txt;

    div.appendChild(el.cloneNode(false));
    txt = div.innerHTML;
    ax = txt.indexOf('>') + 1;
    txt = txt.substring(0, ax) + el.innerHTML + txt.substring(ax);
    div = null;
    return txt;
  },
  getPosition: function (el) {
    var obj = {
      left: 0,
      top: 0
    };
    var offset = this.getOffset(el);
    var offsetParent = this.getOffset(el.parentNode);

    obj.left = offset.left - offsetParent.left;
    obj.top = offset.top - offsetParent.top;

    return obj;
  },
  getPreviousSibling: function (el) {
    do {
      el = el.previousSibling;
    } while (el && el.nodeType !== 1);

    return el;
  },
  getPropertyCount: function (obj) {
    if (!Object.keys) {
      var keys = [];
      var k;

      for (k in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, k)) {
          keys.push(k);
        }
      }

      return keys.length;
    } else {
      return Object.keys(obj).length;
    }
  },
  handlebars: function (template, data) {
    template = handlebars.compile(template);

    return template(data);
  },
  isHidden: function (el) {
    return (el.offsetParent === null);
  },
  isLocalUrl: function (url) {
    if (url.indexOf(window.location.hostname) >= 0) {
      return true;
    } else {
      return !(/^(?:[a-z]+:)?\/\//i.test(url));
    }
  },
  isNumeric: function (val) {
    return !isNaN(parseFloat(val)) && isFinite(val);
  },
  linkify: function (text, shorten, target) {
    var regexRoot = '\\b(https?:\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[A-Z0-9+&@#/%=~_|])';
    var regexLink = new RegExp(regexRoot, 'gi');
    var regexShorten = new RegExp('>' + regexRoot + '</a>', 'gi');
    var textLinked = text.replace(regexLink, '<a href="$1"' + (target ? ' target="' + target + '"' : '') + '>$1</a>');

    if (shorten) {
      var matchArray = textLinked.match(regexShorten);

      if (matchArray) {
        for (var i = 0; i < matchArray.length; i++) {
          var newBase = matchArray[i].substr(1, matchArray[i].length - 5).replace(/https?:\/\//gi, '');
          var newName = newBase.substr(0, shorten) + (newBase.length > shorten ? '&hellip;' : '');

          if (newBase.length - 1 === shorten) {
            newName = newName.substr(0, shorten) + newBase.substr(shorten, 1);
          }

          textLinked = textLinked.replace(matchArray[i], '>' + newName + '</a>');
        }
      }
    }

    return textLinked;
  },
  loadFile: function (url, type, callback) {
    if (this.isLocalUrl(url)) {
      if (type === 'xml') {
        var request = new XMLHttpRequest();

        request.onload = function () {
          var text = this.responseText;

          if (text) {
            callback(text);
          } else {
            callback(false);
          }
        };
        request.open('get', this._parseLocalUrl(url), true);
        request.send();
      } else {
        reqwest({
          error: function () {
            callback(false);
          },
          success: function (response) {
            if (response) {
              if (type === 'text') {
                callback(response.responseText);
              } else {
                callback(response);
              }
            } else {
              callback(false);
            }
          },
          type: type,
          url: this._parseLocalUrl(url)
        });
      }
    } else {
      var supportsCors = (window.location.protocol.indexOf('https:') === 0 ? true : (this.supportsCors() === 'yes'));

      reqwest({
        crossOrigin: supportsCors,
        error: function () {
          callback(false);
        },
        success: function (response) {
          if (response && response.success) {
            callback(response.data);
          } else {
            callback(false);
          }
        },
        type: 'json' + (supportsCors ? '' : 'p'),
        url: 'https://outerspatial-utilities.herokuapp.com/proxy/?encoded=true&type=' + type + '&url=' + window.btoa(encodeURIComponent(url))
      });
    }
  },
  mediaToList: function (data, media) {
    var div = document.createElement('div');
    var types = {
      focus: function (guids) {
        var guidArray = guids.match(new RegExp('[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}(}){0,1}', 'g'));
        var imgs = [];

        for (var i = 0; i < guidArray.length; i++) {
          imgs.push({
            href: 'http://focus.nps.gov/AssetDetail?assetID=' + guidArray[i],
            src: 'http://focus.nps.gov/GetAsset/' + guidArray[i] + '/thumb/xlarge'
          });
        }

        return imgs;
      }
    };
    var ul = document.createElement('ul');
    var images;
    var next;
    var previous;

    function changeImage (direction) {
      var lis = ul.childNodes;
      var maxImg = lis.length;
      var curImg;
      var j;
      var li;

      for (j = 0; j < lis.length; j++) {
        li = lis[j];

        if (li.style.display !== 'none') {
          curImg = j;
          break;
        }
      }

      if ((curImg + direction) < maxImg && (curImg + direction) > -1) {
        for (j = 0; j < lis.length; j++) {
          li = lis[j];

          if (j === (curImg + direction)) {
            li.style.display = 'block';
          } else {
            li.style.display = 'none';
          }
        }
      }

      if ((curImg + direction) <= 0) {
        L.DomUtil.addClass(previous, 'disabled');
      } else {
        L.DomUtil.removeClass(previous, 'disabled');
      }

      if ((curImg + direction + 1) >= maxImg) {
        L.DomUtil.addClass(next, 'disabled');
      } else {
        L.DomUtil.removeClass(next, 'disabled');
      }
    }

    for (var i = 0; i < media.length; i++) {
      var config = media[i];
      var type = types[config.type];

      if (type) {
        images = type(data[config.id.replace('{{', '').replace('}}', '')]);

        for (var k = 0; k < images.length; k++) {
          var a = document.createElement('a');
          var image = images[k];
          var img = document.createElement('img');
          var imgStyles = [];
          var li = document.createElement('li');

          if (typeof config.height === 'number') {
            imgStyles += 'height:' + config.height + 'px;';
          }

          if (typeof config.width === 'number') {
            imgStyles += 'width:' + config.width + 'px;';
          }

          if (imgStyles.length) {
            img.style.cssText = imgStyles;
          }

          img.src = image.src;
          a.appendChild(img);
          a.href = image.href;
          a.target = '_blank';
          li.appendChild(a);
          li.style.display = k > 0 ? 'none' : 'block';
          ul.appendChild(li);
        }
      }
    }

    ul.className = 'clearfix';
    div.appendChild(ul);

    if (ul.childNodes.length > 1) {
      var buttons = document.createElement('div');

      next = document.createElement('button');
      previous = document.createElement('button');
      buttons.style.float = 'right';
      previous = document.createElement('button');
      previous.setAttribute('class', 'btn btn-circle disabled prev');
      previous.innerHTML = '&lt;';
      next = document.createElement('button');
      next.setAttribute('class', 'btn btn-circle next');
      next.innerHTML = '&gt;';
      L.DomEvent.addListener(previous, 'click', function () {
        changeImage(-1);
      });
      L.DomEvent.addListener(next, 'click', function () {
        changeImage(1);
      });
      buttons.appendChild(previous);
      buttons.appendChild(next);
      div.appendChild(buttons);
    }

    return div;
  },
  parseDomainFromUrl: function (url) {
    var matches = url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);

    return matches && matches[1];
  },
  putCursorAtEndOfInput: function (input) {
    if (input.setSelectionRange) {
      var length = input.value.length * 2;
      input.setSelectionRange(length, length);
    } else {
      input.value = input.value;
    }
  },
  reqwest: reqwest,
  strict: function (_, type) {
    if (typeof _ !== type) {
      throw new Error('Invalid argument: ' + type + ' expected');
    }
  },
  strictInstance: function (_, klass, name) {
    if (!(_ instanceof klass)) {
      throw new Error('Invalid argument: ' + name + ' expected');
    }
  },
  strictOneOf: function (_, values) {
    if (values.indexOf(_) === -1) {
      throw new Error('Invalid argument: ' + _ + ' given, valid values are ' + values.join(', '));
    }
  },
  stripHtml: function (html) {
    var tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  },
  // http://stackoverflow.com/a/7616755/27540
  supportsCors: function () {
    if ('withCredentials' in new XMLHttpRequest()) {
      return 'yes';
    } else if (typeof XDomainRequest !== 'undefined') {
      return 'partial';
    } else {
      return 'no';
    }
  },
  unescapeHtml: function (unsafe) {
    return unsafe
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '\"')
      .replace(/&#039;/g, '\'');
  }
};
