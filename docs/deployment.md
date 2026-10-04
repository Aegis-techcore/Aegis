# Deployment

## Docker Compose från GHCR

Production Compose bygger ingenting lokalt. Den hämtar runtime- och migrationsimages från GHCR:

```bash
cp .env.production.example .env.production
docker login ghcr.io -u YOUR_GITHUB_USERNAME
bash scripts/update-production.sh
```

Använd `AEGIS_IMAGE_TAG=main` för senaste godkända huvudgren eller en immutable `sha-<full git SHA>` för reproducerbar drift. Uppdateringsscriptet kör alltid migration före webben och väntar på readiness. Rollback görs genom att välja föregående SHA-tagg och köra scriptet igen.

## Förutsättningar

Klustret behöver Kubernetes, Helm 3, en ingress controller, en StorageClass för `ReadWriteOnce`, DNS/TLS och tillgång till GHCR-imagen. Ändra exempelvärdarna i miljöernas values-filer före första deployment.

## 1. Skapa namespaces och secrets

Skapa en lokal kopia av `helm/aegis/secret.example.yaml`, byt namn och värden och applicera den separat:

```bash
kubectl create namespace aegis-staging
kubectl apply -n aegis-staging -f aegis-staging-secret.yaml
```

Production-secretens namn ska vara `aegis-production-secrets`. Lägg aldrig den ifyllda filen i Git.

## 2. Registryåtkomst

Om GHCR-paketet är privat skapar du en image pull secret med en token som bara har `read:packages` och anger den i values-filen:

```yaml
imagePullSecrets:
  - name: ghcr-pull
```

## 3. Manuell deployment

```bash
helm upgrade --install aegis helm/aegis \
  --namespace aegis-staging \
  --create-namespace \
  --values helm/aegis/values-staging.yaml \
  --set-string image.tag=sha-DIN_FULLSTÄNDIGA_GIT_SHA \
  --atomic --wait --timeout 8m

helm test aegis -n aegis-staging --logs
```

## 4. GitHub Environments

Skapa `staging` och `production` under repository settings. Lägg följande Environment secrets i båda:

- `KUBE_CONFIG_B64`: base64-kodad kubeconfig med minsta nödvändiga RBAC
- `DATABASE_URL`: databasanslutning för migrationssteget

Koda kubeconfig i PowerShell:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("$PWD\kubeconfig"))
```

Lägg required reviewers på `production`. För ett specifikt moln bör kubeconfig-hemligheten senare ersättas med molnleverantörens kortlivade OIDC-inloggning.

Skapa även repository-variabeln `KUBERNETES_DEPLOY_ENABLED=true` först när båda miljöerna och deras secrets är färdiga. Utan variabeln publiceras GHCR-images, men Kubernetes-deployment hoppas över.

## 5. Databasmigreringar

När `drizzle/meta/_journal.json` finns drar CD den signerade `aegis-tooling`-imagen med samma SHA som webbappen och kör migrationerna före Helm-deployment. Skapa och granska migrationer lokalt med `npm run db:generate`. Commita schema och `drizzle/` tillsammans och ta backup inför destruktiva migreringar.

Efter den första migrationen kan äldre lokala kontaktförfrågningar och adminnotiser importeras en gång med `npm run db:import-json`. Importen är idempotent och raderar inte JSON-filerna.

## Rollback

`helm upgrade --atomic` återställer automatiskt releasen om podden inte blir redo. Manuell rollback:

```bash
helm history aegis -n aegis-production
helm rollback aegis REVISION -n aegis-production --wait
```
