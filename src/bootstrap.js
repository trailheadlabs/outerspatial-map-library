/* global L */

window.OuterSpatial = window.OuterSpatial || null;

if (!window.OuterSpatial) {
  throw new Error('The OuterSpatial object is required.');
}

if (typeof window.OuterSpatial !== 'object') {
  throw new Error('The OuterSpatial variable cannot be a ' + typeof window.OuterSpatial + '.');
}

(function () {
  var ie;

  // https://github.com/Gavin-Paolucci-Kleinow/ie-truth
  function IeVersion () {
    var msie = navigator.userAgent.match(/MSIE (\d+)/);
    var trident = navigator.userAgent.match(/Trident\/(\d+)/);
    var value = {
      actingVersion: 0,
      compatibilityMode: false,
      isIe: false,
      trueVersion: 0
    };

    if (trident) {
      value.isIe = true;
      value.trueVersion = parseInt(trident[1], 10) + 4;
    }

    if (msie) {
      value.isIe = true;
      value.actingVersion = parseInt(msie[1], 10);
    } else {
      value.actingVersion = value.trueVersion;
    }

    if (value.isIe && value.trueVersion > 0 && value.actingVersion > 0) {
      value.compatibilityMode = value.trueVersion !== value.actingVersion;
    }

    return value;
  }
  function showError (div) {
    if (typeof div === 'string') {
      div = document.getElementById(div);
    }

    div.innerHTML = '' +
      '<div style="padding:15px;">' +
        '<p>OuterSpatial interactive maps do not support Internet Explorer versions 7, 8, or 9. We recommend upgrading to a <a href="http://outdatedbrowser.com/" target="_blank">modern browser</a>, like the latest version of Internet Explorer, Google Chrome, or Mozilla Firefox.</p>' +
        '<p>If you are using Internet Explorer 10 or later, make sure "Enterprise Mode" and <a href="https://support.google.com/mail/answer/181472?hl=en" target="_blank">"Compatibility View"</a> are turned off.</p>' +
      '</div>' +
    '';
  }

  ie = IeVersion();

  if (ie.isIe && (ie.actingVersion < 10 || ie.trueVersion < 10)) {
    if (window.OuterSpatial.constructor === Array) {
      for (var i = 0; i < window.OuterSpatial.length; i++) {
        showError(window.OuterSpatial[i].div);
      }
    } else {
      showError(window.OuterSpatial.div);
    }
  } else {
    window.OuterSpatial = {
      config: window.OuterSpatial.config || window.OuterSpatial
    };

    (function () {
      var dev = false;
      var head = document.head || document.getElementsByTagName('head')[0];
      var loaderCss = '' +
        '.centeredLoader {' +
          '-ms-flex-pack: center;' +
          '-ms-flex-align: center;' +
          'align-items: center;' +
          'display: flex;' +
          'height: 100%;' +
          'justify-content: center;' +
        '}' +
        '.centeredLoader-loader {' +
          'border-radius: 50%;' +
          'width: 10em;' +
          'height: 10em;' +
          'margin: 60px 0;' +
          'font-size: 4px;' +
          'position: relative;' +
          'text-indent: -9999em;' +
          'border-top: 1.1em solid rgba(0, 0, 0, 0.2);' +
          'border-right: 1.1em solid rgba(0, 0, 0, 0.2);' +
          'border-bottom: 1.1em solid rgba(0, 0, 0, 0.2);' +
          'border-left: 1.1em solid rgba(0, 0, 0, 0.5);' +
          'transform: translateZ(0);' +
          'animation: load8 1.1s infinite linear;' +
        '}' +
        '@keyframes load8 {' +
          '0% { transform: rotate(0deg); }' +
          '100% { transform: rotate(360deg); }' +
        '}' +
      '';
      var script = document.createElement('script');
      var scripts = document.getElementsByTagName('script');
      var style = document.createElement('style');
      var path;

      function build (config) {
        function step () {
          var divLoading;

          function destroyLoader () {
            divLoading.parentNode.removeChild(divLoading);
            delete config.spinner;
            setTimeout(function () {
              config.L.invalidateSize();
            }, 50);
          }

          if (typeof config.div === 'string') {
            config.div = document.getElementById(config.div);
          }

          divLoading = L.outerspatial.util._.getChildElementsByClassName(config.div, 'outerspatial-loading')[0];
          config.L = L.outerspatial.map(config);

          if (config.hooks && config.hooks.init) {
            config.hooks.init(destroyLoader);
          } else {
            destroyLoader();
          }
        }

        if (window.OuterSpatial.config.plugins) {
          var plugins = window.OuterSpatial.config.plugins;
          var count = plugins.length;
          var done = 0;
          var total = 0;
          var i;
          var interval;
          var plugin;

          for (i = 0; i < count; i++) {
            plugin = plugins[i];

            if (plugin.css) {
              total++;
            }

            if (plugin.js) {
              total++;
            }
          }

          for (i = 0; i < count; i++) {
            plugin = plugins[i];

            if (plugin.css) {
              L.outerspatial.util._.appendCssFile(plugin.css, function () {
                done++;
              });
            }

            if (plugin.js) {
              L.outerspatial.util._.appendJsFile(plugin.js, function () {
                done++;
              });
            }
          }

          interval = setInterval(function () {
            if (done === total) {
              clearInterval(interval);

              if (config.hooks && config.hooks.preinit) {
                config.hooks.preinit(step);
              } else {
                step();
              }
            }
          }, 100);
        } else {
          if (config.hooks && config.hooks.preinit) {
            config.hooks.preinit(step);
          } else {
            step();
          }
        }
      }
      function callback () {
        L.outerspatial.util._.appendCssFile(path + 'outerspatial' + (dev ? '' : '.min') + '.css', function () {
          if (window.OuterSpatial.config.constructor === Array) {
            for (var i = 0; i < window.OuterSpatial.config.length; i++) {
              build(window.OuterSpatial.config[i]);
            }
          } else {
            build(window.OuterSpatial.config);
          }
        });
      }
      function showLoader (div) {
        var mask = document.createElement('div');

        mask.className = 'outerspatial-loading';
        mask.style.cssText = 'background-color:#f2f2f2;bottom:0;height:100%;left:0;position:absolute;right:0;top:0;width:100%;z-index:99999;';

        if (typeof div === 'string') {
          div = document.getElementById(div);
        }

        mask.innerHTML = '' +
          '<div class="centeredLoader">' +
            '<div class="centeredLoader-loader"></div>' +
          '</div>';
        div.appendChild(mask);

        return mask;
      }

      style.type = 'text/css';

      if (style.styleSheet) {
        style.styleSheet.cssText = loaderCss;
      } else {
        style.appendChild(document.createTextNode(loaderCss));
      }

      head.appendChild(style);

      if (window.OuterSpatial.config instanceof Array) {
        for (var i = 0; i < window.OuterSpatial.config.length; i++) {
          window.OuterSpatial.config[i].spinner = showLoader(window.OuterSpatial.config[i].div);
        }
      } else {
        window.OuterSpatial.config.spinner = showLoader(window.OuterSpatial.config.div);
      }

      for (var j = 0; j < scripts.length; j++) {
        var src = scripts[j].src;

        if (typeof src === 'string') {
          if (src.indexOf('outerspatial-bootstrap.js') !== -1) {
            dev = true;
            path = src.replace('outerspatial-bootstrap.js', '');
            script.src = path + 'outerspatial.js';
            break;
          } else if (src.indexOf('outerspatial-bootstrap.min.js') !== -1) {
            path = src.replace('outerspatial-bootstrap.min.js', '');
            script.src = path + 'outerspatial.min.js';
            break;
          }
        }
      }

      if (window.attachEvent && document.all) {
        script.onreadystatechange = function () {
          if (this.readyState === 'complete' || this.readyState === 'loaded') {
            callback();
          }
        };
      } else {
        script.onload = callback;
      }

      document.body.appendChild(script);
    })();
  }
})();
