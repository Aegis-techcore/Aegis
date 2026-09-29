"use client";

import { useEffect, useMemo, useState } from 'react';
import LogoLink from '../components/LogoLink';
import { ChatBubbleIcon, CheckIcon, ShieldIcon } from '../components/Icons';

const statusLabels = {
  pending_signature: 'Väntar på signering',
  active: 'Aktiv',
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

const authorLabels = {
  admin: 'Aegis',
  customer: 'Du',
  system: 'System'
};

export default function CustomerPortalPage() {
  const [email, setEmail] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [customer, setCustomer] = useState(null);
  const [message, setMessage] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const sortedMessages = useMemo(
    () => [...(customer?.messages || [])].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
    [customer]
  );

  const loadMe = async () => {
    try {
      const response = await fetch('/api/customer/me');
      const data = await response.json().catch(() => null);

      if (response.ok && data?.customer) {
        setCustomer(data.customer);
      } else {
        setCustomer(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMe();
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/customer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, accessCode })
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || 'Kunde inte logga in.');
      }

      setAccessCode('');
      await loadMe();
    } catch (loginError) {
      setError(loginError.message || 'Kunde inte logga in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/customer/logout', { method: 'POST' });
    setCustomer(null);
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/customer/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmedMessage })
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || 'Kunde inte skicka meddelandet.');
      }

      setMessage('');
      if (data?.message) {
        setCustomer((currentCustomer) => ({
          ...currentCustomer,
          messages: [
            data.message,
            ...(currentCustomer?.messages || [])
          ]
        }));
      }
    } catch (messageError) {
      setError(messageError.message || 'Kunde inte skicka meddelandet.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async (event) => {
    event.preventDefault();
    const confirmed = window.confirm('Vill du avsluta medlemskapet direkt?');

    if (!confirmed) return;

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/customer/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason })
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || 'Kunde inte begära avslut.');
      }

      setCancelReason('');
      if (data?.customer) {
        setCustomer(data.customer);
      }
    } catch (cancelError) {
      setError(cancelError.message || 'Kunde inte begära avslut.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-brand-bg px-4 text-white">
        <p className="text-brand-muted">Laddar kundportal...</p>
      </main>
    );
  }

  if (!customer) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(6,182,212,0.18),transparent_38%),#020617] px-4 py-10 text-white">
        <form onSubmit={handleLogin} className="w-full max-w-md rounded-3xl border border-brand-border bg-slate-950/85 p-8 shadow-2xl shadow-brand-glow/20">
          <LogoLink variant="admin" className="mb-6" />
          <h1 className="text-3xl font-black tracking-tight">Kundportal</h1>
          <p className="mt-2 text-sm leading-6 text-brand-muted">
            Logga in med e-post och kundkod från ditt signerade avtal.
          </p>
          <label className="mt-8 block text-sm font-bold">E-post</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-xl border border-brand-border bg-white px-4 py-4 text-slate-950 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30"
            required
          />
          <label className="mt-5 block text-sm font-bold">Kundkod</label>
          <input
            value={accessCode}
            onChange={(event) => setAccessCode(event.target.value)}
            placeholder="AEGIS-..."
            className="mt-2 w-full rounded-xl border border-brand-border bg-white px-4 py-4 text-slate-950 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30"
            required
          />
          {error && <p className="mt-4 text-sm font-semibold text-rose-300">{error}</p>}
          <button disabled={isSubmitting} className="mt-6 w-full rounded-xl bg-brand-primary px-5 py-4 font-black text-brand-bg shadow-lg shadow-brand-glow transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-60">
            {isSubmitting ? 'Loggar in...' : 'Logga in'}
          </button>
          <a href="/" className="mt-4 block text-center text-sm font-bold text-brand-muted transition hover:text-brand-primary">
            Till startsidan
          </a>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.18),transparent_34%),#020617] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-5 border-b border-brand-border pb-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <LogoLink variant="admin" />
            <div>
              <h1 className="text-3xl font-black tracking-tight">Kundportal</h1>
              <p className="text-sm text-brand-muted">Välkommen, {customer.name}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href="/" className="rounded-xl border border-brand-border px-4 py-3 text-sm font-bold transition hover:border-brand-primary hover:text-brand-primary">
              Startsida
            </a>
            <button onClick={handleLogout} className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-brand-primary">
              Logga ut
            </button>
          </div>
        </header>

        {error && (
          <div className="mt-8 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm font-semibold text-rose-200">
            {error}
          </div>
        )}

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-6">
            <article className="rounded-3xl border border-brand-border bg-slate-950/75 p-6 shadow-xl shadow-black/20">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-border bg-brand-primary/10 text-brand-primary">
                <ShieldIcon className="h-6 w-6" />
              </div>
              <p className="mt-5 text-xs font-black uppercase tracking-[0.24em] text-brand-primary">
                {typeLabels[customer.type] || customer.type}
              </p>
              <h2 className="mt-2 text-2xl font-black">{customer.projectTitle}</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-brand-border bg-white/5 px-3 py-1 text-xs font-black uppercase tracking-wider text-brand-muted">
                  {statusLabels[customer.status] || customer.status}
                </span>
                <span className="rounded-full border border-brand-primary/40 bg-brand-primary/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-brand-primary">
                  {customer.plan}
                </span>
              </div>
              <div className="mt-6 rounded-2xl border border-brand-border bg-black/25 p-4">
                <p className="text-xs font-black uppercase tracking-widest text-brand-muted">Pris</p>
                <p className="mt-2 text-xl font-black">{customer.price || 'Enligt överenskommelse'}</p>
                <p className="text-sm text-brand-muted">{customer.billingCycle}</p>
              </div>
              {customer.paymentMethod?.last4 && (
                <div className="mt-4 rounded-2xl border border-brand-border bg-black/25 p-4">
                  <p className="text-xs font-black uppercase tracking-widest text-brand-muted">Betalning</p>
                  <p className="mt-2 text-sm font-bold text-white">
                    {customer.paymentMethod.brand} **** {customer.paymentMethod.last4}
                    {customer.paymentMethod.mode === 'test' ? ' · testläge' : ''}
                  </p>
                </div>
              )}
              {customer.signedAt && (
                <p className="mt-4 flex items-center gap-2 text-sm font-bold text-emerald-300">
                  <CheckIcon className="h-4 w-4" />
                  Signerat {formatDate(customer.signedAt)}
                </p>
              )}
            </article>

            {customer.type === 'membership' && (
              <form onSubmit={handleCancel} className="rounded-3xl border border-brand-border bg-slate-950/75 p-6 shadow-xl shadow-black/20">
              <h2 className="text-xl font-black">Avsluta medlemskap</h2>
              <p className="mt-2 text-sm leading-6 text-brand-muted">
                Du kan avsluta när du vill. Kontot markeras som avslutat direkt.
              </p>
              <textarea
                value={cancelReason}
                onChange={(event) => setCancelReason(event.target.value)}
                placeholder="Valfri kommentar"
                className="mt-4 min-h-28 w-full resize-y rounded-xl border border-brand-border bg-white px-4 py-3 text-slate-950 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30"
              />
              <button disabled={isSubmitting || customer.status === 'cancelled'} className="mt-4 w-full rounded-xl border border-rose-500/40 px-4 py-3 text-sm font-black text-rose-200 transition hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-60">
                {customer.status === 'cancelled' ? 'Medlemskapet är avslutat' : 'Avsluta direkt'}
              </button>
              </form>
            )}
          </div>

          <section className="rounded-3xl border border-brand-border bg-slate-950/75 p-6 shadow-xl shadow-black/20">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-brand-border bg-brand-primary/10 text-brand-primary">
                <ChatBubbleIcon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl font-black">Chatta med Aegis</h2>
                <p className="text-sm text-brand-muted">Meddelanden sparas i ditt kundarkiv.</p>
              </div>
            </div>

            <div className="mt-6 h-[420px] overflow-y-auto rounded-2xl border border-brand-border bg-black/25 p-4">
              {sortedMessages.length === 0 ? (
                <p className="text-sm text-brand-muted">Inga meddelanden ännu.</p>
              ) : (
                <div className="space-y-3">
                  {sortedMessages.map((item) => {
                    const isCustomer = item.author === 'customer';

                    return (
                      <div key={item.id} className={`flex ${isCustomer ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-6 ${isCustomer ? 'bg-brand-primary text-brand-bg' : 'border border-brand-border bg-white/[0.04] text-brand-muted'}`}>
                          <div className="mb-1 flex items-center justify-between gap-3 text-[11px] font-black uppercase tracking-widest opacity-80">
                            <span>{authorLabels[item.author] || item.author}</span>
                            <span>{formatDate(item.createdAt)}</span>
                          </div>
                          <p className="whitespace-pre-wrap">{item.text}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
              <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Skriv till Aegis..."
                className="min-w-0 flex-1 rounded-xl border border-brand-border bg-white px-4 py-3 text-slate-950 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30"
              />
              <button disabled={isSubmitting || !message.trim()} className="rounded-xl bg-brand-primary px-5 py-3 font-black text-brand-bg shadow-lg shadow-brand-glow transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-60">
                Skicka
              </button>
            </form>
          </section>
        </section>
      </div>
    </main>
  );
}
