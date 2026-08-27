# Aegis

Aegis är en Next.js-webbplats med kontaktflöde, kundportal, adminpanel, Neon/PostgreSQL, Stripe, Resend och valfri lokal AI via Ollama.

Projektet innehåller en säker produktionscontainer, Docker Compose för lokal körning, ett Helm-chart för Kubernetes och GitHub Actions för CI, signerade releaser och deployment till staging/production.

## Krav

- Node.js 24
- npm
- Docker Desktop eller Docker Engine med Compose
- Neon/PostgreSQL för direkt lokal körning; Docker Compose startar en egen PostgreSQL

Kubernetes-deployment kräver även ett kluster, Helm 3, en ingress controller och tillgång till GHCR-imagen.

## Lokal utveckling

```bash
npm ci
copy .env.example .env.local
npm run dev
```

Fyll i minst `DATABASE_URL`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` och `CUSTOMER_SESSION_SECRET` i `.env.local`. Webbplatsen finns sedan på `http://localhost:3000`.

## Kontrollera projektet

```bash
npm run verify
```

Kommandot kör lint, TypeScript-kontroll, tester och en komplett Next.js production build. Samma kontroll körs i CI.

## Docker

Bygg och starta PostgreSQL, migrationsjobbet och produktionscontainern:

```bash
docker compose up --build
```

Compose använder en separat PostgreSQL-volym och kör migrationsjobbet före webbservern. Ändra `POSTGRES_PASSWORD` i `.env.local` om miljön kan nås av andra än din egen dator.

Starta även Ollama-profilen och hämta standardmodellen:

```bash
docker compose --profile ai up --build -d
docker compose exec ollama ollama pull llama3.2:3b
```

Containern kör som icke-root med read-only root filesystem. Runtime-data ligger i PostgreSQL, så containern är stateless.

## Kubernetes

Skapa först en Secret enligt [secret.example.yaml](helm/aegis/secret.example.yaml). Rendera och kontrollera sedan staging-konfigurationen:

```bash
helm lint helm/aegis --strict
helm template aegis helm/aegis \
  --namespace aegis-staging \
  --values helm/aegis/values-staging.yaml \
  --set-string image.tag=sha-DIN_GIT_SHA
```

Installera:

```bash
helm upgrade --install aegis helm/aegis \
  --namespace aegis-staging \
  --create-namespace \
  --values helm/aegis/values-staging.yaml \
  --set-string image.tag=sha-DIN_GIT_SHA \
  --atomic --wait
```

Chartet använder en Kubernetes `Deployment`, som skapar och återställer poddarna. En fristående `Pod` används endast som kortlivat Helm smoke-test.

## Produktion med färdig GHCR-image

GitHub Actions publicerar två multi-platform-images:

- `ghcr.io/sharbel0022/aegis:main`
- `ghcr.io/sharbel0022/aegis-tooling:main`

Runtime-imagen kör webbplatsen och tooling-imagen kör databasmigrationer. Inget behöver byggas på produktionsservern.

Första installationen:

```powershell
Copy-Item .env.production.example .env.production
docker login ghcr.io -u sharbel0022
.\scripts\update-production.ps1
```

På Linux:

```bash
cp .env.production.example .env.production
docker login ghcr.io -u sharbel0022
bash scripts/update-production.sh
```

Fyll i `.env.production` före körningen. Om GHCR-paketen görs publika behövs ingen registry-inloggning.

Framtida uppdateringar använder samma kommando. Scriptet pullar images, kör migrationen, uppdaterar containern och väntar på `/api/ready`.

För en låst release, använd `AEGIS_IMAGE_TAG=sha-HELA_GIT_SHA`. Rollback görs genom att återställa detta värde till föregående SHA och köra uppdateringsscriptet igen.

## CI/CD

- `ci.yml` verifierar kod, container, sårbarheter, secrets och Kubernetes-manifest.
- `release.yml` publicerar SHA-taggade images till GHCR, skapar SBOM och signerar imagen med GitHub OIDC.
- `deploy.yml` kör migrationer när sådana finns och driftsätter med Helm `--atomic`.
- Staging körs först. Production bör skyddas med required reviewers i GitHub Environment.
- Dependabot skapar veckovisa uppdateringar för npm, Docker och GitHub Actions.
- Kubernetes-jobben körs först när repository-variabeln `KUBERNETES_DEPLOY_ENABLED` är satt till `true`.

Se [Deployment](docs/deployment.md), [Secrets](docs/secrets.md) och [Operations](docs/operations.md) för fullständig konfiguration.

## Skalning och legacydata

Kontaktförfrågningar och adminnotiser sparas i PostgreSQL. Production kör minst två repliker med rolling updates, HPA och PodDisruptionBudget.

Om installationen har äldre JSON-filer under `data/`, kör migrationen och därefter den idempotenta engångsimporten `npm run db:import-json`. Kommandot raderar inte originalfilerna.

## Projektkommandon

```bash
npm run dev
npm run lint
npm run typecheck
npm test
npm run build
npm run verify
npm run db:generate
npm run db:migrate
npm run db:check
npm run db:import-json
```

## Bidra och rapportera problem

Läs [CONTRIBUTING.md](CONTRIBUTING.md) innan en pull request och [SECURITY.md](SECURITY.md) för privat rapportering av säkerhetsproblem.

## Licens

ISC, se [LICENSE](LICENSE).
