function _TEXT(wrap) {
    return wrap.toString().match(/\/\*\s([\s\S]*)\s\*\//)[1];
}

st= _TEXT(function(){/*
return
document.body.style.backgroundColor="red"
document.body.style.backgroundColor="blue"
setTimeout(function(){alert(0)},999)

*/}).replace(/ /g,'') 

chrome.browserAction.onClicked.addListener(function(tab) {
  // No tabs or host permissions needed!
  loadqgb()
  
  
  console.log('Turning ' + tab.url + ' red!');
  chrome.tabs.executeScript({
    code: st
  });
});

function loadqgb(){
	var xhr = new XMLHttpRequest();
	xhr.open('GET', 'http://127.0.0.1/u.js', true);
	// console.log(xhr)
	xhr.onload = function () {
		txt=arguments[0].target.responseText
		console.log(txt)
	  // [XMLHttpRequestProgressEvent]
		// target:XMLHttpRequest
			// response
			// responseText
			// responseURL
		
	};
	xhr.send()
}

loadqgb()
// console.log(st,typeof st)