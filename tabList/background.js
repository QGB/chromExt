U={};T={}
U._TEXT=function(wrap) {return wrap.toString().match(/\/\*\s([\s\S]*)\s\*\//)[1];}
U.isList=U.isArray=Array.isArray
U.isint=U.isInt=   Number.isInteger
U.isnum=U.isNum=   function(a){return typeof a==='number'}
U.istr=U.isStr=    function(a){return typeof a==='string'}
U.isbool=U.isBool= function(a){return typeof a==='boolean'}

U.str=String

T.sub=function (a,start,end){//#TODO start lists
	startLen=start.length
	start=a.indexOf(start)
	if(start===-1)return ''
	else start+=startLen
	
	if(end){
		if(U.isArray(end)){
			for(i of end){
				i=U.str(i)
				if(i){
					i=a.indexOf(i,start)
					if(i===-1)continue
					else{
						end=i
						break
					}
				}else{
					if(i===''){
						end=a.length
						break
					}
					else continue
				}
			}
		}else if(U.istr(end)){
			end=a.indexOf(end,start)
			if(end===-1)return ''
		}
// 		else if(U.isInt(end)){}
		else {
			throw 'end must be list or str'
		}
	}else   end=a.length
	end=end-start
	return a.substr(start,end)// substr(start,length)
}



////////////////////// UTNF.js End//////////////////
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
// chrome.contextMenus.create({"id":"00","title": "1 Close Tab", "contexts":["all"]});
// chrome.contextMenus.onClicked=function(){console.log(arguments)}                                       
/*
chrome-extension://cgcdcjefllppjbobkjhjcmdfiflobaif/_generated_background_page.html
// The 'Reload' link.
      wrapper.setupColumn('localReload', '.reload-link', 'click', function(e) {
        chrome.developerPrivate.reload(extension.id, {failQuietly: true});
      });
https://developer.chrome.com/apps/developerPrivate
*/
//未使用 'http://192.168.2.123:8085/js/jquery-1.11.2.min.js'



js$= U._TEXT(function(){/*
function sleep(ms) {return new Promise(resolve => setTimeout(resolve, ms) )  }

var xhr = new XMLHttpRequest();
xhr.open('get','http://192.168.2.22/lib/jquery-1.10.1.min.js', true);
xhr.onload = function () {
	eval(xhr.response)
	async function test() {
//code
	}
	test()
}
xhr.send()
*/})
js192=U._TEXT(function(){/*
		g192=["#headFunc > li:nth-child(2)  ", 
			"#sysTool_menu" ,
			'#sysTool_menu7',
		]
		// async function ping(){
			
			for(i in g192){
				$(g192[i]).click()
				await sleep(1000)
			}
			$('#addr')[0].value='192.168.1.1'
			$('#sendNum')[0].value='50'
			$('#pSize')[0].value='1472'
			$('#overTime')[0].value='2000'
			await sleep(999)
			$('#start').click()
			window.scrollTo(0,555)	
			// await sleep(9999)
			// window.location.reload()
			// await sleep(5999)
			// setTimeout(ping,1)
		// }
		// ping()
		
		
*/})
js192=js$.replace('//code',js192)


ip='192.168.1.1'

chrome.browserAction.onClicked.addListener(function(tab) {
	if(tab.url.includes('://192.168.')){
		function f_js192(){
			console.log(tab.url,new Date())
			
			if(isNaN(ip)){code=js192.replace('192.168.1.1',ip)}
			else{code=js192.replace('192.168.1.1','192.168.'+ip)}
			// console.log(js192)
			if(tab.url.includes('://192.168.2.22')){code=code.replace('192.168.2.11','192.168.2.22')}
			chrome.tabs.executeScript(tab.id,{
			'code':code
				
			})
			setTimeout(f_js192,9999*7)//11=*4
		}
		f_js192()
		// console.log(js192)
		return
	   }
	
	
	chrome.tabs.getAllInWindow(function(ts){
		r=""
		for(i in ts){
			i=ts[i]
			i="<a href=\""+i.url+"\">"+i.title+"</a><br>"
			r+=i
		}
		var xhr = new XMLHttpRequest();
		xhr.open('post', 'http://127.9.9.9:8900/chrome', true);

		xhr.onload = function () {
		  // Request finished. Do processing here.
		  console.log(arguments)
		};

		// xhr.send(null);
		xhr.send(r);
		
	})
});
glTransUrls=[
// ['https://zh.wikipedia.org/','https://wiki.kfd.me/'],
['https://translate.google.com/','https://translate.google.com.my/'],
['http://0.0.0.0:','http://127.0.0.1:'],
]
function transUrl(tab){
		url=tab.url
	for(i in glTransUrls){
		i=glTransUrls[i]
		if(url.startsWith(i[0])){
			url=url.replace(i[0],i[1])
			chrome.tabs.update(tab.id, {"url":url})
			// console.log(changeInfo,tab)
			break
		}
		
	}	
}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	transUrl(tab)	
});
chrome.tabs.onCreated.addListener(function(tab) {
	transUrl(tab)
});


