#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
env_file="${1:-${project_root}/.env.production}"

if [[ ! -f "${env_file}" ]]; then
  echo "Environment file not found: ${env_file}" >&2
  exit 1
fi

export AEGIS_ENV_FILE="${env_file}"
compose=(docker compose --env-file "${env_file}" -f compose.production.yaml)

cd "${project_root}"
"${compose[@]}" pull migrate web
"${compose[@]}" up --detach --remove-orphans

ready=false
for _ in $(seq 1 60); do
  if "${compose[@]}" exec -T web node -e "fetch('http://127.0.0.1:3000/api/ready').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))" >/dev/null 2>&1; then
    ready=true
    break
  fi
  sleep 2
done

if [[ "${ready}" != true ]]; then
  "${compose[@]}" logs --no-color --tail 200 migrate web
  echo 'Aegis did not become ready within 120 seconds' >&2
  exit 1
fi

"${compose[@]}" ps
echo 'Aegis production update completed successfully.'
