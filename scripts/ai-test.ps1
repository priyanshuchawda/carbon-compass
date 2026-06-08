param(
  [string]$Filter = "",
  [int]$Tail = 80
)

$ErrorActionPreference = "Continue"
$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$logDir = Join-Path $root ".agent/logs"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$logFile = Join-Path $logDir "test-$timestamp.log"

Set-Location $root

if (-not (Test-Path "package.json")) {
  "No package.json found. Scaffold the project before running tests." | Set-Content -Path $logFile
  Write-Output "FAIL tests not available"
  Write-Output "Reason: package.json not found"
  Write-Output "Log: $logFile"
  exit 1
}

if ($Filter.Trim().Length -gt 0) {
  $command = "pnpm test -- --run $Filter --reporter=dot"
} else {
  $command = "pnpm test -- --reporter=dot"
}

Write-Output "Running: $command"
Write-Output "Log: $logFile"

cmd /c "$command" *> $logFile
$exitCode = $LASTEXITCODE

if ($exitCode -eq 0) {
  Write-Output "PASS tests completed"
  Write-Output "Log: $logFile"
  exit 0
}

Write-Output "FAIL tests failed"
Write-Output "Log: $logFile"
Write-Output "Last $Tail lines:"
Get-Content $logFile -Tail $Tail
exit $exitCode

