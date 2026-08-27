param(
  [string]$EnvFile = '.env.production'
)

$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$resolvedEnvFile = if ([IO.Path]::IsPathRooted($EnvFile)) {
  $EnvFile
} else {
  Join-Path $projectRoot $EnvFile
}

if (-not (Test-Path -LiteralPath $resolvedEnvFile -PathType Leaf)) {
  throw "Environment file not found: $resolvedEnvFile"
}

$previousEnvFile = $env:AEGIS_ENV_FILE
$env:AEGIS_ENV_FILE = $resolvedEnvFile
$composeArguments = @(
  'compose',
  '--env-file', $resolvedEnvFile,
  '-f', 'compose.production.yaml'
)

Push-Location $projectRoot

try {
  & docker @composeArguments pull migrate web
  if ($LASTEXITCODE -ne 0) {
    throw 'Could not pull the production images'
  }

  & docker @composeArguments up --detach --remove-orphans
  if ($LASTEXITCODE -ne 0) {
    throw 'Production update failed during migration or startup'
  }

  $ready = $false
  for ($attempt = 1; $attempt -le 60; $attempt += 1) {
    & docker @composeArguments exec -T web node -e "fetch('http://127.0.0.1:3000/api/ready').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))" 2>$null
    if ($LASTEXITCODE -eq 0) {
      $ready = $true
      break
    }
    Start-Sleep -Seconds 2
  }

  if (-not $ready) {
    & docker @composeArguments logs --no-color --tail 200 migrate web
    throw 'Aegis did not become ready within 120 seconds'
  }

  & docker @composeArguments ps
  Write-Host 'Aegis production update completed successfully.'
} finally {
  Pop-Location
  $env:AEGIS_ENV_FILE = $previousEnvFile
}
