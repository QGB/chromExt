import os,sys,shutil
import BaseHTTPServer
from urlparse import urlparse,parse_qs
try:
	from cStringIO import StringIO
except ImportError:
	from StringIO import StringIO

sys.path.append('D:/Program Files/.babun/cygwin/lib/python2.7/');from qgb import *
gsr=''
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
	sys.argv=[sys.argv[0],'8900']
	BaseHTTPServer.test(HandlerClass, ServerClass)


if __name__ == '__main__':
	test()