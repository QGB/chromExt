
	gs_qgb_base_url='https://coding.net/u/qgb/p/js/git/raw/master/'
loadQGB=function (isPrint){
	xhr=new XMLHttpRequest()
	xhr.open('get',gs_qgb_base_url+'qgb.js')
	xhr.onload=function(){
		eval(this.response)
		if(isPrint===undefined) console.log('qgb loaded  '+this.response.length)
	}
	xhr.send()
	return xhr
}




function sleep(ms) {return new Promise(resolve => setTimeout(resolve, ms) )  }
async function test(){
	while(true){
		//loadQGB()
		//console.log(new Date())
		await sleep(999)
		
	}
}

test()