# Bidra till Aegis

1. Skapa en kortlivad branch från den senaste huvudgrenen.
2. Installera med `npm ci`.
3. Gör en fokuserad ändring utan hemligheter eller genererade buildfiler.
4. Kör `npm run verify` och relevanta Docker/Helm-kontroller.
5. Beskriv beteendeförändring, verifiering och eventuell migrations- eller rollbackrisk i pull requesten.

Alla pull requests ska passera CI och granskas före merge. Schemaändringar ska innehålla en granskad Drizzle-migration. Säkerhetsproblem rapporteras privat enligt `SECURITY.md`.
