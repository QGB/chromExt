var langmap = {
    zh: '中文',
    en: '英语',
    jp: '日语',
    ara: '阿拉伯语',
    est: '爱沙尼亚语',
    bul: '保加利亚语',
    pl: '波兰语',
    dan: '丹麦语',
    de: '德语',
    ru: '俄语',
    fra: '法语',
    fin: '芬兰语',
    kor: '韩语',
    nl: '荷兰语',
    cs: '捷克语',
    rom: '罗马尼亚语',
    pt: '葡萄牙语',
    swe: '瑞典语',
    slo: '斯洛文尼亚',
    th: '泰语',
    wyw: '文言文',
    spa: '西班牙语',
    el: '希腊语',
    hu: '匈牙利语',
    it: '意大利语',
    yue: '粤语',
    cht: '中文繁体'
};
var query_list = []
var query_dict = {}
var pastTitle;
var newTitle;
var temp_list = []
var MAX_REQ_LEN = 90;
var fliter_set = ['=', '►', '▼', '◄', '★', '☆', '✘', '›', '', ''];
// 指定不翻译的标签元素
var noTranslateTagRe = /^pre|code|style$/gi;

var replace_dict = {
    // '…': "...",
    '&amp': '&',
    '&amp;': '&',
    '&gt;': '>',
    // '&nbsp;': ' '

    '&;': '&'
}

// 判断是否有特定字符
function hasChar(s, c_set) {
    if (s.indexOf('{') >= 0 && s.indexOf('}') >= 0 && s.indexOf('=') >= 0) {
        return true;
    }
    if (s === '\n') {
        return true;
    }
    /* eslint-disable fecs-camelcase */
    for (var i = 0; i < c_set.length; i++) {
        /* eslint-disable fecs-camelcase */
        if (s.indexOf(c_set[i]) >= 0) {
            return true;
        }
    }
    return false;
}

// 将r_dict中的键替换成对应的值
function replaceChar(s, r_dict) {
    /* eslint-disable fecs-camelcase */
    for (var r in r_dict) {
        s = s.replace(r, r_dict[r]);
    }
    return s;
}

// domainName+':'+port+'/'+webContext+'/'+uri == url
function parseDomain(url) {
    var domain;
    if (url.indexOf('/') >= 0) {
        domain = url.substr(0, url.indexOf('/'));
    } else {
        domain = url;
    }

    var domainName;
    var port;
    var idx = domain.indexOf(':');

    if (idx > 0) {
        domainName = domain.substr(0, idx);
        port = domain.substr(idx + 1);
    } else {
        domainName = domain;
    }

    var shortName = domainName.substr(url.indexOf('.') + 1);
    if (shortName.indexOf('.') < 0) {
        shortName = domainName;
    }

    var tmp2 = url.substr(url.indexOf('/') + 1);
    var webContext = tmp2.substr(0, tmp2.indexOf('/'));
    var uri = tmp2.substr(tmp2.indexOf('/'));

    return {
        domainName: domainName,
        shortName: shortName,
        port: port,
        webContext: webContext,
        uri: uri
    };
}

/*
handler_dom结构示例
[ { raw: 'Xyz ', data: 'Xyz ', type: 'text' }
  , { raw: 'script language= javascript'
  , data: 'script language= javascript'
  , type: 'script'
  , name: 'script'
  , attribs: { language: 'javascript' }
  , children:
     [ { raw: 'var foo = \'<bar>\';<'
       , data: 'var foo = \'<bar>\';<'
       , type: 'text'
       }
     ]
  }
, { raw: '<!-- Waah! -- '
  , data: '<!-- Waah! -- '
  , type: 'comment'
  }
]
 */
