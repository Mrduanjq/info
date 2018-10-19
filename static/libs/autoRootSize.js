!function(e, t) {
    function i() {
        for (var e = navigator.userAgent, t = ["Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod"], i = !0, n = 0; t.length > n; n++)
            if (e.indexOf(t[n]) > 0) {
                i = !1;
                break
            }
        return i
    }
    function n() {
        var t = l.getBoundingClientRect().width;
        i() && 2047 > t && (t = u);
        var n = 100 * t / u;
        l.style.fontSize = n + "px",
        s.rem = e.rem = n
    }
    function r() {
        var e = document
          , t = e.querySelector(".wrap");
        if (e && t) {
            if (t.clientWidth != window.innerWidth) {
                var i = window.innerWidth / t.clientWidth;
                window.rem = i * window.rem,
                e.documentElement.style.fontSize = window.rem + "px"
            }
            parseFloat(e.documentElement.style.fontSize) != window.rem && (e.documentElement.style.fontSize = window.rem + "px")
        }
    }
    e.ti_start = (new Date).getTime();
    var a, o = e.document, l = o.documentElement, d = o.querySelector('meta[name="viewport"]'), m = (o.querySelector('meta[name="flexible"]'),
    0), c = 0, s = t.flexible || (t.flexible = {}), u = o.querySelector('meta[name="W_design"]') ? o.querySelector('meta[name="W_design"]').getAttribute("content") : 640;
    if (d) {
        var w = d.getAttribute("content").match(/initial\-scale=([\d\.]+)/);
        w && (c = parseFloat(w[1]),
        m = parseInt(1 / c)),
        d.setAttribute("content", "width=device-width,initial-scale=" + 1 / e.devicePixelRatio + ", maximum-scale=" + 1 / e.devicePixelRatio + ", minimum-scale=" + 1 / e.devicePixelRatio + ", user-scalable=no")
    } else
        d = o.createElement("meta"),
        d.setAttribute("name", "viewport"),
        d.setAttribute("content", "width=device-width,initial-scale=" + 1 / e.devicePixelRatio + ",maximum-scale=" + 1 / e.devicePixelRatio + ", minimum-scale=" + 1 / e.devicePixelRatio + ",user-scalable=no"),
        l.firstElementChild.appendChild(d);
    e.addEventListener("resize", function() {
        clearTimeout(a),
        a = setTimeout(n, 300)
    }, !1),
    e.addEventListener("pageshow", function(e) {
        e.persisted && (clearTimeout(a),
        a = setTimeout(n, 300))
    }, !1),
    "complete" === o.readyState ? o.body.style.fontSize = 12 * m + "px" : o.addEventListener("DOMContentLoaded", function() {
        o.body.style.fontSize = 12 * m + "px"
    }, !1),
    n(),
    s.dpr = e.dpr = m,
    s.refreshRem = n,
    s.rem2px = function(e) {
        var t = parseFloat(e) * this.rem;
        return "string" == typeof e && e.match(/rem$/) && (t += "px"),
        t
    }
    ,
    s.px2rem = function(e) {
        var t = parseFloat(e) / this.rem;
        return "string" == typeof e && e.match(/px$/) && (t += "rem"),
        t
    }
    ;
    var f = setInterval(r, 10);
    setTimeout(function() {
        clearInterval(f)
    }, 3e3)
}(window, window.lib || (window.lib = {}));
