param(
  [Parameter(Mandatory = $true, Position = 0)]
  [ValidateSet('start', 'status', 'stop')]
  [string] $Action
)

$ErrorActionPreference = 'Stop'

$BuilderDir = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$WorkspaceDir = [IO.Path]::GetFullPath((Join-Path $BuilderDir '..')).TrimEnd([IO.Path]::DirectorySeparatorChar, [IO.Path]::AltDirectorySeparatorChar)
$TsxLoaderUrl = ([Uri]::new((Join-Path $BuilderDir 'node_modules/tsx/dist/loader.mjs'))).AbsoluteUri
$Utf8 = New-Object System.Text.UTF8Encoding($false)
$PathBytes = $Utf8.GetBytes($BuilderDir)
$PathHash = [Security.Cryptography.SHA256]::Create()
try {
  $WorkspaceId = ([BitConverter]::ToString($PathHash.ComputeHash($PathBytes))).Replace('-', '').ToLowerInvariant()
} finally {
  $PathHash.Dispose()
}

$LauncherDir = Join-Path $BuilderDir 'data\launcher'
$StateFile = Join-Path $LauncherDir 'state.json'
$ApiPort = 4310
$VitePort = 5173
$ApiEntry = Join-Path $BuilderDir 'server\index.ts'
$TsxCli = Join-Path $BuilderDir 'node_modules\tsx\dist\cli.mjs'
$ViteCli = Join-Path $BuilderDir 'node_modules\vite\bin\vite.js'

function Write-Message([string] $Message) {
  [Console]::WriteLine($Message)
}

function Read-State {
  if (-not (Test-Path -LiteralPath $StateFile -PathType Leaf)) { return $null }
  try {
    return Get-Content -LiteralPath $StateFile -Raw | ConvertFrom-Json
  } catch {
    throw "Launcher state is unreadable; refusing process actions. State: $StateFile"
  }
}

function Write-State($State) {
  if (-not (Test-Path -LiteralPath $LauncherDir -PathType Container)) {
    New-Item -ItemType Directory -Path $LauncherDir -Force | Out-Null
  }
  $TemporaryState = "$StateFile.$PID.tmp"
  $Json = $State | ConvertTo-Json -Depth 8
  [IO.File]::WriteAllText($TemporaryState, $Json, $Utf8)
  Move-Item -LiteralPath $TemporaryState -Destination $StateFile -Force
}

function New-State {
  return [pscustomobject]@{
    version = 1
    workspacePath = $WorkspaceDir
    workspaceId = $WorkspaceId
    processes = [pscustomobject]@{}
  }
}

function Get-StateForWorkspace([switch] $Create) {
  $State = Read-State
  if ($null -eq $State) {
    if ($Create) { return New-State }
    return $null
  }
  if ($State.workspaceId -cne $WorkspaceId -or $State.workspacePath -cne $WorkspaceDir) {
    if ($Create) { return New-State }
    return $null
  }
  if ($null -eq $State.processes) { $State | Add-Member -NotePropertyName processes -NotePropertyValue ([pscustomobject]@{}) }
  return $State
}

function Acquire-LauncherLock {
  if (-not (Test-Path -LiteralPath $LauncherDir -PathType Container)) {
    New-Item -ItemType Directory -Path $LauncherDir -Force | Out-Null
  }
  $LockFile = Join-Path $LauncherDir 'launcher.lock'
  try {
    return [IO.File]::Open($LockFile, [IO.FileMode]::OpenOrCreate, [IO.FileAccess]::ReadWrite, [IO.FileShare]::None)
  } catch {
    throw 'Another launcher start or stop operation is in progress.'
  }
}

function Get-NodeExecutable {
  $Node = Get-Command 'node.exe' -ErrorAction SilentlyContinue
  if ($null -eq $Node) { $Node = Get-Command 'node' -ErrorAction SilentlyContinue }
  if ($null -eq $Node) { throw 'node.exe was not found on PATH.' }
  return [IO.Path]::GetFullPath($Node.Source)
}

