/* global L */

var OuterSpatial = OuterSpatial || null;
var ie;

if (!OuterSpatial) {
  throw new Error('The OuterSpatial object is required.');
}

if (typeof OuterSpatial !== 'object') {
  throw new Error('The OuterSpatial variable cannot be a ' + typeof OuterSpatial + '.');
}

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
      '<p>National Park Service maps do not support Internet Explorer versions 7, 8, or 9. We recommend upgrading to a <a href="http://outdatedbrowser.com/" target="_blank">modern browser</a>, like the latest version of Internet Explorer, Google Chrome, or Mozilla Firefox.</p>' +
      '<p>If you are using Internet Explorer 10 or later, make sure "Enterprise Mode" and <a href="https://support.google.com/mail/answer/181472?hl=en" target="_blank">"Compatibility View"</a> are turned off.</p>' +
    '</div>' +
  '';
}

ie = IeVersion();

if (ie.isIe && (ie.actingVersion < 10 || ie.trueVersion < 10)) {
  if (OuterSpatial.constructor === Array) {
    for (var i = 0; i < OuterSpatial.length; i++) {
      showError(OuterSpatial[i].div);
    }
  } else {
    showError(OuterSpatial.div);
  }
} else {
  OuterSpatial = {
    config: OuterSpatial.config || OuterSpatial
  };

  (function () {
    /**
     * Spin.js - http://fgnass.github.io/spin.js
     * 20150311: Removed require.js support, as it is not needed and it was causing conflicts.
     */
    (function(t,e){t.Spinner=e()})(this,function(){"use strict";var t=["webkit","Moz","ms","O"],e={},i;function o(t,e){var i=document.createElement(t||"div"),o;for(o in e)i[o]=e[o];return i}function n(t){for(var e=1,i=arguments.length;e<i;e++)t.appendChild(arguments[e]);return t}var r=function(){var t=o("style",{type:"text/css"});n(document.getElementsByTagName("head")[0],t);return t.sheet||t.styleSheet}();function s(t,o,n,s){var a=["opacity",o,~~(t*100),n,s].join("-"),f=.01+n/s*100,l=Math.max(1-(1-t)/o*(100-f),t),u=i.substring(0,i.indexOf("Animation")).toLowerCase(),d=u&&"-"+u+"-"||"";if(!e[a]){r.insertRule("@"+d+"keyframes "+a+"{"+"0%{opacity:"+l+"}"+f+"%{opacity:"+t+"}"+(f+.01)+"%{opacity:1}"+(f+o)%100+"%{opacity:"+t+"}"+"100%{opacity:"+l+"}"+"}",r.cssRules.length);e[a]=1}return a}function a(e,i){var o=e.style,n,r;i=i.charAt(0).toUpperCase()+i.slice(1);for(r=0;r<t.length;r++){n=t[r]+i;if(o[n]!==undefined)return n}if(o[i]!==undefined)return i}function f(t,e){for(var i in e)t.style[a(t,i)||i]=e[i];return t}function l(t){for(var e=1;e<arguments.length;e++){var i=arguments[e];for(var o in i)if(t[o]===undefined)t[o]=i[o]}return t}function u(t){var e={x:t.offsetLeft,y:t.offsetTop};while(t=t.offsetParent)e.x+=t.offsetLeft,e.y+=t.offsetTop;return e}function d(t,e){return typeof t=="string"?t:t[e%t.length]}var p={lines:12,length:7,width:5,radius:10,rotate:0,corners:1,color:"#000",direction:1,speed:1,trail:100,opacity:1/4,fps:20,zIndex:2e9,className:"spinner",top:"auto",left:"auto",position:"relative"};function c(t){if(typeof this=="undefined")return new c(t);this.opts=l(t||{},c.defaults,p)}c.defaults={};l(c.prototype,{spin:function(t){this.stop();var e=this,n=e.opts,r=e.el=f(o(0,{className:n.className}),{position:n.position,width:0,zIndex:n.zIndex}),s=n.radius+n.length+n.width,a,l;if(t){t.insertBefore(r,t.firstChild||null);l=u(t);a=u(r);f(r,{left:(n.left=="auto"?l.x-a.x+(t.offsetWidth>>1):parseInt(n.left,10)+s)+"px",top:(n.top=="auto"?l.y-a.y+(t.offsetHeight>>1):parseInt(n.top,10)+s)+"px"})}r.setAttribute("role","progressbar");e.lines(r,e.opts);if(!i){var d=0,p=(n.lines-1)*(1-n.direction)/2,c,h=n.fps,m=h/n.speed,y=(1-n.opacity)/(m*n.trail/100),g=m/n.lines;(function v(){d++;for(var t=0;t<n.lines;t++){c=Math.max(1-(d+(n.lines-t)*g)%m*y,n.opacity);e.opacity(r,t*n.direction+p,c,n)}e.timeout=e.el&&setTimeout(v,~~(1e3/h))})()}return e},stop:function(){var t=this.el;if(t){clearTimeout(this.timeout);if(t.parentNode)t.parentNode.removeChild(t);this.el=undefined}return this},lines:function(t,e){var r=0,a=(e.lines-1)*(1-e.direction)/2,l;function u(t,i){return f(o(),{position:"absolute",width:e.length+e.width+"px",height:e.width+"px",background:t,boxShadow:i,transformOrigin:"left",transform:"rotate("+~~(360/e.lines*r+e.rotate)+"deg) translate("+e.radius+"px"+",0)",borderRadius:(e.corners*e.width>>1)+"px"})}for(;r<e.lines;r++){l=f(o(),{position:"absolute",top:1+~(e.width/2)+"px",transform:e.hwaccel?"translate3d(0,0,0)":"",opacity:e.opacity,animation:i&&s(e.opacity,e.trail,a+r*e.direction,e.lines)+" "+1/e.speed+"s linear infinite"});if(e.shadow)n(l,f(u("#000","0 0 4px "+"#000"),{top:2+"px"}));n(t,n(l,u(d(e.color,r),"0 0 1px rgba(0,0,0,.1)")))}return t},opacity:function(t,e,i){if(e<t.childNodes.length)t.childNodes[e].style.opacity=i}});function h(){function t(t,e){return o("<"+t+' xmlns="urn:schemas-microsoft.com:vml" class="spin-vml">',e)}r.addRule(".spin-vml","behavior:url(#default#VML)");c.prototype.lines=function(e,i){var o=i.length+i.width,r=2*o;function s(){return f(t("group",{coordsize:r+" "+r,coordorigin:-o+" "+-o}),{width:r,height:r})}var a=-(i.width+i.length)*2+"px",l=f(s(),{position:"absolute",top:a,left:a}),u;function p(e,r,a){n(l,n(f(s(),{rotation:360/i.lines*e+"deg",left:~~r}),n(f(t("roundrect",{arcsize:i.corners}),{width:o,height:i.width,left:i.radius,top:-i.width>>1,filter:a}),t("fill",{color:d(i.color,e),opacity:i.opacity}),t("stroke",{opacity:0}))))}if(i.shadow)for(u=1;u<=i.lines;u++)p(u,-2,"progid:DXImageTransform.Microsoft.Blur(pixelradius=2,makeshadow=1,shadowopacity=.3)");for(u=1;u<=i.lines;u++)p(u);return n(e,l)};c.prototype.opacity=function(t,e,i,o){var n=t.firstChild;o=o.shadow&&o.lines||0;if(n&&e+o<n.childNodes.length){n=n.childNodes[e+o];n=n&&n.firstChild;n=n&&n.firstChild;if(n)n.opacity=i}}}var m=f(o("group"),{behavior:"url(#default#VML)"});if(!a(m,"transform")&&m.adj)h();else i=a(m,"animation");return c});

    var dev = false;
    var script = document.createElement('script');
    var scripts = document.getElementsByTagName('script');
    var path;

    function build (config) {
      function step () {
        var divLoading;

        function destroyLoader () {
          divLoading.parentNode.removeChild(divLoading);
          config.spinner.stop();
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

      if (OuterSpatial.config.plugins) {
        var plugins = OuterSpatial.config.plugins;
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
        if (OuterSpatial.config.constructor === Array) {
          for (var i = 0; i < OuterSpatial.config.length; i++) {
            build(OuterSpatial.config[i]);
          }
        } else {
          build(OuterSpatial.config);
        }
      });
    }
    function showLoader (div) {
      var mask = document.createElement('div');

      mask.className = 'outerspatial-loading';
      mask.style.cssText = 'background-color:#f9f7f1;bottom:0;height:100%;left:0;position:absolute;right:0;top:0;width:100%;z-index:99999;';

      if (typeof div === 'string') {
        div = document.getElementById(div);
      }

      div.appendChild(mask);

      return new Spinner({
        className: 'outerspatial-loading-spinner',
        color: '#454545',
        corners: 1,
        direction: 1,
        hwaccel: true,
        left: 'auto',
        length: 15,
        lines: 13,
        radius: 15,
        rotate: 0,
        shadow: false,
        speed: 1,
        top: 'auto',
        trail: 60,
        width: 5,
        zIndex: 2e9
      }).spin(mask);
    }

    if (OuterSpatial.config instanceof Array) {
      for (var i = 0; i < OuterSpatial.config.length; i++) {
        OuterSpatial.config[i].spinner = showLoader(OuterSpatial.config[i].div);
      }
    } else {
      OuterSpatial.config.spinner = showLoader(OuterSpatial.config.div);
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
