/**
 * @file trans-bg.js
 * @author Yao Wei
 * @date   2016-2-3
 */
/*
 注入可选择语言和点击翻译的head bar
 这里所有的样式都设置为inline形式，避免影响原页面或被原页面影响
 因此样式改动非常复杂
 。。
*/

// injectBar中的翻译按钮的初始状态是“显示原文”，即调用injectBar之前网页已经被翻译过
function injectBar(from, to, langmap) {
    if ($('#translate-head').length <= 0) { // 仅当没有head bar时做注入操作
        from = typeof from !== 'undefined' ? from : 'auto';
        to = typeof to !== 'undefined' ? to : 'zh';
        langmap = typeof langmap !== 'undefined' ? langmap : {
            auto: '自动检测',
            zh: '中文',
            en: '英语'
        };
        // 整个bar的div
        var head_bar = $('<div>', {
            'class': 'head-bar',
            'id': 'translate-head',
            /* eslint-disable max-len */
            'style': 'background-color:#f0f0f0 !important;z-index: 99999 !important;font-size:12px !important;color:#333 !important'
        }).css({
            'position': 'fixed',
            'width': '100%',
            'height': '36px',
            'display': 'none',
            'border-bottom': '1px solid #C1C1C1',
            'border-top': '1px solid #fff'
        });

        // 百度翻译logo div
        var imgElement = $('<img>').css({
            position: 'absolute',
            left: '15px',
            top: '6px',
            height: '21px',
            width: '66px'
        }).attr({
            id: 'baidu_fanyi_logo',
            /* globals bridge */
            src: chrome.extension.getURL('imgs/map/logo.png')
        });

        // 源语言方向div
        function createFromElement() {
            var selectFromBox = $('<div>').attr({
                'id': 'translate-head-from',
                'class': 'translate-head-retranslate',
                'style': 'line-height:23px !important;cursor:pointer !important',
                'data-click': 'no-click'
            }).css({
                'width': '97px',
                'height': '23px',
                'position': 'absolute',
                'border-radius': '3px',
                'background-color': '#fff',
                'margin-right': '12px',
                'box-sizing': 'border-box',
                'display': 'flex',
                'justify-content': 'center',
                'align-items': 'center'
            }).on('click', function (e) {
                e.stopPropagation();
                $('#translate-head-to #select-inner-to').slideUp(100);
                $('#translate-head-to').css({
                    'padding-left': '0px',
                    'justify-content': 'center',
                    'border-radius': '3px'
                }).attr('data-click', 'no-click');
                if ($(this).attr('data-click') === 'no-click') {
                    $('#select-inner-from').slideDown(100);
                    $(this).attr('data-click', 'click').css({
                        'padding-left': '11px',
                        'justify-content': 'flex-start',
                        'border-radius': '3px 3px 0 0'
                    });
                } else {
                    $('#select-inner-from').slideUp(100);
                    $(this).attr('data-click', 'no-click').css({
                        'padding-left': '0px',
                        'justify-content': 'center',
                        'border-radius': '3px'
                    });
                }

            });

            var selectFromElement = $('<span>').attr({
                id: 'detect-from',
                value: from,
                /* eslint-disable max-len */
                style: 'cursor:pointer !important;font-size:12px !important;white-space:nowrap !important;color:#333 !important'
            }).css({
                'position': 'relative',
                'background': 'initial',
                'width': 'auto',
                'max-width': '73px',
                'overflow': 'hidden',
                'text-overflow': 'ellipsis'
            }).html(langmap[from]);

            var selectFromIconImg = $('<img>').attr({
                id: 'select-icon-img',
                /* globals bridge */
                src: chrome.extension.getURL('imgs/map/arrow_down_nomal.png'),
                style: 'cursor:pointer !important'
            }).css({
                position: 'relative',
                left: '5px',
                width: '9px',
                height: '5px'
            });

            var selectFromInnerBox = $('<div>').attr({
                'class': 'select-inner-box',
                'id': 'select-inner-from'
            }).css({
                'position': 'absolute',
                'left': '1px',
                'top': '23px',
                'width': '97px',
                'height': '300px',
                'overflow': 'auto',
                'border': '1px solid #f0f0f0',
                'border-top': 'none',
                'border-radius': '0 0 3px 3px',
                'display': 'none',
                'box-sizing': 'border-box'
            });

            for (key in langmap) {
                selectFromInnerBox.append($('<div>').attr({
                    /* globals bridge */
                    value: key,
                    style: 'cursor:pointer !important;line-height:25px !important;font-size:12px !important;color:#333 !important'
                }).html(langmap[key]).css({
                    'box-sizing': 'border-box',
                    'padding-left': '11px',
                    'height': '25px',
                    'background-color': '#fff'
                }).hover(function () {
                    $(this).css({
                        'background-color': '#eef2fc'
                    });
                }, function () {
                    $(this).css({
                        'background-color': '#fff'
                    });
                }).on('click', function (e) {
                    e.stopPropagation();
                    if ($('#detect-from').attr('value') !== $(this).attr('value')) {
                        $('#detect-from').html($(this).html()).attr('value', $(this).attr('value'));
                        changeTranslate();
                    } else {
                        $('#detect-from').html($(this).html()).attr('value', $(this).attr('value'));
                    }

                    $('#translate-head-from').css({
                        'justify-content': 'center',
                        'padding-left': '0px',
                        'border-radius': '3px'
                    }).attr('data-click', 'no-click');

                    $('#select-inner-from').children().attr({
                        style: 'cursor: pointer !important; line-height: 25px !important; font-size: 12px !important; color: rgb(51, 51, 51) !important; box-sizing: border-box; padding-left: 11px; height: 25px; background-color: rgb(255, 255, 255);'
                    });
                    $(this).attr({
                        style: 'cursor: pointer !important; line-height: 25px !important; font-size: 12px !important; color: rgb(67, 149, 255) !important; box-sizing: border-box; padding-left: 11px; height: 25px; background-color: rgb(255, 255, 255);'
                    });

                    $('#select-inner-from').slideUp(100);
                }));
            }
            selectFromBox.append(selectFromElement, selectFromIconImg, selectFromInnerBox);

            return selectFromBox;
        }

        // 目标语言方向div
        function createToElement() {
            var selectToBox = $('<div>').attr({
                'id': 'translate-head-to',
                'class': 'translate-head-retranslate',
                'style': 'line-height:23px !important;cursor:pointer !important',
                'data-click': 'no-click'
            }).css({
                'width': '97px',
                'height': '23px',
                'position': 'absolute',
                'border-radius': '3px',
                'right': '0px',
                'background-color': '#fff',
                'box-sizing': 'border-box',
                'display': 'flex',
                'justify-content': 'center',
                'align-items': 'center'
            }).on('click', function (e) {
                e.stopPropagation();
                $('#translate-head-from #select-inner-from').slideUp(100);
                $('#translate-head-from').css({
                    'padding-left': '0px',
                    'justify-content': 'center',
                    'border-radius': '3px'
                }).attr('data-click', 'no-click');

                if ($(this).attr('data-click') === 'no-click') {
                    $('#select-inner-to').slideDown(100);
                    $(this).attr('data-click', 'click').css({
                        'padding-left': '11px',
                        'justify-content': 'flex-start',
                        'border-radius': '3px 3px 0 0'
                    });
                } else {
                    $('#select-inner-to').slideUp(100);
                    $(this).attr('data-click', 'no-click').css({
                        'padding-left': '0px',
                        'justify-content': 'center',
                        'border-radius': '3px'
                    });
                }
            });

            var selectToElement = $('<span>').attr({
                id: 'detect-to',
                value: to,
                style: 'cursor:pointer !important;font-size:12px !important;color:#333 !important'
            }).css({
                position: 'relative',
                background: 'initial'
            }).html(langmap[to]);

            var selectToIconImg = $('<img>').attr({
                id: 'select-icon-img',
                src: chrome.extension.getURL('imgs/map/arrow_down_nomal.png'),
                style: 'cursor:pointer !important'
            }).css({
                position: 'relative',
                left: '5px',
                width: '9px',
                height: '5px'
            });

            var selectToInnerBox = $('<div>').attr({
                'class': 'select-inner-box',
                'id': 'select-inner-to'
            }).css({
                'position': 'absolute',
                'left': '1px',
                'top': '23px',
                'width': '97px',
                'height': '300px',
                'overflow': 'auto',
                'border': '1px solid #f0f0f0',
                'border-top': 'none',
                'border-radius': '0 0 3px 3px',
                'display': 'none',
                'box-sizing': 'border-box'
            });

            for (key in langmap) {
                if (key === 'auto') {
                    continue;
                }
                selectToInnerBox.append($('<div>').attr({
                    /* globals bridge */
                    value: key,
                    style: 'cursor:pointer !important;line-height:25px !important;font-size:12px !important;color:#333 !important'
                }).html(langmap[key]).css({
                    'box-sizing': 'border-box',
                    'padding-left': '11px',
                    'height': '25px',
                    'background-color': '#fff'
                }).hover(function () {
                    $(this).css({
                        'background-color': '#eef2fc'
                    });
                }, function () {
                    $(this).css({
                        'background-color': '#fff'
                    });
                }).on('click', function (e) {
                    e.stopPropagation();
                    if ($('#detect-to').attr('value') !== $(this).attr('value')) {
                        $('#detect-to').html($(this).html()).attr('value', $(this).attr('value'));
                        changeTranslate();
                    } else {
                        $('#detect-to').html($(this).html()).attr('value', $(this).attr('value'));
                    }

                    $('#translate-head-to').css({
                        'justify-content': 'center',
                        'padding-left': '0px',
                        'border-radius': '3px'
                    }).attr('data-click', 'no-click');

                    $('#select-inner-to').children().attr({
                        style: 'cursor: pointer !important; line-height: 25px !important; font-size: 12px !important; color: rgb(51, 51, 51) !important; box-sizing: border-box; padding-left: 11px; height: 25px; background-color: rgb(255, 255, 255);'
                    });
                    $(this).attr({
                        style: 'cursor: pointer !important; line-height: 25px !important; font-size: 12px !important; color: rgb(67, 149, 255) !important; box-sizing: border-box; padding-left: 11px; height: 25px; background-color: rgb(255, 255, 255);'
                    });
                    $('#select-inner-to').slideUp(100);
                }));
            }

            selectToBox.append(selectToElement, selectToIconImg, selectToInnerBox);

            return selectToBox;
        }

        // 生成源语种到目标语种之间的箭头
        function createTranslateIcon() {
            var imgDiv = $('<div>').attr({
                id: 'select-change'
            }).css({
                'width': '8px',
                'height': '100%',
                'position': 'absolute',
                'left': '50%',
                'display': 'flex',
                'justify-content': 'center',
                'align-items': 'center'
            });

            var imgIcon = $('<img>').attr({
                id: 'translate-icon',
                /* globals bridge */
                src: chrome.extension.getURL('imgs/map/right-arrow.png')
            });

            imgDiv.append(imgIcon);

            return imgDiv;
        }

        // 语言方向整体div
        var selectBoxElement = $('<div>').attr({
            id: 'select-translate-box'
        }).css({
            'position': 'absolute',
            'background-color': '#fff',
            'width': '238px',
            'height': '23px',
            'left': '110px',
            'top': '6px',
            'border-radius': '3px'
        });


        selectBoxElement.append(createFromElement(), createTranslateIcon(), createToElement());

        // 翻译中提示
        var ptIngElement = $('<pt>').attr({
            id: 'translate-head-ing',
            style: 'font-size:12px !important;color:#333 !important'
        }).css({
            position: 'fixed',
            left: '370px',
            top: '12px'
        }).html('翻译中...');

        // 翻译超时提示
        var ptTimeoutElement = $('<pt>').attr({
            id: 'translate-head-timeout',
            style: 'font-size:12px !important;color:#333 !important'
        }).css({
            position: 'fixed',
            left: '370px',
            top: '12px',
            display: 'none'
        }).text('翻译超时，请稍后');

        // 翻译超时提示提示后跟的重试按钮
        var ptTipsElement = $('<a>').attr({
            id: 'translate-head-retry',
            href: 'javascript:void(0)',
            style: 'color:#4395FF !important'
        }).css({

        }).text('重试');

        ptTimeoutElement.append(ptTipsElement);

        // 翻译按钮
        var tranlateButtonElement = $('<div>').attr({
            id: 'src-reload',
            style: 'cursor: pointer !important;color: white !important;text-align:center !important;' + 'border-radius: 3px !important;font-size: 12px !important;line-height:23px !important'
        }).css({
            'position': 'fixed',
            'left': '350px',
            'top': '7px',
            'height': '23px',
            'background-color': '#4395FF',
            'border': 'none',
            'width': '100px',
            'display': 'none',
            'margin': '0px',
            'margin-left': '19px'
        }).text('显示原文');

        // 右边的X
        var deleteBtnElement = $('<div>').attr({
            id: 'translate-head-cross'
        }).append($('<img>').attr({
            id: 'translate-head-cross-img',
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

        // 反馈建议
        var aTousuFanyiCom = $('<a>').attr({
            id: 'tousu_baidu_com_fanyi_add',
            href: 'javascript:void(0)',
            style: 'font-size:12px !important;color:#333 !important'
        }).css({
            'float': 'right',
            'margin-right': '15px',
            'margin-top': '11px',
            'text-decoration': 'none'
        }).text('提交建议与反馈');

        // 进入百度翻译
        var enterFanyiCom = $('<a>').attr({
            id: 'fanyi_baidu_com',
            href: 'javascript:void(0)',
            style: 'font-size:12px !important;color:#333 !important'
        }).css({
            'float': 'right',
            'margin-right': '15px',
            'margin-top': '11px',
            'text-decoration': 'none'
        }).text('进入百度翻译');

        head_bar.append(imgElement, selectBoxElement, ptIngElement, ptTimeoutElement, tranlateButtonElement, deleteBtnElement, enterFanyiCom, aTousuFanyiCom);
        $('body').before(head_bar);
        // 点击页面收起语言选择下拉框
        $(document).on('click', function () {
            $('#translate-head-to #select-inner-to').slideUp(100);
            $('#translate-head-to').css({
                'padding-left': '0px',
                'justify-content': 'center',
                'border-radius': '3px'
            }).attr('data-click', 'no-click');
            $('#translate-head-from #select-inner-from').slideUp(100);
            $('#translate-head-from').css({
                'padding-left': '0px',
                'justify-content': 'center',
                'border-radius': '3px'
            }).attr('data-click', 'no-click');
        });
        $('#translate-head-from #select-inner-from').children().each(function (index, el) {
            if (el.getAttribute('value') === 'auto') {

            } else if (el.getAttribute('value') === $('#translate-head-from #detect-from').attr('value')) {
                el.setAttribute('style', 'cursor: pointer !important; line-height: 25px !important; font-size: 12px !important; color: rgb(67, 149, 255) !important; box-sizing: border-box; padding-left: 11px; height: 25px; background-color: rgb(255, 255, 255);');
            }

        });

        $('#translate-head-to #select-inner-to').children().each(function (index, el) {
            if (el.getAttribute('value') === $('#translate-head-to #detect-to').attr('value')) {
                el.setAttribute('style', 'cursor: pointer !important; line-height: 25px !important; font-size: 12px !important; color: rgb(67, 149, 255) !important; box-sizing: border-box; padding-left: 11px; height: 25px; background-color: rgb(255, 255, 255);');
            }
        });

        var body_margin_top = $('body').css('margin-top');
        var new_margin_top = parseInt(body_margin_top, 10);
        // #detect是语言检测bar
        if ($('#detect').length > 0) {
            $('#detect').remove();
        } else {
            new_margin_top += 36;
        }
        $('body').attr('style', 'position: relative; margin-top: ' + new_margin_top + 'px !important;');
        // 将吸顶的fix元素下移以防止翻译bar遮挡fix元素
        moveFixNodes();
        $('#translate-head').show();
        // 关闭bar之后，将app.didTranslate设置为false，将bar上的翻译按钮改成重新翻译，页面恢复到原文状态，但是页面中的<trans>元素并没有删掉，只是改变了<trans>元素的文本
        $('#translate-head-cross').click(function () {
            /* globals app */
            app.didTranslate = false;
            /* globals chrome */
            chrome.runtime.sendMessage({
                category: 'func',
                action: 'func_remove_headbar',
                opid: 3
            }, function (response) {});
            $('#translate-head').hide();
            $('body').attr('style', 'position: relative; margin-top: ' + body_margin_top + 'px !important;');
            recoverFixNodes();
            $('trans').each(function () {
                $(this).text($(this).attr('data-src'));
            });
            $('#src-reload').text('重新翻译');
        });
        $('#translate-head-cross').hover(function () {
            /* globals bridge */
            $('#translate-head-cross-img').attr('src', chrome.extension.getURL('imgs/map/close_hover.png'));
        }, function () {
            /* globals bridge */
            $('#translate-head-cross-img').attr('src', chrome.extension.getURL('imgs/map/close.png'));
        });
        // 翻译按钮在“显示原文”和“重新翻译”之间切换（此时页面已经被翻译过一次，即<trans>元素已经存在）
        $('#src-reload').click(function () {
            $(this).css('background-color', '#0077EC');
            chrome.runtime.sendMessage({
                category: 'func',
                action: 'func_src_reload_headbar',
                opid: 3
            }, function (response) {});
            if ($(this).text() === '显示原文') {
                $('trans').each(function () {
                    if ($(this).attr('data-src')) {
                        $(this).text($(this).attr('data-src'));
                    }
                });
                /* globals app */
                app.didTranslate = false;
                /* globals pastTitle */
                document.title = pastTitle;
                $(this).text('重新翻译');
            } else {
                $('trans').each(function () {
                    if ($(this).attr('data-dst')) {
                        $(this).text($(this).attr('data-dst'));
                    }
                });
                /* globals app */
                app.didTranslate = true;
                /* globals newTitle */
                document.title = newTitle;
                $(this).text('显示原文');
            }
        });
        $('#src-reload').hover(function () {
            $(this).css('background-color', '#54A0FF');
        }, function () {
            $(this).css('background-color', '#4395FF');
        });

        $('#translate-head-retry').click(function () {
            changeTranslate();
        });
        $('#fanyi_baidu_com').click(function () {
            chrome.runtime.sendMessage({
                category: 'guide',
                action: 'guide_fanyi_headbar',
                opid: 3
            }, function (response) {});
            window.open('http://fanyi.baidu.com');
        });

        $('#tousu_baidu_com_fanyi_add').click(function () {
            chrome.runtime.sendMessage({
                category: 'guide',
                action: 'guide_tousu_headbar',
                opid: 3
            }, function (response) {});
            window.open('http://tousu.baidu.com/fanyi/add');
        });

        $('#fanyi_baidu_com').hover(function () {
            $(this).attr('style', 'float:right;margin-right:15px;margin-top:11px;text-decoration: none;color:#4395FF !important;font-size:12px !important');
        }, function () {
            $(this).attr('style', 'float:right;margin-right:15px;margin-top:11px;text-decoration: none;font-size:12px !important;color:#333 !important');
        });

        $('#tousu_baidu_com_fanyi_add').hover(function () {
            $(this).attr('style', 'float:right;margin-right:15px;margin-top:11px;text-decoration: none;color:#4395FF !important;font-size:12px !important');
        }, function () {
            $(this).attr('style', 'float:right;margin-right:15px;margin-top:11px;text-decoration: none;font-size:12px !important;color:#333 !important');
        });
    }
};

// 点击重试之后刷新页面并重新翻译
function changeTranslate() {
    chrome.storage.local.set({
        temp_translate: ['true', $('#translate-head-from #detect-from').attr('value'), $('#translate-head-to #detect-to').attr('value')]
    }, function () {
        location.reload();
    });
}

function filterNodesByCss(parentNode, cssFilter) {
    var nodeList = [];
    for (var node = parentNode.firstChild; node !== null; node = node.nextSibling) {
        if (node.nodeType === 1) {
            var isOk = true;
            for (var propertyName in cssFilter) {
                if ($(node).css(propertyName) === cssFilter[propertyName]) {
                    continue;
                }else {
                    isOk = false;
                    break;
                }
            }
            if (isOk) {
                nodeList.push(node);
            }
            nodeList = nodeList.concat(filterNodesByCss(node, cssFilter));
        }
    }
    return nodeList;
}

var movedFixNodes = [];

function moveFixNodes() {
    var fixNodes = filterNodesByCss(document.body, {position: 'fixed'});
    for (var idx in fixNodes) {
        var top = parseInt($(fixNodes[idx]).css('top'), 10);
        if (top < 36) {
            $(fixNodes[idx]).css('top', '36px');
            var movedFixNode = {node: fixNodes[idx], orgTop: top};
            movedFixNodes.push(movedFixNode);
        }
    }
}

function recoverFixNodes() {
    if (movedFixNodes.length > 0) {
        for (var idx in movedFixNodes) {
            $(movedFixNodes[idx].node).css('top', movedFixNodes[idx].orgTop + 'px');
        }
        movedFixNodes = [];
    }
}