param(
  [string]$ProductionEnvFile = '.env.production'
)

$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$ciProject = 'aegis-local-release-check'
$composeFiles = @('-f', 'compose.yaml', '-f', 'compose.ci.yaml')
$dockerReady = $false

function Invoke-Checked {
  param(
    [string]$Label,
    [scriptblock]$Command
  )

  Write-Host ""
  Write-Host "==> $Label"
  & $Command

  if ($LASTEXITCODE -ne 0) {
    throw "$Label failed with exit code $LASTEXITCODE"
  }
}

function Test-DockerEngine {
  if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    return $false
  }

  & docker info --format '{{.ServerVersion}}' *> $null
  return $LASTEXITCODE -eq 0
}

function Ensure-DockerEngine {
  if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    throw 'Docker CLI hittades inte. Installera Docker Desktop innan release-verifieringen körs.'
  }

  if (Test-DockerEngine) {
    Write-Host 'Docker engine is running.'
    return
  }

  if ($env:OS -ne 'Windows_NT') {
    throw 'Docker engine svarar inte. Starta Docker-tjänsten och kör verifieringen igen.'
  }

  $candidates = @(
    (Join-Path $env:ProgramFiles 'Docker\Docker\Docker Desktop.exe'),
    (Join-Path $env:LOCALAPPDATA 'Docker\Docker Desktop.exe')
  ) | Where-Object {
    $_ -and (Test-Path -LiteralPath $_ -PathType Leaf)
  }

  $dockerDesktop = $candidates | Select-Object -First 1

  if (-not $dockerDesktop) {
    throw 'Docker Desktop engine svarar inte och Docker Desktop kunde inte hittas automatiskt.'
  }

  Write-Host 'Docker Desktop is installed but the engine is not running. Starting Docker Desktop...'
  Start-Process -FilePath $dockerDesktop | Out-Null

  for ($attempt = 1; $attempt -le 60; $attempt += 1) {
    Start-Sleep -Seconds 2

    if (Test-DockerEngine) {
      Write-Host 'Docker engine is ready.'
      return
    }
  }

  throw 'Docker Desktop startades men engine blev inte redo inom 120 sekunder.'
}

Push-Location $projectRoot

try {
  Invoke-Checked 'Install locked dependencies' {
    npm ci --audit=false
  }

  Invoke-Checked 'Lint, typecheck, tests and production build' {
    npm run verify
  }

  Invoke-Checked 'Audit shipped production dependencies' {
    npm audit --omit=dev --audit-level=moderate
  }

  Write-Host ""
  Write-Host '==> Docker engine preflight'
  Ensure-DockerEngine
  $dockerReady = $true

  Invoke-Checked 'Validate development/CI Compose configuration' {
    docker compose @composeFiles config --quiet
  }

  Invoke-Checked 'Validate production Compose configuration' {
    docker compose --env-file .env.production.example -f compose.production.yaml config --quiet
  }

  Invoke-Checked 'Build and start isolated integration stack' {
    $env:AEGIS_IMAGE_TAG = 'local-release-check'
    docker compose @composeFiles --project-name $ciProject up --build --detach web
  }

  $env:SMOKE_TEST_READINESS = 'true'
  Invoke-Checked 'Smoke-test home, health and readiness endpoints' {
    node scripts/smoke-test.mjs http://127.0.0.1:3100
  }

  if (Test-Path -LiteralPath $ProductionEnvFile -PathType Leaf) {
    Invoke-Checked 'Validate local production environment file against Compose' {
      docker compose --env-file $ProductionEnvFile -f compose.production.yaml config --quiet
    }
  } else {
    Write-Host ""
    Write-Host "NOTE: $ProductionEnvFile was not found. Live production secrets were not validated."
  }

  Write-Host ""
  Write-Host 'LOCAL RELEASE VERIFICATION PASSED.'
  Write-Host 'Verified: install, lint, typecheck, tests, production build, shipped-dependency audit, Docker integration and readiness.'
  Write-Host 'Not executed automatically: a real Stripe charge, real email delivery, public DNS/HTTPS or external-secret rotation.'
}
finally {
  Write-Host ""
  Write-Host 'Cleaning up local integration stack...'

  if ($dockerReady -and (Test-DockerEngine)) {
    $previousErrorActionPreference = $ErrorActionPreference
    $cleanupExitCode = 0

    try {
      # Docker Compose writes normal progress messages to stderr on Windows.
      # Run cleanup with non-terminating native stderr handling and inspect
      # the real process exit code instead.
      $ErrorActionPreference = 'Continue'
      & docker compose @composeFiles --project-name $ciProject down --volumes --remove-orphans 2>&1 | Out-Null
      $cleanupExitCode = $LASTEXITCODE
    }
    finally {
      $ErrorActionPreference = $previousErrorActionPreference
    }

    if ($cleanupExitCode -ne 0) {
      Write-Host 'NOTE: Docker cleanup did not complete cleanly. Check Docker Desktop if test containers remain.'
    } else {
      Write-Host 'Docker cleanup completed.'
    }
  } else {
    Write-Host 'Cleanup skipped because Docker engine is not available.'
  }

  Remove-Item Env:AEGIS_IMAGE_TAG -ErrorAction SilentlyContinue
  Remove-Item Env:SMOKE_TEST_READINESS -ErrorAction SilentlyContinue
  Pop-Location
}
