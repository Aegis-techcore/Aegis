"use client";

import { useEffect, useState } from 'react';

const formatDate = (value) => {
  if (!value) return '';

  return new Intl.DateTimeFormat('sv-SE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
};

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [requests, setRequests] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState('');

  const loadRequests = async () => {
    const response = await fetch('/api/admin/requests');

    if (!response.ok) {
      setIsAuthenticated(false);
      setRequests([]);
      return;
    }

    const data = await response.json();
    setRequests(data.requests || []);
    setIsAuthenticated(true);
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/admin/me');
        const data = await response.json();

        if (data.authenticated) {
          await loadRequests();
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');

    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.message || 'Kunde inte logga in.');
      return;
    }

    setPassword('');
    await loadRequests();
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    setIsAuthenticated(false);
    setRequests([]);
  };

  const handleDeleteRequest = async (requestId) => {
    const shouldDelete = window.confirm('Vill du ta bort denna förfrågan?');

    if (!shouldDelete) {
      return;
    }

    setDeletingId(requestId);
    setError('');

    try {
      const response = await fetch(`/api/admin/requests/${requestId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || 'Kunde inte ta bort förfrågan.');
      }

      setRequests((currentRequests) => currentRequests.filter((request) => request.id !== requestId));
    } catch (deleteError) {
      setError(deleteError.message || 'Kunde inte ta bort förfrågan.');
    } finally {
      setDeletingId('');
    }
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-brand-bg px-4 text-white">
        <p className="text-brand-muted">Laddar adminpanelen...</p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(6,182,212,0.18),transparent_38%),#020617] px-4 text-white">
        <form onSubmit={handleLogin} className="w-full max-w-md rounded-3xl border border-brand-border bg-slate-950/85 p-8 shadow-2xl shadow-brand-glow/20">
          <img src="/aegis-logo.svg" alt="Aegis logotyp" className="mb-6 h-14 w-14 rounded-2xl" />
          <h1 className="text-3xl font-black tracking-tight">Adminpanel</h1>
          <p className="mt-2 text-sm leading-6 text-brand-muted">Logga in för att se inkomna förfrågningar.</p>
          <label className="mt-8 block text-sm font-bold">Lösenord</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full rounded-xl border border-brand-border bg-white px-4 py-4 text-slate-950 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30"
            placeholder="Ange adminlösenord"
            required
          />
          {error && <p className="mt-4 text-sm font-semibold text-rose-300">{error}</p>}
          <button className="mt-6 w-full rounded-xl bg-brand-primary px-5 py-4 font-black text-brand-bg shadow-lg shadow-brand-glow transition hover:bg-brand-primary-hover">
            Logga in
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.18),transparent_34%),#020617] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-6 border-b border-brand-border pb-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <img src="/aegis-logo.svg" alt="Aegis logotyp" className="h-14 w-14 rounded-2xl" />
            <div>
              <h1 className="text-3xl font-black tracking-tight">Förfrågningar</h1>
              <p className="text-sm text-brand-muted">{requests.length} sparade kontakter</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={loadRequests} className="rounded-xl border border-brand-border px-4 py-3 text-sm font-bold transition hover:border-brand-primary hover:text-brand-primary">
              Uppdatera
            </button>
            <button onClick={handleLogout} className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-brand-primary">
              Logga ut
            </button>
          </div>
        </header>

        <section className="mt-8 grid gap-4">
          {error && (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm font-semibold text-rose-200">
              {error}
            </div>
          )}
          {requests.length === 0 ? (
            <div className="rounded-3xl border border-brand-border bg-slate-950/70 p-8 text-brand-muted">
              Inga förfrågningar har sparats ännu.
            </div>
          ) : requests.map((request) => (
            <article key={request.id} className="rounded-3xl border border-brand-border bg-slate-950/75 p-5 shadow-xl shadow-black/20">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-black">{request.name}</h2>
                    <span className={`rounded-full px-3 py-1 text-xs font-black uppercase ${request.status === 'sent' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'}`}>
                      {request.status === 'sent' ? 'Skickad' : 'Fel'}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-brand-muted">{request.company || 'Inget företag angivet'} · {formatDate(request.createdAt)}</p>
                </div>
                <div className="text-sm text-brand-muted md:text-right">
                  <p>{request.email}</p>
                  <p>{request.phone}</p>
                  <button
                    onClick={() => handleDeleteRequest(request.id)}
                    disabled={deletingId === request.id}
                    className="mt-3 rounded-xl border border-rose-500/30 px-4 py-2 text-xs font-black uppercase tracking-widest text-rose-300 transition hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deletingId === request.id ? 'Tar bort...' : 'Ta bort'}
                  </button>
                </div>
              </div>
              <div className="mt-5 grid gap-3 text-sm md:grid-cols-[220px_1fr]">
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-brand-muted">Huvudområde</p>
                  <p className="mt-2 font-bold text-white">{request.serviceLabel || request.service}</p>
                </div>
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-brand-muted">Meddelande</p>
                  <p className="mt-2 whitespace-pre-wrap leading-6 text-white/90">{request.message}</p>
                </div>
              </div>
              {request.error && <p className="mt-4 rounded-2xl bg-rose-500/10 p-3 text-sm text-rose-200">{request.error}</p>}
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
