"use client";

import { useEffect, useMemo, useState } from 'react';
import LogoLink from '../components/LogoLink';

const statusLabels = {
  pending_signature: 'Väntar signering',
  active: 'Aktiv',
  cancel_requested: 'Avslut begärt',
  cancelled: 'Avslutad',
  completed: 'Slutförd'
};

const typeLabels = {
  membership: 'Medlemskap',
  order: 'Beställning'
};

const planOptions = ['Privat', 'Start', 'Plus', 'Pro', 'Business', 'Projekt'];

const formatDate = (value) => {
  if (!value) return '';

  return new Intl.DateTimeFormat('sv-SE', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
};

const getDraftValue = (drafts, requestId, field, fallback = '') => drafts[requestId]?.[field] ?? fallback;

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [requests, setRequests] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, inactive: 0 });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState('');
  const [approvingId, setApprovingId] = useState('');
  const [rejectingId, setRejectingId] = useState('');
  const [creatingAgreementId, setCreatingAgreementId] = useState('');
  const [updatingCustomerId, setUpdatingCustomerId] = useState('');
  const [agreementDrafts, setAgreementDrafts] = useState({});
  const [createdAgreements, setCreatedAgreements] = useState({});
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerStatus, setCustomerStatus] = useState('all');

  const filteredCustomers = useMemo(() => {
    const query = customerSearch.trim().toLowerCase();

    return customers.filter((customer) => {
      const matchesStatus = customerStatus === 'all' || customer.status === customerStatus;
      const searchable = [
        customer.name,
        customer.company,
        customer.email,
        customer.phone,
        customer.projectTitle,
        customer.plan
      ].join(' ').toLowerCase();

      return matchesStatus && (!query || searchable.includes(query));
    });
  }, [customers, customerSearch, customerStatus]);

  const loadDashboard = async () => {
    const [requestsResponse, customersResponse] = await Promise.all([
      fetch('/api/admin/requests'),
      fetch('/api/admin/customers')
    ]);

    if (!requestsResponse.ok || !customersResponse.ok) {
      setIsAuthenticated(false);
      setRequests([]);
      setCustomers([]);
      return;
    }

    const [requestsData, customersData] = await Promise.all([
      requestsResponse.json(),
      customersResponse.json()
    ]);

    setRequests(requestsData.requests || []);
    setCustomers(customersData.customers || []);
    setStats(customersData.stats || { total: 0, active: 0, pending: 0, inactive: 0 });
    setIsAuthenticated(true);
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/admin/me');
        const data = await response.json();

        if (data.authenticated) {
          await loadDashboard();
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
      body: JSON.stringify({ password })
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.message || 'Kunde inte logga in.');
      return;
    }

    setPassword('');
    await loadDashboard();
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    setIsAuthenticated(false);
    setRequests([]);
    setCustomers([]);
  };

  const handleApproveRequest = async (requestId) => {
    const shouldApprove = window.confirm('Vill du godkänna denna förfrågan och skicka e-post?');

    if (!shouldApprove) return;

    setApprovingId(requestId);
    setError('');

    try {
      const response = await fetch(`/api/admin/requests/${requestId}/approve`, {
        method: 'POST'
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || 'Kunde inte godkänna förfrågan.');
      }

      await loadDashboard();
    } catch (approveError) {
      setError(approveError.message || 'Kunde inte godkänna förfrågan.');
    } finally {
      setApprovingId('');
    }
  };

  const handleRejectRequest = async (requestId) => {
    const shouldReject = window.confirm('Vill du neka denna förfrågan och skicka e-post?');

    if (!shouldReject) return;

    setRejectingId(requestId);
    setError('');

    try {
      const response = await fetch(`/api/admin/requests/${requestId}/reject`, {
        method: 'POST'
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || 'Kunde inte neka förfrågan.');
      }

      await loadDashboard();
    } catch (rejectError) {
      setError(rejectError.message || 'Kunde inte neka förfrågan.');
    } finally {
      setRejectingId('');
    }
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
        method: 'DELETE'
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

  const updateDraft = (requestId, field, value) => {
    setAgreementDrafts((current) => ({
      ...current,
      [requestId]: {
        ...(current[requestId] || {}),
        [field]: value
      }
    }));
  };

  const handleCreateAgreement = async (request) => {
    const draft = agreementDrafts[request.id] || {};

    setCreatingAgreementId(request.id);
    setError('');

    try {
      const response = await fetch(`/api/admin/requests/${request.id}/agreement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: draft.type || 'membership',
          plan: draft.plan || 'Start',
          price: draft.price || '',
          billingCycle: draft.billingCycle || 'per månad',
          projectTitle: draft.projectTitle || request.serviceLabel || request.service,
          requirements: draft.requirements || request.message,
          adminNotes: draft.adminNotes || ''
        })
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || 'Kunde inte skapa signeringslänk.');
      }

      setCreatedAgreements((current) => ({
        ...current,
        [request.id]: data.customer
      }));
      await loadDashboard();
    } catch (agreementError) {
      setError(agreementError.message || 'Kunde inte skapa signeringslänk.');
    } finally {
      setCreatingAgreementId('');
    }
  };

  const handleUpdateCustomer = async (customerId, patch) => {
    setUpdatingCustomerId(customerId);
    setError('');

    try {
      const response = await fetch(`/api/admin/customers/${customerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch)
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || 'Kunde inte uppdatera kunden.');
      }

      await loadDashboard();
    } catch (updateError) {
      setError(updateError.message || 'Kunde inte uppdatera kunden.');
    } finally {
      setUpdatingCustomerId('');
    }
  };

  const handleAdminMessage = async (customerId) => {
    const message = window.prompt('Skriv meddelande till kunden');

    if (!message) return;

    setUpdatingCustomerId(customerId);
    setError('');

    try {
      const response = await fetch(`/api/admin/customers/${customerId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || 'Kunde inte skicka meddelandet.');
      }

      await loadDashboard();
    } catch (messageError) {
      setError(messageError.message || 'Kunde inte skicka meddelandet.');
    } finally {
      setUpdatingCustomerId('');
    }
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      window.prompt('Kopiera texten här:', text);
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
          <LogoLink variant="admin" className="mb-6" />
          <h1 className="text-3xl font-black tracking-tight">Adminpanel</h1>
          <p className="mt-2 text-sm leading-6 text-brand-muted">Logga in för att hantera förfrågningar, avtal och kundarkiv.</p>
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
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-6 border-b border-brand-border pb-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <LogoLink variant="admin" />
            <div>
              <h1 className="text-3xl font-black tracking-tight">Aegis Admin</h1>
              <p className="text-sm text-brand-muted">{requests.length} förfrågningar · {stats.total} kunder i arkivet</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={loadDashboard} className="rounded-xl border border-brand-border px-4 py-3 text-sm font-bold transition hover:border-brand-primary hover:text-brand-primary">
              Uppdatera
            </button>
            <a href="/kund" className="rounded-xl border border-brand-border px-4 py-3 text-sm font-bold transition hover:border-brand-primary hover:text-brand-primary">
              Kundportal
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

        <section className="mt-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-brand-border bg-slate-950/75 p-5">
            <p className="text-xs font-black uppercase tracking-widest text-brand-muted">Totalt</p>
            <p className="mt-2 text-3xl font-black">{stats.total}</p>
          </div>
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
            <p className="text-xs font-black uppercase tracking-widest text-emerald-200">Aktiva</p>
            <p className="mt-2 text-3xl font-black text-emerald-200">{stats.active}</p>
          </div>
          <div className="rounded-2xl border border-brand-primary/30 bg-brand-primary/10 p-5">
            <p className="text-xs font-black uppercase tracking-widest text-brand-primary">Väntar</p>
            <p className="mt-2 text-3xl font-black text-brand-primary">{stats.pending}</p>
          </div>
          <div className="rounded-2xl border border-orange-500/30 bg-orange-500/10 p-5">
            <p className="text-xs font-black uppercase tracking-widest text-orange-200">Inaktiva</p>
            <p className="mt-2 text-3xl font-black text-orange-200">{stats.inactive}</p>
          </div>
        </section>

        <section className="mt-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-black">Kundarkiv</h2>
              <p className="mt-1 text-sm text-brand-muted">Sök medlemmar, tidigare kunder och beställningar.</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                value={customerSearch}
                onChange={(event) => setCustomerSearch(event.target.value)}
                placeholder="Sök namn, företag, e-post..."
                className="rounded-xl border border-brand-border bg-white px-4 py-3 text-sm text-slate-950 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30"
              />
              <select
                value={customerStatus}
                onChange={(event) => setCustomerStatus(event.target.value)}
                className="rounded-xl border border-brand-border bg-white px-4 py-3 text-sm font-bold text-slate-950 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30"
              >
                <option value="all">Alla statusar</option>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-5 grid gap-4">
            {filteredCustomers.length === 0 ? (
              <div className="rounded-3xl border border-brand-border bg-slate-950/70 p-8 text-brand-muted">
                Inga kunder matchar sökningen.
              </div>
            ) : filteredCustomers.map((customer) => (
              <article key={customer.id} className="rounded-3xl border border-brand-border bg-slate-950/75 p-5 shadow-xl shadow-black/20">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-black">{customer.name}</h3>
                      <span className="rounded-full border border-brand-primary/40 bg-brand-primary/10 px-3 py-1 text-xs font-black uppercase tracking-widest text-brand-primary">
                        {typeLabels[customer.type] || customer.type}
                      </span>
                      <span className="rounded-full border border-brand-border bg-white/5 px-3 py-1 text-xs font-black uppercase tracking-widest text-brand-muted">
                        {statusLabels[customer.status] || customer.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-brand-muted">{customer.company || 'Privatperson'} · {customer.email} · {customer.phone}</p>
                    <p className="mt-3 text-sm font-bold text-white">{customer.projectTitle}</p>
                    <p className="mt-1 text-sm text-brand-muted">{customer.plan} · {customer.price || 'Enligt överenskommelse'} {customer.billingCycle}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    <button
                      onClick={() => handleAdminMessage(customer.id)}
                      disabled={updatingCustomerId === customer.id}
                      className="rounded-xl border border-brand-border px-4 py-2 text-xs font-black uppercase tracking-widest text-white transition hover:border-brand-primary hover:text-brand-primary disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Meddelande
                    </button>
                    {customer.signUrl && customer.status === 'pending_signature' && (
                      <button
                        onClick={() => copyText(customer.signUrl)}
                        className="rounded-xl border border-brand-primary/40 px-4 py-2 text-xs font-black uppercase tracking-widest text-brand-primary transition hover:bg-brand-primary/10"
                      >
                        Kopiera signering
                      </button>
                    )}
                    <button
                      onClick={() => handleUpdateCustomer(customer.id, { status: 'active' })}
                      disabled={updatingCustomerId === customer.id}
                      className="rounded-xl border border-emerald-500/40 px-4 py-2 text-xs font-black uppercase tracking-widest text-emerald-300 transition hover:bg-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Aktiv
                    </button>
                    <button
                      onClick={() => handleUpdateCustomer(customer.id, { status: customer.type === 'order' ? 'completed' : 'cancelled' })}
                      disabled={updatingCustomerId === customer.id}
                      className="rounded-xl border border-orange-500/40 px-4 py-2 text-xs font-black uppercase tracking-widest text-orange-300 transition hover:bg-orange-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {customer.type === 'order' ? 'Slutför' : 'Avsluta'}
                    </button>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 text-sm lg:grid-cols-[1fr_1fr]">
                  <div className="rounded-2xl bg-white/5 p-4">
                    <p className="text-xs font-black uppercase tracking-widest text-brand-muted">Krav / omfattning</p>
                    <p className="mt-2 line-clamp-6 whitespace-pre-wrap leading-6 text-white/90">{customer.requirements}</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-4">
                    <p className="text-xs font-black uppercase tracking-widest text-brand-muted">Arkivinfo</p>
                    <p className="mt-2 text-white/90">Skapad: {formatDate(customer.createdAt)}</p>
                    <p className="text-white/90">Signerad: {customer.signedAt ? formatDate(customer.signedAt) : 'Inte signerad'}</p>
                    <p className="text-white/90">Kundkod: {customer.accessCode}</p>
                    {customer.signUrl && (
                      <p className="mt-2 break-all text-brand-primary">{customer.signUrl}</p>
                    )}
                  </div>
                </div>

                {customer.messages?.length > 0 && (
                  <div className="mt-4 rounded-2xl border border-brand-border bg-black/20 p-4">
                    <p className="text-xs font-black uppercase tracking-widest text-brand-muted">Senaste meddelande</p>
                    <p className="mt-2 text-sm leading-6 text-white/90">{customer.messages[0].text}</p>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-black">Nya förfrågningar</h2>
          <p className="mt-1 text-sm text-brand-muted">Skapa avtal och signeringslänk när en kund vill bli medlem eller beställa arbete.</p>

          <div className="mt-5 grid gap-4">
            {requests.length === 0 ? (
              <div className="rounded-3xl border border-brand-border bg-slate-950/70 p-8 text-brand-muted">
                Inga förfrågningar har sparats ännu.
              </div>
            ) : requests.map((request) => {
              const createdAgreement = createdAgreements[request.id];

              return (
                <article key={request.id} className="rounded-3xl border border-brand-border bg-slate-950/75 p-5 shadow-xl shadow-black/20">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-xl font-black">{request.name}</h3>
                        <span className={`rounded-full px-3 py-1 text-xs font-black uppercase ${request.status === 'sent' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'}`}>
                          {request.status === 'sent' ? 'Skickad' : 'Fel'}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-brand-muted">{request.company || 'Inget företag angivet'} · {formatDate(request.createdAt)}</p>
                    </div>
                    <div className="text-sm text-brand-muted md:text-right">
                      <p>{request.email}</p>
                      <p>{request.phone}</p>
                      <div className="mt-3 flex flex-wrap justify-end gap-2">
                        <button
                          onClick={() => handleApproveRequest(request.id)}
                          disabled={approvingId === request.id}
                          className="rounded-xl border border-emerald-500/40 px-4 py-2 text-xs font-black uppercase tracking-widest text-emerald-300 transition hover:bg-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {approvingId === request.id ? 'Godkänner...' : 'Godkänn'}
                        </button>
                        <button
                          onClick={() => handleDeleteRequest(request.id)}
                          disabled={deletingId === request.id}
                          className="rounded-xl border border-orange-500/40 px-4 py-2 text-xs font-black uppercase tracking-widest text-orange-300 transition hover:bg-orange-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletingId === request.id ? 'Tar bort...' : 'Ta bort'}
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request.id)}
                          disabled={rejectingId === request.id}
                          className="rounded-xl border border-rose-500/40 px-4 py-2 text-xs font-black uppercase tracking-widest text-rose-300 transition hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {rejectingId === request.id ? 'Nekar...' : 'Neka'}
                        </button>
                      </div>
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

                  <div className="mt-5 rounded-2xl border border-brand-primary/30 bg-brand-primary/10 p-4">
                    <p className="text-xs font-black uppercase tracking-widest text-brand-primary">Skapa avtal / signering</p>
                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      <select
                        value={getDraftValue(agreementDrafts, request.id, 'type', 'membership')}
                        onChange={(event) => updateDraft(request.id, 'type', event.target.value)}
                        className="rounded-xl border border-brand-border bg-white px-3 py-3 text-sm font-bold text-slate-950 outline-none"
                      >
                        <option value="membership">Medlemskap</option>
                        <option value="order">Beställning</option>
                      </select>
                      <select
                        value={getDraftValue(agreementDrafts, request.id, 'plan', 'Start')}
                        onChange={(event) => updateDraft(request.id, 'plan', event.target.value)}
                        className="rounded-xl border border-brand-border bg-white px-3 py-3 text-sm font-bold text-slate-950 outline-none"
                      >
                        {planOptions.map((plan) => (
                          <option key={plan} value={plan}>{plan}</option>
                        ))}
                      </select>
                      <input
                        value={getDraftValue(agreementDrafts, request.id, 'price')}
                        onChange={(event) => updateDraft(request.id, 'price', event.target.value)}
                        placeholder="Pris, t.ex. 1 790 kr"
                        className="rounded-xl border border-brand-border bg-white px-3 py-3 text-sm text-slate-950 outline-none"
                      />
                      <input
                        value={getDraftValue(agreementDrafts, request.id, 'billingCycle', 'per månad')}
                        onChange={(event) => updateDraft(request.id, 'billingCycle', event.target.value)}
                        placeholder="Betalning, t.ex. per månad"
                        className="rounded-xl border border-brand-border bg-white px-3 py-3 text-sm text-slate-950 outline-none"
                      />
                      <input
                        value={getDraftValue(agreementDrafts, request.id, 'projectTitle', request.serviceLabel || request.service)}
                        onChange={(event) => updateDraft(request.id, 'projectTitle', event.target.value)}
                        placeholder="Avtalstitel"
                        className="rounded-xl border border-brand-border bg-white px-3 py-3 text-sm text-slate-950 outline-none md:col-span-2"
                      />
                      <textarea
                        value={getDraftValue(agreementDrafts, request.id, 'requirements', request.message)}
                        onChange={(event) => updateDraft(request.id, 'requirements', event.target.value)}
                        placeholder="Krav, omfattning och vad kunden ska godkänna"
                        className="min-h-28 resize-y rounded-xl border border-brand-border bg-white px-3 py-3 text-sm text-slate-950 outline-none md:col-span-3"
                      />
                    </div>
                    <button
                      onClick={() => handleCreateAgreement(request)}
                      disabled={creatingAgreementId === request.id}
                      className="mt-4 rounded-xl bg-brand-primary px-5 py-3 text-sm font-black text-brand-bg shadow-lg shadow-brand-glow transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {creatingAgreementId === request.id ? 'Skapar...' : 'Skapa signeringslänk'}
                    </button>

                    {createdAgreement && (
                      <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm">
                        <p className="font-black text-emerald-200">Signeringslänk skapad</p>
                        <p className="mt-2 break-all text-white">{createdAgreement.signUrl}</p>
                        <p className="mt-1 text-brand-muted">Kundkod: {createdAgreement.accessCode}</p>
                      </div>
                    )}
                  </div>

                  {request.error && <p className="mt-4 rounded-2xl bg-rose-500/10 p-3 text-sm text-rose-200">{request.error}</p>}
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
