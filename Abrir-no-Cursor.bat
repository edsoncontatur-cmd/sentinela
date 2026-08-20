@echo off
chcp 65001 >nul
title Abrir no Cursor
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0..\scripts\abrir-workspace-cursor.ps1" -App starter -NewWindow
