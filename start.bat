@echo off
cd %~dp0
title ��Ϸ������

::echo WshShell = WScript.CreateObject("WScript.Shell");> temp.js
::echo WshShell.run("http://localhost");>> temp.js
::cscript temp.js
::del temp.js

node main.js
cmd