/* 遍历dom解析结果，将页面text信息提取，push到query_list中 */
// query_list是一个数组，数组的每一个元素是一个字符串数组，保存着一批要翻译的文本，这个字符串数组长度不超过MAX_REQ_LEN
// replaceChar(text_buf, replace_dict)将文本中的字符实体都替换掉了
function walkParserDom(handler_dom) {
    for (var i in handler_dom) {
        if (handler_dom[i].type === 'tag' && noTranslateTagRe.test(handler_dom[i].name)) {
            continue;
        }
        if (handler_dom[i].type === 'text') {
            var text_buf = handler_dom[i].data;
            // 通过hasChar(s, c_set)判定有特殊字符的文本节点就不翻译了
            if (text_buf !== '' && !hasChar(text_buf, fliter_set)) {
                // 重复的文本节点只翻译一次
                if (!query_dict[replaceChar(text_buf, replace_dict)]) {
                    query_dict[replaceChar(text_buf, replace_dict)] = true;
                    temp_list.push(replaceChar(text_buf, replace_dict));
                    if (temp_list.length === MAX_REQ_LEN) {
                        query_list.push(temp_list);
                        temp_list = [];
                    }
                }
            }
        }
        walkParserDom(handler_dom[i].children);
    }
}

/* 遍历dom树，根据翻译结果进行结果回填 */
// 遍历方法有点弱，以后可以调研下有没有成熟的第三方库可以用
function enumChildNodes(parentNode, data) {
    var node = parentNode.firstChild;
    if (node !== null) {
        while (node != null) {
            if (node.nodeType === 1 && noTranslateTagRe.test(node.nodeName)) {
                node = node.nextSibling;
                continue;
            }
            if (node.nodeType === 3) {
                node.nodeValue = node.nodeValue.replace(/(^\s*)|(\s*$)/g, '');
                node.nodeValue = node.nodeValue.replace(/(\n)+|(\r\n)+/g, '');
                for (var i = 0; i < node.nodeValue.length; i++) {
                    if (node.nodeValue[i].charCodeAt() === 160) {
                        var kg = node.nodeValue.substring(i, i + 1);
                        node.nodeValue = node.nodeValue.replace(kg, ' ');
                    }
                }
                // console.log('node.nodeValue--', node.nodeValue);
                var dst = data[node.nodeValue];
                if (typeof dst === 'undefined' || dst.length === 0 || dst === 'null') {
                    var next = node.nextSibling;
                    node = next;
                    continue;
                }
                if (dst.length <= 10) {
                    if (dst[dst.length - 1] === '。') {
                        dst = dst.substring(0, dst.length - 1);
                    }
                }
                var trans = document.createElement('trans');
                var att = document.createAttribute('data-src');
                att.value = node.nodeValue;
                trans.setAttributeNode(att);
                var att1 = document.createAttribute('data-dst');
                att1.value = data[node.nodeValue];
                trans.setAttributeNode(att1);
                // trans.textContent = data[node.nodeValue];
                trans.textContent = dst;
                parentNode.insertBefore(trans, node);
                var next = node.nextSibling;
                parentNode.removeChild(node);
                node = next;
                continue;
            }
            // else if (node.nodeType == 3 && data[$.trim(node.nodeValue)]) {
            //     var trans = document.createElement('trans');
            //     var att = document.createAttribute("data-src");
            //     att.value = node.nodeValue;
            //     trans.setAttributeNode(att);
            //     var att1 = document.createAttribute("data-dst");
            //     att1.value = data[$.trim(node.nodeValue)];
            //     trans.setAttributeNode(att1);

            //     trans.textContent = data[$.trim(node.nodeValue)];
            //     parentNode.insertBefore(trans, node);
            //     var next = node.nextSibling;
            //     parentNode.removeChild(node);
            //     node = next;
            //     continue;
            // }
            enumChildNodes(node, data);
            node = node.nextSibling;
        }
    }
}

