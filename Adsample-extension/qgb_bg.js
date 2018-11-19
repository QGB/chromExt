//encoding 一定要是 utf-8-BOM  
chrome.contextMenus.removeAll()

cm=chrome.contextMenus.create( {
	"id":'qgb',
	"title": "0██████Close ",
	"contexts":["all"],
	"onclick": function(a,tab){/**/
			chrome.tabs.remove(tab.id)
		}	
})	