function Get-ProcessInfo([int] $ProcessId) {
  $CimProcess = Get-CimInstance -ClassName Win32_Process -Filter "ProcessId = $ProcessId" -ErrorAction SilentlyContinue
  if ($null -eq $CimProcess) { return $null }
  $Process = Get-Process -Id $ProcessId -ErrorAction SilentlyContinue
  if ($null -eq $Process) { return $null }
  try { $StartTicks = $Process.StartTime.ToUniversalTime().Ticks } catch { return $null }
  return [pscustomobject]@{
    pid = [int] $ProcessId
    startTimeUtcTicks = [string] $StartTicks
    executablePath = [string] $CimProcess.ExecutablePath
    commandLine = [string] $CimProcess.CommandLine
  }
}

function Get-ListenerPids([int] $Port) {
  try {
    $Connections = @(Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue)
    return @($Connections | ForEach-Object { [int] $_.OwningProcess } | Sort-Object -Unique)
  } catch {
    throw "Cannot inspect port $Port with Get-NetTCPConnection; refusing to start or stop services."
  }
}

function Get-RoleRecord($State, [string] $Role) {
  if ($null -eq $State -or $null -eq $State.processes) { return $null }
  $Property = $State.processes.PSObject.Properties[$Role]
  if ($null -eq $Property) { return $null }
  return $Property.Value
}

function Test-ExpectedCommand($Info, [string] $Role) {
  if ($null -eq $Info -or [string]::IsNullOrWhiteSpace($Info.executablePath) -or [string]::IsNullOrWhiteSpace($Info.commandLine)) { return $false }
  if ($Role -eq 'api') {
    return ($Info.commandLine.IndexOf($TsxCli, [StringComparison]::OrdinalIgnoreCase) -ge 0 -or
      $Info.commandLine.IndexOf($TsxLoaderUrl, [StringComparison]::OrdinalIgnoreCase) -ge 0) -and
      $Info.commandLine.IndexOf($ApiEntry, [StringComparison]::OrdinalIgnoreCase) -ge 0
  }
  if ($Role -eq 'vite') {
    return $Info.commandLine.IndexOf($ViteCli, [StringComparison]::OrdinalIgnoreCase) -ge 0 -and
      $Info.commandLine.IndexOf('--host 127.0.0.1', [StringComparison]::OrdinalIgnoreCase) -ge 0 -and
      $Info.commandLine.IndexOf("--port $VitePort", [StringComparison]::OrdinalIgnoreCase) -ge 0 -and
      $Info.commandLine.IndexOf('--strictPort', [StringComparison]::OrdinalIgnoreCase) -ge 0
  }
  return $false
}

function Test-WorkspaceServiceProcess([int] $ProcessId, [string] $Role) {
  $Info = Get-ProcessInfo $ProcessId
  if ($null -eq $Info -or [IO.Path]::GetFileName($Info.executablePath) -ine 'node.exe') { return $false }
  if ($Role -eq 'api') {
    return ($Info.commandLine.IndexOf($TsxCli, [StringComparison]::OrdinalIgnoreCase) -ge 0 -or
      $Info.commandLine.IndexOf($TsxLoaderUrl, [StringComparison]::OrdinalIgnoreCase) -ge 0) -and
      ($Info.commandLine.IndexOf($ApiEntry, [StringComparison]::OrdinalIgnoreCase) -ge 0 -or
        $Info.commandLine -match '(?i)(^|\s)["'']?server[\\/]index\.ts(["'']?\s|$)')
  }
  if ($Role -eq 'vite') {
    if ($Info.commandLine.IndexOf($ViteCli, [StringComparison]::OrdinalIgnoreCase) -lt 0 -or
        $Info.commandLine.IndexOf('--host 127.0.0.1', [StringComparison]::OrdinalIgnoreCase) -lt 0) { return $false }
    if ($Info.commandLine -match '(?i)--port\s+["'']?(\d+)') { return [int] $Matches[1] -eq $VitePort }
    return $true
  }
  return $false
}

