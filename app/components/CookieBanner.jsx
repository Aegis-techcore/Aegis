"use client";

import { useEffect, useState } from "react";

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("aegis-cookie-consent");

    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("aegis-cookie-consent", "accepted");
    setShowBanner(false);
  };

  const rejectCookies = () => {
    localStorage.setItem("aegis-cookie-consent", "rejected");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[9999] mx-auto max-w-4xl rounded-3xl border border-brand-border bg-slate-950/95 p-5 text-white shadow-2xl shadow-brand-glow backdrop-blur-xl">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-black">Vi använder cookies</h3>
          <p className="mt-2 text-sm leading-6 text-brand-muted">
            Vi använder nödvändiga cookies för att webbplatsen ska fungera och för att förbättra upplevelsen.
            Du kan acceptera eller neka icke-nödvändiga cookies.
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <button
            onClick={rejectCookies}
            className="rounded-xl border border-brand-border px-4 py-3 text-sm font-bold text-white transition hover:border-brand-primary hover:text-brand-primary"
          >
            Neka
          </button>

          <button
            onClick={acceptCookies}
            className="rounded-xl bg-brand-primary px-4 py-3 text-sm font-black text-brand-bg transition hover:bg-brand-primary-hover"
          >
            Acceptera
          </button>
        </div>
      </div>
    </div>
  );
}