"use client";
import Footer from "../components/Footer";
import { useState } from "react";
import Header from "../components/Header";
import {
  ServerIcon,
  SparklesIcon,
  CheckIcon
} from "../components/Icons";

const subscriptionPlans = [
  {
    name: "Privat",
    price: "99 kr",
    period: "/månad",
    audience:
      "För privatpersoner som vill ha hjälp med en personlig hemsida, portfolio eller mindre digital tjänst utan stora kostnader.",
    hours: "Upp till 30 minuters hjälp varje vecka",
    features: [
      "Ändring av enklare texter och bilder",
      "Uppdatering av kontaktuppgifter eller länkar",
      "Mindre justeringar på personlig hemsida eller portfolio",
      "Hjälp med enklare publicering",
      "Support via e-post"
    ],
    fit:
      "Har en mindre privat webbplats och vill kunna få enkel hjälp vid behov.",
    useCaseCount: 4
  },
  {
    name: "Start",
    price: "299 kr",
    period: "/månad",
    audience:
      "För mindre företag som vill hålla sin webbplats uppdaterad, professionell och fungerande över tid.",
    hours: "Upp till 1 timmes arbete varje vecka",
    features: [
      "Ändring av texter, bilder och innehåll",
      "Uppdatering av kontaktuppgifter, öppettider och företagsinformation",
      "Mindre designjusteringar",
      "Felsökning av mindre problem",
      "Enklare teknisk rådgivning",
      "Support via e-post"
    ],
    fit:
      "Vill ha hjälp då och då för att hålla webbplatsen aktuell och professionell.",
    useCaseCount: 6
  },
  {
    name: "Plus",
    price: "699 kr",
    period: "/månad",
    audience:
      "För företag som vill förbättra sin webbplats löpande och utveckla nya delar utan stora engångskostnader.",
    hours: "Upp till 2 timmars arbete varje vecka",
    features: [
      "Allt som ingår i Start",
      "Skapande av nya sektioner på webbplatsen",
      "Uppdatering av menyer, knappar och layout",
      "Mindre förbättringar av design och struktur",
      "Hjälp med mobilanpassning",
      "Mindre funktioner, exempelvis formulär, knappar eller bokningslänkar",
      "Prioriterad e-postsupport"
    ],
    fit:
      "Vill kunna utveckla webbplatsen lite varje månad med tillgång till teknisk hjälp.",
    highlighted: true,
    useCaseCount: 8
  },
  {
    name: "Pro",
    price: "1 490 kr",
    period: "/månad",
    audience:
      "För företag som vill ha löpande utveckling, förbättringar och teknisk support varje månad.",
    hours: "Upp till 3 timmars arbete varje vecka",
    features: [
      "Allt som ingår i Plus",
      "Löpande vidareutveckling av webbplats eller app",
      "Nya sidor och landningssidor",
      "Förbättringar av användarupplevelse och design",
      "Felsökning och buggfixar",
      "Teknisk rådgivning kring förbättringar",
      "Enklare API- och automationshjälp",
      "Support via e-post och telefon"
    ],
    fit:
      "Vill ha en flexibel utvecklingspartner tillgänglig varje månad.",
    useCaseCount: 11
  },
  {
    name: "Business",
    price: "2 990 kr",
    period: "/månad",
    audience:
      "För företag som vill ha en långsiktig teknikpartner för utveckling, förbättringar, support och digital tillväxt.",
    hours: "Upp till 5 timmars arbete varje vecka",
    features: [
      "Allt som ingår i Pro",
      "Kontinuerlig utveckling av webbplats, app eller digital tjänst",
      "Planering och genomförande av nya funktioner",
      "Större design- och strukturförbättringar",
      "Hjälp med kampanjsidor och nya tjänstesidor",
      "AI-, automation- och API-förbättringar vid behov",
      "Regelbundna avstämningar",
      "Prioriterad support och snabbare hantering"
    ],
    fit:
      "Vill ha en pålitlig teknikpartner som aktivt hjälper företaget att växa digitalt.",
    useCaseCount: 13
  }
];

const subscriptionUseCases = [
  "Ändra texter och bilder",
  "Lägga till nya sidor",
  "Skapa nya sektioner",
  "Uppdatera produkter eller tjänster",
  "Lägga till kontaktformulär",
  "Förbättra design och layout",
  "Göra webbplatsen mer mobilanpassad",
  "Fixa buggar och tekniska problem",
  "Lägga till bokningslänkar eller externa tjänster",
  "Skapa kampanjsidor",
  "Göra mindre ändringar i appar",
  "Förbättra användarupplevelsen",
  "IT-support och teknisk rådgivning"
];

