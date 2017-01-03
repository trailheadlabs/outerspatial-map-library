module.exports = function (i, j) {
  function c () {
    g--;
    g === 0 && j && j();
  }
  function f (a) {
    try {
      document.styleSheets[a].cssRules ? c() : document.styleSheets[a].rules && document.styleSheets[a].rules.length ? c() : setTimeout(function () {
        f(a);
      }, 250);
    } catch (b) {
      setTimeout(function () {
        f(a);
      }, 250);
    }
  }
  function k (a) {
    a = a.toLowerCase();
    var b = a.indexOf('js');
    a = a.indexOf('css');
    return b === -1 && a === -1 ? !1 : b > a ? 'js' : 'css';
  }
  function m (a) {
    var b = document.createElement('link');
    b.href = a;
    b.rel = 'stylesheet';
    b.type = 'text/css';
    b.onload = c;
    b.onreadystatechange = function () {
      (this.readyState === 'loaded' || this.readyState === 'complete') && c();
    };
    document.getElementsByTagName('head')[0].appendChild(b);
  }

  for (var g = 0, d, l = document.styleSheets.length - 1, h = 0; h < i.length; h++) {
    if (g++, d = i[h], k(d) === 'css' && (m(d), l++, !window.opera && navigator.userAgent.indexOf('MSIE') === -1 && f(l)), k(d) === 'js') {
      var e = document.createElement('script');
      e.onload = c;
      e.src = d;
      e.type = 'text/javascript';
      document.getElementsByTagName('head')[0].appendChild(e);
    }
  }
};
