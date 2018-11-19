(function() {
    var g = function(A, y, v) {
            var x, z, w, u = A.length;
            if ("function" == typeof y) {
                for (w = 0; w < u; w++) {
                    z = A[w];
                    x = y.call(v || A, z, w);
                    if (x === false) {
                        break
                    }
                }
            }
            return A
        };
    var r = function(u) {
            return String(u).replace(new RegExp("(^[\\s\\t\\xa0\\u3000]+)|([\\u3000\\xa0\\s\\t]+\x24)", "g"), "")
        };
    var p = function() {
            if (/msie (\d+\.\d)/i.test(navigator.userAgent)) {
                return (document.documentMode || +RegExp["\x241"]) === 6
            }
        };
    var d = function(v, w) {
            for (var u in w) {
                v.style[u] = w[u]
            }
        };
    var q = function(v, u) {
            v = o(v);
            var x = document,
                w;
            if (x.defaultView && x.defaultView.getComputedStyle) {
                w = x.defaultView.getComputedStyle(v, null);
                if (w) {
                    return w[u] || w.getPropertyValue(u)
                }
            }
            return ""
        };
    var j = function(v, u) {
            var w = v.style[u] || (v.currentStyle ? v.currentStyle[u] : "") || q(v, u)
        };
    var o = function(u) {
            return ("string" == typeof u) ? document.getElementById(u) : u
        };
    var s = document.createElement("div");
    s.style.position = "static";
    d(s, {
        display: 'none',
        position: "static",
        width: "0",
        height: "0",
        border: "none",
        padding: "0",
        margin: "0"
    });
    s.innerHTML = "<div id='trans-tooltip'><div id='tip-left-top'></div><div id='tip-top'></div><div id='tip-right-top'></div><div id='tip-right'></div><div id='tip-right-bottom'></div><div id='tip-bottom'></div><div id='tip-left-bottom'></div><div id='tip-left'></div><div id='trans-content'></div></div><div id='tip-arrow-bottom'></div><div id='tip-arrow-top'></div></div>";
    document.body.appendChild(s);
    // console.log('s', s);
    var e = o("trans-tooltip");
    var i = document.getElementById("trans-content");
    var m = o("tip-arrow-bottom");
    var n = o("tip-arrow-top");
    var l = o("tip-top"),
        k = o("tip-right"),
        f = o("tip-bottom"),
        c = o("tip-left");
    $('#tip-left-top').css("background", "url("+chrome.extension.getURL('imgs/map/tip-left-top.png')+")");
    $('#tip-top').css("background", "url("+chrome.extension.getURL('imgs/map/tip-top.png')+") repeat-x");
    $('#tip-right-top').css("background", "url("+chrome.extension.getURL('imgs/map/tip-right-top.png')+")");
    $('#tip-right').css("background", "url("+chrome.extension.getURL('imgs/map/tip-right.png')+") repeat-y");
    $('#tip-right-bottom').css("background", "url("+chrome.extension.getURL('imgs/map/tip-right-bottom.png')+")");
    $('#tip-bottom').css("background", "url("+chrome.extension.getURL('imgs/map/tip-bottom.png')+") repeat-x");
    $('#tip-left-bottom').css("background", "url("+chrome.extension.getURL('imgs/map/tip-left-bottom.png')+")");
    $('#tip-left').css("background", "url("+chrome.extension.getURL('imgs/map/tip-left.png')+")");
    $('#tip-arrow-bottom').css("background", "url("+chrome.extension.getURL('imgs/map/tip-arrow-bottom.png')+")");
    $('#tip-arrow-top').css("background", "url("+chrome.extension.getURL('imgs/map/tip-arrow-top.png')+")");
    var t = 12;
    var b = function(u) {
            return u.offsetParent ? u.offsetLeft + b(u.offsetParent) : u.offsetLeft
        };
    var a = function(u) {
            return u.offsetParent ? u.offsetTop + a(u.offsetParent) : u.offsetTop
        };
    var h = document.getElementsByTagName("trans");
    var over_count = 0;
    var out_time_out;
    var over = function (E) {
        var srcObj = E.srcElement ? E.srcElement : E.target;
        // console.log('srcObj', srcObj);
        // console.log('srcObj.id', srcObj.id);
        if (srcObj.tagName && srcObj.tagName.toUpperCase() === 'TRANS' && $('#src-reload').text() === '显示原文') {
            d(s, {
                display: 'block'
            });
            clearTimeout(out_time_out);
            // console.log('E', E);
            // console.log('e', e);
            i.innerHTML = '';
            var B = -2;
            var C = {
                top: a(srcObj),
                left: b(srcObj)
            };
            var w = parseInt(srcObj.offsetWidth, 10);
            var I = parseInt(srcObj.offsetHeight, 10);
            var A = Math.max(document.body.scrollTop, document.documentElement.scrollTop);
            var G = Math.max(document.body.scrollLeft, document.documentElement.scrollLeft);
            var v = document.documentElement.clientWidth;
            var y = document.createElement("div");
            // console.log('w', w);
            // console.log('I', I);
            // console.log('A', A);
            // console.log('G', G);
            // console.log('v', v);
            // console.log('y', y);
            // if (/www.amazon.com/i.test(window.location.href)){
            //     var trans = srcObj.getAttribute('data-dst');
            //     console.log('trans', trans);
            //     if (trans == '超级会员'){
            //         srcObj.setAttribute('data-src', 'superVIP');
            //     }
            // }
            y.innerHTML = "<div style='padding:13px 13px;width: 266px;'><p>\u539f\u6587\uff1a</p><div style='width:250px;white-space:normal;'>" 
            +srcObj.getAttribute("data-src").replace("<", "&lt;").replace(">", "&gt;")
            +"</div><div><img src='"+chrome.extension.getURL('imgs/map/logo.png')
            +"' style='height:22px;margin-top:12px;'><a href='#' id='check_in_fanyi_baidu_com_" 
            +over_count+ 
            "' style='float:right;margin-top:21px;margin-right:-10px;text-decoration: none;color: #0066ff;letter-spacing:1px;'>到百度翻译中打开〉</a></div></div>";
            i.appendChild(y);
            d(srcObj, {
                background: "#C4F3BF"
            });
            // console.log('e2', e);
            var z = parseInt(e.offsetHeight, 10);
            var x = parseInt(e.offsetWidth, 10);
            // console.log(z, x);
            // console.log('w', w);
            // console.log('x', x);
            // console.log('v', v);
            // console.log('C.left', C.left);
            if (x >= 500) {
                d(y, {
                    width: "500px",
                    whiteSpace: "normal"
                });
                if (p()) {
                    B += 1
                }
            }
            z = parseInt(e.offsetHeight, 10);
            x = parseInt(e.offsetWidth, 10);
            d(e, {
                visibility: "visible"
            });
            var J, H, F, D;
            F = C.left + w / 2 - 10;
            if (C.top - A < z + t) {
                H = C.top + I + 10;
                D = C.top + I + 1;
                if (/thai.tourismthailand.org/i.test(window.location.href)) {
                    H = C.top + z / 2 + 10;
                    D = C.top + z / 2 + 1;
                }
                d(n, {
                    visibility: "visible"
                });
                d(n, {
                    left: F + "px",
                    top: D - 1 + "px"
                })
            } else {
                H = C.top - z - 10;
                D = C.top - t + B;
                if (p()) {
                    D -= 1
                }
                d(m, {
                    visibility: "visible"
                });
                d(m, {
                    left: F + "px",
                    top: D + "px"
                })
            }
            if (C.left < G) {
                J = G + 5
            } else {
                if (x / 2 > (C.left + w / 2)) {
                    J = 5
                } else {
                    if ((x / 2) > (v - C.left - w / 2)) {
                        J = v - x - 5
                    } else {
                        J = C.left + w / 2 - x / 2
                    }
                }
            }
            // console.log('J', J);
            d(e, {
                left: J + "px",
                top: H + "px"
            });
            d(l, {
                width: x - 4 + "px"
            });
            d(k, {
                height: z - 9 + "px"
            });
            d(f, {
                width: x - 11 + "px"
            });
            d(c, {
                height: z - 2 + "px"
            });
        }
        
        $('#check_in_fanyi_baidu_com_'+over_count).on("click", function(){
            chrome.runtime.sendMessage({category: 'guide', action: 'guide_fanyi_tip',opid: 3}, function(response) {
            });
            window.open("http://fanyi.baidu.com/#auto/zh/"+srcObj.getAttribute("data-src"));
        });
        over_count += 1;
    };
    var out = function (v) {
        var srcObj = v.srcElement ? v.srcElement : v.target;
        if (srcObj.tagName && srcObj.tagName.toUpperCase() === 'TRANS') {
            d(srcObj, {
                background: "transparent"
            });
            out_time_out = setTimeout(function() {
                d(s, {
                    display: 'none'
                });
                d(e, {
                    visibility: "hidden"
                });
                d(m, {
                    visibility: "hidden"
                });
                d(n, {
                    visibility: "hidden"
                });
            }, 500);
        }
    };
    if (document.attachEvent) {
        document.attachEvent('onmouseover', over);
        document.attachEvent('onmouseout', out);
    }else if (document.addEventListener) {
        document.addEventListener('mouseover', over, false);
        document.addEventListener('mouseout', out, false);
    }
    
    $('#trans-content').mouseover(function () {
        clearTimeout(out_time_out);
    }).mouseout(function () {
        out_time_out = setTimeout(function() {
            d(e, {
                visibility: "hidden"
            });
            d(m, {
                visibility: "hidden"
            });
            d(n, {
                visibility: "hidden"
            });
        }, 500);
    });
})();