export default function AbonnemangPage() {
  const [selectedSubscriptionName, setSelectedSubscriptionName] =
    useState("Privat");

  const selectedSubscriptionIndex = subscriptionPlans.findIndex(
    (plan) => plan.name === selectedSubscriptionName
  );

  const selectedSubscriptionPlan =
    subscriptionPlans[selectedSubscriptionIndex] || subscriptionPlans[0];

  const selectedSubscriptionUseCases = subscriptionUseCases.slice(
    0,
    selectedSubscriptionPlan.useCaseCount
  );

  return (
    <main className="min-h-screen bg-brand-bg text-white">
      <Header />

      {/* Maintenance Subscriptions */}
      <section
        id="subscriptions"
        data-chat-section="subscriptions"
        className="border-b border-brand-border py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-border bg-brand-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-brand-primary">
              <ServerIcon className="h-4 w-4" />
              Webbunderhåll & IT-support
            </div>

            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Abonnemang för privatpersoner och företag
            </h1>

            <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-brand-primary" />

            <p className="mt-6 leading-8 text-brand-muted">
              En modern webbplats eller app behöver inte bara byggas en gång.
              Den behöver hållas uppdaterad, förbättras och anpassas efter dina
              behov. Med våra abonnemang får privatpersoner och företag löpande
              hjälp med ändringar, vidareutveckling och teknisk support.
            </p>

            <p className="mt-4 text-sm font-semibold leading-7 text-white/80">
              När du väljer ett abonnemang skickar Aegis Core ett digitalt
              avtal med pris, villkor och omfattning. Efter signering får du
              tillgång till kundportalen där du kan kommunicera med oss och
              hantera ditt medlemskap.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-5">
            {subscriptionPlans.map((plan, planIndex) => {
              const isSelected =
                selectedSubscriptionPlan.name === plan.name;

              const isIncludedInSelectedLevel =
                planIndex <= selectedSubscriptionIndex;

              return (
                <div
                  key={plan.name}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  onClick={() => setSelectedSubscriptionName(plan.name)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedSubscriptionName(plan.name);
                    }
                  }}
                  className={`group relative flex h-full cursor-pointer flex-col rounded-3xl border p-5 text-left outline-none transition duration-300 hover:-translate-y-1 hover:border-brand-primary hover:bg-brand-primary/10 focus-visible:border-brand-primary focus-visible:ring-2 focus-visible:ring-brand-primary/40 ${
                    isSelected
                      ? "border-brand-primary bg-brand-primary/15 shadow-2xl shadow-brand-glow/25"
                      : plan.highlighted
                        ? "border-brand-primary/50 bg-brand-primary/10 shadow-xl shadow-brand-glow/10"
                        : "border-brand-border bg-slate-950/55"
                  }`}
                >
                  <div className="mb-5 flex items-start justify-between gap-3">
                    <div>
                      <p className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-brand-primary">
                        Nivå {planIndex + 1}
                      </p>

                      <h2 className="text-2xl font-black text-white">
                        {plan.name}
                      </h2>

                      <p className="mt-2 text-sm leading-6 text-brand-muted">
                        {plan.audience}
                      </p>
                    </div>

                    {(plan.highlighted || isSelected) && (
                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
                          isSelected
                            ? "bg-white text-slate-950"
                            : "bg-brand-primary text-brand-bg"
                        }`}
                      >
                        {isSelected ? "Vald" : "Populär"}
                      </span>
                    )}
                  </div>

                  <div className="mb-5">
                    <span className="text-3xl font-black text-white">
                      {plan.price}
                    </span>

                    <span className="ml-1 text-sm font-bold text-brand-muted">
                      {plan.period}
                    </span>

                    <p className="mt-2 rounded-xl border border-brand-border bg-black/25 px-3 py-2 text-xs font-bold text-brand-primary">
                      {plan.hours}
                    </p>

                    <p className="mt-2 text-xs font-bold text-brand-muted">
                      {plan.useCaseCount} valbara hjälpområden
                    </p>
                  </div>

                  <ul className="mb-6 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-brand-border bg-brand-primary/10 text-brand-primary">
                          <CheckIcon className="h-3 w-3" />
                        </span>

                        <span
                          className={`text-sm leading-6 ${
                            isSelected
                              ? "text-white/90"
                              : "text-brand-muted"
                          }`}
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto">
                    <div className="mb-5 rounded-2xl border border-brand-border bg-black/25 p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-primary">
                        Passar dig som
                      </p>

                      <p className="mt-2 text-sm leading-6 text-white/85">
                        {plan.fit}
                      </p>
                    </div>

                    <a
                      href={`/bli-medlem?plan=${encodeURIComponent(plan.name)}`}
                      onClick={(event) => event.stopPropagation()}
                      className={`block w-full rounded-xl px-4 py-3 text-center text-sm font-black transition active:scale-95 ${
                        isSelected || plan.highlighted
                          ? "bg-brand-primary text-brand-bg hover:bg-brand-primary-hover"
                          : "border border-brand-border text-white hover:border-brand-primary hover:bg-brand-primary/10"
                      }`}
                    >
                      Bli medlem
                    </a>

                    <p
                      className={`mt-3 text-center text-[11px] font-bold ${
                        isIncludedInSelectedLevel
                          ? "text-brand-primary"
                          : "text-brand-muted"
                      }`}
                    >
                      {isIncludedInSelectedLevel
                        ? "Ingår i vald nivå eller lägre"
                        : "Klicka för att se fler val"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected subscription */}
          <div className="mt-8 rounded-3xl border border-brand-primary/30 bg-slate-950/75 p-6 shadow-2xl shadow-brand-glow/10 sm:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-brand-primary">
                  Valt abonnemang
                </p>

                <h2 className="mt-2 text-3xl font-black text-white">
                  {selectedSubscriptionPlan.name} –{" "}
                  {selectedSubscriptionPlan.price}

                  <span className="ml-1 text-base font-bold text-brand-muted">
                    {selectedSubscriptionPlan.period}
                  </span>
                </h2>

                <p className="mt-3 text-sm leading-7 text-brand-muted">
                  {selectedSubscriptionPlan.audience}
                </p>
              </div>

              <a
                href={`/bli-medlem?plan=${encodeURIComponent(
                  selectedSubscriptionPlan.name
                )}`}
                className="rounded-xl bg-brand-primary px-5 py-3 text-center text-sm font-black text-brand-bg shadow-lg shadow-brand-glow transition hover:bg-brand-primary-hover active:scale-95"
              >
                Starta medlemskap
              </a>
            </div>

            <div className="mt-7 grid grid-cols-1 gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <h3 className="text-lg font-black text-white">
                  Detta ingår
                </h3>

                <ul className="mt-4 space-y-3">
                  {selectedSubscriptionPlan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-brand-border bg-brand-primary/10 text-brand-primary">
                        <CheckIcon className="h-3 w-3" />
                      </span>

                      <span className="text-sm leading-6 text-white/85">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h3 className="text-lg font-black text-white">
                      Saker du kan välja
                    </h3>

                    <p className="mt-1 text-sm text-brand-muted">
                      Högre nivåer låser upp fler typer av hjälp varje månad.
                    </p>
                  </div>

                  <span className="text-sm font-black text-brand-primary">
                    {selectedSubscriptionUseCases.length} val
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {selectedSubscriptionUseCases.map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-3 rounded-2xl border border-brand-border bg-black/20 p-3 transition hover:border-brand-primary hover:bg-brand-primary/10"
                    >
                      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" />

                      <span className="text-sm leading-6 text-brand-muted">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Services and extra work */}
          <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-3xl border border-brand-border bg-slate-950/55 p-6 sm:p-8">
              <h2 className="text-2xl font-black text-white">
                Vad kan vi hjälpa dig med?
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-brand-muted">
                Du kan använda dina timmar till praktiska förbättringar,
                uppdateringar och support för webbplats, app eller digitala
                arbetsflöden.
              </p>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {subscriptionUseCases.map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-2xl border border-brand-border bg-black/20 p-3"
                  >
                    <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" />

                    <span className="text-sm leading-6 text-brand-muted">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-brand-primary/30 bg-brand-primary/10 p-6 sm:p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-border bg-brand-bg/60 text-brand-primary">
                <SparklesIcon className="h-6 w-6" />
              </div>

              <h2 className="text-2xl font-black text-white">
                Extra arbete
              </h2>

              <p className="mt-4 text-sm leading-7 text-brand-muted">
                Om arbetet tar mer tid än vad som ingår i ditt abonnemang
                debiteras extra tid separat.
              </p>

              <div className="mt-6 rounded-2xl border border-brand-border bg-black/30 p-5">
                <p className="text-sm font-bold text-brand-muted">
                  Extra utveckling för Pro och Business
                </p>

                <p className="mt-1 text-3xl font-black text-white">
                  249 kr/timme
                </p>
              </div>

              <p className="mt-5 text-sm font-semibold leading-7 text-white/85">
                Vi påbörjar aldrig extra arbete utan att först informera dig
                och få ditt godkännande.
              </p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}