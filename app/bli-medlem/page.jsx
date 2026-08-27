"use client";
import Footer from "../components/Footer";
import { useEffect, useMemo, useState } from 'react';
import LogoLink from '../components/LogoLink';
import { ShieldIcon } from '../components/Icons';

const plans = [
  {
    name: 'Privat',
    price: '99 kr',
    audience: 'Privatpersoner med personlig hemsida, portfolio eller mindre digital tjänst.',
    hours: 'Upp till 30 minuter per vecka'
  },
  {
    name: 'Start',
    price: '299 kr',
    audience: 'Mindre företag som vill hålla sin webbplats uppdaterad.',
    hours: 'Upp till 1 timme per vecka'
  },
  {
    name: 'Plus',
    price: '699 kr',
    audience: 'Företag som vill förbättra webbplatsen löpande.',
    hours: 'Upp till 2 timmar per vecka'
  },
  {
    name: 'Pro',
    price: '1 490 kr',
    audience: 'Företag med aktiv vidareutveckling och support.',
    hours: 'Upp till 3 timmar per vecka'
  },
  {
    name: 'Business',
    price: '2 990 kr',
    audience: 'Långsiktigt partnerskap för utveckling, support och digital tillväxt.',
    hours: 'Upp till 5 timmar per vecka'
  }
];

const defaultRequirements = (plan) => [
  `Medlemskapet gäller abonnemanget ${plan.name} för ${plan.price}/månad.`,
  'Aegis hjälper med webbundehåll, mindre utveckling, teknisk rådgivning och IT-support inom vald nivå.',
  'Extra arbete utöver abonnemangets omfattning startar först efter separat godkännande.',
  'Kunden ansvarar för att lämna korrekt information, inloggningar och material som behövs för arbetet.',
  'Medlemskapet kan avslutas när som helst via kundportalen och avslutas direkt.'
].join('\n');

