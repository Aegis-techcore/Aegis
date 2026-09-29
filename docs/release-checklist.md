# Aegis production release checklist

Use this checklist before accepting real customer data or live subscription payments.

## 1. Security prerequisites

- [ ] Rotate the Stripe recovery/backup code that was previously committed. Treat the old code as compromised even though the file has been removed.
- [ ] Keep `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, database credentials, session secrets and email API keys outside Git.
- [ ] Use different random values for `ADMIN_SESSION_SECRET` and `CUSTOMER_SESSION_SECRET`, each at least 32 characters.
- [ ] Use an admin password of at least 12 characters.
- [ ] Run the full local release verification:
  ```powershell
  .\scripts\verify-release.ps1
  ```

## 2. Production infrastructure

- [ ] Configure a persistent PostgreSQL database.
- [ ] Configure automated database backups and perform at least one restore test.
- [ ] Deploy the current approved release image/build, not an older `:main` image.
- [ ] Configure `aegis.dev` and `www.aegis.dev` DNS.
- [ ] Enable HTTPS and redirect plain HTTP to HTTPS.
- [ ] Confirm `https://www.aegis.dev/api/health` returns HTTP 200.
- [ ] Confirm `https://www.aegis.dev/api/ready` returns HTTP 200.

## 3. Production configuration

The production environment must contain the values required by `app/lib/runtimeConfig.js`, including:

- `DATABASE_URL`
- `SITE_URL=https://www.aegis.dev`
- `NEXT_PUBLIC_SITE_URL=https://www.aegis.dev`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`
- `CUSTOMER_SESSION_SECRET`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `OWNER_EMAIL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- all five `STRIPE_PRICE_*` values

Never commit the real values.

## 4. Email acceptance

- [ ] Verify the sender domain/address in Resend.
- [ ] Send a contact request and confirm the owner receives it.
- [ ] Send an agreement link and confirm the customer receives it.
- [ ] Exercise approve/reject email flows.

## 5. Stripe acceptance

Only run these steps after public DNS, HTTPS, database readiness and the webhook secret are working.

- [ ] Start Checkout through the Aegis membership page.
- [ ] Confirm the selected recurring price is correct before authorizing payment.
- [ ] Confirm the Stripe webhook is delivered successfully.
- [ ] Confirm the pending membership becomes active only after Stripe verification.
- [ ] Confirm the customer can log in using the chosen code.
- [ ] Confirm the admin portal displays the membership.
- [ ] Cancel the test membership and confirm Stripe and Aegis agree on the final status.

A live Checkout creates a real recurring subscription. Do not perform a live payment as an automated smoke test.

## 6. Data protection and operations

- [ ] Review the privacy policy against the production providers actually selected for hosting/database/email/payment.
- [ ] Define and document retention periods for customer, message, agreement and contact-request data.
- [ ] Create a process for access, correction and deletion requests.
- [ ] Configure uptime monitoring for `/api/health` and `/api/ready`.
- [ ] Configure alerts for repeated server errors, database failures and failed Stripe webhooks.

## Release decision

Do not describe the deployment as production-ready until all applicable items above are complete and the local release verification passes.
