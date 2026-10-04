@echo off
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\launcher.ps1" session
if errorlevel 1 (
  echo.
  echo Atelier did not start. Press any key to close this window.
  pause >nul
)
