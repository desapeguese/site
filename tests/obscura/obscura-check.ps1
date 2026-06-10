$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
$OutputEncoding = [System.Text.UTF8Encoding]::new()

$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$WebBase = if ([string]::IsNullOrWhiteSpace($env:E2E_WEB_URL)) { "http://127.0.0.1:3000" } else { $env:E2E_WEB_URL.TrimEnd("/") }
$ApiBase = if ([string]::IsNullOrWhiteSpace($env:E2E_API_URL)) { "$WebBase/api/v1" } else { $env:E2E_API_URL.TrimEnd("/") }
$ObscuraApiBase = $null
$ObscuraWebBase = $null
$OutputRoot = Join-Path $RepoRoot "output\obscura"
$StartedProcesses = New-Object System.Collections.Generic.List[System.Diagnostics.Process]

New-Item -ItemType Directory -Force -Path $OutputRoot | Out-Null

function Test-Url {
  param([Parameter(Mandatory = $true)][string]$Url)

  try {
    $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5
    return [int]$response.StatusCode -ge 200 -and [int]$response.StatusCode -lt 500
  } catch {
    return $false
  }
}

function Wait-Url {
  param(
    [Parameter(Mandatory = $true)][string]$Url,
    [int]$TimeoutSeconds = 180
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  do {
    if (Test-Url $Url) {
      return
    }
    Start-Sleep -Seconds 2
  } while ((Get-Date) -lt $deadline)

  throw "Timeout aguardando $Url"
}

function Get-ObscuraTargetHost {
  if (-not [string]::IsNullOrWhiteSpace($env:OBSCURA_TARGET_HOST)) {
    return $env:OBSCURA_TARGET_HOST
  }

  $addresses = @(
    Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
      Where-Object {
        $_.AddressState -eq "Preferred" -and
        $_.IPAddress -notmatch "^127\." -and
        $_.IPAddress -notmatch "^169\.254\." -and
        $_.IPAddress -notmatch "^10\." -and
        $_.IPAddress -notmatch "^192\.168\." -and
        $_.IPAddress -notmatch "^172\.(1[6-9]|2[0-9]|3[0-1])\."
      } |
      Sort-Object InterfaceMetric |
      Select-Object -ExpandProperty IPAddress
  )

  if ($addresses.Count -gt 0) {
    return $addresses[0]
  }

  return "127.0.0.1"
}

function Start-LocalServer {
  param(
    [Parameter(Mandatory = $true)][string]$Name,
    [Parameter(Mandatory = $true)][string]$WorkingDirectory,
    [Parameter(Mandatory = $true)][string]$Command
  )

  $stdout = Join-Path $OutputRoot "$Name.stdout.log"
  $stderr = Join-Path $OutputRoot "$Name.stderr.log"
  $process = Start-Process `
    -FilePath "cmd.exe" `
    -ArgumentList @("/d", "/s", "/c", $Command) `
    -WorkingDirectory $WorkingDirectory `
    -RedirectStandardOutput $stdout `
    -RedirectStandardError $stderr `
    -WindowStyle Hidden `
    -PassThru

  $StartedProcesses.Add($process)
  return $process
}

function Get-DescendantProcessIds {
  param([Parameter(Mandatory = $true)][int]$ParentId)

  $children = @(Get-CimInstance Win32_Process | Where-Object { $_.ParentProcessId -eq $ParentId })
  foreach ($child in $children) {
    Get-DescendantProcessIds -ParentId ([int]$child.ProcessId)
    [int]$child.ProcessId
  }
}

function Stop-StartedServers {
  foreach ($process in $StartedProcesses) {
    $ids = @(Get-DescendantProcessIds -ParentId $process.Id) + @($process.Id)
    foreach ($id in ($ids | Select-Object -Unique)) {
      try {
        Stop-Process -Id $id -Force -ErrorAction SilentlyContinue
      } catch {
      }
    }
  }
}

function Start-ObscuraServer {
  param(
    [Parameter(Mandatory = $true)][int]$Port
  )

  $obscuraPath = (Get-Command obscura).Source
  $stdout = Join-Path $OutputRoot "obscura-serve.stdout.log"
  $stderr = Join-Path $OutputRoot "obscura-serve.stderr.log"
  $process = Start-Process `
    -FilePath $obscuraPath `
    -ArgumentList @("serve", "--port", "$Port") `
    -RedirectStandardOutput $stdout `
    -RedirectStandardError $stderr `
    -WindowStyle Hidden `
    -PassThru

  $StartedProcesses.Add($process)
  return $process
}

function Invoke-NodeCheck {
  param([Parameter(Mandatory = $true)][string]$ScriptPath)

  $nodePath = (Get-Command node).Source
  $processStartInfo = New-Object System.Diagnostics.ProcessStartInfo
  $processStartInfo.FileName = $nodePath
  $processStartInfo.Arguments = "`"$ScriptPath`""
  $processStartInfo.RedirectStandardOutput = $true
  $processStartInfo.RedirectStandardError = $true
  $processStartInfo.UseShellExecute = $false
  $processStartInfo.CreateNoWindow = $true
  $processStartInfo.WorkingDirectory = $RepoRoot

  $processStartInfo.EnvironmentVariables["E2E_API_URL"] = $ObscuraApiBase
  $processStartInfo.EnvironmentVariables["E2E_WEB_URL"] = $ObscuraWebBase
  $processStartInfo.EnvironmentVariables["OBSCURA_CDP_ENDPOINT"] = $env:OBSCURA_CDP_ENDPOINT

  $process = New-Object System.Diagnostics.Process
  $process.StartInfo = $processStartInfo
  [void]$process.Start()
  $stdout = $process.StandardOutput.ReadToEnd()
  $stderr = $process.StandardError.ReadToEnd()
  $process.WaitForExit()

  $text = (@($stdout, $stderr) -join "`n").Trim()
  Set-Content -Path (Join-Path $OutputRoot "obscura-cdp.log") -Value $text -Encoding UTF8

  if ($process.ExitCode -ne 0) {
    throw "Validação Obscura/CDP falhou com código $($process.ExitCode). Veja output\obscura\obscura-cdp.log"
  }

  Write-Host $text
}

try {
  if (-not (Get-Command obscura -ErrorAction SilentlyContinue)) {
    throw "Obscura não está disponível no PATH."
  }

  if (-not (Test-Url "$ApiBase/health")) {
    Start-LocalServer `
      -Name "web" `
      -WorkingDirectory $RepoRoot `
      -Command "set DATABASE_REQUIRED=false&& pnpm prisma:deploy && pnpm db:seed && pnpm build && pnpm exec next start -p 3000" | Out-Null
  }

  Wait-Url "$ApiBase/health" -TimeoutSeconds 240
  Wait-Url "$WebBase/pt" -TimeoutSeconds 240

  $ObscuraApiBase = $ApiBase
  $ObscuraWebBase = $WebBase

  $obscuraPort = if ([string]::IsNullOrWhiteSpace($env:OBSCURA_CDP_PORT)) { 9223 } else { [int]$env:OBSCURA_CDP_PORT }
  $env:OBSCURA_CDP_ENDPOINT = "http://127.0.0.1:$obscuraPort"

  if (-not (Test-Url "$($env:OBSCURA_CDP_ENDPOINT)/json/version")) {
    Start-ObscuraServer -Port $obscuraPort | Out-Null
  }

  Wait-Url "$($env:OBSCURA_CDP_ENDPOINT)/json/version" -TimeoutSeconds 60
  Invoke-NodeCheck -ScriptPath (Join-Path $PSScriptRoot "obscura-cdp-check.mjs")
} finally {
  Stop-StartedServers
}
