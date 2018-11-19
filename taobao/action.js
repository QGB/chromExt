
chrome.tabs.getCurrent(function(tab){
	if(!tab)return
	console.log(tab)
	g.tab=tab
	
})

chrome.tabs.query( {},function(tabs){
	if(!tabs)return
	// console.log(tabs.length)
	g.tab=tabs[0]
	g.tabs=tabs
})

