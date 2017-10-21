/*优化站点列表,待放到server端*/
opt_sites = ['http://www.amazon.com/*', 'https://www.amazon.com/*', 'http://www.gnc.com/*', 'http://www.diapers.com/*', 'http://www.jomashop.com/*', 'http://www.6pm.com/*', 'http://www.ebay.com/*']

/*封装executeScript，可以向当前网页批量注入js脚本*/
function executeScripts(tabId, injectDetailsArray) {
    function createCallback(tabId, injectDetails, innerCallback) {
        return function () {
			/* globals chrome */
            chrome.tabs.executeScript(tabId, injectDetails, innerCallback);
        };
    }

    var callback = null;

    for (var i = injectDetailsArray.length - 1; i >= 0; --i) {
        callback = createCallback(tabId, injectDetailsArray[i], callback);
    }
    if (callback !== null) {
        callback();
    }
}

/*绑定右键翻译事件，暂时不用*/
function genericOnClick(info, tab) {
    executeScripts(null, [{
        file: 'js/jquery-1.11.3.js'
    }, {
        file: 'js/inject-bar.js'
    }, {
        file: 'js/htmlparser.js'
    }, {
        file: 'js/trans-lib.js'
    }, {
        code: 'if($(\'#translate-head\').length<=0){injectBar(\'auto\',\'zh\',langmap);translate();}'
    }]);
}