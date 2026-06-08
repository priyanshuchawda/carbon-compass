param(
  [int]$Tail = 80
)

$ErrorActionPreference = "Continue"
$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$logDir = Join-Path $root ".agent/logs"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$summaryLog = Join-Path $logDir "quality-$timestamp.log"

Set-Location $root

if (-not (Test-Path "package.json")) {
  "No package.json found. Scaffold the project before running quality gates." | Set-Content -Path $summaryLog
  Write-Output "FAIL quality not available"
  Write-Output "Reason: package.json not found"
  Write-Output "Log: $summaryLog"
  exit 1
}

$commands = @(
  @{ Name = "typecheck"; Command = "pnpm typecheck" },
  @{ Name = "lint"; Command = "pnpm lint" },
  @{ Name = "test"; Command = "pnpm test -- --reporter=dot" },
  @{ Name = "build"; Command = "pnpm build" }
)

foreach ($item in $commands) {
  $stepLog = Join-Path $logDir "quality-$timestamp-$($item.Name).log"
  Write-Output "Running: $($item.Command)"
  Add-Content -Path $summaryLog -Value "Running: $($item.Command)"

  cmd /c $item.Command *> $stepLog
  $exitCode = $LASTEXITCODE

  if ($exitCode -ne 0) {
    Write-Output "FAIL $($item.Name)"
    Write-Output "Log: $stepLog"
    Write-Output "Last $Tail lines:"
    Get-Content $stepLog -Tail $Tail
    Add-Content -Path $summaryLog -Value "FAIL $($item.Name): $stepLog"
    exit $exitCode
  }

  Write-Output "PASS $($item.Name)"
  Add-Content -Path $summaryLog -Value "PASS $($item.Name): $stepLog"
}

Write-Output "PASS quality gates completed"
Write-Output "Summary: $summaryLog"
exit 0