function Test-WorkspaceListener([int[]] $Owners, [string] $Role) {
  if ($Owners.Count -eq 0) { return $false }
  foreach ($Owner in $Owners) {
    if (-not (Test-WorkspaceServiceProcess ([int] $Owner) $Role)) { return $false }
  }
  return $true
}

function Test-OwnedRecord($State, [string] $Role, $Record) {
  if ($null -eq $State -or $State.workspaceId -cne $WorkspaceId -or $State.workspacePath -cne $WorkspaceDir) { return $false }
  if ($null -eq $Record -or $null -eq $Record.pid) { return $false }
  $Info = Get-ProcessInfo ([int] $Record.pid)
  if ($null -eq $Info) { return $false }
  if ($Info.startTimeUtcTicks -cne [string] $Record.startTimeUtcTicks) { return $false }
  if (-not [string]::Equals($Info.executablePath, [string] $Record.executablePath, [StringComparison]::OrdinalIgnoreCase)) { return $false }
  if ($Info.commandLine -cne [string] $Record.commandLine) { return $false }
  return Test-ExpectedCommand $Info $Role
}

function Save-ProcessRecord($State, [string] $Role, [int] $ProcessId) {
  $Info = $null
  for ($Attempt = 0; $Attempt -lt 20 -and $null -eq $Info; $Attempt++) {
    Start-Sleep -Milliseconds 100
    $Info = Get-ProcessInfo $ProcessId
  }
  if ($null -eq $Info -or -not (Test-ExpectedCommand $Info $Role)) {
    throw "Could not establish process identity for the newly started $Role service."
  }
  $Record = [pscustomobject]@{
    pid = $Info.pid
    startTimeUtcTicks = $Info.startTimeUtcTicks
    executablePath = $Info.executablePath
    commandLine = $Info.commandLine
    startedAtUtc = [DateTime]::UtcNow.ToString('o')
  }
  $Property = $State.processes.PSObject.Properties[$Role]
  if ($null -eq $Property) {
    $State.processes | Add-Member -NotePropertyName $Role -NotePropertyValue $Record
  } else {
    $Property.Value = $Record
  }
  Write-State $State
  return $Record
}

function Test-Health([int] $Port) {
  try {
    $Response = Invoke-RestMethod -Uri "http://127.0.0.1:$Port/api/health" -TimeoutSec 2 -ErrorAction Stop
    return ($Response.ready -eq $true -and [string] $Response.workspaceId -ceq $WorkspaceId)
  } catch { return $false }
}

function Wait-Health([int] $Port, [int] $TimeoutSeconds, [string] $Role) {
  $Deadline = [DateTime]::UtcNow.AddSeconds($TimeoutSeconds)
  while ([DateTime]::UtcNow -lt $Deadline) {
    if (Test-Health $Port) { return $true }
    Start-Sleep -Milliseconds 400
  }
  return $false
}

function Remove-RoleRecord($State, [string] $Role) {
  if ($null -eq $State -or $null -eq $State.processes) { return }
  $Property = $State.processes.PSObject.Properties[$Role]
  if ($null -ne $Property) { $State.processes.PSObject.Properties.Remove($Role) }
}

function Stop-OwnedRecord($State, [string] $Role, $Record) {
  if (-not (Test-OwnedRecord $State $Role $Record)) { return $false }
  $ProcessId = [int] $Record.pid
  $Taskkill = Join-Path $env:SystemRoot 'System32\taskkill.exe'
  if (-not (Test-Path -LiteralPath $Taskkill -PathType Leaf)) { return $false }
  if (-not (Test-OwnedRecord $State $Role $Record)) { return $false }
  $null = & $Taskkill /PID $ProcessId /T /F 2>$null
  for ($Attempt = 0; $Attempt -lt 20; $Attempt++) {
    $Current = Get-ProcessInfo $ProcessId
    if ($null -eq $Current -or $Current.startTimeUtcTicks -cne [string] $Record.startTimeUtcTicks) { return $true }
    Start-Sleep -Milliseconds 100
  }
  $Current = Get-ProcessInfo $ProcessId
  return ($null -eq $Current -or $Current.startTimeUtcTicks -cne [string] $Record.startTimeUtcTicks)
}

