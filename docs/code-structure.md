# Hitta rätt i Aegis-koden

Aegis använder Next.js App Router. Börja med den sida eller det API-flöde som du vill ändra och följ dess importer till den gemensamma logiken.

## Mappar och ansvar

| Plats | Ansvar |
| --- | --- |
| `app/**/page.jsx` | Sidor: visning, användarens val och formulärens tillstånd. |
| `app/components/` | Gemensamma visuella komponenter, exempelvis Header, Footer och ikoner. |
| `app/abonnemang/SubscriptionCard.jsx` | Visning och tangentbordsinteraktion för ett abonnemangskort. Sidans komponent äger valet av abonnemang. |
| `app/abonnemang/plans.js`, `app/bli-medlem/plans.js` | Sidornas texter, omfattning och hjälpområden. Priser hämtas från den gemensamma katalogen. |
| `app/tjanster/services.js` | Tjänstesidans beskrivningar, ikoner och exempel. |
| `app/admin/customerViews.js` | Adminpanelens etiketter, statistik och kundfiltrering. Funktionerna gör inga nätverks- eller databasanrop. |
| `app/api/**/route.js` | HTTP-gränsen: autentisering, indata, svar och anrop till serverlogik. |
| `app/lib/` | Gemensam logik och serverintegrationer. Kontrollera beroenden innan en modul importeras i en klientkomponent. |
| `app/lib/db/` och `drizzle/` | Databasanslutning, schema och versionshanterade migrationer. |
| `tests/` | Beteendetester och säkerhets-/produktionskontroller. |
| `scripts/`, `.github/`, `helm/` | Bygg, drift, CI/CD och deployment. |

## Vanliga ändringar

- **Visat medlemspris eller plannamn:** `app/lib/membershipPlans.js`. Abonnemangssidan, medlemsformuläret, adminpanelens planval och Stripe-adaptern använder samma katalog.
- **Stripe-pris för debitering:** miljövariabeln `STRIPE_PRICE_*`. Kopplingen finns i `app/lib/stripePlans.js`, som bara ska importeras av serverkod. Den publika katalogen innehåller inga Stripe-ID:n eller hemligheter.
- **Tjänst i kontaktformuläret:** `app/lib/services.js`. Formulärets val och API:ets etiketter kommer från samma lista. Utförligare presentationer ligger i `app/tjanster/services.js`.
- **Adminpanelens kundvyer:** `app/admin/customerViews.js`. Filtrering och statistik använder samma statusgrupper.
- **Visning av datum och tid:** `app/lib/formatDate.js`, som används av adminpanelen, kundportalen och avtalssidan.
- **Kund- eller avtalsflöde:** börja i motsvarande API-route och följ anrop till `app/lib/customerStore.js`. Sessions- och kundkodskontroller finns i `customerAuth.js` och `adminAuth.js`.

## Håll nya ändringar begripliga

Låt sidkomponenten äga tillståndet och namnge komponenter efter det de visar. Lägg större innehållslistor bredvid sidan. Samla uppgifter som måste vara identiska mellan UI och API i en gemensam modul utan serverberoenden. Behåll autentisering, databasanslutning och providerhemligheter på servern.

Kör `npm run verify` före push. Lägg beteendetester till i `tests/` när gemensam logik ändras. `catalogue-and-dashboard.test.mjs` kontrollerar bland annat prisöverensstämmelse, Stripe-kopplingen och kombinationen av kundstatus och sökning.
