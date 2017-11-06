/**
 * @file lookup.js
 * @author Tang Yu
 * @date   2015-12-7
 */

var px;
var py;
var sx;
var sy;
var list = [];
var lastbutton = null;
var lastFrame = null;
var inBtn = false;
var inFrame = false;
var isAltKey = false;
var isPlayAudio = false;
/* eslint-disable fecs-camelcase */
var huaci_switch;
/* eslint-disable fecs-camelcase */
var huaci_button;

/* escape function begin */

var escapeMap = {
    "<": "&#60;",
    ">": "&#62;",
    '"': "&#34;",
    "'": "&#39;",
    "&": "&#38;"
};


var escapeFn = function (s) {
    return escapeMap[s];
};

var escapeHTML = function (content) {
    return toString(content)
    .replace(/&(?![\w#]+;)|[<>"']/g, escapeFn);
};

var toString = function (value, type) {
    if (typeof value !== 'string') {
        type = typeof value;
        if (type === 'number') {
            value += '';
        } else if (type === 'function') {
            value = toString(value.call(value));
        } else {
            value = '';
        }
    }
    return value;
};

/* escape function end */

// console.log(1);
if (document.body.addEventListener) {
    document.body.addEventListener('mouseup', onEventTranslate, false);
    document.body.addEventListener('mousedown', getHuaciSwitch, false);
} else {
    document.body.attachEvent('onmouseup', onEventTranslate);
    document.body.attachEvent('onmousedown', getHuaciSwitch);
}

// 得到是否开启划词翻译及是否显示翻译按钮的配置
function getHuaciSwitch() {
    /* globals chrome */
    // 鼠标按下之后先清除之前的selection，这句话会在用户即使按鼠标右键的时候仍然会清除掉selection，导致右键菜单、鼠标拖拽等功能不可用，先注释掉，以后再找解决方法
    //document.getSelection().removeAllRanges();
    chrome.storage.local.get(null, function (items) {
		// 在用户开了划词选项并且页面没有被翻译过的时候才出划词翻译
        huaci_switch = items['huaci_switch']&&(!app.didTranslate);
        huaci_button = items['huaci_button'];
    });
}

// 判断字符串temp中是否含有空格
function hasSpaceCount(temp) {
    var cnt = 0;
    for (var i = 0; i < temp.length; i++) {
        if (temp.charAt(i) === ' ') {
            cnt++;
        }
    }
    if (cnt > 0) {
        return true;
    } else {
        return false;
    }
}

// 判断中文的逻辑好像没有判断中文标点符号
function isAllChinese(temp) {
    var re = /^[\u4e00-\u9fa5\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b]+$/;
    if (re.test(temp)) {
        return true;
    } else {
        return false;
    }
}

function isEnglish(temp) {
    var re = /[a-zA-Z]/;
    for (var i = 0; i < temp.length; i++) {
        if (!re.test(temp[i])) {
            return false;
        }
    }
    return true;
}

// onEventTranslate中并没有控制是出翻译按钮还是出翻译框
function onEventTranslate(e) {
    var word = '';
    var target = e.srcelement ? e.srcelement : e.target;
    // 兼容非IE浏览器
    if (document.getSelection) {
        word = document.getSelection();
    // 兼容IE浏览器，IE10已经支持getSelection接口
    } else if (document.selection) {
        word = document.selection.createRange().text;
    }
    if (inBtn) {
        return;
    }
    if (inFrame) {
        return;
    }
    onCloseFrame();
    onClosebutton();
    if (!huaci_switch) {
        return;
    }
    word = String(word);
    // trim了一下
    word = word.replace(/^\s*/, '').replace(/\s*$/, '');
    if (word === '') {
        return;
    }
    // input框里的内容不触发划词翻译
    if (target.tagName === 'INPUT' || target.tagName === 'IMG') {
        return;
    }
    if (word.length > 500) {
        return;
    }
    // for (var i = 0; i < word.length; i++) {
    //     if (isChinese(word[i])) {
    //         return;
    //     }
    // }
    // console.log('word', word);
    if (isAllChinese(word)) {
        return;
    }
    if (word.indexOf('<') === 1 || word.indexOf('>') === 1) {
        return;
    }

    if (word !== '') {
        // 相对于文档位置
        px = e.pageX;
        py = e.pageY;
        // 相对于屏幕位置
        sx = e.screenX;
        sy = e.screenY;
        if (!hasSpaceCount(word)) {
            // 单词是英文的话调用词典接口，不是的话调用翻译接口
            if (isEnglish(word)) {
                getDictTrans(word, e.pageX, e.pageY, e.screenX, e.screenY);
            } else {
                getTranslate(word, e.pageX, e.pageY, e.screenX, e.screenY);
            }
        // 不是单词的话调用翻译接口
        } else {
            getTranslate(word, e.pageX, e.pageY, e.screenX, e.screenY);
        }
    }
}

function getDictTrans(word, pX, pY, sX, sY) {
    /* globals chrome */
    chrome.extension.sendRequest({
        action: 'dict',
        word: word
    }, function (response) {
        // console.log('response', response);
        var data = response['data'];
        // console.log('data', data);
        if (data['data'] === '' || data['data'] === null || data['data'] === undefined || data['data'].length === 0) {
            getTranslate(word, pX, pY, sX, sY);
        } else {
            if (huaci_button) {
                createFyBtn(pX, pY, sX, sY);
                $('#fanyiWrapper').click(function () {
                    createDictFrame(word, pX, pY, sX, sY, data);
                    $(this).hide();
                });
            } else {
                createDictFrame(word, pX, pY, sX, sY, data);
            }
        }

    });
}

function getTranslate(word, pX, pY, sX, sY) {
    // var appid = '20151211000007653';
    // var key = 'IFJB6jBORFuMmVGDRude';
    // var salt = (new Date).getTime();
    // var str1 = appid + word + salt + key;
    // var sign = MD5(str1);
    /* globals chrome */
    chrome.extension.sendRequest({
        action: 'trans',
        word: word
    }, function (response) {
        var data = response['data'];
        // console.log('transData', data);
        if (huaci_button) {
            createFyBtn(pX, pY, sX, sY);
            $('#fanyiWrapper').click(function () {
                createFyFrame(word, pX, pY, sX, sY, data);
                $(this).hide();
            });
        } else {
            createFyFrame(word, pX, pY, sX, sY, data);
        }

    });
}

// 弹出词典翻译框
function createDictFrame(word, pX, pY, sX, sY, data) {
    var speechPart = '';
    var means = '';
    var $frame = $('<div></div>');
    $frame.attr('id', 'fanyiContainer');
    var parts = data['data'].symbols[0].parts;
    if (parts.length === 0) {
        return;
    }
    if (parts.length > 3) {
        parts = parts.slice(0, 3);
    }
    for (var i = 0; i < parts.length; i++) {
        for (var j = 0; j < parts[i]['means'].length; j++) {
            means += '<span style="color: #333 !important;">' + escapeHTML(parts[i]['means'][j]) + ';</span>';
        }
        /* eslint-disable max-len */
        speechPart += '<p style="font-family:\'微软雅黑\';margin-top:2px;margin-bottom:0;line-height:18px;font-size:13px;"><span style="width:40px;text-overflow:ellipsis;margin-right:5px;color: #333 !important;">' + parts[i]['part'] + '</span>' + means + '</p>';
        means = '';
    }
    /* eslint-disable max-len */
    $frame[0].innerHTML = '<div style="padding:13px 13px;width:257px;border:1px solid #ccc;box-shadow:0 0 3px #ccc;border-radius:2px;background:#fff;text-align:left;"><div style="height:17px;"><span style="font-size:14px;display:inline-block;font-family:\'微软雅黑\';color: #333 !important;">' + escapeHTML(data['data']['word_name'])
        + '</span><audio src="http://tts.baidu.com/text2audio?lan=en&pid=101&ie=UTF-8&text=' + data['data']['word_name']
        /* globals chrome */
        + '" visibility:hidden;></audio><img id="playVoice" src="' + chrome.extension.getURL('imgs/map/voice.png')
        /* globals chrome */
        /* eslint-disable max-len */
        + '" style="vertical-align:baseline;margin-left:7px;display:inline-block;position:relative;top:3px;left:0;cursor:pointer;width:18px;height:15px;"><img id="closeFrame" style="float:right;" src="' + chrome.extension.getURL('imgs/map/close.png')
        + '"></div><div style="margin-top:8px;">' + speechPart
        /* globals bridge */
        /* globals chrome */
        + '</div><div style="margin-top:8px;"><img src="' + chrome.extension.getURL('imgs/map/graylogo.png')
        + '" style="display:inline-block;"><a id="moreMean" target="_blank" href="http://fanyi.baidu.com/#en/zh/' +  data['data']['word_name']
        /* eslint-disable max-len */
        + '" style="font-family:\'微软雅黑\';float:right;text-decoration:none;color:#0066FF;letter-spacing:1px;font-size:12px;position:relative;top:4px;left:0;">更多释义 ></a></div></div>';
    var frameWidth = 310;
    var frameHeight = 100;
    var frameLeft = 0;
    var frameTop = 0;
    var screenWidth = screen.availWidth;
    var screenHeight = screen.availHeight;
    var padding = 10;
    if (sX + frameWidth < screenWidth) {
        frameLeft = pX;
    } else {
        frameLeft = pX - frameWidth - 20;
    }
    $frame[0].style.left = frameLeft  + 'px';

    if (sY + frameHeight + 20 < screenHeight) {
        frameTop = pY;
    } else {
        frameTop = pY - frameHeight - 20;
    }
    $frame[0].style.top = frameTop + 10 + 'px';
    $frame[0].style.position = 'absolute';
    $frame[0].style.zIndex = 10002;
    document.body.style.position = 'static';
    document.body.appendChild($frame[0]);
    list.push($frame);
    $('#fanyiContainer').mouseover(function () {
        inFrame = true;
    }).mouseout(function () {
        inFrame = false;
    });
    $('#closeFrame').hover(function () {
        /* globals chrome */
        $(this).attr('src', chrome.extension.getURL('imgs/map/close_hover.png'));
    }, function () {
        /* globals chrome */
        $(this).attr('src', chrome.extension.getURL('imgs/map/close.png'));
    });
    if (lastFrame != null) {
        /* globals $button */
        if (lastFrame.css('left') !== $button.css('left')) {
            document.body.removeChild(lastFrame[0]);
        }
    }
    lastFrame = $frame;
    $('#closeFrame').click(function () {
        inFrame = false;
        $('#fanyiContainer').hide();
    });

    // $('#moreMean').hover(function () {
    //     $(this).css('color', '#0066FF');
    // }, function () {
    //     $(this).css('color', '#ccc');
    // });

    $('#moreMean').click(function () {
        inFrame = false;
        $('#fanyiContainer').hide();
    });

    $('#playVoice').hover(function () {
        if (!isPlayAudio) {
            /* globals chrome */
            $(this).attr('src', chrome.extension.getURL('imgs/map/voice_hover.png'));
        }
    }, function () {
        if (!isPlayAudio) {
            /* globals chrome */
            $(this).attr('src', chrome.extension.getURL('imgs/map/voice.png'));
        }
    });

    $('#playVoice').click(function () {
        var that = this;
        isPlayAudio = true;
        $(this).siblings('audio')[0].play();
        var $audio = $(this).siblings('audio');
        $audio[0].play();
        /* globals chrome */
        $(this).attr('src', chrome.extension.getURL('imgs/map/sound.gif'));
        $audio.unbind('ended').bind('ended', function () {
            isPlayAudio = false;
            /* globals chrome */
            $(that).attr('src', chrome.extension.getURL('imgs/map/voice.png'));
        });
    });
}
// 弹出翻译框
function createFyFrame(word, pX, pY, sX, sY, data) {
    var dst = '';
    var txt = '';
    var transResult = data['trans_result'];
    var $frame = $('<div></div>');
    $frame.attr('id', 'fanyiContainer');
    var y = document.createElement('div');
    for (var i = 0; i < transResult.length; i++) {
        dst += transResult[i]['dst'];
		dst = escapeHTML(dst);
    }
    for (var i = 0; i < transResult.length; i++) {
        txt += transResult[i]['src'];
		txt = escapeHTML(txt);
    }
    /* globals chrome */
    /* eslint-disable max-len */
    y.innerHTML = '<div style="padding:13px 13px;width:257px;border:1px solid #ccc;border-radius:2px;box-shadow:0 0 5px #ccc;background:#fff;text-align:left;font-family:\'微软雅黑\';"><div><span style="font-size:13px;display:inline-block;font-family:\'微软雅黑\';color: #333 !important;">译文:</span><img style="float:right;" id="closeFrame" src="' + chrome.extension.getURL('imgs/map/close.png')
        /* eslint-disable max-len */
        + '"></div><p id="content" style="white-space:normal;margin-top:8px;font-size:13px;font-family:\'微软雅黑\';color:#333 !important;padding:0;line-height:18px;width:257px;">' + dst
        /* globals chrome */
        + '</p><div style="margin-top:8px;"><img src="' + chrome.extension.getURL('imgs/map/graylogo.png')
        + '" style="display:inline-block;"><a id="moreMean" target="_blank" href="http://fanyi.baidu.com/#auto/zh/' + txt
        /* eslint-disable max-len */
        + '" style="float:right;text-decoration:none;color:#0066FF;letter-spacing:1px;font-size:12px;font-family:\'微软雅黑\';position:relative;left:0;top:5px;">更多释义 ></a></div></div>';
    $frame[0].appendChild(y);

    var frameWidth = 310;
    var frameHeight = 100;
    var frameLeft = 0;
    var frameTop = 0;
    var screenWidth = screen.availWidth;
    var screenHeight = screen.availHeight;
    var padding = 10;

    if (sX + frameWidth < screenWidth) {
        frameLeft = pX;
    } else {
        // frameLeft = (pX - frameWidth - 2 * padding);
        frameLeft = pX - frameWidth - 20;
    }
    $frame[0].style.left = frameLeft  + 'px';

    if (sY + frameHeight + 20 < screenHeight) {
        frameTop = pY;
    } else {
        frameTop = pY - frameHeight - 20;
    }
    $frame[0].style.top = frameTop + 10 + 'px';
    $frame[0].style.position = 'absolute';
    $frame[0].style.zIndex = 10002;
    document.body.style.position = 'static';
    document.body.appendChild($frame[0]);
    list.push($frame);
    $('#fanyiContainer').mouseover(function () {
        inFrame = true;
    }).mouseout(function () {
        inFrame = false;
    });
    $('#closeFrame').hover(function () {
        /* globals chrome */
        $(this).attr('src', chrome.extension.getURL('imgs/map/close_hover.png'));
    }, function () {
        /* globals chrome */
        $(this).attr('src', chrome.extension.getURL('imgs/map/close.png'));
    });
    if (lastFrame != null) {
        /* globals $button */
        if (lastFrame.css('left') !== $button.css('left')) {
            document.body.removeChild(lastFrame[0]);
        }
    }
    lastFrame = $frame;
    $('#closeFrame').click(function () {
        inFrame = false;
        $('#fanyiContainer').hide();
    });

    // $('#moreMean').hover(function () {
    //     $(this).css('color', '#0066FF');
    // }, function () {
    //     $(this).css('color', '#ccc');
    // });

    $('#moreMean').click(function () {
        inFrame = false;
        $('#fanyiContainer').hide();
    });

}
// 翻译按钮
function createFyBtn(pX, pY, sX, sY) {
    var $button = $('<div></div>');
    $button.attr('id', 'fanyiWrapper');
    $button.html('译');
    $button.css({
        'height': '32px',
        'width': '33px',
        'font-family': '微软雅黑',
        'font-size': '14px',
        'text-align': 'center',
        'line-height': '32px',
        'color': '#fff',
        'background-color': '#4395FF',
        'border-radius': '2px',
        'cursor': 'pointer',
        'z-index': '99999'
    });
    var buttonWidth = 35;
    var buttonHeight = 35;
    var buttonLeft = 0;
    var buttonTop = 0;
    var screenWidth = screen.availWidth;
    var screenHeight = screen.availHeight;
    var padding = 10;
    if (sX + buttonWidth < screenWidth) {
        buttonLeft = pX;
    }
    $button[0].style.left = buttonLeft  + 'px';
    // if (sY + buttonHeight + 20 < screenHeight) {
    // }
    buttonTop = pY;
    $button[0].style.top = buttonTop + 10 + 'px';
    $button[0].style.position = 'absolute';
    document.body.style.position = 'static';
    document.body.appendChild($button[0]);
    $('#fanyiWrapper').mouseover(function () {
        inBtn = true;
    }).mouseout(function () {
        inBtn = false;
    });
    list.push($button);
    if (lastbutton !== null) {
        if (lastbutton.css('left') !== $button.css('left')) {
            document.body.removeChild(lastbutton[0]);
            // lastbutton = null;
        }
    }
    lastbutton = $button;
}
function onCloseFrame() {
    if (inFrame) {
        return;
    }
    if (lastFrame != null) {
        while (list.length !== 0) {
            document.body.removeChild(list.pop()[0]);
        }
        lastFrame = null;
        return true;
    }
    return false;
}
function onClosebutton() {
    if (inBtn) {
        return;
    }
    if (lastbutton != null) {
        while (list.length !== 0) {
            document.body.removeChild(list.pop()[0]);
        }
        lastbutton = null;
        return true;
    }
    return false;
}
// document.body.addEventListener('click', onClosebutton, false);
