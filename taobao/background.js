glib_url='https://coding.net/u/qgb/p/js/git/raw/master/'
function loadQGB(isPrint){
	xhr=new XMLHttpRequest()
	xhr.open('get',glib_url+'jquery-1.8.1.js')
	xhr.send()
	xhr=new XMLHttpRequest()
	xhr.open('get',glib_url+'qgb.js')
	xhr.onload=function(){
		eval(this.response)
		main_loop()
	}
	xhr.send()
	return xhr
}
loadQGB()


////////////////////// UTNF.js End//////////////////
g={}
gimain_loop=0
gmain_url='https://lk.lk:1122/'
gmain_loop_stop=false

function main_loop(){
	gimain_loop+=1
	if(gmain_loop_stop)return U.log('stoped!')
	xhr=new XMLHttpRequest()
	xhr.open('GET',gmain_url+'action')
	xhr.onload = function(){
		U.weval(this.response)
		main_loop()
	}

	xhr.onerror = function(){
		U.log('#error',new Date())
		U.weval(this.response)
		main_loop()
	}
		
	xhr.send()

// N.http(gmain_url+'action','get',function(){
	// U.weval(this.response)
	// main_loop()
// },false)


// setTimeout(main_loop,999)
// U.log(new Date)
}





/*
25144
VM97:5 25145
VM97:1 Uncaught RangeError: Maximum call stack size exceeded
    at t (<anonymous>:1:11)
    at t (<anonymous>:6:8)
    at t (<anonymous>:6:8)
    at t (<anonymous>:6:8)
    at t (<anonymous>:6:8)
    at t (<anonymous>:6:8)
    at t (<anonymous>:6:8)
    at t (<anonymous>:6:8)
    at t (<anonymous>:6:8)
    at t (<anonymous>:6:8)
t @ VM97:1
t @ VM97:6
t @ VM97:6
.....
*/


// setTimeout(function(){
	// U.log(23333333)
// },999)


// loadQGB()




