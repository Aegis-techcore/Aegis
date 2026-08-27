# Operations

## Grundkontroller

```bash
kubectl get deployment,pods,service,ingress -n aegis-production
kubectl rollout status deployment/aegis -n aegis-production
kubectl logs deployment/aegis -n aegis-production --tail=200
helm test aegis -n aegis-production --logs
```

## Vanliga fel

Om podden inte startar, kör `kubectl describe pod PODDNAMN -n aegis-production`. Kontrollera Secret och GHCR-behörighet. Om readiness-proben misslyckas, kontrollera `DATABASE_URL`, databasens nätverksåtkomst och att migrationerna har körts.

## Backup

- Aktivera Neon/PostgreSQL point-in-time recovery och testa återläsning.
- Säkerhetskopiera secrets i en krypterad secret manager, inte som vanlig YAML.

## Skalning

Production använder följande stateless-konfiguration:

```yaml
persistence:
  enabled: false
autoscaling:
  enabled: true
podDisruptionBudget:
  enabled: true
```

Varje release identifieras av `sha-<full git SHA>`. Använd digest eller SHA-tagg vid felsökning och rollback, aldrig `latest` i produktion.
