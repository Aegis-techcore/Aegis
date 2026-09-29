param(
  [string]$ProductionEnvFile = '.env.production'
)

$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$ciProject = 'aegis-local-release-check'
$composeFiles = @('-f', 'compose.yaml', '-f', 'compose.ci.yaml')

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

Push-Location $projectRoot

try {
  Invoke-Checked 'Install locked dependencies' {
    npm ci
  }

  Invoke-Checked 'Lint, typecheck, tests and production build' {
    npm run verify
  }

  Invoke-Checked 'Audit production dependencies' {
    npm audit --omit=dev --audit-level=high
  }

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
  Write-Host 'This verifies code, build, production dependency audit, Docker integration and readiness.'
  Write-Host 'It does not perform a real Stripe charge, send a real email, verify public DNS/HTTPS, or rotate external secrets.'
}
finally {
  Write-Host ""
  Write-Host 'Cleaning up local integration stack...'
  docker compose @composeFiles --project-name $ciProject down --volumes --remove-orphans 2>$null
  Remove-Item Env:AEGIS_IMAGE_TAG -ErrorAction SilentlyContinue
  Remove-Item Env:SMOKE_TEST_READINESS -ErrorAction SilentlyContinue
  Pop-Location
}
