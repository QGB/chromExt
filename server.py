import os,sys,shutil
import BaseHTTPServer
from urlparse import urlparse,parse_qs
try:
	from cStringIO import StringIO
except ImportError:
	from StringIO import StringIO

gsr=''

import sys;sys.path.append("C:/QGB/babun/cygwin/lib/python2.7");from qgb import *
from qgb.N.HTTPServer import route,server

@route(args=None)
def get():
	return '<head><meta charset="UTF-8"></head>'+gsr

@route('/chrome',['post'])
def chrome(h,**ka):
	global gsr
	gsr= h.postData
	# U.pprint(ka)
	# U.repl()
	# U.thread(target= U.repl).start()
	return ''
	
server(onMainThread=True)
exit()	
class handler(BaseHTTPServer.BaseHTTPRequestHandler):
	server_version = "SimpleHTTP/" 

	def do_GET(self):
		f = StringIO()
		f.write('<head><meta charset="UTF-8"></head>')
		global gsr
		f.write(gsr)
		
		length = f.tell()
		f.seek(0)
		self.send_response(200)
		self.send_header("Content-Length", str(length))
		self.send_header("Content-type", "text/html; charset=utf-8")
		self.end_headers()
		
		try:
			shutil.copyfileobj(f, self.wfile)
		finally:
			f.close()
			
	def do_POST(self):
		length = int(self.headers['Content-Length'])
		# arguments = parse_qs(.decode('utf-8'))
		global gsr
		gsr= self.rfile.read(length)
		
		self.send_response(200)
		self.send_header("Content-type", "text/html; charset=%s" % U.encoding)
		self.send_header("Content-Length", 0)

		self.end_headers()
			
	# def log_request(*a):
		# s=a[0]
		# print a,s.raw_requestline

def test(HandlerClass = handler,   ServerClass = BaseHTTPServer.HTTPServer):
	BaseHTTPServer.test(HandlerClass, ServerClass)


if __name__ == '__main__':
	test()