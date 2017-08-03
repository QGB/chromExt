import sys,os;sys.path.append('C:/QGB/babun/cygwin/lib/python2.7/');
from qgb import *
from qgb.N.HTTPServer import *
U.cd__file__()
@route('/u.js')
def jsU(h,**ka):
	# U.repl()
	return {"Content-type": "text/plain",
		'content': U.read('../../js/U.js')}

from StringIO import *
@route('/up',['get','post'])
def recv(h,**ka):
	# s=StringIO()
	# print >>s,ka
	# s.seek(0)
	# return s.read(-1)
	return h.rfile.read(-1)
@route('t.html')
def html(h):
	return U.read('t.html')
	
	
	
@route('/t',h=None)
def t(**b):
	return b
	# 

# input()
print U.pwd()
serve()

'''
>>> dir(a)
['MessageClass', '__doc__', '__init__', '__module__', 'address_string', 'client_
address', 'close_connection', 'command', 'connection', 'date_time_string', 'defa
ult_request_version', 'disable_nagle_algorithm', 'do_GET', 'do_HEAD', 'do_POST',
 'do_routing', 'end_headers', 'error_content_type', 'error_message_format', 'fin
ish', 'handle', 'handle_one_request', 'headers', 'log_date_time_string', 'log_er
ror', 'log_message', 'log_request', 'monthname', 'parse_request', 'path', 'proto
col_version', 'raw_requestline', 'rbufsize', 'request', 'request_version', 'requ
estline', 'responses', 'rfile', 'send_error', 'send_header', 'send_response', 's
erver', 'server_version', 'setup', 'sys_version', 'timeout', 'version_string', '
wbufsize', 'weekdayname', 'wfile']
>>> a.client_address
('127.0.0.1', 1264)
'''