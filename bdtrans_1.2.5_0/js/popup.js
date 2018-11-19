/* 百度统计相关逻辑 */

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
var timer = null;

trackPageview('/popup');

$(document).ready(function() {
    var re = new RegExp(opt_sites.join('|'));
    chrome.tabs.query({
        active: true,
        lastFocusedWindow: true,
        currentWindow: true
    }, function (tabs) {
        if (tabs.length > 0) {
            var url = tabs[0].url;
            if (url === 'chrome://newtab/') {
                $('#translate-page').css('background', '#ccc');
            }
            if (re.test(url)) {
                $('.jumbotron').append('<img src="../imgs/check-icon.png" class="check-icon">' + '<span class="checkMsg">已对该网站进行过翻译结果优化</span>');
            }
            /* globals bridge */
            // 向content script发消息检查网页是否翻译过以确定翻译网页按钮状态
            chrome.tabs.sendMessage(tabs[0].id, {
                action: 'getDidTranslate'
            }, function (response) {
                // console.log('response', response);
                if (response.didTranslate) {
                    $('#translate-page').attr('disabled', 'true');
                    $('#translate-page').addClass('disabled').html('已翻译该网页');
                } else {
                    $('#translate-page').removeAttr('disabled');
                    $('#translate-page').removeClass('disabled').html('翻译当前网页');
                }
            });
        }
    });
    $('#translate-page').click(function () {
		
		trackEvent('translate', 'translate_page_icon');
		
        // jquery-1.11.3.js js/inject-bar.js htmlparser.js js/trans-lib.js 这些脚本已经存在于content script中，不需要重新注入
        executeScripts(null, [{
            file: 'js/jquery-1.11.3.js'
        }, {
            file: 'js/inject-bar.js'
        }, {
            file: 'js/htmlparser.js'
        }, {
            file: 'js/trans-lib.js'
        }, {
            code: 'translateByPopup();'
        }]);
        setTimeout(function () {
            window.close();
        }, 200);
    });
    $('#translate-text').click(function () {
        var query = $.trim($('#query').val());
        // query为空提示
        if (query.length <= 0) {
            $('.translate-placeholder').hide();
            $('.translate-error').show();
            var timer = setTimeout(function () {
                $('.translate-error').hide();
                $('.translate-placeholder').show();
                clearTimeout(timer);
            }, 1000);
            return;
        }
		
		trackEvent('translate', 'translate_text_icon');
		
        function dictTrans() {
            $.ajax({
                url: 'http://openapi.baidu.com/public/2.0/translate/dict/inner?',
                method: 'GET',
                data: {
                    from: $('.translate-from .selected-l-text').attr('value'),
                    to: $('.translate-to .selected-l-text').attr('value'),
                    /* eslint-disable fecs-camelcase */
                    sec_key: 'VIhvXpx8vuE1LXZOmTWvtlGF',
                    /* eslint-disable fecs-camelcase */
                    client_id: 'pTjX2N3Kne0P6xuGZzRBWE6D',
                    // appid: '20151113000005349',
                    q: $('#query').val()
                },
                async: true
            }).done(function (data) {
                // console.log('dictData', data);
                var speechPart = '';
                var means = '';
                // data.data为词典结果
				/* eslint-disable max-len */
                if (data['data'] === '' || data['data'] === null || data['data'] === undefined || data['data'].length === 0) {
                    fanyiTrans();
                } else {
                    if ($('.translate-from .selected-l-text').attr('value') === 'auto') {
                        if (data.from !== 'auto') {
                            // 让检测到的对应语言变蓝，用户点击下拉框之后可以看到
                            $('.translate-from .select-inner span')
                                .removeClass('span-hover')
                                .each(function (index, el) {
                                    if ($(el).attr('value') === data.from) {
                                        $(this).addClass('span-hover');
                                    }
                                }
                            );
                            $('.translate-from .selected-l-text').html('检测到' + langmap[data.from]);
                        } else {
                            $('.translate-from .selected-l-text').html('自动检测');
                        }
                    }
                    if (data['to'] === 'en') {
                        $('.translate-to .selected-l-text').html('英文');
                    }
                    var parts = data['data']['symbols'][0]['parts'];
                    // 一个part代表一种词性下的解释，最多显示3种词性的解释
                    if (parts.length > 3) {
                        parts = parts.slice(0, 3);
                    }
                    for (var i = 0; i < parts.length; i++) {
                        for (var j = 0; j < parts[i]['means'].length; j++) {
                            means += '<span>' + parts[i]['means'][j] + ';</span>';
                        }
                        /* eslint-disable max-len */
                        speechPart += '<div style="font-family:\'微软雅黑\';margin-top:4px;display:-webkit-box;display:box;"><span style="text-overflow:ellipsis;margin-right:5px;-webkit-box-flex:1;">' + parts[i]['part']
                            + '</span><div style="-webkit-box-flex:80;">' + means
                            + '</div></div>';
                        means = '';
                    }
                    /* eslint-disable max-len */
                    speechPart += '<p style="float:right;margin-top:8px;"><a id="moreMean" style="text-decoration:none;color:#0066FF;" href="javacript:;">全部释义\></a></p>';
                    if (speechPart.length > 0) {
                        $('#result').css('padding', '12px');
                    } else {
                        $('#result').css('padding', '0px');
                    }
                    $('#result').html(speechPart);
                    $('#moreMean').click(function () {
                        // window.open('http://fanyi.baidu.com/#en/jp/' + data['data']['word_name']);
                        window.open('http://fanyi.baidu.com/#' + data['from'] + '/' + data['to'] + '/' + data['data']['word_name']);
                    });
                }
            }).fail(function (data) {
                // console.log('faildata', data);;
                fanyiTrans();
            });
        }

        dictTrans();
        function fanyiTrans() {
            $.ajax({
                url: 'http://openapi.baidu.com/public/2.0/bmt/translate',
                method: 'GET',
                data: {
                    /* eslint-disable fecs-camelcase */
                    client_id: 'AVhF9A0GExzkU5gCkZ0Gbht7',
                    from: $('.translate-from .selected-l-text').attr('value'),
                    to: $('.translate-to .selected-l-text').attr('value'),
                    q: $('#query').val()
                },
                async: true
            }).done(function (data) {
                // console.log('transData', data);
                // var re = /[a-zA-Z]/;
                if ($('.translate-from .selected-l-text').attr('value') === 'auto') {
                    if (data.from !== 'auto') {
                        $('.translate-from .select-inner span').removeClass('span-hover').each(function (index, el) {
                            if ($(el).attr('value') === data.from) {
                                $(this).addClass('span-hover');
                            }
                        });
                        $('.translate-from .selected-l-text').html('检测到' + langmap[data.from]);
                    } else {
                        $('.translate-from .selected-l-text').html('自动检测');
                    }
                }
                if (data['to'] === 'en') {
                    $('.translate-to .selected-l-text').html('英文');
                }
                if (data['error_code'] === '52001') {
                    $('#result').text('请求超时.');
                } else if (data['error_code'] === '52002') {
                    $('#result').text('翻译系统错误.');
                } else if (data['error_code'] === '52003') {
                    $('#result').text('未授权的用户.');
                } else if (data['error_code'] === '5004') {
                    $('#result').text('参数错误.');
                } else {
                    /* eslint-disable fecs-camelcase */
                    var dst_text = '';
                    for (var i in data['trans_result']) {
                        dst_text += (data['trans_result'][i]['dst'] + '<br>');
                    }
                    if (dst_text.length > 0) {
                        $('#result').css('padding', '12px');
                    } else {
                        $('#result').css('padding', '0px');
                    }
                    // if ((data['from'] == 'en' && data['to'] !== 'zh') || (data['from'] == 'zh' && data['to'] !== 'en')) {
                 //        dst_text = dst_text;
                 //    } else {
                    dst_text += '<p style="float:right;"><a style="text-decoration:none;" href="javascript:;" id="moreMean">更多释义 \></a></p>';
                    // }
                    $('#result').html(dst_text);
                    var TransSrc = '';
                    for (var i = 0; i < data['trans_result'].length; i++) {
                        TransSrc += data['trans_result'][i]['src'];
                    }
                    // console.log("TransSrc", TransSrc);
                    $('#moreMean').click(function () {
                        window.open('http://fanyi.baidu.com/#' + data['from'] + '/' + data['to'] + '/' + TransSrc);
                    });
                }
            }).fail(function () {
                $('#result').text('翻译请求超时了，请稍后再试。');
            }).always(function (data) {
                if (data == null) {
                    $('#result').text('翻译请求超时了，请稍后再试。');
                }
            });
        }
        // fanyiTrans();
    });

    $('#translate-text-clear').click(function () {
        $('#result').html('').css('padding', 0);
        $('#query').val('');
        $('#translate-text-clear').css('visibility', 'hidden');
    });

    $('#icon_options_setting').click(function () {
		
		trackEvent('guide', 'guide_options_icon');
		
        window.open('options.html');
    });

    $('#icon_options_setting').hover(function () {
        $('#icon_options_setting_img').attr('src', 'imgs/map/setuphover.png');
    }, function () {
        $('#icon_options_setting_img').attr('src', 'imgs/map/setup.png');
    });
    /* global chrome */
    // 控制划词按钮状态
    chrome.storage.local.get(null, function (items) {
        var huaci_switch = items['huaci_switch'];
        huaciSwitchUi(huaci_switch);
        $('#huaci_switch').click(function () {
            if (huaci_switch) {
                chrome.storage.local.set({
                    huaci_switch: false
                }, function () {
                    huaci_switch = false;
                    huaciSwitchUi(huaci_switch);
                });
            } else {
                chrome.storage.local.set({
                    huaci_switch: true
                }, function () {
                    huaci_switch = true;
                    huaciSwitchUi(huaci_switch);
                });
            }
        });
    });
    function huaciSwitchUi(huaci) {
        if (huaci) {
            $('#huaci_switch').attr('src', 'imgs/map/on.png');
        } else {
            $('#huaci_switch').attr('src', 'imgs/map/off.png');
        }
    }

    $('#icon_options_home').click(function () {
		
		trackEvent('guide', 'guide_fanyi_icon');
		
        window.open('http://fanyi.baidu.com');
    });
    $('#icon_options_home').hover(function () {
        $('#icon_options_home_img').attr('src', 'imgs/map/home_hover.png');
    }, function () {
        $('#icon_options_home_img').attr('src', 'imgs/map/home.png');
    });

    $('#icon_options_help').click(function () {
		
		trackEvent('guide', 'guide_tousu_icon');
		
        window.open('http://tousu.baidu.com/fanyi/add');
    });
    $('#icon_options_help').hover(function () {
        $('#icon_options_help_img').attr('src', 'imgs/map/help_hover.png');
    }, function () {
        $('#icon_options_help_img').attr('src', 'imgs/map/help.png');
    });

    $('.select-l').on('click', selectEvent);

    $('.select-inner span').on('click', langBtnEvent);

    function selectEvent(e) {
        var target = $(e.target).hasClass('select-l') ? $(e.target) : $(e.target).parents('.select-l');
        e.stopPropagation();
        initSelectBtn();
        if (target.attr('data-click') === 'no-click') {
            target.find('.selected-l').css('justify-content', 'flex-start').css('margin-left', '15px');
            if (target.hasClass('translate-from')) {
                target.addClass('from-click');
            } else {
                target.addClass('to-click');
            }
            target.children('.select-inner').slideDown(100);
            target.attr('data-click', 'click');
        } else {
            target.attr('data-click', 'no-click');
            target.children('.select-inner').slideUp(100);
        }
    }

    function langBtnEvent(e) {
        e.stopPropagation();

        var target = $(e.target);
        target.siblings().removeClass('span-hover');
        target.addClass('span-hover');

        target.parents('.select-l').attr('data-click', 'no-click').find('.selected-l-text').html(target.html()).attr('value', target.attr('value'));
        $('.select-inner').slideUp(100);
        initSelectBtn();
    }

    function initSelectBtn() {
        $('.select-l').removeClass('from-click').removeClass('to-click');
        $('.select-inner').slideUp(100);
        $('.selected-l').css('justify-content', 'center').css('margin-left', '0');
    }

    $(document).on('click', function (e) {
        initSelectBtn();
    });
    var flag = true;
    $('#query').hover(function () {
        if (flag) {
            $(this).parent('.row').css('border-color', '#bbb');
        }
    }, function () {
        if (flag) {
            $(this).parent('.row').css('border-color', '#dedede');
        }
    }).on('blur', function () {
        if ($(this).val() === '') {
            $('.translate-placeholder').show();
        }
        $(this).parent('.row').css('border-color', '#dedede');
        flag = true;
    }).on('focus', function () {
        if ($(this).val() === '') {
            $('.translate-placeholder').hide();
        }
        $(this).parent('.row').css('border-color', '#4395FF');
        flag = false;
    }).on('keydown keyup', function () {
        if ($('#query').val().length > 0) {
            $('.translate-placeholder').hide();
            $('#translate-text-clear').css('visibility', 'visible');
        } else {
            $('#result').css('padding', '0px');
            $('.translate-placeholder').show();
            $('#translate-text-clear').css('visibility', 'hidden');
            $('#result').html('');
        }

        if ($('.form-control').get(0).scrollHeight && $('.form-control').get(0).scrollHeight < 130) {
            $('.form-control').height(this.scrollHeight);
        } else {
            $('.form-control').css('overflow-y', 'scroll');
        }

        if ($('.form-control').scrollTop() === 0 && $('.form-control').height() > 60) {
            $('.form-control').height('60px').height(this.scrollHeight);
        }
    }).on('keyup', function () {
        if (timer) {
            clearTimeout(timer);
        }
        if ($.trim($('#query').val()).length > 0) {
            timer = setTimeout(function () {
                $('#translate-text').click();
            }, 1500);
        }
    });
});