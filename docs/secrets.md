# Secrets och konfiguration

## Hemliga värden

Följande ska ligga i `.env.local`, Kubernetes Secret eller GitHub Environment secrets—aldrig i Git eller Docker-imagen:

- `DATABASE_URL`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`
- `CUSTOMER_SESSION_SECRET`
- `RESEND_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` och `TWILIO_FROM_PHONE`

Använd separata `ADMIN_SESSION_SECRET` och `CUSTOMER_SESSION_SECRET`, båda minst 32 tecken långa och kryptografiskt slumpmässiga. Rotera en hemlighet om den råkat skrivas till logg, terminalhistorik, issue eller commit.

`STRIPE_WEBHOOK_SECRET` ska komma från exakt den webhook-endpoint som skickar händelser till `/api/stripe/webhook`. Blanda inte test- och live-hemligheter.

## Icke-hemlig konfiguration

Följande är konfiguration men inte credentials och kan dokumenteras utan att behandlas som hemligheter: `RESEND_FROM_EMAIL`, `OWNER_EMAIL` samt Stripe price-ID:n `STRIPE_PRICE_PRIVATE`, `STRIPE_PRICE_START`, `STRIPE_PRICE_PLUS`, `STRIPE_PRICE_PRO` och `STRIPE_PRICE_BUSINESS`.

Helm-chartets ConfigMap innehåller `NODE_ENV`, port/hostname, site URL, databasdriver/poolstorlek och Ollama-konfiguration. `DATABASE_DRIVER=auto` använder Neon HTTP för `*.neon.tech` och vanlig PostgreSQL för andra värdar. `NEXT_PUBLIC_`-värden kan exponeras till webbläsaren och får aldrig innehålla credentials.

`SITE_URL` och `NEXT_PUBLIC_SITE_URL` måste båda vara den riktiga publika HTTPS-origin-adressen i produktion och peka på samma origin, eftersom signerings- och Stripe-returlänkar skapas från den konfigurationen.

I produktion måste `RESEND_FROM_EMAIL` använda en verifierad egen avsändardomän (inte `onboarding@resend.dev`) och `OWNER_EMAIL` måste vara en giltig mottagaradress.

För större drift, använd External Secrets Operator eller molnleverantörens CSI-driver mot en riktig secret manager.
