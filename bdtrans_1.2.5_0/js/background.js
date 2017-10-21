/**
    * @file background.js
    * @author tangyu@benbun
**/
/* globals chrome */
// extension.onRequest已废弃，换用runtime.onMessage https://developer.chrome.com/extensions/extension#event-onRequest
chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
    // console.log('request', request);
    // console.log('sender', sender);
    if (request.action === 'dict') {
        $.ajax({
            url: 'http://openapi.baidu.com/public/2.0/translate/dict/inner?',
            method: 'GET',
            data: {
                from: 'en',
                to: 'zh',
                /* eslint-disable fecs-camelcase */
                client_id: 'pTjX2N3Kne0P6xuGZzRBWE6D',
                /* eslint-disable fecs-camelcase */
                sec_key: 'VIhvXpx8vuE1LXZOmTWvtlGF',
                // appid: '20151113000005349',
                q: request.word
            },
            async: true
        }).done(function (data) {
            // console.log('data', data);
            sendResponse({
                data: data
            });
        });
    } else if (request.action === 'trans') {
        var appid = '20151211000007653';
        var key = 'IFJB6jBORFuMmVGDRude';
        var salt = (new Date).getTime();
        var str1 = appid + request.word + salt + key;
        /* globals MD5 */
        var sign = MD5(str1);
        $.ajax({
            url: 'http://api.fanyi.baidu.com/api/trans/vip/translate',
            method: 'GET',
            data: {
                q: request.word,
                appid: appid,
                salt: salt,
                from: 'auto',
                to: 'zh',
                sign: sign
            },
            async: true
        }).done(function (data) {
            // console.log('transData', data);
            sendResponse({
                data: data
            });
        });
    }
});