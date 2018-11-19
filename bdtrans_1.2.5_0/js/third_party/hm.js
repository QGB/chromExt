/**
 * 标准 pixel 代码开始
 * 标准 pixel 代码只记录 PV/UV
 */
(function(b) {
    var a = new Image,
        r = Math.floor(2147483648 * Math.random()),
        c = "hm_log_" + r;
    window[c] = a;
    a.onload = a.onerror = a.onabort = function() {
        a.onload = a.onerror = a.onabort = null;
        a = window[c] = null
    };
    a.src = b + '&rnd=' + r
})('https://hm.baidu.com/hm.gif?si=3b231847743b9335bfaccda43a1abc1b&et=0&nv=0&st=4&v=pixel-1.0');

/**
 *  标准 pixel 代码结束
 */

/************************如果标准 pixel 代码够用，那么以下就可以无视了************************/

/**
 * 以下是你可以自定义记录信息的示意
 * 参数含义见：http://wiki.baidu.com/display/HMJS/tag
 */

// 记录日志使用的公共方法
var hmLog = function (url) {
    var img = new Image;
    var r = Math.floor(2147483648 * Math.random());
    var c = "hm_log_" + r;
    
    window[c] = img;
    img.onload = img.onerror = img.onabort = function() {
        img.onload = img.onerror = img.onabort = null;
        img = window[c] = null
    };
    
    img.src = url + '&rnd=' + r;
};

// 如果你要记录一个 PV (_trackPageview)
var trackPageview = function (url) {
    var def = document.location.protocol === 'https:' ? 'https:' : 'http:';
    url = def + '//' + document.location.host + url;
    
    var logUrl = 'https://hm.baidu.com/hm.gif?si=3b231847743b9335bfaccda43a1abc1b&et=0&nv=0&st=4&v=pixel-1.0&u='
        + encodeURIComponent(url);
        
    hmLog(logUrl);
};

// 如果你要记录一个事件 (_trackEvent)
var trackEvent = function (category, action, opt_label, opt_value) {
    var replaceSpecialChars = function (text) {
        return text.replace ? text.replace(/'/g, '\'0').replace(/\*/g, '\'1').replace(/!/g, '\'2') : text;
    };
    
    var logUrl = 'https://hm.baidu.com/hm.gif?si=3b231847743b9335bfaccda43a1abc1b&et=0&nv=0&st=4&v=pixel-1.0&et=4&ep='
        + replaceSpecialChars(category)
        + '*' + replaceSpecialChars(action)
        + (opt_label ? '*' + replaceSpecialChars(opt_label) : '')
        + (opt_value ? '*' + replaceSpecialChars(opt_value) : '');
  
    hmLog(logUrl);
};