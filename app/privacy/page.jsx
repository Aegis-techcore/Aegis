import LogoLink from '../components/LogoLink';

export const metadata = {
  title: 'Integritetspolicy | Aegis Core',
  description: 'Integritetspolicy för Aegis Core.',
};

const sectionsSv = [
  {
    title: '1. Vem ansvarar för personuppgifterna?',
    text: 'Aegis Core ansvarar för behandlingen av personuppgifter som samlas in via vår webbplats, kontaktformulär, kundportal och kommunikation med kunder. Organisationsnummer kommer att uppdateras när företaget är registrerat.'
  },
  {
    title: '2. Vilka uppgifter samlar vi in?',
    text: 'Vi kan samla in namn, företagsnamn, e-postadress, telefonnummer, meddelanden, projektinformation och annan information som du själv lämnar när du kontaktar oss eller använder våra tjänster.'
  },
  {
    title: '3. Varför använder vi uppgifterna?',
    text: 'Vi använder uppgifterna för att kunna besvara förfrågningar, skapa offerter, planera projekt, kommunicera med kunder, leverera tjänster, hantera support och förbättra våra digitala lösningar.'
  },
  {
    title: '4. Hur länge sparas uppgifterna?',
    text: 'Vi sparar uppgifter så länge det behövs för att hantera förfrågan, projektet, kundrelationen eller för att uppfylla rättsliga skyldigheter. Uppgifter som inte längre behövs raderas eller anonymiseras.'
  },
  {
    title: '5. Delar vi uppgifter med andra?',
    text: 'Vi säljer aldrig personuppgifter. Uppgifter kan delas med tekniska tjänsteleverantörer som behövs för drift, e-post, hosting, kommunikation eller betalning, men endast när det är nödvändigt för att leverera våra tjänster.'
  },
  {
    title: '6. Dina rättigheter',
    text: 'Du har rätt att begära information om vilka personuppgifter vi behandlar om dig, begära rättelse, radering, begränsning av behandling och i vissa fall invända mot behandlingen. Du kan också lämna klagomål till Integritetsskyddsmyndigheten (IMY).'
  },
  {
    title: '7. Kontakt',
    text: 'Om du har frågor om hur vi behandlar personuppgifter kan du kontakta oss via e-post: aegis.infon@gmail.com.'
  }
];

const sectionsEn = [
  {
    title: '1. Who is responsible for personal data?',
    text: 'Aegis Core is responsible for the processing of personal data collected through our website, contact forms, customer portal and customer communication. Company registration number will be updated once the company is registered.'
  },
  {
    title: '2. What data do we collect?',
    text: 'We may collect name, company name, email address, phone number, messages, project information and other information you provide when contacting us or using our services.'
  },
  {
    title: '3. Why do we use the data?',
    text: 'We use the data to respond to inquiries, prepare offers, plan projects, communicate with customers, deliver services, handle support and improve our digital solutions.'
  },
  {
    title: '4. How long do we store the data?',
    text: 'We store personal data for as long as necessary to handle the inquiry, project, customer relationship or legal obligations. Data that is no longer needed is deleted or anonymized.'
  },
  {
    title: '5. Do we share data?',
    text: 'We never sell personal data. Data may be shared with technical service providers needed for hosting, email, communication, payment or service delivery, but only when necessary.'
  },
  {
    title: '6. Your rights',
    text: 'You have the right to request access to your personal data, correction, deletion, restriction of processing and in some cases object to processing. You may also file a complaint with the Swedish Authority for Privacy Protection (IMY).'
  },
  {
    title: '7. Contact',
    text: 'If you have questions about how we process personal data, contact us at: aegis.infon@gmail.com.'
  }
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(6,182,212,0.18),transparent_35%),#020617] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <LogoLink className="mb-10" />

        <section className="rounded-3xl border border-brand-border bg-slate-950/75 p-6 shadow-2xl shadow-brand-glow/10 sm:p-10">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-brand-primary">
            Legal / Juridiskt
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
            Integritetspolicy
          </h1>

          <p className="mt-4 max-w-3xl text-brand-muted leading-8">
            Denna policy beskriver hur Aegis Core behandlar personuppgifter. Informationen är framtagen för att ge tydlig information om hur uppgifter hanteras enligt GDPR.
          </p>

          <p className="mt-3 text-xs text-brand-muted">
            Senast uppdaterad: 2026-07-06
          </p>

          <div className="mt-10 grid gap-5">
            {sectionsSv.map((section) => (
              <div key={section.title} className="rounded-2xl border border-brand-border bg-white/5 p-5">
                <h2 className="text-xl font-black text-white">{section.title}</h2>
                <p className="mt-3 text-sm leading-7 text-brand-muted">{section.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 border-t border-brand-border pt-10">
            <h2 className="text-3xl font-black text-white">Privacy Policy</h2>

            <div className="mt-8 grid gap-5">
              {sectionsEn.map((section) => (
                <div key={section.title} className="rounded-2xl border border-brand-border bg-white/5 p-5">
                  <h3 className="text-xl font-black text-white">{section.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-brand-muted">{section.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}