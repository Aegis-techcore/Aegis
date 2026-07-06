import LogoLink from '../components/LogoLink';

export const metadata = {
  title: 'Allmänna villkor | Aegis Core',
  description: 'Allmänna villkor för Aegis Core.',
};

const sectionsSv = [
  {
    title: '1. Allmänt',
    text: 'Dessa allmänna villkor gäller för samtliga tjänster som erbjuds av Aegis Core, inklusive webbutveckling, mjukvaruutveckling, AI-lösningar, cybersäkerhet, IT-support och övriga konsulttjänster.'
  },
  {
    title: '2. Offert och avtal',
    text: 'Ett projekt påbörjas först när kunden har godkänt offert eller skriftligt accepterat vårt erbjudande.'
  },
  {
    title: '3. Betalningsvillkor',
    text: 'För projektbaserade tjänster betalas 25 % av det överenskomna priset innan projektet påbörjas. Resterande 75 % faktureras efter att projektet har levererats och godkänts av kunden. För abonnemang gäller betalning enligt vald abonnemangsplan.'
  },
  {
    title: '4. Ändringar under projektet',
    text: 'Mindre ändringar som ryms inom projektets omfattning ingår. Större ändringar eller tillägg kan innebära en ny offert eller justerad tidsplan.'
  },
  {
    title: '5. Leverans',
    text: 'Leveranstid bestäms individuellt för varje projekt. Eventuella förseningar kommuniceras så snart som möjligt.'
  },
  {
    title: '6. Garanti och support',
    text: 'Efter leverans erbjuder Aegis Core support enligt överenskommen tjänst eller abonnemang. Eventuella fel som omfattas av garantin åtgärdas utan extra kostnad.'
  },
  {
    title: '7. Immateriella rättigheter',
    text: 'När full betalning har mottagits övergår äganderätten till den färdiga lösningen till kunden, om inget annat avtalats. Aegis Core behåller rätten att använda generella lösningar, komponenter och kunskap som utvecklats under projektet.'
  },
  {
    title: '8. Ansvarsbegränsning',
    text: 'Aegis Core ansvarar inte för indirekta skador, utebliven vinst eller förlust som uppstår utanför vårt direkta kontrollområde.'
  },
  {
    title: '9. Force majeure',
    text: 'Aegis Core ansvarar inte för förseningar eller hinder som orsakas av omständigheter utanför vår kontroll, exempelvis naturkatastrofer, myndighetsbeslut, krig eller större tekniska störningar.'
  },
  {
    title: '10. Tillämplig lag',
    text: 'Dessa villkor regleras av svensk lag. Eventuella tvister ska i första hand lösas genom dialog mellan parterna.'
  }
];

const sectionsEn = [
  {
    title: '1. General',
    text: 'These terms apply to all services provided by Aegis Core, including web development, software development, AI solutions, cybersecurity, IT support and consulting services.'
  },
  {
    title: '2. Quotes and agreements',
    text: 'A project begins only after the customer has approved the quotation or otherwise accepted our proposal in writing.'
  },
  {
    title: '3. Payment terms',
    text: 'For project-based services, 25% of the agreed price is paid before work begins. The remaining 75% is invoiced after the project has been delivered and approved by the customer. Subscription services are billed according to the selected plan.'
  },
  {
    title: '4. Project changes',
    text: 'Minor changes within the agreed scope are included. Larger changes may require a revised quotation or updated timeline.'
  },
  {
    title: '5. Delivery',
    text: 'Delivery time is agreed individually for each project. Any delays will be communicated as soon as possible.'
  },
  {
    title: '6. Warranty and support',
    text: 'After delivery, Aegis Core provides support according to the agreed service or subscription. Errors covered by warranty will be corrected free of charge.'
  },
  {
    title: '7. Intellectual property',
    text: 'Ownership of the completed solution transfers to the customer once full payment has been received, unless otherwise agreed. Aegis Core retains the right to reuse general knowledge, components and development methods.'
  },
  {
    title: '8. Limitation of liability',
    text: 'Aegis Core is not liable for indirect damages, lost profits or losses beyond our reasonable control.'
  },
  {
    title: '9. Force majeure',
    text: 'Aegis Core is not responsible for delays caused by events beyond our control, including natural disasters, government actions, war or major technical failures.'
  },
  {
    title: '10. Governing law',
    text: 'These terms are governed by Swedish law. Any disputes should primarily be resolved through dialogue between the parties.'
  }
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(6,182,212,0.18),transparent_35%),#020617] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <LogoLink className="mb-10" />

        <section className="rounded-3xl border border-brand-border bg-slate-950/75 p-6 shadow-2xl shadow-brand-glow/10 sm:p-10">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-brand-primary">
            Legal / Juridiskt
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
            Allmänna villkor
          </h1>

          <p className="mt-4 max-w-3xl text-brand-muted leading-8">
            Dessa villkor beskriver hur Aegis Core arbetar med projekt, betalning, leverans, support och kundrelationer.
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
            <h2 className="text-3xl font-black text-white">
              Terms & Conditions
            </h2>

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