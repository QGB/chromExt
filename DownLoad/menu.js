// http://open.chrome.360.cn/extension_dev/tabs.html#method-remove
// 浏览器页面定位（#xx）对name=xx 属性也有效？

function tabCallback(){
	// 被关闭之后无法获取到标签信息
	// alert(arguments.length);
}


function click() {
	tab=arguments[1];

	chrome.downloads.download({url:tab.url});
	alert(tab.url);
	// alert(b.id)
	//chrome.tabs.remove(arguments[1].id,tabCallback)
	// alert(233);
	// alert(tab.title);
}

// var id = 
chrome.contextMenus.create({"title": "QGB Downlaod", "contexts":["all"],    "onclick": click});
// alert(id)