/* 解析页面文本，向background监听发送翻译请求，并完成页面信息回填 */
function translate(from, to) {
    app.didTranslate = true;
    from = typeof from !== 'undefined' ? from : 'auto';
    to = typeof to !== 'undefined' ? to : 'zh';

    query_list = [];
    query_dict = {};
    temp_list = [];
    /* globals bridge */
    var handler = new Tautologistics.NodeHtmlParser.DefaultHandler(function (error, dom) {
        if (error) {} else {}
    });
    var parser = new Tautologistics.NodeHtmlParser.Parser(handler);
    parser.parseComplete(document.body.innerHTML);
    walkParserDom(handler.dom);
    // walkParserDom结束后temp_list可能还不为空，可能还有不到MAX_REQ_LEN个字符串元素
    // 把title也加到query_list中去
    if (!hasChar(document.title, fliter_set)) {
        if (temp_list.length === MAX_REQ_LEN) {
            query_list.push(temp_list);
            query_list.push([replaceChar(document.title, replace_dict)]);
        } else {
            temp_list.push(replaceChar(document.title, replace_dict));
            query_list.push(temp_list);
        }
    // title里面有特定符号就不翻译了
    } else {
        query_list.push(temp_list);
    }
    for (var i = 0; i < query_list.length; i++) {
        for (var j = 0; j < query_list[i].length; j++) {
            query_list[i][j] = query_list[i][j].replace(/(\n)+|(\r\n)+/g, '');
            query_list[i][j] = query_list[i][j].replace(/&nbsp;/g, ' ');
            query_list[i][j] = query_list[i][j].replace(/(^\s*)|(\s*$)/g, '');
        }
    }
    // console.log('query_list---', query_list);
    var ocharset = document.charset;
    var location_obj = parseDomain(window.location.href.replace('http://', '').replace('https://', ''));
    // aFrom没有用到
    var aFrom = {
        'tourismthailand.org': 'th',
        'thaichinatrading.com': 'th',
        'gov.ro': 'rom',
        'vlada.cz': 'cs',
        'gov.si': 'slo',
        'poslovnisos.gov.si': 'slo',
        'vlada.si': 'slo',
        'stopbirokraciji.si': 'slo',
        'vladi.si': 'slo',
        'primeminister.gr': 'el',
        'gnto.gov.gr': 'el',
        'government.bg': 'bul',
        'thailandpages.com': 'th',
        'mfa.bg': 'bul',
        'premier.gov.pl': 'pl',
        'auth.gr': 'el',
        'lennuakadeemia.ee': 'est',
        'greek-tourism.gr': 'el',
        'greek-tourism.com': 'en'
    };
    chrome.runtime.sendMessage({
        query_list: query_list,
        from: from,
        to: to,
        domain: location_obj.shortName,
        opid: 1,
        ocharset: ocharset
    }, function (response) {
        // console.log('response', response);
        if (response.dict == null) {
            $('#translate-head-ing').hide();
            $('#translate-head-timeout').show();
            return;
        }
        // for (var key in response.dict) {
        //     var m_key = key;
        //     if (m_key[0] == '"' && m_key.length > 1) {
        //         m_key = m_key.substr(1);
        //     }
        //     if (m_key.length > 1 && m_key[m_key.length - 1] == '"') {
        //         m_key = m_key.substr(0, m_key.length - 1);
        //     }
        //     response.dict[$.trim(m_key)] = response.dict[key];
        // }
        // console.log(response.dict);
        var title = document.title;
        document.title = document.title + ' wait';
        $('#src-reload').show();
        // $("*").each(function() {
        //     var key = replaceChar($(this).html(), replace_dict);
        //     console.log(this.nodeType);
        //     if (response.dict[key]) {
        //         $(this).html('<trans data-src="' + key + '" data-dst="' + response.dict[key].replace("；", "") + '">' + response.dict[key].replace("；", "") + '</trans>');
        //     }
        // });
        enumChildNodes(document.body, response.dict);
        // enumChildNodes(document, response.dict);
        if (response.dict[title]) {
            document.title = response.dict[title];
            pastTitle = title;
            newTitle = document.title;
        } else {
            document.title = title;
        }

        if (response.src_dir === 'zh' && to === 'zh') {
            chrome.storage.local.set({
                temp_translate: ['true', 'zh', 'en']
            }, function () {
                location.reload();
            });
        }
        // 源语言语种为auto时，翻译页面后改变源语言语种显示
        if (from === 'auto') {
            if (/www.gov.ro|mfa.bg/i.test(window.location.href)) {
                if (/www.gov.ro/i.test(window.location.href)) {
                    $('#translate-head-from #detect-from').html('检测到' + '罗马尼亚语').attr('value', 'rom');
                    $('#select-inner-from').children().eq(15).attr({
                        /* eslint-disable max-len */
                        style: 'cursor: pointer !important; line-height: 25px !important; font-size: 12px !important; color: rgb(67, 149, 255) !important; box-sizing: border-box; padding-left: 11px; height: 25px; background-color: rgb(255, 255, 255);'
                    });
                }
                if (/mfa.bg/i.test(window.location.href)) {
                    $('#translate-head-from #detect-from').html('检测到' + '保加利亚语').attr('value', 'bul');
                    $('#select-inner-from').children().eq(5).attr({
                        /* eslint-disable max-len */
                        style: 'cursor: pointer !important; line-height: 25px !important; font-size: 12px !important; color: rgb(67, 149, 255) !important; box-sizing: border-box; padding-left: 11px; height: 25px; background-color: rgb(255, 255, 255);'
                    });
                }
            } else {
                /* eslint-disable max-len */
                $('#translate-head-from #detect-from').html('检测到' + langmap[response.src_dir]).attr('value', response.src_dir);

                $('#select-inner-from').children().each(function (index, el) {
                    if (el.getAttribute('value') === response.src_dir) {
                        /* eslint-disable max-len */
                        el.setAttribute('style', 'cursor: pointer !important; line-height: 25px !important; font-size: 12px !important; color: rgb(67, 149, 255) !important; box-sizing: border-box; padding-left: 11px; height: 25px; background-color: rgb(255, 255, 255);');
                    }
                });
            }
        }
    });
}

