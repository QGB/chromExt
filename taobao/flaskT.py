#coding=utf8
import sys;'qgb.U' in sys.modules or sys.path.append('G:/QGB/babun/cygwin/lib/python2.7/');from qgb import *;py=U.py
sys.path.pop()
# U.msgbox()
# exit()
import sys,os
import traceback as tb
from pprint import pformat
import IPython

import logging,json

U.set(1,2)
def sleep():
	if not U.get(1):return
	U.sleep(1)
	sleep()
	
from flask import Flask,request,make_response,json
app = Flask(__name__)
def on_receive(request):
	t=request.path[1:]
	r=json.loads(request.get_data())
	U.set(t,r)
	if t.startswith('Item'):gdb.merge(Item(r))
	else:
		for i in r:gdb.merge(globals()[t](i))
	try:
		gdb.commit()
	except Exception as e:
		py.traceback(e)
		gdb.rollback()
	response = make_response(pformat(request.headers)+'\n===============\n'+pformat(request.get_data())  )
	return response
@app.route('/SItem', methods=['GET', 'POST'] )
def receive_SItem():return on_receive(request)
	
@app.route('/PItem', methods=['GET', 'POST'] )
def receive_PItem():return on_receive(request)
	
@app.route('/Item', methods=['GET', 'POST'] )
def receive_Item():return on_receive(request)

@app.route('/commit' )
def do_commit():
	gdb.commit()
	return pformat(request.headers)+'\n===============\n'+pformat(request.get_data())

# @app.route('/eval(<st>)')
# @app.route('/eval <st>')
# @app.route('/eval<st>')
@app.route('/eval/<st>')
def do_eval(st):
	headers={ 'content-type':'text/plain' }
	return '{}\n{}\n{}'.format(st,'='*22,U.eval(st)),200,headers

@app.route('/json', methods=['GET', 'POST'] )	
def receive_json():
	F.write('1122.json',request.get_data())
	F.write('1122.headers',request.headers)
	return U.stime()
giaction_count=-1
@app.route('/action' )
def chrome_action():
	global giaction_count
	giaction_count+=1
	U.sleep(3)
	return F.read('./action.js')
	response=''
	# IPython.embed()
	U.sleep(1)
	return response
	gccreate.format(url='')

gc=r'''

'''	
gc=r'''

'''	
gc=r'''

'''	
gc=r'''

'''	
gcgetCurrent=r'''
chrome.tabs.getCurrent(function(tab){
	console.log(tab)
	g.tab=tab
})
'''	
gcgetAllTab=r'''
'''	
gccreate=r'''
chrome.tabs.create({'url': '{url}', 'selected': true} ,function( tab) {
	gtab=tab
	setTimeout(function(){
	},1000*11)
 }   
);	

'''





















	
key=r'G:\QGB\software\xxnet\data\gae_proxy\Certkey.pem'
crt=r'G:\QGB\babun\cygwin\home\qgb\chromExt\tabList\lk.lk.crt'
ka={'port':1122,'host':'0.0.0.0','ssl_context':(crt,key)}
if __name__=='__main__':
	# U.thread(target=IPython.embed).start() 
	app.run(**ka,debug=1)
	# ka['debug']=1;U.thread(target=app.run,kwargs=ka).start() 
	# IPython.embed()
	# ProgrammingError: (sqlite3.ProgrammingError) SQLite objects created in a thread can only be used in that same thread.
	# The object was created in thread id 91700 and this is thread id 85640  不能在不同线程上gdb.ommit
