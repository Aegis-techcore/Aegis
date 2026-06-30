export const CONTACT_EMAIL = 'Aegis.infon@gmail.com';

export const moneyKeywords = [
  'pengar',
  'pris',
  'priser',
  'kostnad',
  'kostnadsforslag',
  'kostar',
  'kosta',
  'offert',
  'avgift',
  'avgifter',
  'betalning',
  'betala',
  'faktura',
  'fakturering',
  'budget',
  'rabatt',
  'timpris',
  'kronor',
  'sek',
  'dyr',
  'billig',
  'vad tar',
  'hur mycket',
  'moms',
  'avtal',
  'price',
  'cost',
  'quote',
  'payment',
  'invoice',
  'billing',
  'discount',
  'fee'
];

export const normalize = (value) =>
  String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export const mentionsMoney = (message) => {
  const normalized = normalize(message);
  return moneyKeywords.some((keyword) => normalized.includes(keyword));
};

export const moneyReply = () =>
  `När det handlar om pris, offert, betalning, faktura, rabatt eller budget ska vi ta det via mejl så att du får rätt besked. Kontakta oss på ${CONTACT_EMAIL}.`;

export const buildFallbackReply = (message) => {
  const normalized = normalize(message);

  if (mentionsMoney(message)) {
    return moneyReply();
  }

  if (/(hej|hello|tjena|halla|god morgon|god kvall)/.test(normalized)) {
    return 'Hej! Jag kan hjälpa dig att hitta rätt Aegis-tjänst och samla ihop vad projektet behöver innan du kontaktar oss. Vad vill du bygga eller lösa?';
  }

  if (/(ai|chatbot|automation|automatisering|assistent|support)/.test(normalized)) {
    return 'En AI-chatbot kan svara på vanliga frågor, samla in kundens behov, föreslå nästa steg och skicka vidare ärenden som behöver manuell kontakt. Vill du att den främst ska hjälpa med support, bokningar eller kundförfrågningar?';
  }

  if (/(webb|hemsida|app|system|fullstack|bokning|ehandel|portal)/.test(normalized)) {
    return 'För webbplatser, appar och system kan Aegis hjälpa med design, frontend, backend, databaser, API:er, adminpaneler och lansering. Ska lösningen vara en hemsida, portal, bokning eller något annat?';
  }

  if (/(sakerhet|cyber|gdpr|hack|intrang|audit|penetration|brandvagg)/.test(normalized)) {
    return 'För säkerhet kan Aegis granska kod och system, härda servrar, sätta upp säkra inloggningar, skydda kunddata och hitta risker innan de blir problem. Vad vill du skydda först?';
  }

  if (/(excel|data|rapport|databas|automatisera|python)/.test(normalized)) {
    return 'Med data och Excel kan Aegis automatisera rapporter, samla ihop filer, bygga databaser och skapa tydliga dashboards. Vilket manuellt arbete vill du slippa?';
  }

  if (/(kontakt|mejl|mail|boka|mote|samtal|konsultation|telefon)/.test(normalized)) {
    return `Skicka gärna en kort beskrivning av behovet via ${CONTACT_EMAIL}, eller använd kontaktformuläret längre ner på sidan. Ta med namn, telefon, område och vad du vill uppnå.`;
  }

  if (/(tid|tidsplan|lang tid|leverans|deadline|nar klart)/.test(normalized)) {
    return 'Tidsplanen beror på omfattning, integrationer och hur mycket material som finns från start. Beskriv målet, nuläget och önskad deadline så kan vi guida dig till rätt nästa steg.';
  }

  return 'Jag kan hjälpa med programmering, hemsidor, system, data/Excel, cybersäkerhet, nätverk, IoT, AI-automation och spelutveckling. Beskriv ditt problem med 1-2 meningar så föreslår jag en bra väg framåt.';
};

export const buildSystemPrompt = (pageContext = 'startsidan') => `
Du är Aegis AI-assistent på företagets webbplats. Svara alltid på svenska, naturligt och hjälpsamt.

Mål:
- Hjälp besökaren förstå vilken Aegis-tjänst som passar.
- Ställ gärna en kort följdfråga när du behöver mer information.
- Håll svaren korta, konkreta och professionella.
- Aegis hjälper med programmering, fullstack, hemsidor, appar, databaser, data/Excel, cybersäkerhet, nätverk, IoT, AI-chatbots, automation och spelutveckling.
- Aktuell sida/sektion: ${pageContext}.

Viktig regel:
Om kunden frågar om pris, offert, kostnad, betalning, faktura, rabatt, budget, timpris, avtal eller andra pengarelaterade saker får du inte ge pris, uppskattning eller förhandla. Svara bara att frågor om pris/offert/betalning/faktura ska tas via mejl: ${CONTACT_EMAIL}.

Om du inte vet svaret, be kunden beskriva behovet kort eller kontakta Aegis via ${CONTACT_EMAIL}.
`.trim();
