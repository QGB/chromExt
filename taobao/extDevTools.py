#coding=utf-8
import sys;'qgb.U' in sys.modules or sys.path.append('G:/QGB/babun/cygwin/lib/python2.7/');from qgb import *;C=c=U.clear;NPP=npp=U.npp;py=U.py
_1=Win.getAllWindows()                                                  # 1 
_3='Developer Tools - chrome-extension://'                              # 3 
_2=[i for i in _1 if _3 in i[1]]                                     # 2 
if len(_2)!=1:raise EnvironmentError(_2,'can not locate '+_3)

import pywinauto                                                        # 4 
app=pywinauto.Application().connect(handle=_2[0][0])                    # 6 
_7=app.windows()
w= _27=[i for i in _7 if _3 in ''.join(i.texts())  ] [0]
import win32api  

def getWCur():
    import win32api
    x,y=win32api.GetCursorPos()
    r=w.rectangle()
    return [x-r.left,y-r.top]                                           # 55 
# while 1:
    # print (getWCur())
    # U.sleep(1)                                                          # 59 
	
def reset():
	w.click_input(coords=[8, 8])                                        # 60 
	U.sleep(0.3)
	w.click_input(coords= [148, 50])                                        # 60 
	U.sleep(0.3)
	w.click_input(coords=[146, 117])                                        # 61 
	U.sleep(0.3)

	# w.send_keystrokes('^L')                                                 # 67 
	w.send_keystrokes('loadQGB ')#() 不能直接用                                         # 69 
	w.send_keystrokes('{(}{)}')
	w.send_keystrokes('{ENTER}')                                            # 70


if __name__=='__main__':
	reset()