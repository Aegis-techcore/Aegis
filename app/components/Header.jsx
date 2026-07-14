"use client";

import { useState } from "react";
import LogoLink from "./LogoLink";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-brand-border bg-brand-bg/85 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <LogoLink showSlogan />

          <nav className="hidden xl:flex items-center gap-2 text-sm font-bold">
            <a
              href="/"
              className="rounded-xl px-3 py-2 text-brand-muted transition hover:bg-white/5 hover:text-white"
            >
              Hem
            </a>

            <a
              href="/tjanster"
              className="rounded-xl px-3 py-2 text-brand-muted transition hover:bg-white/5 hover:text-white"
            >
              Tjänster
            </a>

            <a
              href="/kalkylator"
              className="rounded-xl px-3 py-2 text-brand-muted transition hover:bg-white/5 hover:text-white"
            >
              Kalkylator
            </a>

            <a
              href="/hemsidor"
              className="rounded-xl px-3 py-2 text-brand-muted transition hover:bg-white/5 hover:text-white"
            >
              Hemsidor
            </a>

            <a
              href="/abonnemang"
              className="rounded-xl px-3 py-2 text-brand-muted transition hover:bg-white/5 hover:text-white"
            >
              Abonnemang
            </a>

            <a
              href="/om-oss"
              className="rounded-xl px-3 py-2 text-brand-muted transition hover:bg-white/5 hover:text-white"
            >
              Om oss
            </a>

            <a
              href="/kontakt"
              className="rounded-xl px-4 py-2 text-brand-muted transition hover:bg-white/5 hover:text-white"
            >
              Kontakt
            </a>
          </nav>

          <div className="hidden xl:flex items-center gap-3">
            <a
              href="/bli-medlem"
              className="rounded-xl border border-brand-border px-4 py-2 text-sm font-bold text-white transition hover:border-brand-primary hover:text-brand-primary"
            >
              Bli medlem
            </a>

            <a
              href="/kund"
              className="rounded-xl bg-brand-primary px-4 py-2 text-sm font-black text-brand-bg shadow-lg shadow-brand-glow transition hover:bg-brand-primary-hover"
            >
              Kundportal
            </a>
          </div>

          <button
            type="button"
            onClick={() => setIsMenuOpen((current) => !current)}
            aria-expanded={isMenuOpen}
            aria-label="Öppna eller stäng meny"
            className="rounded-xl border border-brand-border px-4 py-3 text-sm font-black text-white transition hover:border-brand-primary hover:text-brand-primary xl:hidden"
          >
            {isMenuOpen ? "Stäng" : "Meny"}
          </button>
        </div>

        {isMenuOpen && (
          <nav className="mt-4 rounded-2xl border border-brand-border bg-slate-950/95 p-4 shadow-xl shadow-brand-glow/10 xl:hidden">
            <div className="flex flex-col gap-2 text-sm font-bold">
              {[
                ["/", "Hem"],
                ["/tjanster", "Tjänster"],
                ["/kalkylator", "Projektkalkylator"],
                ["/hemsidor", "Hemsidor"],
                ["/abonnemang", "Abonnemang"],
                ["/om-oss", "Om oss"],
                ["/kontakt", "Kontakt"],
              ].map(([href, label]) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-xl px-4 py-3 text-brand-muted transition hover:bg-white/5 hover:text-white"
                >
                  {label}
                </a>
              ))}

              <div className="my-2 border-t border-brand-border" />

              <a
                href="/bli-medlem"
                onClick={() => setIsMenuOpen(false)}
                className="rounded-xl border border-brand-border px-4 py-3 text-center text-white transition hover:border-brand-primary hover:text-brand-primary"
              >
                Bli medlem
              </a>

              <a
                href="/kund"
                onClick={() => setIsMenuOpen(false)}
                className="rounded-xl bg-brand-primary px-4 py-3 text-center font-black text-brand-bg transition hover:bg-brand-primary-hover"
              >
                Kundportal
              </a>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}