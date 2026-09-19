"use client";

import { useEffect, useMemo, useState } from 'react';
import LogoLink from '../components/LogoLink';

const statusLabels = {
  pending_signature: 'Väntar signering',
  pending_payment: 'Väntar betalning',
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

const viewTabs = [
  { id: 'requests', label: 'Förfrågningar' },
  { id: 'active', label: 'Aktiva' },
  { id: 'pending', label: 'Väntar' },
  { id: 'archive', label: 'Arkiv' },
  { id: 'all', label: 'Alla kunder' }
];

const formatDate = (value) => {
  if (!value) return '';

  return new Intl.DateTimeFormat('sv-SE', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
};

const getDraftValue = (drafts, requestId, field, fallback = '') => drafts[requestId]?.[field] ?? fallback;

const getStats = (customers) => ({
  total: customers.length,
  active: customers.filter((customer) => customer.status === 'active').length,
  pending: customers.filter((customer) => ['pending_signature', 'pending_payment'].includes(customer.status)).length,
  archive: customers.filter((customer) => ['cancel_requested', 'cancelled', 'completed'].includes(customer.status)).length
});

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [requests, setRequests] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeView, setActiveView] = useState('requests');
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState('');
  const [agreementDrafts, setAgreementDrafts] = useState({});
  const [createdAgreements, setCreatedAgreements] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const stats = useMemo(() => getStats(customers), [customers]);

  const visibleCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return customers.filter((customer) => {
      const matchesView =
        activeView === 'all' ||
        (activeView === 'active' && customer.status === 'active') ||
        (activeView === 'pending' && ['pending_signature', 'pending_payment'].includes(customer.status)) ||
        (activeView === 'archive' && ['cancel_requested', 'cancelled', 'completed'].includes(customer.status));

      const searchable = [
        customer.name,
        customer.company,
        customer.email,
        customer.phone,
        customer.projectTitle,
        customer.plan
      ].join(' ').toLowerCase();

      return matchesView && (!query || searchable.includes(query));
    });
  }, [activeView, customers, search]);

  const loadDashboard = async () => {
    const [requestsResponse, customersResponse, notificationsResponse] = await Promise.all([
      fetch('/api/admin/requests'),
      fetch('/api/admin/customers'),
      fetch('/api/admin/notifications')
    ]);

    if (!requestsResponse.ok || !customersResponse.ok || !notificationsResponse.ok) {
      setIsAuthenticated(false);
      setRequests([]);
      setCustomers([]);
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const [requestsData, customersData, notificationsData] = await Promise.all([
      requestsResponse.json(),
      customersResponse.json(),
      notificationsResponse.json()
    ]);

    setRequests(requestsData.requests || []);
    setCustomers(customersData.customers || []);
    setNotifications(notificationsData.notifications || []);
    setUnreadCount(notificationsData.unreadCount || 0);
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

  useEffect(() => {
    if (!isAuthenticated) return undefined;

    const intervalId = window.setInterval(async () => {
      try {
        const response = await fetch('/api/admin/notifications');
        const data = await response.json();

        if (response.ok) {
          setNotifications(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
        }
      } catch {
        // Notispolling ska inte störa adminpanelen.
      }
    }, 15000);

    return () => window.clearInterval(intervalId);
  }, [isAuthenticated]);

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

  const updateDraft = (requestId, field, value) => {
    setAgreementDrafts((current) => ({
      ...current,
      [requestId]: {
        ...(current[requestId] || {}),
        [field]: value
      }
    }));
  };

  const upsertCustomer = (customer) => {
    setCustomers((current) => {
      const exists = current.some((item) => item.id === customer.id);
      return exists
        ? current.map((item) => (item.id === customer.id ? customer : item))
        : [customer, ...current];
    });
  };

  const handleCreateAgreement = async (request) => {
    const draft = agreementDrafts[request.id] || {};

    setBusyId(request.id);
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
          emailMessage: draft.emailMessage || ''
        })
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || 'Kunde inte skapa signeringslänk.');
      }

      setCreatedAgreements((current) => ({
        ...current,
        [request.id]: {
          ...data.customer,
          emailStatus: data.emailStatus,
          emailError: data.emailError
        }
      }));
      upsertCustomer(data.customer);
    } catch (agreementError) {
      setError(agreementError.message || 'Kunde inte skapa signeringslänk.');
    } finally {
      setBusyId('');
    }
  };

  const handleUpdateCustomer = async (customerId, patch) => {
    setBusyId(customerId);
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

      upsertCustomer(data.customer);
    } catch (updateError) {
      setError(updateError.message || 'Kunde inte uppdatera kunden.');
    } finally {
      setBusyId('');
    }
  };

  const handleAdminMessage = async (customerId) => {
    const message = window.prompt('Skriv meddelande till kunden');

    if (!message?.trim()) return;

    setBusyId(customerId);
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

      setCustomers((current) => current.map((customer) => (
        customer.id === customerId
          ? { ...customer, messages: [data.message, ...(customer.messages || [])] }
          : customer
      )));
    } catch (messageError) {
      setError(messageError.message || 'Kunde inte skicka meddelandet.');
    } finally {
      setBusyId('');
    }
  };

  const handleDeleteRequest = async (requestId) => {
    const shouldDelete = window.confirm('Vill du ta bort denna förfrågan?');

    if (!shouldDelete) return;

    setBusyId(requestId);
    setError('');

    try {
      const response = await fetch(`/api/admin/requests/${requestId}`, { method: 'DELETE' });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || 'Kunde inte ta bort förfrågan.');
      }

      setRequests((current) => current.filter((request) => request.id !== requestId));
    } catch (deleteError) {
      setError(deleteError.message || 'Kunde inte ta bort förfrågan.');
    } finally {
      setBusyId('');
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    const shouldDelete = window.confirm('Vill du ta bort kunden helt från arkivet? Detta tar även bort sparade meddelanden för kunden.');

    if (!shouldDelete) return;

    setBusyId(customerId);
    setError('');

    try {
      const response = await fetch(`/api/admin/customers/${customerId}`, { method: 'DELETE' });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || 'Kunde inte ta bort kunden.');
      }

      setCustomers((current) => current.filter((customer) => customer.id !== customerId));
    } catch (deleteError) {
      setError(deleteError.message || 'Kunde inte ta bort kunden.');
    } finally {
      setBusyId('');
    }
  };

  const markNotificationsRead = async () => {
    try {
      const response = await fetch('/api/admin/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: notifications.filter((notification) => !notification.read).map((notification) => notification.id)
        })
      });
      const data = await response.json().catch(() => null);

      if (response.ok) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      setUnreadCount(0);
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
          <p className="mt-2 text-sm leading-6 text-brand-muted">Hantera förfrågningar, aktiva kunder och arkiv.</p>
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
              <p className="text-sm text-brand-muted">{requests.length} förfrågningar · {stats.total} kunder</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={loadDashboard} className="rounded-xl border border-brand-border px-4 py-3 text-sm font-bold transition hover:border-brand-primary hover:text-brand-primary">
              Uppdatera
            </button>
            <button
              onClick={() => {
                setShowNotifications((current) => !current);
                if (unreadCount > 0) {
                  markNotificationsRead();
                }
              }}
              className="relative rounded-xl border border-brand-border px-4 py-3 text-sm font-bold transition hover:border-brand-primary hover:text-brand-primary"
            >
              Notiser
              {unreadCount > 0 && (
                <span className="absolute -right-2 -top-2 rounded-full bg-rose-500 px-2 py-0.5 text-xs font-black text-white">
                  {unreadCount}
                </span>
              )}
            </button>
            <a href="/bli-medlem" className="rounded-xl border border-brand-border px-4 py-3 text-sm font-bold transition hover:border-brand-primary hover:text-brand-primary">
              Bli medlem
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

        {showNotifications && (
          <section className="mt-6 rounded-3xl border border-brand-border bg-slate-950/85 p-5 shadow-2xl shadow-black/20">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-black">Notiser</h2>
              <button onClick={markNotificationsRead} className="rounded-xl border border-brand-border px-3 py-2 text-xs font-black uppercase tracking-widest text-brand-muted transition hover:border-brand-primary hover:text-white">
                Markera lästa
              </button>
            </div>
            <div className="mt-4 grid gap-2">
              {notifications.length === 0 ? (
                <p className="text-sm text-brand-muted">Inga notiser ännu.</p>
              ) : notifications.slice(0, 12).map((notification) => (
                <div key={notification.id} className={`rounded-2xl border p-3 text-sm ${notification.read ? 'border-brand-border bg-white/5 text-brand-muted' : 'border-brand-primary/40 bg-brand-primary/10 text-white'}`}>
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-black">{notification.title}</p>
                    <p className="text-xs text-brand-muted">{formatDate(notification.createdAt)}</p>
                  </div>
                  <p className="mt-1 text-sm leading-6">{notification.message}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mt-8 grid gap-4 md:grid-cols-4">
          <button onClick={() => setActiveView('active')} className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-left transition hover:border-emerald-300">
            <p className="text-xs font-black uppercase tracking-widest text-emerald-200">Aktiva</p>
            <p className="mt-2 text-3xl font-black text-emerald-200">{stats.active}</p>
          </button>
          <button onClick={() => setActiveView('pending')} className="rounded-2xl border border-brand-primary/30 bg-brand-primary/10 p-5 text-left transition hover:border-brand-primary">
            <p className="text-xs font-black uppercase tracking-widest text-brand-primary">Väntar</p>
            <p className="mt-2 text-3xl font-black text-brand-primary">{stats.pending}</p>
          </button>
          <button onClick={() => setActiveView('archive')} className="rounded-2xl border border-orange-500/30 bg-orange-500/10 p-5 text-left transition hover:border-orange-300">
            <p className="text-xs font-black uppercase tracking-widest text-orange-200">Arkiv</p>
            <p className="mt-2 text-3xl font-black text-orange-200">{stats.archive}</p>
          </button>
          <button onClick={() => setActiveView('requests')} className="rounded-2xl border border-brand-border bg-slate-950/75 p-5 text-left transition hover:border-brand-primary">
            <p className="text-xs font-black uppercase tracking-widest text-brand-muted">Förfrågningar</p>
            <p className="mt-2 text-3xl font-black">{requests.length}</p>
          </button>
        </section>

        <nav className="mt-8 flex flex-wrap gap-2 border-b border-brand-border pb-4">
          {viewTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`rounded-xl px-4 py-2 text-sm font-black transition ${activeView === tab.id ? 'bg-brand-primary text-brand-bg' : 'border border-brand-border text-brand-muted hover:border-brand-primary hover:text-white'}`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {activeView !== 'requests' && (
          <div className="mt-6">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Sök namn, företag, e-post, plan..."
              className="w-full max-w-xl rounded-xl border border-brand-border bg-white px-4 py-3 text-sm text-slate-950 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30"
            />
          </div>
        )}

        {activeView === 'requests' ? (
          <RequestsView
            requests={requests}
            busyId={busyId}
            agreementDrafts={agreementDrafts}
            createdAgreements={createdAgreements}
            updateDraft={updateDraft}
            handleCreateAgreement={handleCreateAgreement}
            handleDeleteRequest={handleDeleteRequest}
          />
        ) : (
          <CustomersView
            customers={visibleCustomers}
            busyId={busyId}
            handleAdminMessage={handleAdminMessage}
            handleUpdateCustomer={handleUpdateCustomer}
            handleDeleteCustomer={handleDeleteCustomer}
            copyText={copyText}
          />
        )}
      </div>
    </main>
  );
}

function CustomersView({ customers, busyId, handleAdminMessage, handleUpdateCustomer, handleDeleteCustomer, copyText }) {
  if (customers.length === 0) {
    return (
      <div className="mt-6 rounded-3xl border border-brand-border bg-slate-950/70 p-8 text-brand-muted">
        Inga kunder i denna vy.
      </div>
    );
  }

  return (
    <section className="mt-6 grid gap-3">
      {customers.map((customer) => (
        <article key={customer.id} className="rounded-2xl border border-brand-border bg-slate-950/75 p-4 shadow-xl shadow-black/15">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-black">{customer.name}</h2>
                <span className="rounded-full border border-brand-primary/40 bg-brand-primary/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-brand-primary">
                  {typeLabels[customer.type] || customer.type}
                </span>
                <span className="rounded-full border border-brand-border bg-white/5 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-brand-muted">
                  {statusLabels[customer.status] || customer.status}
                </span>
              </div>
              <p className="mt-1 truncate text-sm text-brand-muted">{customer.company || 'Privatperson'} · {customer.email} · {customer.plan}</p>
              <p className="mt-1 text-sm font-bold text-white">{customer.projectTitle}</p>
            </div>
            <div className="flex flex-wrap gap-2 lg:justify-end">
              <button onClick={() => handleAdminMessage(customer.id)} disabled={busyId === customer.id} className="rounded-xl border border-brand-border px-3 py-2 text-xs font-black uppercase tracking-widest text-white transition hover:border-brand-primary hover:text-brand-primary disabled:cursor-not-allowed disabled:opacity-60">
                Meddelande
              </button>
              {customer.signUrl && customer.status === 'pending_signature' && (
                <button onClick={() => copyText(customer.signUrl)} className="rounded-xl border border-brand-primary/40 px-3 py-2 text-xs font-black uppercase tracking-widest text-brand-primary transition hover:bg-brand-primary/10">
                  Signering
                </button>
              )}
              <button onClick={() => handleUpdateCustomer(customer.id, { status: 'active' })} disabled={busyId === customer.id} className="rounded-xl border border-emerald-500/40 px-3 py-2 text-xs font-black uppercase tracking-widest text-emerald-300 transition hover:bg-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-60">
                Aktiv
              </button>
              <button onClick={() => handleUpdateCustomer(customer.id, { status: customer.type === 'order' ? 'completed' : 'cancelled' })} disabled={busyId === customer.id} className="rounded-xl border border-orange-500/40 px-3 py-2 text-xs font-black uppercase tracking-widest text-orange-300 transition hover:bg-orange-500/10 disabled:cursor-not-allowed disabled:opacity-60">
                {customer.type === 'order' ? 'Slutför' : 'Arkivera'}
              </button>
              <button onClick={() => handleDeleteCustomer(customer.id)} disabled={busyId === customer.id} className="rounded-xl border border-rose-500/40 px-3 py-2 text-xs font-black uppercase tracking-widest text-rose-300 transition hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-60">
                Ta bort
              </button>
            </div>
          </div>

          <details className="mt-3 rounded-xl border border-brand-border bg-black/20 p-3">
            <summary className="cursor-pointer text-xs font-black uppercase tracking-widest text-brand-muted">Detaljer och konversation</summary>
            <div className="mt-4 grid gap-3 text-sm lg:grid-cols-2">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-brand-muted">Krav</p>
                <p className="mt-2 whitespace-pre-wrap leading-6 text-white/90">{customer.requirements || 'Inga krav angivna.'}</p>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-brand-muted">Info</p>
                <p className="mt-2">Pris: {customer.price || 'Enligt överenskommelse'} {customer.billingCycle}</p>
                <p>Skapad: {formatDate(customer.createdAt)}</p>
                <p>Signerad: {customer.signedAt ? formatDate(customer.signedAt) : 'Inte signerad'}</p>
                <p>Kundkod: {customer.status === 'pending_signature' ? 'Skapas av kunden vid signering' : 'Skyddad'}</p>
                {customer.paymentMethod?.last4 && (
                  <p>
                    Kort: {customer.paymentMethod.brand} **** {customer.paymentMethod.last4}
                    {customer.paymentMethod.mode === 'test' ? ' · testläge' : ''}
                  </p>
                )}
              </div>
            </div>
            {customer.messages?.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-black uppercase tracking-widest text-brand-muted">Meddelanden</p>
                {customer.messages.slice(0, 5).map((message) => (
                  <div key={message.id} className="rounded-xl bg-white/5 p-3 text-sm">
                    <p className="text-xs font-black uppercase tracking-widest text-brand-muted">{message.author} · {formatDate(message.createdAt)}</p>
                    <p className="mt-1 whitespace-pre-wrap text-white/90">{message.text}</p>
                  </div>
                ))}
              </div>
            )}
          </details>
        </article>
      ))}
    </section>
  );
}

function RequestsView({ requests, busyId, agreementDrafts, createdAgreements, updateDraft, handleCreateAgreement, handleDeleteRequest }) {
  if (requests.length === 0) {
    return (
      <div className="mt-6 rounded-3xl border border-brand-border bg-slate-950/70 p-8 text-brand-muted">
        Inga förfrågningar har sparats ännu.
      </div>
    );
  }

  return (
    <section className="mt-6 grid gap-3">
      {requests.map((request) => {
        const createdAgreement = createdAgreements[request.id];

        return (
          <article key={request.id} className="rounded-2xl border border-brand-border bg-slate-950/75 p-4 shadow-xl shadow-black/15">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-black">{request.name}</h2>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${request.status === 'sent' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'}`}>
                    {request.status === 'sent' ? 'Skickad' : 'Fel'}
                  </span>
                </div>
                <p className="mt-1 text-sm text-brand-muted">{request.company || 'Inget företag'} · {request.email} · {formatDate(request.createdAt)}</p>
                <p className="mt-2 text-sm font-bold text-white">{request.serviceLabel || request.service}</p>
              </div>
              <button onClick={() => handleDeleteRequest(request.id)} disabled={busyId === request.id} className="rounded-xl border border-orange-500/40 px-3 py-2 text-xs font-black uppercase tracking-widest text-orange-300 transition hover:bg-orange-500/10 disabled:cursor-not-allowed disabled:opacity-60">
                Ta bort
              </button>
            </div>

            <details className="mt-3 rounded-xl border border-brand-border bg-black/20 p-3">
              <summary className="cursor-pointer text-xs font-black uppercase tracking-widest text-brand-muted">Meddelande och avtal</summary>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-white/90">{request.message}</p>
              <p className="mt-4 rounded-xl border border-brand-primary/30 bg-brand-primary/10 p-3 text-xs font-bold leading-5 text-brand-muted">
                Mallen nedan hämtas från kundens meddelande. Ändra pris, krav och mejltext innan du skapar länken.
              </p>

              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <select value={getDraftValue(agreementDrafts, request.id, 'type', 'membership')} onChange={(event) => updateDraft(request.id, 'type', event.target.value)} className="rounded-xl border border-brand-border bg-white px-3 py-3 text-sm font-bold text-slate-950 outline-none">
                  <option value="membership">Medlemskap</option>
                  <option value="order">Beställning</option>
                </select>
                <select value={getDraftValue(agreementDrafts, request.id, 'plan', 'Start')} onChange={(event) => updateDraft(request.id, 'plan', event.target.value)} className="rounded-xl border border-brand-border bg-white px-3 py-3 text-sm font-bold text-slate-950 outline-none">
                  {planOptions.map((plan) => <option key={plan} value={plan}>{plan}</option>)}
                </select>
                <input value={getDraftValue(agreementDrafts, request.id, 'price')} onChange={(event) => updateDraft(request.id, 'price', event.target.value)} placeholder="Pris" className="rounded-xl border border-brand-border bg-white px-3 py-3 text-sm text-slate-950 outline-none" />
                <input value={getDraftValue(agreementDrafts, request.id, 'billingCycle', 'per månad')} onChange={(event) => updateDraft(request.id, 'billingCycle', event.target.value)} placeholder="Betalning" className="rounded-xl border border-brand-border bg-white px-3 py-3 text-sm text-slate-950 outline-none" />
                <input value={getDraftValue(agreementDrafts, request.id, 'projectTitle', request.serviceLabel || request.service)} onChange={(event) => updateDraft(request.id, 'projectTitle', event.target.value)} placeholder="Titel" className="rounded-xl border border-brand-border bg-white px-3 py-3 text-sm text-slate-950 outline-none md:col-span-2" />
                <textarea value={getDraftValue(agreementDrafts, request.id, 'requirements', request.message)} onChange={(event) => updateDraft(request.id, 'requirements', event.target.value)} placeholder="Kontrakt/krav som kunden ska godkänna" className="min-h-32 resize-y rounded-xl border border-brand-border bg-white px-3 py-3 text-sm text-slate-950 outline-none md:col-span-3" />
                <textarea value={getDraftValue(agreementDrafts, request.id, 'emailMessage', 'Hej! Här kommer avtalet enligt det vi har diskuterat. Läs igenom pris, krav och omfattning innan du signerar.')} onChange={(event) => updateDraft(request.id, 'emailMessage', event.target.value)} placeholder="Mejltext till kunden" className="min-h-24 resize-y rounded-xl border border-brand-border bg-white px-3 py-3 text-sm text-slate-950 outline-none md:col-span-3" />
              </div>

              <button onClick={() => handleCreateAgreement(request)} disabled={busyId === request.id} className="mt-4 rounded-xl bg-brand-primary px-5 py-3 text-sm font-black text-brand-bg shadow-lg shadow-brand-glow transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-60">
                {busyId === request.id ? 'Skapar...' : 'Skapa signeringslänk'}
              </button>

              {createdAgreement && (
                <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm">
                  <p className="font-black text-emerald-200">Signeringslänk skapad</p>
                  <p className="mt-2 break-all text-white">{createdAgreement.signUrl}</p>
                  <p className="mt-1 text-brand-muted">Kundkod skapas av kunden vid signering.</p>
                  {createdAgreement.emailStatus === 'sent' && (
                    <p className="mt-2 text-emerald-200">Avtalet skickades också till kundens mejl.</p>
                  )}
                  {createdAgreement.emailStatus === 'failed' && (
                    <p className="mt-2 text-orange-200">Länken skapades, men mejlet kunde inte skickas: {createdAgreement.emailError || 'okänt fel'}</p>
                  )}
                  {createdAgreement.emailStatus === 'not_sent' && (
                    <p className="mt-2 text-orange-200">Länken skapades. Mejltjänsten är inte aktiv, så kopiera länken och skicka den manuellt.</p>
                  )}
                </div>
              )}
            </details>
          </article>
        );
      })}
    </section>
  );
}
