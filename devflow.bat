@echo off
setlocal

if not defined DEVFLOW_ENGINE (
  echo DevFlow engine is not configured. Set DEVFLOW_ENGINE to the engine directory containing cli.py.
  exit /b 2
)

set "DEVFLOW_CLI=%DEVFLOW_ENGINE%\cli.py"
if not exist "%DEVFLOW_CLI%" (
  echo DevFlow CLI not found: "%DEVFLOW_CLI%"
  echo Check that DEVFLOW_ENGINE points to the engine directory containing cli.py.
  exit /b 2
)

if not defined DEVFLOW_PYTHON set "DEVFLOW_PYTHON=python"
"%DEVFLOW_PYTHON%" "%DEVFLOW_CLI%" %* --target-dir "%~dp0"
exit /b %errorlevel%