export default function JoinMembershipPage() {
  const [selectedPlanName, setSelectedPlanName] = useState('Plus');
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    signatureTitle: '',
    accessCode: ''
  });

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.name === selectedPlanName) || plans[2],
    [selectedPlanName]
  );

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const plan = search.get('plan');

    if (plans.some((item) => item.name === plan)) {
      setSelectedPlanName(plan);
    }
  }, []);

  const updateField = (field, value) => {
    setFormData((current) => ({
      ...current,
      [field]: field === 'accessCode'
        ? value.toUpperCase()
        : value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');
  
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          plan: selectedPlan.name,
          acceptedTerms,
          requirements: defaultRequirements(selectedPlan)
        })
      });
  
      const data = await response.json().catch(() => null);
  
      if (!response.ok) {
        throw new Error(
          data?.message || 'Kunde inte starta betalningen.'
        );
      }
  
      if (!data?.url) {
        throw new Error('Stripe returnerade ingen betalningslänk.');
      }
  
      window.location.href = data.url;
    } catch (checkoutError) {
      setError(
        checkoutError.message || 'Kunde inte starta betalningen.'
      );
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.18),transparent_34%),#020617] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-5 border-b border-brand-border pb-8 md:flex-row md:items-center md:justify-between">
          <LogoLink showSlogan />
          <a href="/kund" className="rounded-xl border border-brand-border px-4 py-3 text-sm font-black text-white transition hover:border-brand-primary hover:text-brand-primary">
            Kundlogin
          </a>
        </header>

        <section className="mt-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-brand-primary">Bli medlem</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Välj abonnemang och starta direkt</h1>
            <p className="mt-5 text-sm leading-7 text-brand-muted">
              Fyll i uppgifter, registrera kort och godkänn medlemskraven. Kontot aktiveras direkt och du får tillgång till kundportalen.
            </p>

            <div className="mt-6 grid gap-3">
              {plans.map((plan) => {
                const selected = plan.name === selectedPlan.name;

                return (
                  <button
                    key={plan.name}
                    type="button"
                    onClick={() => setSelectedPlanName(plan.name)}
                    className={`rounded-2xl border p-4 text-left transition ${selected ? 'border-brand-primary bg-brand-primary/15 shadow-lg shadow-brand-glow/15' : 'border-brand-border bg-slate-950/65 hover:border-brand-primary'}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-xl font-black">{plan.name}</h2>
                        <p className="mt-1 text-sm leading-6 text-brand-muted">{plan.audience}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black">{plan.price}</p>
                        <p className="text-xs text-brand-muted">/månad</p>
                      </div>
                    </div>
                    <p className="mt-3 rounded-xl border border-brand-border bg-black/25 px-3 py-2 text-xs font-bold text-brand-primary">
                      {plan.hours}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="rounded-3xl border border-brand-border bg-slate-950/75 p-6 shadow-2xl shadow-black/25 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-border bg-brand-primary/10 text-brand-primary">
                <ShieldIcon className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black">{selectedPlan.name}</h2>
                <p className="text-sm text-brand-muted">{selectedPlan.price}/månad</p>
              </div>
            </div>

            {error && (
              <div className="mt-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm font-semibold text-rose-200">
                {error}
              </div>
            )}

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-bold">
                Namn
                <input value={formData.name} onChange={(event) => updateField('name', event.target.value)} className="mt-2 w-full rounded-xl border border-brand-border bg-white px-4 py-3 text-slate-950 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30" required />
              </label>
              <label className="block text-sm font-bold">
                Företag
                <input value={formData.company} onChange={(event) => updateField('company', event.target.value)} placeholder="Valfritt" className="mt-2 w-full rounded-xl border border-brand-border bg-white px-4 py-3 text-slate-950 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30" />
              </label>
              <label className="block text-sm font-bold">
                E-post
                <input type="email" value={formData.email} onChange={(event) => updateField('email', event.target.value)} className="mt-2 w-full rounded-xl border border-brand-border bg-white px-4 py-3 text-slate-950 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30" required />
              </label>
              <label className="block text-sm font-bold">
                Telefon
                <input value={formData.phone} onChange={(event) => updateField('phone', event.target.value)} className="mt-2 w-full rounded-xl border border-brand-border bg-white px-4 py-3 text-slate-950 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30" required />
              </label>
              <label className="block text-sm font-bold sm:col-span-2">
                Skapa kundkod för login
                <input
                  value={formData.accessCode}
                  onChange={(event) => updateField('accessCode', event.target.value)}
                  placeholder="Ex. AEGIS-MITTKONTO-2026"
                  className="mt-2 w-full rounded-xl border border-brand-border bg-white px-4 py-3 text-slate-950 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30"
                  required
                />
                <span className="mt-2 block text-xs leading-5 text-brand-muted">Minst 8 tecken. Denna kod används tillsammans med e-post i kundportalen.</span>
              </label>
            </div>

            <div className="mt-7 rounded-2xl border border-brand-primary/30 bg-brand-primary/10 p-5">
              <p className="text-sm font-black text-white">Krav som godkänns</p>
              <pre className="mt-3 whitespace-pre-wrap font-display text-sm leading-7 text-brand-muted">{defaultRequirements(selectedPlan)}</pre>
            </div>

            <label className="mt-5 flex items-start gap-3 rounded-2xl border border-brand-border bg-black/25 p-4 text-sm leading-6 text-brand-muted">
              <input type="checkbox" checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} className="mt-1 h-4 w-4" />
              <span>Jag godkänner medlemskraven och att Aegis aktiverar medlemskapet direkt.</span>
            </label>

            <button disabled={isSubmitting} className="mt-6 w-full rounded-xl bg-brand-primary px-5 py-4 font-black text-brand-bg shadow-lg shadow-brand-glow transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-60">
            {isSubmitting ? 'Öppnar Stripe...' : 'Fortsätt till säker betalning'}
            </button>
          </form>
        </section>
      </div>
      <Footer />
    </main>
  );
}
