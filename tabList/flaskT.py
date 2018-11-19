#coding=utf8
import sys;'qgb.U' in sys.modules or sys.path.append('G:/QGB/babun/cygwin/lib/python2.7/');from qgb import *;py=U.py
sys.path.pop()
# U.msgbox()
# exit()
import sys,os
import traceback as tb
from pprint import pformat
import IPython

from flask import Flask
from flask import request
from flask import make_response
from flask import json
import logging,json

import sqlalchemy
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, DateTime
import datetime
ModelBase = declarative_base()#子类必须要有 __tablename__ , 所以不能新建一个类再让 Table 继承

class SItem(ModelBase):
	__tablename__ ='SItem'    #sqlalchemy.exc.InvalidRequestError: Class <item> does not have a __table__ or __tablename__
	url     =Column(String(),primary_key=True)#0	
	img     =Column(String())                 #1
	title   =Column(String())	              #2
	price   =Column(String())	              #3
	ship    =Column(String())	              #4
	deal    =Column(String())	              #5
	shop    =Column(String())	              #6
	location=Column(String())	              #7
	icons   =Column(String())	              #8
	time    = Column(DateTime, default=datetime.datetime.now)
	def __init__(s,*a,**ka):
		_initFromList(s,*a)
		super().__init__(**ka)
		
class Item(ModelBase):
	__tablename__ ='Item'  
	url     =Column(String(),primary_key=True)#0:"https://item.
	title   =Column(String())	              #1:"MICRO USB转Di		
	price   =Column(String())	              #2:"0.08"		
	sprice  =Column(String())	              #3:"0.37"		
	type    =Column(String())	              #4:"优惠促销"		
	freight =Column(String())	              #5:"快递 ¥6.00 "		
	comment =Column(String())	              #6:"21累计评论"		
	deal    =Column(String())	              #7:"1132交易成功"		
	favorite=Column(String())	              #8:" (24人气)"		
	multi   =Column(String())	              #8: json list of multi 
	time    = Column(DateTime, default=datetime.datetime.now)
	def __init__(s,*a,**ka):
		_initFromList(s,*a)
		super().__init__(**ka)
		
class PItem(ModelBase):
	__tablename__ ='PItem'
	url     =Column(String(),primary_key=True)#0	
	img     =Column(String())                 #1
	title   =Column(String())                 #2
	price   =Column(String())                 #3
	sprice  =Column(String())                 #4
	deal    =Column(String())                 #5
	comment	=Column(String())	              #6		
	time    = Column(DateTime, default=datetime.datetime.now)
	def __init__(s,*a,**ka):
		_initFromList(s,*a)
		super().__init__(**ka)#指定参数优先
#############common :url title price deal  ###############################		
def _initFromList(s,*a):
	if len(a)>1:raise py.ArgumentError('must only one list',a)
	if len(a)==1:
		a=a[0]
		cs=s.__table__.columns
		iskip=len(cs)-len(a) 
		if iskip<0 or iskip>2 :raise py.ArgumentError(len(a),len(cs),'a columns can not match list',a)
		for i,c in enumerate(cs):
			if i+iskip>=len(cs):break
			s.__dict__[c.name]=a[i]
	#len==0 pass
			

engine = sqlalchemy.create_engine("sqlite:///{}.db".format(U.stime() )  )
	
ModelBase.metadata.create_all(engine)
DBSessinon = sqlalchemy.orm.sessionmaker(bind=engine)   # 创建会话类
gdb = DBSessinon()                                  # 创建会话对象

# si=SItem(url=1,img=1,deal=2)
# si=SItem()#必须要有主键sqlalchemy.exc.IntegrityError: (sqlite3.IntegrityError) NOT NULL constraint failed: SItem.url 
# gdb.merge(SItem(url=1)) 
# gdb.merge(Item(url=2)) 
# gdb.merge(PItem(url=3)) 
# gdb.merge(si) 
# gdb.commit()

# IPython.embed()
# exit()


U.set(1,2)
def sleep():
	if not U.get(1):return
	U.sleep(1)
	sleep()

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
	
	
key=r'G:\QGB\software\xxnet\data\gae_proxy\Certkey.pem'
crt=r'G:\QGB\babun\cygwin\home\qgb\chromExt\tabList\lk.lk.crt'
ka={'port':1122,'host':'0.0.0.0','ssl_context':(crt,key)}
if __name__=='__main__':
	# U.thread(target=IPython.embed).start() 
	app.run(**ka,debug=0)
	# ka['debug']=1;U.thread(target=app.run,kwargs=ka).start() 
	# IPython.embed()
	# ProgrammingError: (sqlite3.ProgrammingError) SQLite objects created in a thread can only be used in that same thread.
	# The object was created in thread id 91700 and this is thread id 85640  不能在不同线程上gdb.ommit
