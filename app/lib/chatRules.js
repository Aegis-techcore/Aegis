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

export const mentionsSubscription = (message) => {
  const normalized = normalize(message);
  return /(abonnemang|webbunderhall|underhall|lopande|it-support|supportavtal|manad|serviceavtal|privatperson|privat hemsida)/.test(normalized);
};

export const mentionsCompanyInfo = (message) => {
  const normalized = normalize(message);
  return /(vad erbjuder|vad gor aegis|vad kan ni|vilka tjanster|era tjanster|aegis hjalper|om aegis)/.test(normalized);
};

export const needsHumanHelp = (message) => {
  const normalized = normalize(message);
  return /(jag vill|jag behover|vi behover|kan ni|kan du|hjalp mig|hjalpa mig|bygga|skapa|utveckla|fixa|felsoka|bugg|problem|inte fungerar|installera|integrera|uppdatera|andra|support|radgivning|konsultation|boka|kontakt|mejl|mail|offert|projekt|kund)/.test(normalized);
};

export const asksForDirectWork = (message) => {
  const normalized = normalize(message);
  return /(gor|gora|skapa|bygg|bygga|koda|programmera|utveckla|designa|fixa|felsok|felsoka|installera|integrera|uppdatera|andra text|andra texter|andra bild|andra innehall|andra pa sidan|skriv kod|kan du gora|kan du skapa|kan du bygga|kan du koda|jag vill att du|jag vill bygga|jag vill skapa|jag vill utveckla|jag behover bygga|jag behover skapa|jag behover fixa)/.test(normalized);
};

export const isOutOfScope = (message) => {
  const normalized = normalize(message);
  const allowedTopic = /(aegis|hemsida|webb|app|system|programmering|kod|java|python|api|databas|excel|data|rapport|cyber|sakerhet|gdpr|natverk|brandvagg|it-support|support|iot|embedded|ai|chatbot|automation|automatisering|spel|abonnemang|underhall|kontakt|mejl|mail|pris|offert|betalning|projekt|foretag|kund|tjanst|service|bokning|formular|design|bugg|felsok)/.test(normalized);
  const clearOffTopic = /(vader|vadret|recept|matlagning|fotboll|sport|politik|nyheter|horoskop|relation|dejting|medicin|diagnos|juridisk|advokat|skamt|dikt|roman|huvudstad|president|film|musik|traning|resa|hotell|flyg|aktier|krypto|lotto|matte|matematik|rakna|berakna|oversatt)/.test(normalized);
  const genericChatGptQuestion = /(vad ar|vem ar|nar ar|hur manga|forklara|skriv en|beratta om|\d+\s*[+\-*/]\s*\d+)/.test(normalized);

  return (clearOffTopic || genericChatGptQuestion) && !allowedTopic;
};

export const mentionsMailHelp = (message) => {
  const normalized = normalize(message);
  return /(hjalp mig skriva ett mejl|hjalp mig skriva ett mail|hjalp mig skriva mejl|hjalp mig skriva mail|skriv ett mejl|skriv ett mail|skriv mejl|skriv mail|vilken information ska jag skicka|vad ska jag skicka)/.test(normalized);
};

export const moneyReply = () =>
  `När det handlar om pris, offert, betalning, faktura, rabatt eller budget ska vi ta det via mejl så att du får rätt besked. Kontakta oss på ${CONTACT_EMAIL}.`;

export const subscriptionReply = () =>
  `Aegis har fem abonnemangsnivåer: Privat, Start, Plus, Pro och Business. Privat passar privatpersoner med personlig hemsida eller portfolio. Start passar enklare uppdateringar, Plus löpande förbättringar, Pro mer aktiv vidareutveckling och Business ett långsiktigt utvecklingspartnerskap. Klicka på en nivå i abonnemangssektionen så ser du fler valbara saker när nivån blir högre. För pris, offert eller betalning kontaktar du oss via ${CONTACT_EMAIL}.`;

export const scopeReply = () =>
  'Jag är Aegis AI-assistent och svarar bara på frågor om Aegis, våra tjänster, webbplatsen, projekt, webbutveckling, IT-support, abonnemang och kontakt. Berätta gärna vad du vill bygga, fixa eller få hjälp med.';

export const humanHandoffText = () =>
  `Om du vill att en människa hjälper dig vidare med uppgiften kan du mejla ${CONTACT_EMAIL} eller använda kontaktformuläret på sidan.`;

export const directWorkReply = () =>
  `Chatboten kan inte skapa, bygga, koda, felsöka eller utföra arbete direkt i chatten. Den kan bara svara på frågor om Aegis, våra tjänster och hur du får hjälp. Aegis kan däremot hjälpa med hemsidor, appar, AI-chatbots, IT-support och andra digitala projekt. Om du vill gå vidare kan du mejla ${CONTACT_EMAIL} eller använda kontaktformuläret på sidan.`;

