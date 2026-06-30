# Aegis

Next.js-webbplats för Aegis.

## Kom igang

```bash
npm install
npm run dev
```

Sidan körs lokalt på `http://localhost:3000`.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Gratis AI-chatbot

Chatboten anvander en lokal gratis AI-modell via Ollama nar den finns tillganglig.

Installera Ollama och hamta modellen:

```bash
ollama pull llama3.2:3b
```

Starta sedan webbplatsen som vanligt:

```bash
npm run dev
```

Standardinstallningen ar:

```env
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=llama3.2:3b
```

Om Ollama inte ar igang svarar chatten med ett enklare fallback-lage, men regeln om pris/offert/betalning till mejl galler fortfarande.

## E-post

Kontaktformuläret använder Next.js API-routen `app/api/contact/route.js` och skickar förfrågningar till `aegis.infon@gmail.com` via Resend.

Lägg Resend-nyckeln i `.env.local` lokalt eller som environment variable i hostingen:

```env
RESEND_API_KEY=din_resend_api_key
```

## Adminpanel

Adminpanelen finns på `http://localhost:3000/admin`.

Lägg till ett adminlösenord i `.env.local` lokalt eller som environment variable i hostingen:

```env
ADMIN_PASSWORD=ditt_starka_losenord
ADMIN_SESSION_SECRET=en_lang_slumpmassig_secret
```

Förfrågningar sparas server-side i `data/contact-requests.json` när projektet körs på en Node-server. På serverless-hosting med read-only filsystem bör detta bytas till en databas innan produktion.
