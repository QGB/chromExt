var app = {
    didTranslate: false
};
/* globals match_list */
match_list = [];
/* globals bridge */
chrome.storage.local.get(null, function(items) {
    // storage中的temp_translate在某些情况下会被设置成true，并刷新整个页面，设置成true时，表示刷新后的页面需要直接按照temp_translate中的语言方向翻译一遍
    if (items['temp_translate']) {
        /* globals bridge */
        injectBar(items['temp_translate'][1], items['temp_translate'][2], langmap);
        /* globals bridge */
        translate(items['temp_translate'][1], items['temp_translate'][2]);
    // 自动翻译页面
    } else if (items['custom_switch']) {
        /* globals bridge */
        for (i in items['custom_sites']) {
            /* globals bridge */
            /* eslint-disable fecs-camelcase */
            match_list.push('.*' + items['custom_sites'][i] + '*');
        }
        /* globals bridge */
        /* eslint-disable fecs-camelcase */
        if (match_list.length === 0) {
            if (!items['ban_detect'] && window.location.href.indexOf('newtab') < 0) {
                /* globals bridge */
                langDetect();
            }
            return;
        }
        /* globals bridge */
        /* eslint-disable fecs-camelcase */
        var re = new RegExp(match_list.join('|'));

        if (re.test(window.location.href)) {
            /* globals bridge */
            /* globals bridge */
            injectBar('auto', 'zh', langmap);
            /* globals bridge */
            translate();
        } else {
            if (!items['ban_detect'] && window.location.href.indexOf('newtab') < 0) {
                /* globals bridge */
                langDetect();
            }
        }
    } else {
        // 自动检测语言
        if (!items['ban_detect'] && window.location.href.indexOf('newtab') < 0) {
            /* globals bridge */
            langDetect();
        }
    }
    /* globals bridge */
    chrome.storage.local.set({
        temp_translate: false
    });
});
/* globals bridge */
chrome.runtime.onMessage.addListener(function (data, sender, sendResponse) {
    if (data.action === 'getDidTranslate') {
        sendResponse({
            didTranslate: app.didTranslate
        });
    }
});
function translateByPopup() {
    setTimeout(function () {
        // 网页从来没有出现过翻译bar
        if ($('#translate-head').length <= 0) {
            /* globals bridge */
            /* globals bridge */
            injectBar('auto', 'zh', langmap);
            /* globals bridge */
            translate();
        // 网页出现过翻译bar，但是被用户关了
        } else if ($('#translate-head').is(':hidden')) {
            app.didTranslate = true;
            $('#translate-head').show();
            /* globals bridge */
            var body_margin_top = $('body').css('margin-top');
            /* eslint-disable fecs-camelcase */
            var new_margin_top = parseInt(body_margin_top, 10);
            new_margin_top += 36;
            $('body').attr('style', 'position: relative; margin-top: ' + new_margin_top + 'px !important;');
			/* globals moveFixNodes */
            moveFixNodes();
            $('trans').each(function () {
                $(this).text($(this).attr('data-dst'));
            });
            $('#src-reload').text('显示原文');
        // 网页有翻译bar并且用户看得见
        } else if (!$('#translate-head').is(':hidden')) {
            // 不会触发，什么都不做
            if ($('#src-reload').text() === '显示原文') {
            // 此时bar上翻译按钮显示“重新翻译”
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
                $('#src-reload').text('显示原文');
            }
        }
    }, 0);
}