function Get-PortStatus([int] $Port) {
  $Pids = @(Get-ListenerPids $Port)
  if ($Pids.Count -eq 0) { return [pscustomobject]@{ port = $Port; pids = @(); health = $false } }
  $HealthPort = if ($Port -eq $VitePort) { $VitePort } else { $ApiPort }
  $Role = if ($Port -eq $VitePort) { 'vite' } else { 'api' }
  $Verified = (Test-Health $HealthPort) -and (Test-WorkspaceListener $Pids $Role)
  return [pscustomobject]@{ port = $Port; pids = $Pids; health = $Verified }
}

function Test-OnlyOwnedListener($State, [string] $Role, [int[]] $Owners) {
  $Record = Get-RoleRecord $State $Role
  if (-not (Test-OwnedRecord $State $Role $Record)) { return $false }
  foreach ($Owner in $Owners) {
    $CurrentId = [int] $Owner
    $Found = $false
    for ($Depth = 0; $Depth -lt 8 -and $CurrentId -gt 0; $Depth++) {
      if ($CurrentId -eq [int] $Record.pid) { $Found = $true; break }
      $Ancestor = Get-CimInstance Win32_Process -Filter "ProcessId = $CurrentId" -ErrorAction SilentlyContinue
      if ($null -eq $Ancestor) { break }
      $CurrentId = [int] $Ancestor.ParentProcessId
    }
    if (-not $Found) { return $false }
  }
  return $true
}

function Show-Status($State) {
  $Api = Get-PortStatus $ApiPort
  $Vite = Get-PortStatus $VitePort
  $ApiHealthy = $Api.health
  $ViteHealthy = $Vite.health
  $OwnedDescriptions = @()
  foreach ($Role in @('api', 'vite')) {
    $Record = Get-RoleRecord $State $Role
    if ($null -ne $Record) {
      if (Test-OwnedRecord $State $Role $Record) { $OwnedDescriptions += "$Role PID $($Record.pid) (owned)" }
      else { $OwnedDescriptions += "$Role PID $($Record.pid) (identity no longer matches)" }
    }
  }
  $ApiLabel = if ($ApiHealthy) { 'healthy for this workspace' } elseif ($Api.pids.Count -gt 0) { 'occupied by another or unverified service' } else { 'stopped' }
  $ViteLabel = if ($ViteHealthy) { 'healthy for this workspace' } elseif ($Vite.pids.Count -gt 0) { 'occupied by another or unverified service' } else { 'stopped' }
  Write-Message "API  127.0.0.1:$ApiPort : $ApiLabel"
  Write-Message "Vite 127.0.0.1:$VitePort : $ViteLabel"
  if ($OwnedDescriptions.Count -gt 0) { Write-Message ('Tracked process identities: ' + ($OwnedDescriptions -join ', ')) }
  if ($ApiHealthy -and $ViteHealthy) { return 0 }
  if ($Api.pids.Count -gt 0 -or $Vite.pids.Count -gt 0) { return 2 }
  return 1
}

