// chrome.app.runtime.onLaunched.addListener(openWindow);
// chrome.app.runtime.onRestarted.addListener(openWindow);

function openWindow() {
  chrome.app.window.create('window.html', {
    id: 'window',
    defaultWidth: 600,
    defaultHeight: 700,
    defaultTop: 20,
    defaultLeft: 20
  });
}
function log(){
	for(i in arguments){
		console.log(arguments[i])// 无法在浏览器调试中定位到所在行，建议直接使用		
	}
}


console.log(chrome.extension.getBackgroundPage())
console.log(window)

x=new XMLHttpRequest()
x.open('get','http://qq.com')


// i=0
// log(i)

// while(1){
	// alert(i+=1)
	// console.log(new Date())	
// }

