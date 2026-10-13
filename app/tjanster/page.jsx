"use client";
import Footer from "../components/Footer";
import { useState } from "react";
import Header from "../components/Header";
import { services } from "./services.js";
import {
  SparklesIcon,
  ChevronIcon,
  CheckIcon
} from "../components/Icons";

export default function TjansterPage() {
  const [activeTab, setActiveTab] = useState("programming");

  return (
    <main className="min-h-screen bg-brand-bg text-white">
      <Header />

      <section className="border-b border-brand-border py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-brand-primary">
              Våra lösningar
            </p>

            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Tjänster för företag och privatpersoner
            </h1>

            <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-brand-primary" />

            <p className="mx-auto mt-6 max-w-2xl leading-8 text-brand-muted">
              Välj ett område för att läsa mer om vad vi erbjuder och hur vi kan hjälpa dig från idé till färdig lösning.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="flex flex-col gap-2 lg:col-span-5">
              {services.map((service) => {
                const TabIcon = service.icon;
                const isActive = activeTab === service.id;

                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => setActiveTab(service.id)}
                    className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition-all duration-300 ${
                      isActive
                        ? "border-brand-primary/40 bg-brand-primary/10 text-white shadow-md"
                        : "border-transparent text-brand-muted hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`rounded-xl p-2 transition-all duration-300 ${
                          isActive
                            ? "scale-105 bg-brand-primary text-brand-bg"
                            : "bg-white/5 text-brand-muted"
                        }`}
                      >
                        <TabIcon className="h-5 w-5" />
                      </div>

                      <span className="text-sm font-bold sm:text-base">
                        {service.title}
                      </span>
                    </div>

                    <ChevronIcon
                      direction={isActive ? "right" : "down"}
                      className="h-4 w-4 opacity-50"
                    />
                  </button>
                );
              })}
            </div>

            <div className="lg:col-span-7">
              {services.map((service) => {
                if (service.id !== activeTab) return null;

                const TabIcon = service.icon;

                return (
                  <div
                    key={service.id}
                    className="glass-effect flex h-full flex-col justify-between rounded-3xl p-6 animate-fade-in sm:p-8"
                  >
                    <div>
                      <div className="mb-6 flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-brand-border bg-brand-primary/10 text-brand-primary">
                          <TabIcon className="h-6 w-6" />
                        </div>

                        <h2 className="text-2xl font-bold text-white">
                          {service.title}
                        </h2>
                      </div>

                      <ul className="mb-8 space-y-3.5">
                        {service.items.map((item) => (
                          <li key={item} className="flex items-start gap-3">
                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-brand-border bg-brand-primary/10 text-brand-primary">
                              <CheckIcon className="h-3 w-3" />
                            </span>

                            <span className="text-sm leading-relaxed text-brand-muted sm:text-base">
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-auto rounded-2xl border border-brand-border bg-black/35 p-5">
                      <div className="mb-3 flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-brand-primary">
                        <SparklesIcon className="h-4 w-4 animate-spin-slow" />
                        <span>Exempel på lösning</span>
                      </div>

                      <h3 className="mb-1 text-base font-bold text-white">
                        {service.scenario.title}
                      </h3>

                      <p className="mb-2 text-xs leading-relaxed text-brand-muted">
                        <strong className="font-semibold text-white/80">
                          Problem:
                        </strong>{" "}
                        {service.scenario.problem}
                      </p>

                      <p className="text-xs leading-relaxed text-brand-muted">
                        <strong className="font-semibold text-white/80">
                          Lösning:
                        </strong>{" "}
                        {service.scenario.action}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-12 text-center">
            <a
              href="/kontakt"
              className="inline-block rounded-xl bg-brand-primary px-6 py-3 font-black text-brand-bg transition hover:bg-brand-primary-hover"
            >
              Diskutera ditt projekt
            </a>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}