"use client";

import { useState } from 'react';
import Footer from '../components/Footer';
import LogoLink from '../components/LogoLink';

export default function WithdrawalPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    reference: '',
    note: ''
  });
  const [confirmed, setConfirmed] = useState(false);
  const [status, setStatus] = useState({
    busy: false,
    message: '',
    referenceId: '',
    error: false
  });

  const update = (field, value) =>
    setForm((current) => ({
      ...current,
      [field]: value
    }));

  const submit = async (event) => {
    event.preventDefault();
    setStatus({
      busy: true,
      message: '',
      referenceId: '',
      error: false
    });

    try {
      const response = await fetch('/api/withdrawal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          confirmWithdrawal: confirmed
        })
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            'Begäran kunde inte registreras.'
        );
      }

      setStatus({
        busy: false,
        message: data.message,
        referenceId: data.referenceId || '',
        error: false
      });
    } catch (error) {
      setStatus({
        busy: false,
        message:
          error.message ||
          'Begäran kunde inte registreras.',
        referenceId: '',
        error: true
      });
    }
  };

  return (
    <main className="min-h-screen bg-brand-bg text-white">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <LogoLink className="mb-10" />

        <section className="rounded-3xl border border-brand-border bg-slate-950/75 p-6 shadow-2xl shadow-black/20 sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-brand-primary">
            Konsument
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight">
            Använd ångerrätten
          </h1>
          <p className="mt-4 text-sm leading-7 text-brand-muted">
            Om du som konsument har ingått ett avtal med Aegis på distans kan du här lämna ett tydligt meddelande om att du vill använda din ångerrätt. Begäran sparas med tidpunkt så att Aegis kan kontrollera avtalet, utfört arbete och eventuell återbetalning.
          </p>

          {status.message && (
            <div className={`mt-6 rounded-2xl border p-4 text-sm ${status.error ? 'border-rose-500/30 bg-rose-500/10 text-rose-200' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'}`}>
              <p>{status.message}</p>
              {status.referenceId && (
                <p className="mt-2 font-bold">
                  Referens: {status.referenceId}
                </p>
              )}
            </div>
          )}

          <form onSubmit={submit} className="mt-8 grid gap-4">
            <label className="text-sm font-bold">
              Namn
              <input
                value={form.name}
                onChange={(event) => update('name', event.target.value)}
                required
                className="mt-2 w-full rounded-xl border border-brand-border bg-white px-4 py-3 text-slate-950 outline-none focus:border-brand-primary"
              />
            </label>

            <label className="text-sm font-bold">
              E-post som användes vid köpet
              <input
                type="email"
                value={form.email}
                onChange={(event) => update('email', event.target.value)}
                required
                className="mt-2 w-full rounded-xl border border-brand-border bg-white px-4 py-3 text-slate-950 outline-none focus:border-brand-primary"
              />
            </label>

            <label className="text-sm font-bold">
              Order-, medlems- eller betalningsreferens
              <input
                value={form.reference}
                onChange={(event) => update('reference', event.target.value)}
                placeholder="Valfritt"
                className="mt-2 w-full rounded-xl border border-brand-border bg-white px-4 py-3 text-slate-950 outline-none focus:border-brand-primary"
              />
            </label>

            <label className="text-sm font-bold">
              Kommentar
              <textarea
                value={form.note}
                onChange={(event) => update('note', event.target.value)}
                placeholder="Valfritt"
                className="mt-2 min-h-28 w-full resize-y rounded-xl border border-brand-border bg-white px-4 py-3 text-slate-950 outline-none focus:border-brand-primary"
              />
            </label>

            <label className="flex items-start gap-3 rounded-2xl border border-brand-border bg-black/25 p-4 text-sm leading-6 text-brand-muted">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(event) => setConfirmed(event.target.checked)}
                className="mt-1 h-4 w-4"
              />
              <span>
                Jag meddelar härmed att jag vill använda min ångerrätt för avtalet/köpet.
              </span>
            </label>

            <button
              disabled={status.busy || !confirmed}
              className="rounded-xl bg-brand-primary px-5 py-4 font-black text-brand-bg disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status.busy
                ? 'Registrerar...'
                : 'Registrera ångerbegäran'}
            </button>
          </form>

          <p className="mt-6 text-xs leading-6 text-brand-muted">
            Läs även <a href="/terms" className="font-bold text-brand-primary underline">Aegis allmänna villkor</a>. Detta formulär registrerar ditt meddelande; eventuell återbetalning hanteras efter kontroll av avtalet och vad som redan har utförts.
          </p>
        </section>
      </div>
      <Footer />
    </main>
  );
}
