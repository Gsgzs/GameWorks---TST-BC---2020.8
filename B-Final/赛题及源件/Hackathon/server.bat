@echo off
cd /d %~dp0
set map=%1
if "%~1"=="" (set map=1) else (set map=%1)
REM 启动测评程序
start python server/src/main.py
REM 启动游戏程序
start python pinball/main.py %map%