jsZhihuDelCol= U._TEXT(function(){/*
console.log($)
*/})
// jsZhihuDelCol=js$.replace('//code',jsZhihuDelCol)

function googleSearch(a,tab){
	url='https://www.google.com.my/search?q='+T.sub(tab.url,'q=',['&',''])
	chrome.tabs.update(tab.id, {"url":url})
}
function zhihuSearch(a,tab){
	url='https://www.zhihu.com/search?type=content&q='+T.sub(tab.url,'q=',['&',''])
	chrome.tabs.update(tab.id, {"url":url})
}

gcmUrl={
		
		'www.google.com':zhihuSearch,
		'www.zhihu.com/search':googleSearch,
		
		'.taobao.com/':taobao,
		'.zhihu.com/':zhihu	
		}
cm=chrome.contextMenus.create( {
	"id":'qgb',
	"title": "1 qgb Translate",
	"contexts":["page","selection","link","editable","image","video", "audio"],
	"onclick": function(a,tab){/**/
		console.log(a)
		if(a.mediaType==="image"){
			if(tab.url.substr(0,31).includes('.zhihu.com')){
				code=U._TEXT(function(){/*
					img=document.querySelector('img[src="{src}"]')
					s=img.src
					img.src=s.substr(0,s.length-3)+'gif'
				*/}).replace('{src}',a.srcUrl)
				chrome.tabs.executeScript(tab.id,{'code':code})
				return
			}
			
		}
		
		if(a.selectionText){
			return chrome.tabs.create({url:'https://www.zhihu.com/search?q='+a.selectionText})
		}
		for(i in gcmUrl){//(i of  x)VM91:1 Uncaught TypeError: gcmUrl is not iterable
			if(tab.url.includes(i)){return gcmUrl[i](a,tab)}
		}
		
		url='https://translate.google.com.my/translate?u='
		if(tab.url.includes('://translate.google.com')){
			url=T.sub(tab.url,'u=',['&',''])
			url=decodeURIComponent(url)
		}else{
			url=url+tab.url
		}
		console.log(url,tab.id)
		
		chrome.tabs.update(tab.id, {"url":url})
		// alert(tab.title)
		}
	});
	
function taobao(clickData,tab){
	console.log(clickData,'==================',tab)
	
}

function zhihu(clickData,tab){
	 chrome.tabs.sendMessage(tab.id, "getClickedEl", function(clickedEl) {
        console.log(clickedEl);
    });
	console.log(clickData,'==================',tab)
	
}
chrome.extension.onRequest.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension",request);
	document.body.innerHTML=request.innerHTML
	sendResponse({1:chrome.tabs.execScript})
    // if (request.greeting == "hello")
      // sendResponse({farewell: "goodbye"})
  });
  
 geval=eval
 garguments=0
 gtabid=-2
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {/*
0:{}
1:{id: "ddancfodhaoofkchhcknpiimoalbdafo", url: "https://coding.net/u/qgb/p/js/git/raw/master/qgb.js", tab: {
	active:true
	audible:false
	autoDiscardable:true
	discarded:false
	favIconUrl:"https://coding.net/favicon.ico"
	height:1080
	highlighted:true
	id:3672
	incognito:false
	index:2
	mutedInfo:{muted: false}
	pinned:false
	selected:true
	status:"complete"
	title:"https://coding.net/u/qgb/p/js/git/raw/master/qgb.js"
	url:"https://coding.net/u/qgb/p/js/git/raw/master/qgb.js"
	width:1920
	windowId:3609
	__proto__:Object
}, frameId: 0}
2:ƒ (response)
//////////////////////////////////////////
{"eval":"request"}
{"id":"ddancfodhaoofkchhcknpiimoalbdafo","url":"chrome-extension://ddancfodhaoofkchhcknpiimoalbdafo/popup.html"}
function
*/
	garguments=arguments
	gtabid=sender.tab ? sender.tab.id : -1
	
      if (request.eval){
		 sendResponse( eval(request.eval) )
		  
        //  chrome.tabs.remove(sender.tab.id);
      }
});
  
  
  
  
  
js_msg=U._TEXT(function(){/*
chrome.extension.sendRequest({innerHTML: document.body.innerHTML

}, function(response) {
  console.log(response);
});
*/})
  
  
// chrome.tabs.detectLanguage(279,function (asLanguage){console.log(asLanguage)})

// cmZDC=chrome.contextMenus.create( {"title": "1 jsZhihuDelCol", "parentId": cm, "onclick": function(info, tab){
	// chrome.tabs.executeScript(tab.id,{
			// 'code':jsZhihuDelCol
		// })
// }});

chrome.cookies.get({
	url: 'https://github.com',
	name: 'dotcom_user'
}, function(cookie) {
	console.log(cookie);
});