var CH_PATTERN = /[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/gi; // 中文字符pattern
function hasChineseChar(s) {
    var res = CH_PATTERN.test(s);
    return res;
}

function isNeedToTranslate(query_list) {
    var MAX_WORDS = 100;
    var CH_RATIO = 0.1;
    var MAX_CH_WORDS = MAX_WORDS * CH_RATIO;
    var valid_list = false;
    var wordsCnt = 0;
    var chineseWordsCnt = 0;
    for (var i = 0; i < query_list.length; i++) {
        var j = 0;
        // 取前MAX_WORDS个text node，中间有超过CH_RATIO比例的text node有中文字符，就判断网页为中文
        for (; j < query_list[i].length; j++) {
            if (!hasChar(query_list[i][j], fliter_set)) {
                if ($.trim(query_list[i][j]) !== '') {
                    valid_list = true;
                }
                if (hasChineseChar(query_list[i][j])) {
                    ++chineseWordsCnt;
                    // 中文字符过多，判定为中文网页
                    if (chineseWordsCnt > MAX_CH_WORDS) {
                        return false;
                    }
                }
                ++wordsCnt;
                if (wordsCnt >= MAX_WORDS) {
                    break;
                }
            }
        }
    }
    if (wordsCnt > 0 && chineseWordsCnt / wordsCnt >= CH_RATIO) {
        return false;
    }
    return valid_list;
}


/* 遍历dom文本元素，如果没有中文字符则插入语言检测head bar */
function langDetect() {
    if (hasChineseChar(document.title)) {
        return;
    }
    query_list = [];
    query_dict = {};
    temp_list = [];
    /* globals bridge */
    var handler = new Tautologistics.NodeHtmlParser.DefaultHandler(function (error, dom) {
        if (error) {} else {}
    });
    var parser = new Tautologistics.NodeHtmlParser.Parser(handler);
    parser.parseComplete(document.body.innerHTML);

    walkParserDom(handler.dom);
    query_list.push(temp_list);
    if (!isNeedToTranslate(query_list)) {
        return;
    }

    // chrome.runtime.sendMessage({detect_query: detect_query, opid: 2}, function(response) {
    //     var data = response.data;
    //     //目前语言检测有错误暂不做处理，不弹框即可。
    //     if(data["error_code"] == "52001"){
    //         //TODO with "请求超时."
    //     }
    //     else if(data["error_code"] == "52002"){
    //         //TODO with "翻译系统错误."
    //     }
    //     else if(data["error_code"] == "52003"){
    //         //TODO with "未授权的用户."
    //     }
    //     else if(data["error_code"] == "5004"){
    //         //TODO with "参数错误."
    //     }
    //     else if (langmap[data['from']] != null &&
    //             data['from'] != 'zh' &&
    //             data['from'] != 'auto'){

    // chrome.runtime.sendMessage({
    //     // detect_query: detect_query,
    //     opid: 2
    // }, function (response) {
    //     var data = response.data;
    //     console.log('data', data);
    // });

    var head_bar = $('<div>', {
        'class': 'head-bar',
        'id': 'detect',
        'style': 'background-color:#f0f0f0 !important;z-index: 99999 !important;font-size:12px !important;color:#333 !important'
    }).css({
        'position': 'fixed',
        'width': '100%',
        'height': '36px',
        'display': 'none',
        'border-bottom': '1px solid #C1C1C1',
        'border-top': '1px solid #fff'
    });

    var imgElement = $('<img>').css({
        position: 'fixed',
        left: '15px',
        top: '6px',
        height: '21px',
        width: '66px'
    }).attr({
        id: 'baidu_fanyi_logo',
        /* globals bridge */
        src: chrome.extension.getURL('imgs/map/logo.png')
    });

    var ptLeftElement = $('<pt>').attr({
        id: 'detect-left-p',
        style: 'font-size:12px !important;color:#333 !important'
    }).css({
        position: 'fixed',
        left: '120px',
        top: '12px'
    }).html('检测到当前网页不是中文网页，是否要翻译成中文？');

    var selectBoxElement = $('<div>').attr({
        id: 'select-translate-box'
    });

    // var selectFromBox = $('<div>').attr({
    //     'id':'select-translate-from',
    //     'style':'line-height:23px !important;cursor:pointer !important;color:#333 !important',
    //     'data-click':'no-click'
    // }).css({
    //     'width':'97px',
    //     'height':'23px',
    //     'position':'fixed',
    //     'border-radius':'3px',
    //     'left':'220px',
    //     'top':'7px',
    //     'background-color':'#fff',
    //     'margin-right':'12px',
    //     'box-sizing':'border-box',
    //     'display':'flex',
    //     'justify-content':'center',
    //     'align-items':'center'
    // }).on('click', function(e) {
    //     e.stopPropagation();
    //     if ($(this).attr('data-click') == 'no-click') {
    //         $('#select-inner-box').slideDown(100);
    //         $(this).css({
    //             'padding-left':'11px',
    //             'justify-content':'flex-start',
    //             'border-radius':'3px 3px 0 0'
    //         });
    //         $(this).attr('data-click','click');
    //     } else {
    //         $('#select-inner-box').slideUp(100);
    //         $(this).css({
    //             'padding-left':'0px',
    //             'justify-content':'center',
    //             'border-radius':'3px'
    //         });
    //         $(this).attr('data-click','no-click');
    //     }

    // })

    // var selectElement = $('<span>').attr({
    //     'id':'detect-from',
    //     'value':data['from'],
    //     'style':'cursor:pointer !important;font-size:12px !important;color:#333 !important'
    // }).css({
    //     'position': 'relative',
    //     'background':'initial'
    // }).html(langmap[data['from']]);

    // var selectIconImg = $('<img>').attr({
    //     'id':'select-icon-img',
    //     'src':chrome.extension.getURL("imgs/map/arrow_down_nomal.png"),
    //     'style':'cursor:pointer !important'
    // }).css({
    //     'position':'relative',
    //     'left':'5px',
    //     'width':'9px',
    //     'height':'5px'
    // })

    // var selectInnerBox = $('<div>').attr({
    //     'id':'select-inner-box'
    // }).css({
    //     'position':'absolute',
    //     'left':'-1px',
    //     'top':'23px',
    //     'width':'97px',
    //     'height':'auto',
    //     'border':'1px solid #f0f0f0',
    //     'border-top':'none',
    //     'border-radius':'0 0 3px 3px',
    //     'display':'none',
    //     'z-index':'99999'
    // })

    // for (key in langmap){
    //     selectInnerBox.append($('<div>').attr({
    //         'value':key,
    //         'style':'cursor:pointer !important;line-height:25px !important;font-size:12px !important;color:#333 !important'
    //     }).html(langmap[key]).css({
    //         'box-sizing':'border-box',
    //         'padding-left':'11px',
    //         'height':'25px',
    //         'background-color':'#fff'
    //     }).hover(function() {
    //         $(this).css({
    //             'background-color':'#eef2fc'
    //         })
    //     },function() {
    //         $(this).css({
    //             'background-color':'#fff'
    //         })
    //     }).on('click', function(e) {
    //         e.stopPropagation();
    //         $('#detect-from').html($(this).html()).attr('value', $(this).attr('value'))

    //         $('#select-translate-from').css({
    //             'justify-content':'center',
    //             'padding-left': '0px',
    //             'border-radius':'3px'
    //         }).attr('data-click','no-click');

    //         $('#select-translate-from #select-inner-box').children().attr({
    //             'style':'cursor: pointer !important; line-height: 25px !important; font-size: 12px !important; color: rgb(51, 51, 51) !important; box-sizing: border-box; padding-left: 11px; height: 25px; background-color: rgb(255, 255, 255);'
    //         })

    //         $(this).attr({
    //             'style':'cursor: pointer !important; line-height: 25px !important; font-size: 12px !important; color: rgb(67, 149, 255) !important; box-sizing: border-box; padding-left: 11px; height: 25px; background-color: rgb(255, 255, 255);'
    //         })

    //         $('#select-inner-box').slideUp(100);
    //     }));
    // }

    // selectFromBox.append(selectElement, selectIconImg, selectInnerBox);
    // selectBoxElement.append(selectFromBox);

    var ptRightElement = '';
    // var ptRightElement = $('<pt>').attr({
    //     'id':'detect-right-p',
    //     'style':'font-size:12px !important;color:#333 !important'
    // }).css({
    //     'position': 'fixed',
    //     'left':'340px',
    //     'top':'12px',
    // }).html('网页，是否要翻译成中文？');

    var buttonTranslateElement = $('<div>').attr({
        id: 'detect-translate',
        /* eslint-disable max-len */
        style: 'cursor:pointer !important;border-radius:3px !important;color:white !important;' + 'font-size:12px !important;text-align:center !important;line-height:23px !important'
    }).css({
        'padding': 'initial',
        'position': 'fixed',
        'margin': '0px',
        'left': '430px',
        'top': '7px',
        'background-color': '#4395FF',
        'border': 'none',
        'height': '23px',
        'width': '60px'
    }).html('翻译');

    var buttonDetectButton = $('<div>').attr({
        id: 'detect-no-translate',
        /* eslint-disable max-len */
        style: 'cursor:pointer !important;border-radius:3px !important;cursor:pointer !important;' + 'font-size:12px !important;color:#333 !important;text-align:center !important;line-height:23px !important'
    }).css({
        'padding': 'initial',
        'position': 'fixed',
        'margin': '0px',
        'left': '500px',
        'top': '7px',
        'background-color': '#fbfbfb',
        'border': 'none',
        'height': '23px',
        'width': '75px'
    }).html('不翻译');

    var aTipsElement = $('<a>').attr({
        id: 'detect-no-more',
        href: '#',
        style: 'font-size:12px !important;color:#333 !important'
    }).css({
        'position': 'fixed',
        'left': '585px',
        'top': '12px',
        'text-decoration': 'none'
    }).html('不再提示').hover(function () {
        $(this).attr('style', 'position: fixed;left:585px;top:12px;text-decoration: none;color:#4395FF !important;font-size:12px !important');
    }, function () {
        $(this).attr('style', 'position: fixed;left:585px;top:12px;text-decoration: none;font-size:12px !important;color:#333 !important');
    });

    var deleteBtnElement = $('<div>').attr({
        id: 'detect-cross'
    }).append($('<img>').attr({
        id: 'detect-cross-img',
        style: 'cursor:pointer !important',
        /* globals bridge */
        src: chrome.extension.getURL('imgs/map/close.png')
    }).css({
        'float': 'right',
        'margin-right': '20px',
        'margin-top': '8px',
        // 'height': '18px'
        'width': '18px'
    }));

    head_bar.append(imgElement, ptLeftElement, selectBoxElement, ptRightElement, buttonTranslateElement, buttonDetectButton, aTipsElement, deleteBtnElement);

    $('body').before(head_bar);
    $(document).on('click', function () {
        $('#select-inner-box').slideUp(100);
        $('#select-translate-from').css({
            'padding-left': '0px',
            'justify-content': 'center',
            'border-radius': '3px'
        });
        $('#select-translate-from').attr('data-click', 'no-click');
    });
    $('#select-translate-from #select-inner-box').children().each(function (index, el) {
        if (el.getAttribute('value') === $('#detect-from').attr('value')) {
            el.setAttribute('style', 'cursor: pointer !important; line-height: 25px !important; font-size: 12px !important; color: rgb(67, 149, 255) !important; box-sizing: border-box; padding-left: 11px; height: 25px; background-color: rgb(255, 255, 255);');
        }
    });
    var body_margin_top = $('body').css('margin-top');
    var new_margin_top = parseInt(body_margin_top, 10) + 36;
    $('body').attr('style', 'position: relative; margin-top: ' + new_margin_top + 'px !important;');
    /* globals moveFixNodes */
    moveFixNodes();
    $('#detect').show();
    $('#detect-cross').click(function () {
        /* globals app */
        app.didTranslate = false;
        $('#detect').remove();
        $('body').attr('style', 'position: relative; margin-top: ' + body_margin_top + 'px !important;');
        /* globals recoverFixNodes */
        recoverFixNodes();
    });
    $('#detect-cross').hover(function () {
        $('#detect-cross-img').attr('src', chrome.extension.getURL('imgs/map/close_hover.png'));
    }, function () {
        $('#detect-cross-img').attr('src', chrome.extension.getURL('imgs/map/close.png'));
    });
    // 点击翻译之后删掉语言检测bar，插入翻译bar，翻译页面
    $('#detect-translate').click(function () {
        $(this).css('background-color', '#0077EC');
        var detect_from = $('#detect-from').attr('value');
        $('#detect').remove();
        $('body').attr('style', 'position: relative; margin-top: ' + body_margin_top + 'px !important;');
        recoverFixNodes();
        injectBar(detect_from, 'zh', langmap);
        translate(detect_from, 'zh');
    });
    $('#detect-translate').hover(function () {
        $(this).css('background-color', '#54A0FF');
    }, function () {
        $(this).css('background-color', '#4395FF');
    });
    $('#detect-no-translate').click(function () {
        $('#detect').remove();
        $('body').attr('style', 'position: relative; margin-top: ' + body_margin_top + 'px !important;');
        recoverFixNodes();
    });
    $('#detect-no-translate').hover(function () {
        $(this).css('background-color', '#fff');
    }, function () {
        $(this).css('background-color', '#fbfbfb');
    });
    $('#detect-no-more').click(function () {
        $('#detect').remove();
        $('body').attr('style', 'position: relative; margin-top: ' + body_margin_top + 'px !important;');
        recoverFixNodes();
        chrome.storage.local.set({
            ban_detect: true
        });
    });
}