/*
chrome-extension://cgcdcjefllppjbobkjhjcmdfiflobaif/_generated_background_page.html
// The 'Reload' link.
      wrapper.setupColumn('localReload', '.reload-link', 'click', function(e) {
        chrome.developerPrivate.reload(extension.id, {failQuietly: true});
      });
https://developer.chrome.com/apps/developerPrivate
*/


chrome.browserAction.onClicked.addListener(function(tab) {
	

chrome.tabs.getAllInWindow(function(ts){
	r=""
	for(i in ts){
		i=ts[i]
		i="<a href=\""+i.url+"\">"+i.title+"</a><br>"
		r+=i
	}
	var xhr = new XMLHttpRequest();
	xhr.open('post', 'http://127.9.9.9/chrome', true);

	xhr.onload = function () {
	  // Request finished. Do processing here.
	  console.log(arguments)
	};

	// xhr.send(null);
	xhr.send(r);
	
})

  
  
});

// alert(2333)