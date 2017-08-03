console.log(chrome)
console.log(chrome.extension)

chrome.extension.onRequest.addListener(function(){console.log(arguments)})