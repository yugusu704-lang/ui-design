$CurrentDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$EngineRoot = $env:DEVFLOW_ENGINE
if ([string]::IsNullOrWhiteSpace($EngineRoot)) {
  Write-Error 'DevFlow engine is not configured. Set DEVFLOW_ENGINE to the engine directory containing cli.py.'
  exit 2
}

$EngineCli = Join-Path $EngineRoot 'cli.py'
if (-not (Test-Path -LiteralPath $EngineCli -PathType Leaf)) {
  Write-Error "DevFlow CLI not found: $EngineCli. Check DEVFLOW_ENGINE."
  exit 2
}

$PythonCommand = if ([string]::IsNullOrWhiteSpace($env:DEVFLOW_PYTHON)) { 'python' } else { $env:DEVFLOW_PYTHON }
if (-not (Get-Command $PythonCommand -ErrorAction SilentlyContinue)) {
  Write-Error "Python command not found: $PythonCommand. Install Python or set DEVFLOW_PYTHON to its executable path."
  exit 2
}

& $PythonCommand $EngineCli @args --target-dir $CurrentDir
exit $LASTEXITCODE
