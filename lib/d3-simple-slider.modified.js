// https://github.com/johnwalley/d3-simple-slider v1.10.4 Copyright 2021 John Walley
! function(t, e) {
    "object" == typeof exports && "undefined" != typeof module ? e(exports, require("d3-transition"), require("d3-axis"), require("d3-array"), require("d3-scale"), require("d3-selection"), require("d3-dispatch"), require("d3-drag"), require("d3-ease")) : "function" == typeof define && define.amd ? define(["exports", "d3-transition", "d3-axis", "d3-array", "d3-scale", "d3-selection", "d3-dispatch", "d3-drag", "d3-ease"], e) : e((t = "undefined" != typeof globalThis ? globalThis : t || self).d3 = t.d3 || {}, t.d3, t.d3, t.d3, t.d3, t.d3, t.d3, t.d3, t.d3)
}(this, (function(t, e, a, n, r, l, i, u, c) {
    "use strict";

    function o(t) {
        if (t && t.__esModule) return t;
        var e = Object.create(null);
        return t && Object.keys(t).forEach((function(a) {
            if ("default" !== a) {
                var n = Object.getOwnPropertyDescriptor(t, a);
                Object.defineProperty(e, a, n.get ? n : {
                    enumerable: !0,
                    get: function() {
                        return t[a]
                    }
                })
            }
        })), e.default = t, Object.freeze(e)
    }
    var s = o(l),
        d = "event";

    function f(t) {
        var e = !(d in s);
        return function(a, n) {
            e ? t.call(this, a, n) : t.call(this, s.event, a)
        }
    }

    function h(t) {
        return "translate(" + t + ",0)"
    }

    function m(t) {
        return "translate(0," + t + ")"
    }

    function g(t, e) {
        e = void 0 !== e ? e.copy() : null;
        var o = [0],
            s = [0],
            d = [0, 10],
            g = 100,
            p = 100,
            v = !0,
            x = "M-5.5,-5.5v10l6,5.5l6,-5.5v-10z",
            k = null,
            y = null,
            b = 3,
            w = null,
            A = null,
            M = null,
            D = null,
            O = null,
            q = i.dispatch("onchange", "start", "end", "drag"),
            j = null,
            z = null,
            P = null,
            F = 1 === t || 4 === t ? -1 : 1,
            L = 4 === t || 2 === t ? -1 : 1,
            T = 4 === t || 2 === t ? "y" : "x",
            V = 4 === t || 2 === t ? "x" : "y",
            E = 1 === t || 3 === t ? h : m,
            R = 1 === t || 3 === t ? m : h,
            _ = null;
        switch (t) {
            case 1:
                _ = a.axisTop;
                break;
            case 2:
                _ = a.axisRight;
                break;
            case 3:
                _ = a.axisBottom;
                break;
            case 4:
                _ = a.axisLeft
        }
        var B = null,
            H = null;

        function Q(a) {
            j = a.selection ? a.selection() : a, e || (e = (e = d[0] instanceof Date ? r.scaleTime() : r.scaleLinear()).domain(d).range(1 === t || 3 === t ? [0, g] : [p, 0]).clamp(!0)), z = r.scaleLinear().range(e.range()).domain(e.range()).clamp(!0), o = o.map((function(t) {
                return r.scaleLinear().range(d).domain(d).clamp(!0)(t)
            })), A = A || e.tickFormat(), D = D || A || e.tickFormat(), j.selectAll(".axis").data([null]).enter().append("g").attr("transform", R(7 * F)).attr("class", "axis");
            var i = j.selectAll(".slider").data([null]),
                c = i.enter().append("g").attr("class", "slider").attr("cursor", 1 === t || 3 === t ? "ew-resize" : "ns-resize").call(u.drag().on("start", f((function(a) {
                    l.select(this).classed("active", !0);
                    var r = z(3 === t || 1 === t ? a.x : a.y);
                    P = o[0] === d[0] && o[1] === d[0] ? 1 : o[0] === d[1] && o[1] === d[1] ? 0 : n.scan(o.map((function(t) {
                        return Math.abs(t - C(e.invert(r)))
                    })));
                    var u = o.map((function(t, a) {
                        return a === P ? C(e.invert(r)) : t
                    }));
                    I(u), q.call("start", i, 1 === u.length ? u[0] : u), G(u, !0)
                }))).on("drag", f((function(e) {
                    var a = h(z(3 === t || 1 === t ? e.x : e.y));
                    I(a), q.call("drag", i, 1 === a.length ? a[0] : a), G(a, !0)
                }))).on("end", f((function(e) {
                    l.select(this).classed("active", !1);
                    var a = h(z(3 === t || 1 === t ? e.x : e.y));
                    I(a), q.call("end", i, 1 === a.length ? a[0] : a), G(a, !0), P = null
                }))));
            c.append("line").attr("class", "track").attr(T + "1", e.range()[0] - 8 * L).attr("stroke", "#bbb").attr("stroke-width", 6).attr("stroke-linecap", "round"), c.append("line").attr("class", "track-inset").attr(T + "1", e.range()[0] - 8 * L).attr("stroke", "#eee").attr("stroke-width", 4).attr("stroke-linecap", "round"), O && c.append("line").attr("class", "track-fill").attr(T + "1", 1 === o.length ? e.range()[0] - 8 * L : e(o[0])).attr("stroke", O).attr("stroke-width", 4).attr("stroke-linecap", "round"), c.append("line").attr("class", "track-overlay").attr(T + "1", e.range()[0] - 8 * L).attr("stroke", "transparent").attr("stroke-width", 40).attr("stroke-linecap", "round").merge(i.select(".track-overlay"));
            var s = c.selectAll(".parameter-value").data(o.map((function(t, e) {
                return {
                    value: t,
                    index: e
                }
            }))).enter().append("g").attr("class", "parameter-value").attr("transform", (function(t) {
                return E(e(t.value))
            })).attr("font-family", "sans-serif").attr("text-anchor", 2 === t ? "start" : 4 === t ? "end" : "middle");

            function h(t) {
                var a = C(e.invert(t));
                return o.map((function(t, e) {
                    return 2 === o.length ? e === P ? 0 === P ? Math.min(a, C(o[1])) : Math.max(a, C(o[0])) : t : e === P ? a : t
                }))
            }
            s.append("path").attr("transform", "rotate(" + 90 * (t + 1) + ")").attr("d", x).attr("class", "handle").attr("aria-label", "handle").attr("aria-valuemax", d[1]).attr("aria-valuemin", d[0]).attr("aria-valuenow", (function(t) {
                return t.value
            })).attr("aria-orientation", 4 === t || 2 === t ? "vertical" : "horizontal").attr("focusable", "true").attr("tabindex", 0).attr("fill", "white").attr("stroke", "#777").on("keydown", f((function(t, e) {
                var a = k || (d[1] - d[0]) / 100,
                    r = w ? n.scan(w.map((function(t) {
                        return Math.abs(o[e.index] - t)
                    }))) : null;

                function l(t) {
                    return o.map((function(a, n) {
                        return 2 === o.length ? n === e.index ? 0 === e.index ? Math.min(t, C(o[1])) : Math.max(t, C(o[0])) : a : n === e.index ? t : a
                    }))
                }
                switch (t.key) {
                    case "ArrowLeft":
                    case "ArrowDown":
                        w ? Q.value(l(w[Math.max(0, r - 1)])) : Q.value(l(+o[e.index] - a)), t.preventDefault();
                        break;
                    case "PageDown":
                        w ? Q.value(l(w[Math.max(0, r - 2)])) : Q.value(l(+o[e.index] - 2 * a)), t.preventDefault();
                        break;
                    case "ArrowRight":
                    case "ArrowUp":
                        w ? Q.value(l(w[Math.min(w.length - 1, r + 1)])) : Q.value(l(+o[e.index] + a)), t.preventDefault();
                        break;
                    case "PageUp":
                        w ? Q.value(l(w[Math.min(w.length - 1, r + 2)])) : Q.value(l(+o[e.index] + 2 * a)), t.preventDefault();
                        break;
                    case "Home":
                        Q.value(l(d[0])), t.preventDefault();
                        break;
                    case "End":
                        Q.value(l(d[1])), t.preventDefault()
                }
            }))), v && s.append("text").attr("font-size", 10).attr(V, F * (24 + b)).attr("dy", 1 === t ? "0em" : 3 === t ? ".71em" : ".32em").attr("transform", o.length > 1 ? "translate(0,0)" : null).text((function(t, e) {
                return D(o[e])
            })), a.select(".track").attr(T + "2", e.range()[1] + 8 * L), a.select(".track-inset").attr(T + "2", e.range()[1] + 8 * L), O && a.select(".track-fill").attr(T + "2", 1 === o.length ? e(o[0]) : e(o[1])), a.select(".track-overlay").attr(T + "2", e.range()[1] + 8 * L), a.select(".axis").call(_(e).tickFormat(A).ticks(M).tickValues(y).tickPadding(b)), j.select(".axis").select(".domain").remove(), a.select(".axis").attr("transform", R(7 * F)), a.selectAll(".axis text").attr("fill", "#aaa").attr(V, F * (17 + b)).attr("dy", 1 === t ? "0em" : 3 === t ? ".71em" : ".32em").attr("text-anchor", 2 === t ? "start" : 4 === t ? "end" : "middle"), a.selectAll(".axis line").attr("stroke", "#aaa"), a.selectAll(".parameter-value").attr("transform", (function(t) {
                return E(e(t.value))
            })), U(), H = j.selectAll(".parameter-value text"), B = j.select(".track-fill")
        }

        function U() {
            if (j && v) {
                var t = [];
                if (o.forEach((function(e) {
                        var a = [];
                        j.selectAll(".axis .tick").each((function(t) {
                            a.push(Math.abs(t - e))
                        })), t.push(n.scan(a))
                    })), j.selectAll(".axis .tick text").attr("opacity", (function(e, a) {
                        return ~t.indexOf(a) ? 0 : 1
                    })), H && o.length > 1) {
                    var e, a, r = [],
                        l = [];
                    H.nodes().forEach((function(t, n) {
                        e = t.getBoundingClientRect(), a = t.getAttribute("transform").split(/[()]/)[1].split(",")["x" === T ? 0 : 1], r[n] = e[T] - parseFloat(a), l[n] = e["x" === T ? "width" : "height"]
                    })), "x" === T ? (a = Math.max(0, (r[0] + l[0] - r[1]) / 2), H.attr("transform", (function(t, e) {
                        return "translate(" + (1 === e ? a : -a) + ",0)"
                    }))) : (a = Math.max(0, (r[1] + l[1] - r[0]) / 2), H.attr("transform", (function(t, e) {
                        return "translate(0," + (1 === e ? -a : a) + ")"
                    })))
                }
            }
        }

        function C(t) {
            if (w) {
                var e = n.scan(w.map((function(e) {
                    return Math.abs(t - e)
                })));
                return w[e]
            }
            if (k) {
                var a = (t - d[0]) % k,
                    r = t - a;
                return 2 * a > k && (r += k), t instanceof Date ? new Date(r) : r
            }
            return t
        }

        function G(t, e) {
            (o[0] !== t[0] || o.length > 1 && o[1] !== t[1]) && (o = t, e && q.call("onchange", Q, 1 === t.length ? t[0] : t), U())
        }

        function I(t, a) {
            j && ((a = void 0 !== a && a) ? (j.selectAll(".parameter-value").data(t.map((function(t, e) {
                return {
                    value: t,
                    index: e
                }
            }))).transition().ease(c.easeQuadOut).duration(200).attr("transform", (function(t) {
                return E(e(t.value))
            })).select(".handle").attr("aria-valuenow", (function(t) {
                return t.value
            })), O && B.transition().ease(c.easeQuadOut).duration(200).attr(T + "1", 1 === o.length ? e.range()[0] - 8 * F : e(t[0])).attr(T + "2", 1 === o.length ? e(t[0]) : e(t[1]))) : (j.selectAll(".parameter-value").data(t.map((function(t, e) {
                return {
                    value: t,
                    index: e
                }
            }))).attr("transform", (function(t) {
                return E(e(t.value))
            })).select(".handle").attr("aria-valuenow", (function(t) {
                return t.value
            })), O && B.attr(T + "1", 1 === o.length ? e.range()[0] - 8 * F : e(t[0])).attr(T + "2", 1 === o.length ? e(t[0]) : e(t[1]))), v && H.text((function(e, a) {
                return D(t[a])
            })))
        }
        return e && (d = [n.min(e.domain()), n.max(e.domain())], 1 === t || 3 === t ? g = n.max(e.range()) - n.min(e.range()) : p = n.max(e.range()) - n.min(e.range()), e = e.clamp(!0)), Q.min = function(t) {
            return arguments.length ? (d[0] = t, e && e.domain(d), Q) : d[0]
        }, Q.max = function(t) {
            return arguments.length ? (d[1] = t, e && e.domain(d), Q) : d[1]
        }, Q.domain = function(t) {
            return arguments.length ? (d = t, e && e.domain(d), Q) : d
        }, Q.width = function(t) {
            return arguments.length ? (g = t, e && e.range([e.range()[0], e.range()[0] + g]), Q) : g
        }, Q.height = function(t) {
            return arguments.length ? (p = t, e && e.range([e.range()[0], e.range()[0] + p]), Q) : p
        }, Q.tickFormat = function(t) {
            return arguments.length ? (A = t, Q) : A
        }, Q.displayFormat = function(t) {
            return arguments.length ? (D = t, Q) : D
        }, Q.ticks = function(t) {
            return arguments.length ? (M = t, Q) : M
        }, Q.value = function(t) {
            if (!arguments.length) return 1 === o.length ? o[0] : o;
            var a = Array.isArray(t) ? t : [t];
            if (a.sort((function(t, e) {
                    return t - e
                })), e) {
                var n = a.map(e).map(z),
                    r = n.map(e.invert).map(C);
                I(r, !0), G(r, !0)
            } else o = a;
            return Q
        }, Q.silentValue = function(t) {
            if (!arguments.length) return 1 === o.length ? o[0] : o;
            var a = Array.isArray(t) ? t : [t];
            if (a.sort((function(t, e) {
                    return t - e
                })), e) {
                var n = a.map(e).map(z),
                    r = n.map(e.invert).map(C);
                I(r, !1), G(r, !1)
            } else o = a;
            return Q
        }, Q.default = function(t) {
            if (!arguments.length) return 1 === s.length ? s[0] : s;
            var e = Array.isArray(t) ? t : [t];
            return e.sort((function(t, e) {
                return t - e
            })), s = e, o = e, Q
        }, Q.step = function(t) {
            return arguments.length ? (k = t, Q) : k
        }, Q.tickValues = function(t) {
            return arguments.length ? (y = t, Q) : y
        }, Q.tickPadding = function(t) {
            return arguments.length ? (b = t, Q) : b
        }, Q.marks = function(t) {
            return arguments.length ? (w = t, Q) : w
        }, Q.handle = function(t) {
            return arguments.length ? (x = t, Q) : x
        }, Q.displayValue = function(t) {
            return arguments.length ? (v = t, Q) : v
        }, Q.fill = function(t) {
            return arguments.length ? (O = t, Q) : O
        }, Q.on = function() {
            var t = q.on.apply(q, arguments);
            return t === q ? Q : t
        }, Q
    }
    t.sliderBottom = function(t) {
        return g(3, t)
    }, t.sliderHorizontal = function(t) {
        return g(3, t)
    }, t.sliderLeft = function(t) {
        return g(4, t)
    }, t.sliderRight = function(t) {
        return g(2, t)
    }, t.sliderTop = function(t) {
        return g(1, t)
    }, t.sliderVertical = function(t) {
        return g(4, t)
    }, Object.defineProperty(t, "__esModule", {
        value: !0
    })
}));