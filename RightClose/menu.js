// http://open.chrome.360.cn/extension_dev/tabs.html#method-remove
// 浏览器页面定位（#xx）对name=xx 属性也有效？
chrome.browserAction.onClicked.addListener(function(tab) {
	if(tab.url.includes('://192.168.')){
		function f_js192(){
			console.log(tab.url,new Date())
			chrome.tabs.executeScript(tab.id,{
			'code':js192
				
			})
			setTimeout(f_js192,9999*4)
		}
		f_js192()
		// console.log(js192)
		return
	   }
})
function tabCallback(){
	// 被关闭之后无法获取到标签信息
	// alert(arguments.length);
}

// 0 :{editable: false, frameId: 0, menuItemId: 55293, pageUrl: "chrome://extensions/"}
function click(_0,tab) {
	// console.log(arguments	);
	chrome.tabs.remove(tab.id,tabCallback)
}
chrome.contextMenus.removeAll()
// var id = 
chrome.contextMenus.create({"title": "1 Close Tab", "contexts":["all"],    "onclick": click});
// alert(id

function all() {
	function getOpenedTabs() {
  var openedTabs = [];
  chrome.windows.getAll({}, function(wins) {
    for (var w in wins) {
      if (wins[w].id !== undefined) {
        chrome.tabs.getAllInWindow(wins[w].id, function(tabs) {
          for (var t in tabs) {
            if (tabs[t].id !== undefined) {
              openedTabs.push(tabs[t]);
            }
          }
        });
      }
    }
  });
  return openedTabs;
}

console.log(getOpenedTabs())
}

// var id = 
// chrome.contextMenus.create({"title": "all Tab", "contexts":["all"],    "onclick": all});