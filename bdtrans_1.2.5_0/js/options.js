/* 百度统计相关逻辑 */
trackPageview('/options');

var clickFlag = true;

// domainName+':'+port+'/'+webContext+'/'+uri == url
function parseURL(url) {
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

var custom_switch = false;
/* 海淘类网站名称对照，用于添加自动翻译站点时显示名称，待放到server端 */
var haitao_sites = {
    'www.amazon.com': '美国亚马逊',
    'www.backcountry.com': 'Backcountry',
    'www.buy.com': '乐天',
    'www.woot.com': 'Woot',
    'www.macys.com': '梅西百货',
    'www.endless.com': 'Endless',
    'www.bluefly.com': '蓝蝴蝶',
    'www.soap.com': 'Soap',
    'www.overstock.com': 'Overstock',
    'www.ebay.com': '易贝',
    'www.carters.com': '卡特',
    'www.gymboree.com': '金宝贝',
    'www.drugstore.com': '药店小铺',
    'www.oldnavy.com': '老海军',
    'www.oshkosh.com': '奥什科什',
    'www.albeebaby.com': '阿比尔',
    'www.diapers.com': 'Diapers',
    'www.disneystore.com': '迪斯尼',
    'www.childrensplace.com': 'Children\'s Place',
    'www.gnc.com': 'GNC',
    'www.pharmapacks.com': 'Pharmapacks',
    'www.swansonvitamins.com': '斯旺森',
    'www.vitacost.com': 'VT家',
    'www.puritan.com': '普丽普莱',
    'www.luckyvitamin.com': 'LuckyVitamin',
    'www.beauty.com': 'Beauty',
    'www.sephora.com': '丝芙兰',
    'www.origins.com': '悦木之源',
    'www.clinique.com': '倩碧',
    'www.lancome-usa.com': '兰蔻',
    'www.skinstore.com': 'SkinStore',
    'www.esteelauder.com': '雅诗兰黛',
    'shop.nordstrom.com': 'Nordstrom',
    'www.levis.com': '李维斯',
    'www.ralphlauren.com': '拉夫劳伦',
    'www.gap.com': 'Gap',
    'www.victoriassecret.com': '维多利亚的秘密',
    'www.forever21.com': 'FOREVER 21',
    'www.6pm.com': '6pm',
    'www.ashford.com': 'Ashford',
    'www.jomashop.com': 'JomaShop',
    'www.bestbuy.com': '百思买',
    'www.katespade.com': '凯特·丝蓓',
    'shop.samsonite.com': '新秀丽',
    'www.kipling.com': '凯浦林',
    'www.windeln.de': 'W家',
    'www.kidsroom.de': 'Kidsroom',
    'www.amazon.co.jp': '日本亚马逊',
    'www.rakuten.co.jp': '日本乐天'
}

// 只保存自动翻译网站列表
function save_options() {
    custom_sites = [];

    $('.site').each(function () {
        /* globals bridge */
        /* eslint-disable fecs-camelcase */
        if ($(this).text() !== '' && custom_sites.indexOf($(this).text()) === -1) {
            custom_sites.push($(this).text());
        }
    });

    chrome.storage.local.set({
        /* globals bridge */
        custom_sites: custom_sites
    }, function () {
        location.reload();
    });
}

// 只更新自动翻译网站的UI
function updateUi() {
    if (custom_switch) {
        $('#switch').removeClass('switch-open').addClass('switch-close').attr('src', 'imgs/map/on.png');
        $('#custom').removeClass('closed');
        $('#custom').removeClass('text-closed');
        $('#thead-tip').removeClass('text-closed');
        $('#add').removeClass('text-closed');
        $('.remove').removeClass('text-closed');
        $('.site a').removeClass('text-closed');
        $('.autoTranslate').css('background', '#fff');
    } else {
        $('#switch').removeClass('switch-close').addClass('switch-open').attr('src', 'imgs/map/off.png');
        $('#custom').addClass('closed');
        $('#custom').addClass('text-closed');
        $('#thead-tip').addClass('text-closed');
        $('#add').addClass('text-closed');
        $('.remove').addClass('text-closed');
        $('.site a').addClass('text-closed');
        $('.autoTranslate').css('background', '#ededed');
    }
}

function detectUi() {
    if (ban_detect) {
        $('#detect-switch').addClass('switch-open').attr('src', 'imgs/map/off.png');
        $('.div-lang-detect').css('background', '#ededed');
        $('#detect-switch-l p').css('color', '#ccc');
    } else {
        $('#detect-switch').addClass('switch-close').attr('src', 'imgs/map/on.png');
        $('.div-lang-detect').css('background', '#fff');
        $('#detect-switch-l p').css('color', '#333');
    }
}

function huaciUi() {
    /* globals huaci_switch */
    if (huaci_switch) {
        $('#huaci_switch').attr('src', 'imgs/map/on.png');
        $('#huaci_options').css('color', '#333');
        $('#fanyi_huaci').css({background: '#fff', color: '#333'});
        $('.huaci_selections').siblings('hr').css('border-bottom', '1px solid #eee');
        // 还要分别判断 btn 和frame
    } else {
        $('#huaci_switch').attr('src', 'imgs/map/off.png');
        $('#huaci_options').css('color', '#ccc');
        $('#fanyi_huaci').css({background: '#ededed', color: '#ccc'});
        $('.huaci_selections').siblings('hr').css('border-bottom', '1px solid #ddd');
        // 还要分别判断 btn 和 frame
    }
}

function huaciBtnUi() {
    /* globals huaci_button */
    if (huaci_button) {
        $('#btn_switch').attr('src', 'imgs/map/selected.png');
        $('#frame_switch').attr('src', 'imgs/map/unselected.png');
    } else {
        $('#btn_switch').attr('src', 'imgs/map/unselected.png');
        $('#frame_switch').attr('src', 'imgs/map/selected.png');
    }
}
/*
    ban_detect:自动检测
    huaci_switch:划词翻译
    huaci_button:是否“显示图标，点击即可弹出翻译。”
    online_api:线上OR线下
    custom_switch:自动翻译网站开关
    custom_sites:数组，每个元素为用户添加的一条网址
*/
function restore_options() {
    /* globals bridge */
    chrome.storage.local.get(null, function (items) {
        // console.log('items', items);
        custom_switch = items['custom_switch'];
        ban_detect = items['ban_detect'];
        online_api = items['online_api'];
        /* globals huaci_switch */
        huaci_switch = items['huaci_switch'];
        /* globals huaci_button */
        huaci_button = items['huaci_button'];
        detectUi();
        huaciUi();
        huaciBtnUi();

        if (online_api) {
            $('#api-switch').addClass('switch-open').text('线上');
        } else {
            $('#api-switch').addClass('switch-close').text('线下测试');
        }

        if (items['custom_sites'] && items['custom_sites'].length > 0) {
            $('#custom').addClass('table-custom-padding');
            for (var i in items['custom_sites']) {
                var input_obj = parseURL(items['custom_sites'][i]);
                var name = haitao_sites[input_obj.domainName] ? haitao_sites[input_obj.domainName] : input_obj.shortName;
                $('#custom').append('\
          <tr>\
            <td class="site"><a href="http://' + items['custom_sites'][i] + '" target="_blank">' + items['custom_sites'][i] + '</a></td>\
            <td class="site-name">' + name + '</td>\
            <td class="site-remove"><a href="#" class="remove">移除</a></td>\
          </tr>');
                $('.remove').click(function () {
                    if (custom_switch) {
                        $(this).parent().parent().remove();
                        save_options();
                    }
                });
            }
        } else {
            $('#custom').append('\
        <tr id="blank">\
          <td class="custom-nothing">无</td>\
        </tr>');
        }

        updateUi();
    });
}

restore_options();

$(document).ready(function () {
    $('#switch').click(function () {
        if (custom_switch) {
            chrome.storage.local.set({
                custom_switch: false
            }, function () {
                // location.reload();
                custom_switch = false;
                updateUi();
            });
        } else {
            /* globals bridge */
            chrome.storage.local.set({
                custom_switch: true
            }, function () {
                // location.reload();
                custom_switch = true;
                updateUi();
            });
        }
    });

    $('#detect-switch').click(function () {
        if (ban_detect) {
            /* globals bridge */
            chrome.storage.local.set({
                ban_detect: false
            }, function () {
                // location.reload();
                /* globals ban_detect */
                ban_detect = false;
                detectUi();
            });
        } else {
            /* globals chrome */
            chrome.storage.local.set({
                ban_detect: true
            }, function () {
                // location.reload();
                /* globals ban_detect */
                ban_detect = true;
                detectUi();
            });
        }
    });

    $('#huaci_switch').click(function () {
        /* globals huaci_switch */
        if (huaci_switch) {
            /* globals chrome */
            chrome.storage.local.set({
                huaci_switch: false
            }, function () {
                /* globals bridge */
                huaci_switch = false;
                huaciUi();
            });
        } else {
            /* globals chrome */
            chrome.storage.local.set({
                huaci_switch: true
            }, function () {
                /* globals huaci_switch */
                huaci_switch = true;
                huaciUi();
            });
        }
    });

    $('#btn_switch').click(function () {
        if (huaci_switch) {
            if (!huaci_button) {
                /* globals chrome */
                chrome.storage.local.set({
                    huaci_button: true
                }, function () {
                    /* globals huaci_button */
                    huaci_button = true;
                    huaciBtnUi();
                });
            }
        }
    });

    $('#frame_switch').click(function () {
        if (huaci_switch) {
            if (huaci_button) {
                /* globals chrome */
                chrome.storage.local.set({
                    huaci_button: false
                }, function () {
                    /* globals huaci_button */
                    huaci_button = false;
                    huaciBtnUi();
                });
            }
        }
    });

    $('#api-switch').click(function () {
        /* globals online_api */
        if (online_api) {
            /* globals chrome */
            chrome.storage.local.set({
                online_api: false
            }, function () {
                location.reload();
            });
        } else {
            /* globals chrome */
            chrome.storage.local.set({
                /* globals online_api */
                online_api: true
            }, function () {
                location.reload();
            });
        }
    });

    $('#save').click(function () {
        save_options();
    });

    var url_expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
    var url_regex = new RegExp(url_expression);

    var c_id = 0;
    $('#add').on('click', function () {
        if ($('.add-tr').length <= 0 && custom_switch) {
            if (!$('#custom').hasClass('table-custom-padding')) {
                $('#custom').addClass('table-custom-padding');
            }
            $('#custom').before('\
        <table id="' + c_id + '" class="add-table">\
          <tr class="add-tr">\
            <td class="td-add-input">\
              <input type="text" class="form-control site" placeholder="请输入网站地址，如: www.amazon.com" required>\
            </td>\
            <td class="td-add-button">\
              <button type="button" class="switch-open add-confirm" style="width:79px;float: none;margin-left:16px;">添加</button>\
            </td>\
            <td class="td-add-remove-button">\
              <button type="button" class="switch-close add-remove" style="width:79px;float: none;">取消</button>\
            </td>\
          </tr>\
          <tr><td class="fail"></td></tr>\
        </table>');
            $('.add-remove').on('click', function () {
                $(this).parent().parent().parent().parent().remove();
                if ($('.site').length <= 0) {
                    $('#custom').removeClass('table-custom-padding');
                }
            });
            $('#' + c_id + ' .add-confirm').on('click', function () {
				
				trackEvent('set', 'set_custom_option');

                var input_valid = true;
                var url_input = $(this).parent().prev().children('input').val().replace('。', '.').replace('http://', '').replace('https://', '');
                if (url_input === '') {
                    $('.fail').text('输入内容不能为空');
                    $('.fail').show();
                    input_valid = false;
                } else if (!url_input.match(url_regex)) {
                    $('.fail').text('无效网址');
                    $('.fail').show();
                    input_valid = false;
                }
                // 此处应该加入判断输入网址是否和已有网址重复的逻辑

                if (input_valid) {
                    var input_obj = parseURL(url_input);
                    var name = haitao_sites[input_obj.domainName] ? haitao_sites[input_obj.domainName] : input_obj.shortName;

                    $('#custom #blank').remove();
                    $('#custom').prepend('\
            <tr>\
              <td class="site"><a href="http://' + url_input + '" target="_blank">' + url_input + '</a></td>\
              <td class="site-name">' + name + '</td>\
              <td class="site-remove"><a href="#" class="remove">移除</a></td>\
            </tr>');
                    $(this).parent().parent().remove();
                    $('.remove').on('click', function () {
                        if (custom_switch) {
                            $(this).parent().parent().remove();
                            save_options();
                        }
                    });
                    save_options();
                }
            });
            c_id += 1;
        }
    });
});