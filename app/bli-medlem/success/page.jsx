"use client";

import { useEffect, useState } from 'react';

export default function MembershipSuccessPage() {
  const [state, setState] = useState({
    loading: true,
    verified: false,
    message: 'Verifierar betalningen...'
  });

  useEffect(() => {
    const sessionId =
      new URLSearchParams(
        window.location.search
      ).get('session_id');

    if (!sessionId) {
      setState({
        loading: false,
        verified: false,
        message:
          'Betalningssession saknas. Kontakta Aegis om du redan har betalat.'
      });
      return;
    }

    fetch(
      `/api/stripe/session?session_id=${encodeURIComponent(sessionId)}`,
      { cache: 'no-store' }
    )
      .then(async (response) => {
        const data =
          await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            data?.message ||
              'Betalningen kunde inte verifieras.'
          );
        }

        setState({
          loading: false,
          verified: true,
          message:
            'Betalningen är verifierad och medlemskapet är aktiverat.'
        });
      })
      .catch((error) => {
        setState({
          loading: false,
          verified: false,
          message:
            error.message ||
            'Betalningen kunde inte verifieras.'
        });
      });
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-20 text-white">
      <div className="mx-auto max-w-xl rounded-3xl border border-brand-border bg-slate-900/80 p-8 text-center">
        <h1 className="text-3xl font-black">
          {state.loading
            ? 'Verifierar betalningen'
            : state.verified
              ? 'Medlemskapet är aktivt'
              : 'Betalningen behöver kontrolleras'}
        </h1>

        <p className="mt-4 leading-7 text-brand-muted">
          {state.message}
        </p>

        {!state.loading && state.verified && (
          <a
            href="/kund"
            className="mt-8 inline-block rounded-xl bg-brand-primary px-5 py-3 font-black text-brand-bg"
          >
            Öppna kundportalen
          </a>
        )}

        {!state.loading && !state.verified && (
          <a
            href="/bli-medlem"
            className="mt-8 inline-block rounded-xl border border-brand-border px-5 py-3 font-black"
          >
            Tillbaka
          </a>
        )}
      </div>
    </main>
  );
}
