"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import LogoLink from '../../components/LogoLink';
import { CheckIcon, ShieldIcon } from '../../components/Icons';

const statusLabels = {
  pending_signature: 'Väntar på signering',
  active: 'Signerad och aktiv',
  cancel_requested: 'Avslut begärt',
  cancelled: 'Avslutad',
  completed: 'Slutförd'
};

const typeLabels = {
  membership: 'Medlemskap',
  order: 'Beställning'
};

const formatDate = (value) => {
  if (!value) return '';

  return new Intl.DateTimeFormat('sv-SE', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
};

export default function AgreementPage() {
  const params = useParams();
  const token = params?.token;
  const [agreement, setAgreement] = useState(null);
  const [signatureName, setSignatureName] = useState('');
  const [signatureTitle, setSignatureTitle] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [login, setLogin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigning, setIsSigning] = useState(false);
  const [error, setError] = useState('');

  const loadAgreement = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/agreements/${token}`);
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || 'Avtalet kunde inte laddas.');
      }

      setAgreement(data.agreement);
      setSignatureName(data.agreement.signatureName || data.agreement.name || '');
    } catch (loadError) {
      setError(loadError.message || 'Avtalet kunde inte laddas.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadAgreement();
    }
  }, [token]);

  const handleSign = async (event) => {
    event.preventDefault();
    setIsSigning(true);
    setError('');

    try {
      const response = await fetch(`/api/agreements/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signatureName, signatureTitle, accessCode, accepted })
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || 'Avtalet kunde inte signeras.');
      }

      setAgreement(data.agreement);
      setLogin(data.login);
      setAccessCode('');
    } catch (signError) {
      setError(signError.message || 'Avtalet kunde inte signeras.');
    } finally {
      setIsSigning(false);
    }
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-brand-bg px-4 text-white">
        <p className="text-brand-muted">Laddar avtal...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.18),transparent_34%),#020617] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-col gap-5 border-b border-brand-border pb-8 sm:flex-row sm:items-center sm:justify-between">
          <LogoLink showSlogan />
          <a href="/kund" className="rounded-xl border border-brand-border px-4 py-3 text-sm font-black text-white transition hover:border-brand-primary hover:text-brand-primary">
            Kundlogin
          </a>
        </header>

        {error && (
          <div className="mt-8 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm font-semibold text-rose-200">
            {error}
          </div>
        )}

        {agreement && (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
            <section className="rounded-3xl border border-brand-border bg-slate-950/75 p-6 shadow-2xl shadow-black/20 sm:p-8">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-brand-primary/40 bg-brand-primary/10 px-3 py-1 text-xs font-black uppercase tracking-widest text-brand-primary">
                  {typeLabels[agreement.type] || agreement.type}
                </span>
                <span className="rounded-full border border-brand-border bg-white/5 px-3 py-1 text-xs font-black uppercase tracking-widest text-brand-muted">
                  {statusLabels[agreement.status] || agreement.status}
                </span>
              </div>

              <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">
                {agreement.projectTitle}
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-brand-muted">
                Läs igenom uppdraget, priset och villkoren. När du signerar aktiveras ditt kundkonto hos Aegis och du kan logga in för att skriva till oss.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-brand-border bg-black/25 p-4">
                  <p className="text-xs font-black uppercase tracking-widest text-brand-muted">Kund</p>
                  <p className="mt-2 font-black text-white">{agreement.name}</p>
                  <p className="text-sm text-brand-muted">{agreement.company || 'Privatperson'}</p>
                  <p className="text-sm text-brand-muted">{agreement.email}</p>
                </div>
                <div className="rounded-2xl border border-brand-border bg-black/25 p-4">
                  <p className="text-xs font-black uppercase tracking-widest text-brand-muted">Plan och pris</p>
                  <p className="mt-2 font-black text-white">{agreement.plan}</p>
                  <p className="text-sm text-brand-muted">{agreement.price || 'Enligt överenskommelse'} {agreement.billingCycle}</p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-brand-border bg-black/25 p-5">
                <p className="text-xs font-black uppercase tracking-widest text-brand-muted">Krav och omfattning</p>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-white/90">{agreement.requirements}</p>
              </div>

              <div className="mt-6 rounded-2xl border border-brand-primary/30 bg-brand-primary/10 p-5">
                <div className="flex items-start gap-3">
                  <ShieldIcon className="mt-1 h-5 w-5 shrink-0 text-brand-primary" />
                  <div>
                    <h2 className="font-black text-white">Villkor</h2>
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-brand-muted">
                      <li>Arbetet startar efter digital signering och överenskommen betalning eller fakturering.</li>
                      <li>Aegis utför endast arbete som ryms inom avtalad omfattning, krav och plan.</li>
                      <li>Extra arbete påbörjas inte utan separat godkännande.</li>
                      <li>Medlemskap kan avslutas via kundportalen. Pågående beställningar avslutas enligt överenskommelse.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <aside className="rounded-3xl border border-brand-border bg-slate-950/75 p-6 shadow-2xl shadow-black/20">
              {agreement.status === 'pending_signature' ? (
                <form onSubmit={handleSign}>
                  <h2 className="text-2xl font-black">Signera digitalt</h2>
                  <p className="mt-2 text-sm leading-6 text-brand-muted">
                    Signeringen sparas med tidpunkt och aktiverar ditt kundkonto.
                  </p>
                  <label className="mt-6 block text-sm font-bold">Namn</label>
                  <input
                    value={signatureName}
                    onChange={(event) => setSignatureName(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-brand-border bg-white px-4 py-3 text-slate-950 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30"
                    required
                  />
                  <label className="mt-4 block text-sm font-bold">Roll/titel</label>
                  <input
                    value={signatureTitle}
                    onChange={(event) => setSignatureTitle(event.target.value)}
                    placeholder="Ex. VD, ägare eller privatperson"
                    className="mt-2 w-full rounded-xl border border-brand-border bg-white px-4 py-3 text-slate-950 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30"
                  />
                  <label className="mt-4 block text-sm font-bold">Skapa kundkod för login</label>
                  <input
                    value={accessCode}
                    onChange={(event) => setAccessCode(event.target.value.toUpperCase())}
                    placeholder="Ex. AEGIS-MITTKONTO-2026"
                    className="mt-2 w-full rounded-xl border border-brand-border bg-white px-4 py-3 text-slate-950 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30"
                    required
                  />
                  <p className="mt-2 text-xs leading-5 text-brand-muted">Minst 8 tecken. Denna kod används med din e-post i kundportalen.</p>
                  <label className="mt-5 flex items-start gap-3 rounded-2xl border border-brand-border bg-black/25 p-4 text-sm leading-6 text-brand-muted">
                    <input
                      type="checkbox"
                      checked={accepted}
                      onChange={(event) => setAccepted(event.target.checked)}
                      className="mt-1 h-4 w-4"
                    />
                    <span>Jag har läst avtalet, kraven, priset och villkoren och godkänner att Aegis får starta enligt denna överenskommelse.</span>
                  </label>
                  <button
                    disabled={isSigning}
                    className="mt-6 w-full rounded-xl bg-brand-primary px-5 py-4 font-black text-brand-bg shadow-lg shadow-brand-glow transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSigning ? 'Signerar...' : 'Signera avtal'}
                  </button>
                </form>
              ) : (
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                    <CheckIcon className="h-6 w-6" />
                  </div>
                  <h2 className="mt-5 text-2xl font-black">Avtalet är signerat</h2>
                  <p className="mt-2 text-sm leading-6 text-brand-muted">
                    Signerat av {agreement.signatureName || agreement.name}
                    {agreement.signedAt ? ` ${formatDate(agreement.signedAt)}` : ''}.
                  </p>
                </div>
              )}

              {login && (
                <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                  <p className="text-sm font-black text-emerald-200">Kundlogin skapad</p>
                  <p className="mt-2 text-sm text-brand-muted">E-post: {login.email}</p>
                  <p className="mt-1 text-sm text-brand-muted">Använd kundkoden du precis valde. Av säkerhetsskäl visas den inte igen.</p>
                  <a href="/kund" className="mt-4 block rounded-xl bg-white px-4 py-3 text-center text-sm font-black text-slate-950 transition hover:bg-brand-primary">
                    Gå till kundportalen
                  </a>
                </div>
              )}
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