function Start-Role($State, [string] $Role, [string] $Node, [string] $LogStamp, [Collections.Generic.List[object]] $NewProcesses) {
  $Port = if ($Role -eq 'api') { $ApiPort } else { $VitePort }
  $HealthPort = if ($Role -eq 'api') { $ApiPort } else { $VitePort }
  $Current = Get-RoleRecord $State $Role
  if ($null -ne $Current -and (Test-OwnedRecord $State $Role $Current)) {
    if (Test-Health $HealthPort) { return $Current }
    $StillThere = Get-ProcessInfo ([int] $Current.pid)
    if ($null -ne $StillThere) {
      if (Wait-Health $HealthPort 15 $Role) { return $Current }
      throw "The tracked $Role process is alive but did not become healthy; inspect its launcher log."
    }
    Remove-RoleRecord $State $Role
    Write-State $State
  } elseif ($null -ne $Current) {
    Remove-RoleRecord $State $Role
    Write-State $State
  }

  $Owners = @(Get-ListenerPids $Port)
  if ($Owners.Count -gt 0) {
    if ((Test-Health $HealthPort) -and (Test-WorkspaceListener $Owners $Role)) { return $null }
    if (Test-OnlyOwnedListener $State $Role $Owners) {
      if (Wait-Health $HealthPort 15 $Role) { return (Get-RoleRecord $State $Role) }
    }
    throw "Port $Port is occupied by a service that did not identify as this workspace; refusing to reuse or stop it."
  }

  $Arguments = if ($Role -eq 'api') {
    '"{0}" "{1}"' -f $TsxCli, $ApiEntry
  } else {
    '"{0}" --host 127.0.0.1 --port {1} --strictPort' -f $ViteCli, $VitePort
  }
  $LogPrefix = Join-Path $LauncherDir "$Role-$LogStamp"
  $Process = Start-Process -FilePath $Node -ArgumentList $Arguments -WorkingDirectory $BuilderDir -WindowStyle Hidden -PassThru `
    -RedirectStandardOutput "$LogPrefix.out.log" -RedirectStandardError "$LogPrefix.err.log"
  $Record = Save-ProcessRecord $State $Role $Process.Id
  $NewProcesses.Add([pscustomobject]@{ role = $Role; record = $Record })
  if (-not (Wait-Health $HealthPort 25 $Role)) {
    throw "The newly started $Role service did not pass its workspace health check; inspect its launcher log."
  }
  return $Record
}

function Invoke-Start {
  if (-not (Test-Path -LiteralPath $TsxCli -PathType Leaf) -or -not (Test-Path -LiteralPath $ViteCli -PathType Leaf)) {
    throw 'Builder dependencies are missing; install the builder package dependencies first.'
  }
  $Lock = Acquire-LauncherLock
  try {
    $State = Get-StateForWorkspace -Create
    $ApiOwners = @(Get-ListenerPids $ApiPort)
    $ViteOwners = @(Get-ListenerPids $VitePort)
    $ApiHealth = Test-Health $ApiPort
    $ViteHealth = Test-Health $VitePort

    if ($ApiHealth -and -not (Test-WorkspaceListener $ApiOwners 'api')) {
      throw "Port $ApiPort passed the health check but its process identity is not this workspace's API; refusing reuse."
    }
    if ($ViteHealth -and -not (Test-WorkspaceListener $ViteOwners 'vite')) {
      throw "Port $VitePort passed the health check but its process identity is not this workspace's Vite server; refusing reuse."
    }

    if ($ApiOwners.Count -gt 0 -and -not $ApiHealth) {
      if (-not (Test-OnlyOwnedListener $State 'api' $ApiOwners)) {
        throw "Port $ApiPort is occupied by a service that did not identify as this workspace; refusing to start or stop services."
      }
    }
    if ($ViteOwners.Count -gt 0 -and -not $ViteHealth) {
      if (-not (Test-OnlyOwnedListener $State 'vite' $ViteOwners)) {
        throw "Port $VitePort is occupied by a service that did not identify as this workspace; refusing to start or stop services."
      }
    }
    if ($ApiHealth -and $ViteHealth) {
      if (-not (Test-Path -LiteralPath $LauncherDir -PathType Container)) { New-Item -ItemType Directory -Path $LauncherDir -Force | Out-Null }
      Write-State $State
      Write-Message 'Builder is already healthy for this workspace on 127.0.0.1:5173 and 127.0.0.1:4310.'
      return
    }

    if (-not $ApiHealth -and $ApiOwners.Count -eq 0) {
      $ApiRecord = Get-RoleRecord $State 'api'
      if ($null -ne $ApiRecord -and -not (Test-OwnedRecord $State 'api' $ApiRecord)) {
        Remove-RoleRecord $State 'api'
      }
    }
    if (-not $ViteHealth -and $ViteOwners.Count -eq 0) {
      $ViteRecord = Get-RoleRecord $State 'vite'
      if ($null -ne $ViteRecord -and -not (Test-OwnedRecord $State 'vite' $ViteRecord)) {
        Remove-RoleRecord $State 'vite'
      }
    }

    if (-not (Test-Path -LiteralPath $LauncherDir -PathType Container)) { New-Item -ItemType Directory -Path $LauncherDir -Force | Out-Null }
    $Node = Get-NodeExecutable
    $LogStamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds().ToString()
    $StartedThisRun = New-Object 'Collections.Generic.List[object]'
    try {
      Start-Role $State 'api' $Node $LogStamp $StartedThisRun | Out-Null
      Start-Role $State 'vite' $Node $LogStamp $StartedThisRun | Out-Null
      if (-not (Test-Health $ApiPort) -or -not (Test-Health $VitePort)) {
        throw 'Both services did not remain healthy for this workspace after startup.'
      }
      Write-State $State
      Write-Message 'Builder is ready at http://127.0.0.1:5173 (API: 127.0.0.1:4310).'
    } catch {
      for ($Index = $StartedThisRun.Count - 1; $Index -ge 0; $Index--) {
        $Started = $StartedThisRun[$Index]
        if (Stop-OwnedRecord $State $Started.role $Started.record) {
          Remove-RoleRecord $State $Started.role
        }
      }
      Write-State $State
      throw
    }
  } finally {
    $Lock.Dispose()
  }
}

function Invoke-Stop {
  $Lock = Acquire-LauncherLock
  try {
    $State = Get-StateForWorkspace
    if ($null -eq $State) {
      Write-Message 'No owned launcher state exists for this workspace; no processes were stopped.'
      return 0
    }
    $Stopped = @()
    $Unowned = @()
    foreach ($Role in @('vite', 'api')) {
      $Record = Get-RoleRecord $State $Role
      if ($null -eq $Record) { continue }
      if (Test-OwnedRecord $State $Role $Record) {
        if (Stop-OwnedRecord $State $Role $Record) { $Stopped += "$Role PID $($Record.pid)" }
        else { $Unowned += "$Role PID $($Record.pid) did not exit" }
      } else {
        $Unowned += "$Role PID $($Record.pid) identity no longer matches"
      }
    }
    if ($Stopped.Count -gt 0) { Write-Message ('Stopped owned processes: ' + ($Stopped -join ', ')) }
    if ($Unowned.Count -gt 0) { Write-Message ('Left unchanged: ' + ($Unowned -join ', ')) }
    foreach ($Role in @('vite', 'api')) {
      $Record = Get-RoleRecord $State $Role
      if ($null -ne $Record -and (Test-OwnedRecord $State $Role $Record)) { return 2 }
      if ($null -ne $Record) { Remove-RoleRecord $State $Role }
    }
    Write-State $State
    if ($Stopped.Count -eq 0 -and $Unowned.Count -eq 0) { Write-Message 'No owned builder processes were running.' }
    return 0
  } finally {
    $Lock.Dispose()
  }
}

try {
  if ($Action -eq 'start') {
    Invoke-Start
    exit 0
  }
  if ($Action -eq 'status') {
    $Status = Show-Status (Get-StateForWorkspace)
    exit $Status
  }
  if ($Action -eq 'stop') {
    exit (Invoke-Stop)
  }
} catch {
  Write-Message "Builder launcher error: $($_.Exception.Message)"
  exit 1
}
