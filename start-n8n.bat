@echo off
title n8n Workflow Automation
cd /d "%~dp0"

echo Starting n8n with file-access modules enabled...
echo Web UI: http://localhost:5678

:: ?? Code ???????? (fs, path)
set "NODE_FUNCTION_ALLOW_BUILTIN=fs,path"
set "NODE_FUNCTION_ALLOW_EXTERNAL=*"
set "N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true"

start "" cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:5678"

set "PATH=%~dp0.runtime\node-v20;%PATH%"
"%~dp0.runtime\node-v20\node.exe" "%~dp0.runtime\n8n-app\node_modules\n8n\bin\n8n"

pause