export const companyInfoReply = () =>
  'Aegis hjälper privatpersoner och företag med programmering, hemsidor, appar, data/Excel, cybersäkerhet, nätverk, IoT, AI-chatbots, automation, spelutveckling, webbundehåll och IT-support. Chatboten kan förklara tjänsterna och hjälpa dig hitta rätt väg vidare, men den utför inte arbetet direkt i chatten.';

export const mailHelpReply = () =>
  `Absolut. Skicka gärna ett kort mejl till ${CONTACT_EMAIL} med: namn, företag eller privatperson, telefonnummer, vad du behöver hjälp med, vilken webbplats/app det gäller och om det är bråttom. Då kan vi snabbare förstå uppgiften och hjälpa dig vidare.`;

export const withHumanHandoff = (reply, userMessage) => {
  if (!needsHumanHelp(userMessage)) {
    return reply;
  }

  const normalizedReply = normalize(reply);

  if (normalizedReply.includes(normalize(CONTACT_EMAIL)) || /(kontaktformular|mejl|mail)/.test(normalizedReply)) {
    return reply;
  }

  return `${reply}\n\n${humanHandoffText()}`;
};

export const buildFallbackReply = (message) => {
  const normalized = normalize(message);

  if (mentionsMoney(message)) {
    return moneyReply();
  }

  if (mentionsMailHelp(message)) {
    return mailHelpReply();
  }

  if (asksForDirectWork(message)) {
    return directWorkReply();
  }

  if (isOutOfScope(message)) {
    return scopeReply();
  }

  if (/(hej|hello|tjena|halla|god morgon|god kvall)/.test(normalized)) {
    return 'Hej! Jag kan hjälpa dig att hitta rätt Aegis-tjänst och samla ihop vad projektet behöver innan du kontaktar oss. Vad vill du bygga eller lösa?';
  }

  if (mentionsSubscription(message)) {
    return subscriptionReply();
  }

  if (mentionsCompanyInfo(message)) {
    return companyInfoReply();
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
- Du är inte en generell ChatGPT. Svara inte på allmänna frågor utanför Aegis, webbplatsen, företagets tjänster, kundservice, projekt, IT, webbutveckling, AI-chatbots, abonnemang eller kontakt.
- Om frågan ligger utanför Aegis område ska du artigt säga att du bara kan hjälpa med Aegis tjänster och be användaren beskriva sitt webb-, IT- eller projektbehov.
- Du får aldrig utföra arbete i chatten. Du får inte skapa appar, bygga hemsidor, skriva kod, felsöka system, installera saker, ändra innehåll, skapa filer eller leverera färdiga lösningar.
- Om användaren ber dig göra något praktiskt ska du säga att chatten bara kan informera om Aegis och hänvisa till ${CONTACT_EMAIL} eller kontaktformuläret.
- Aegis hjälper med programmering, fullstack, hemsidor, appar, databaser, data/Excel, cybersäkerhet, nätverk, IoT, AI-chatbots, automation, spelutveckling, webbundehåll, löpande utveckling och IT-support.
- Aegis abonnemang för webbundehåll och IT-support heter endast Privat, Start, Plus, Pro och Business.
- Privat kostar 250 kr/månad och passar privatpersoner med personlig hemsida, portfolio eller mindre digital tjänst.
- Start passar enklare uppdateringar. Plus passar löpande förbättringar. Pro passar mer aktiv vidareutveckling. Business passar långsiktigt utvecklingspartnerskap.
- Abonnemang kan användas för text- och bildändringar, nya sidor, nya sektioner, designjusteringar, mobilanpassning, mindre funktioner, formulär, bokningslänkar, buggfixar, teknisk rådgivning och IT-support.
- När någon frågar om abonnemang ska du alltid utgå från alla fem nivåer: Privat, Start, Plus, Pro och Business. Skriv aldrig att det bara finns tre nivåer och kalla dem aldrig tillfälliga.
- Hitta aldrig på andra abonnemangstyper, årsavtal, livstidsavtal, övervakning eller tjänster som inte nämns här.
- Aktuell sida/sektion: ${pageContext}.

Viktig regel:
Om kunden frågar om pris, offert, kostnad, betalning, faktura, rabatt, budget, timpris, avtal eller andra pengarelaterade saker får du inte ge pris, uppskattning eller förhandla. Svara bara att frågor om pris/offert/betalning/faktura ska tas via mejl: ${CONTACT_EMAIL}.

När kunden beskriver ett konkret uppdrag, problem, felsökning, byggbehov, supportbehov eller något som kräver mänsklig uppföljning ska du kort guida dem och nämna att de kan mejla ${CONTACT_EMAIL} eller använda kontaktformuläret för mer hjälp.

Om du inte vet svaret, be kunden beskriva behovet kort eller kontakta Aegis via ${CONTACT_EMAIL}.
`.trim();
