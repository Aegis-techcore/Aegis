# Secrets och konfiguration

## Hemliga värden

Följande ska ligga i `.env.local`, Kubernetes Secret eller GitHub Environment secrets—aldrig i Git eller Docker-imagen:

- `DATABASE_URL`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`
- `CUSTOMER_SESSION_SECRET`
- `RESEND_API_KEY`
- `STRIPE_SECRET_KEY` och Stripe price-ID:n
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` och `TWILIO_FROM_PHONE`

Generera sessionshemligheter med minst 32 kryptografiskt slumpmässiga byte. Rotera en hemlighet om den råkat skrivas till logg, terminalhistorik, issue eller commit.

## Icke-hemlig konfiguration

Helm-chartets ConfigMap innehåller `NODE_ENV`, port/hostname, site URL, databasdriver/poolstorlek och Ollama-konfiguration. `DATABASE_DRIVER=auto` använder Neon HTTP för `*.neon.tech` och vanlig PostgreSQL för andra värdar. `NEXT_PUBLIC_`-värden kan exponeras till webbläsaren och får aldrig innehålla credentials.

För större drift, använd External Secrets Operator eller molnleverantörens CSI-driver mot en riktig secret manager.
