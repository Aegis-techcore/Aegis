import LogoLink from '../components/LogoLink';

export const metadata = {
  title: 'Cookiepolicy | Aegis Core',
  description: 'Cookiepolicy för Aegis Core.',
};

const sectionsSv = [
  {
    title: '1. Vad är cookies?',
    text: 'Cookies är små textfiler som sparas i din webbläsare när du besöker en webbplats. De används för att webbplatsen ska fungera korrekt, komma ihåg vissa val och förbättra användarupplevelsen.'
  },
  {
    title: '2. Vilka cookies använder vi?',
    text: 'Aegis Core använder i första hand nödvändiga cookies och lokal lagring för att webbplatsen ska fungera, till exempel för cookie-samtycke, inloggning och grundläggande funktioner.'
  },
  {
    title: '3. Analys och marknadsföring',
    text: 'Om vi i framtiden använder analysverktyg eller marknadsföringscookies, till exempel för statistik eller annonsering, kommer vi att be om ditt samtycke innan sådana cookies aktiveras.'
  },
  {
    title: '4. Hur kan du hantera cookies?',
    text: 'Du kan acceptera eller neka icke-nödvändiga cookies via vår cookie-banner. Du kan också radera eller blockera cookies direkt i din webbläsares inställningar.'
  },
  {
    title: '5. Kontakt',
    text: 'Om du har frågor om vår användning av cookies kan du kontakta oss via e-post: aegis.infon@gmail.com.'
  }
];

const sectionsEn = [
  {
    title: '1. What are cookies?',
    text: 'Cookies are small text files stored in your browser when you visit a website. They are used to make the website work properly, remember certain choices and improve the user experience.'
  },
  {
    title: '2. What cookies do we use?',
    text: 'Aegis Core primarily uses necessary cookies and local storage to make the website function, for example for cookie consent, login and basic website features.'
  },
  {
    title: '3. Analytics and marketing',
    text: 'If we use analytics tools or marketing cookies in the future, for example for statistics or advertising, we will ask for your consent before such cookies are activated.'
  },
  {
    title: '4. How can you manage cookies?',
    text: 'You can accept or reject non-essential cookies through our cookie banner. You can also delete or block cookies directly in your browser settings.'
  },
  {
    title: '5. Contact',
    text: 'If you have questions about our use of cookies, contact us at: aegis.infon@gmail.com.'
  }
];

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(6,182,212,0.18),transparent_35%),#020617] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <LogoLink className="mb-10" />

        <section className="rounded-3xl border border-brand-border bg-slate-950/75 p-6 shadow-2xl shadow-brand-glow/10 sm:p-10">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-brand-primary">
            Legal / Juridiskt
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
            Cookiepolicy
          </h1>

          <p className="mt-4 max-w-3xl text-brand-muted leading-8">
            Denna policy beskriver hur Aegis Core använder cookies och liknande tekniker på webbplatsen.
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
            <h2 className="text-3xl font-black text-white">Cookie Policy</h2>

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