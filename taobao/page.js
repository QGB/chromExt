// if(window.location.origin==)  chrome.tabs.onUpdated.addListener(function(integer tabId, object changeInfo, Tab tab) {...});
// chrome.extension.onRequest.addListener(function(){console.log(arguments)})


// console.log(chrome)
// console.log(chrome.extension)


function qs(s){
	return document.querySelectorAll(s)

}

// alert(233)
glScrool=[['.bilibili.com/video/',430-30-20],   ]
//可以 click i[1: Max]
glQsClick=[['.bilibili.com/video/',['.bilibili-player-iconfont-start',1199],['.bilibili-player-video-btn-widescreen',311],     ],
		
		]

setTimeout(function(){
	url=window.location.href
	for(i in glScrool){
		i=glScrool[i]
		if(url.includes(i[0])){
			if(typeof(i[1])==="number"){
				//如果要scroll X，需要#TODO
				window.scrollTo(0,i[1])
				// qs('.bilibili-player-iconfont-start')[0].click()
				console.log(i,document.scrollingElement.scrollTop)
				
			}	
			
		}
	}
	
	for(i in glQsClick){
		i=glQsClick[i]
		if(url.includes(i[0])){
			j=1
			while(j<i.length){
				try{
					if(typeof(i[j])==="string"){
						qs(i[j])[0].click()
					}
					if(i[j] instanceof Array){
						function _click(a){  
							return function(){  a.click()  }  
						}  
						setTimeout(_click(qs(i[j][0])[0]),i[j][1])
						// break;
					}
				}catch(e){console.log(e)}
				
				j+=1
			}
		}
	}
	
},4199)//999 时 滚下来又弹回去了，248 


var clickedEl = null;
background=''

document.addEventListener("mousedown", function(event){
    //right click
	// alert(event,'event clickedEl')
    if(event.button == 2) { 
        clickedEl = event.target;
		clickedEl=cssPath(clickedEl)
		console.log(clickedEl)
		
			return
		if(clickedEl.style.background=='red'){
			clickedEl.style.background=background
		}else{
			background=clickedEl.style.background
			clickedEl.style.background='red'
			// setTimeout()
		}
		// document.defaultView.getComputedStyle(clickedEl,0).getPropertyValue('background-color')
    }
}, true);

var cssPath = function (el) {
  var path = [];

  while (    (el.nodeName.toLowerCase() != 'html')&&el.parentNode ){
	cn=el.className
	if(cn instanceof SVGAnimatedString)	cn=cn.baseVal
	cn=cn?'.'+cn.replace(/\s+/g, ".") : ''
	
	r=el.nodeName.toLowerCase() + 
	(el.id ? '#' + el.id : '') + cn
	path.unshift(r)
	
	rq=document.querySelectorAll(path.join(" > "))
	if(rq.length==1)return r
	el=el.parentNode
  }
  return path.join(" > ");
}
//////////////////////////////////////////////
function print(a){
	if(arguments.length>1)a=U.list(arguments)
	chrome.runtime.sendMessage({out: U.str(a)}, function(response) {
		if(response) console.log(response);
	});
}
function clearOut(){
	chrome.runtime.sendMessage({clearOut:true} );	
}

gurl='https://coding.net/u/qgb/p/js/git/raw/master/'
function loadQGB(isPrint){
	xhr=new XMLHttpRequest()
	xhr.open('get',gurl+'qgb.js')
	xhr.onload=function(){
		eval(this.response)
		if(isPrint===undefined) print('qgb loaded  '+this.response.length)
	}
	xhr.send()
	return xhr
}
loadQGB()

function taobao_item(){
	scitem=U._TEXT(function(){/*
x=new XMLHttpRequest();
x.open('GET','https://coding.net/u/qgb/p/js/git/raw/master/item.js');
x.onload=function(){eval(this.response)};
x.send();
	*/})
	
	scitem=T.replaceAll(scitem,'\n','')
	sc=U._TEXT(function(){/*
	chrome.tabs.executeScript(sender.tab.id,{code:"#code" } )
*/}).replace('#code',scitem)
	
	print(sc)
	chrome.extension.sendMessage({eval: sc}  );
	
}
function taobao_start(){
	if(!window['qgb']) loadQGB()
	N.http(gurl+'taobao.js','get',function(){ eval(this.response)  }      )
	// print(qgb)
	return
	
	href=window.location.href
	if(href.includes('tabao.com/'))isTaobao=true
	else                           isTaobao=false
	print([isTaobao,href])
	if(!isTaobao)return
	
	
}
gtaobao_pause=false
function taobao_pause(){
	gtaobao_pause=!gtaobao_pause
	print('gtaobao_pause : '+gtaobao_pause)
}

var geval = eval; // 等价于在全局作用域调用
gtabid=0
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
/* request 
options:{}
type:"taobao_item"
__proto__:Object
sender    {id: "lcgbfhamhkaojgnakpnbdnmelgahcnep"}
sendResponse
ƒ (response) {
        if (port) {
          port.postMessage(response);
          // TODO(robwu): This can be changed to disconnect() because there is
          // no point in allowing other receivers…
*/
  // var x = 2, y = 4;
  // console.log(eval("x + y"));  // 直接调用，使用本地作用域，结果是 6
	if(request.type.toLowerCase()==='eval'){
		// console.log(request);
		r={}
		try{
			r['out']=U.str(geval(request.options) )
		}catch(e){
			// console.log(e)
			r['err']=e.message||e//直接 传递e  会变成 空对象 {}
			// r['err']=U.str(e) // 变成 空对象 {}
		}
		
		chrome.runtime.sendMessage(r, function(response) {
			console.log(response);//popup:Wed May 23 2018 12:39:52 GMT+0800 (中国标准时间)
		});
		// sendResponse(geval(request.options));
	}	
	if(request.type.startsWith('taobao')){
		try{
			window[request.type]();
		}catch(e){
			chrome.runtime.sendMessage({'err':e.message} )
		}
		// return 
	}
    if(request == "getClickedEl") {
		r=clickedEl.outerHTML
		r=clickedEl
        sendResponse(r);
    }
///////////////////////////////////////////////	 
	if(sender.tab && sender.tab.id)	gtabid=sender.tab.id
	// console.log(sender)
	 
	 
}  );

