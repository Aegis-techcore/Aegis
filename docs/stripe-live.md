# Stripe live-konfiguration för Aegis

Aegis använder Stripe Checkout för återkommande månadsabonnemang och webhooken `/api/stripe/webhook` för att verifiera och synkronisera betalningsstatus.

## Live-konto

- Stripe-konto: Cedrus kommanditbolag
- Publik URL: https://www.aegis.dev
- Webhook URL: https://www.aegis.dev/api/stripe/webhook
- Valuta: SEK
- Debitering: månadsvis

## Live-planer

| Aegis-plan | Pris | Stripe Price ID |
| --- | ---: | --- |
| Privat | 99 kr/mån | `price_1UIDC2FvUOKefkomn8kl6uXu` |
| Start | 299 kr/mån | `price_1UIDCIFvUOKefkomNSJqwvWG` |
| Plus | 699 kr/mån | `price_1UIDCKFvUOKefkomVI0apZ1c` |
| Pro | 1 490 kr/mån | `price_1UIDCMFvUOKefkomaDEFZK3X` |
| Business | 2 990 kr/mån | `price_1UIDCPFvUOKefkom1ln4d34x` |

## Webhook-events

Produktionswebhooken prenumererar på:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

## Hemliga värden

Följande får aldrig committas till Git:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

De ska läggas i produktionsmiljön/Kubernetes Secret/GitHub Environment secrets.

## Viktigt före första liveköpet

Kontrollera att:

1. `STRIPE_SECRET_KEY` är en live-nyckel från samma Stripe-konto.
2. `STRIPE_WEBHOOK_SECRET` kommer från Aegis-webhooken i live mode.
3. `SITE_URL=https://www.aegis.dev`.
4. Databasen och övriga production-secrets är konfigurerade.
5. `/api/ready` svarar med status `ready`.
6. Ett kontrollerat liveköp görs med ett litet eller återbetalningsbart testscenario innan tjänsten öppnas brett.
