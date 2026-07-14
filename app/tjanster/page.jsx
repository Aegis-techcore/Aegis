"use client";
import Footer from "../components/Footer";
import { useState } from "react";
import Header from "../components/Header";
import {
  ShieldIcon,
  CodeIcon,
  LayoutIcon,
  TableIcon,
  ServerIcon,
  CpuIcon,
  SparklesIcon,
  GamepadIcon,
  ChevronIcon,
  CheckIcon
} from "../components/Icons";

const services = [
  {
    id: "programming",
    title: "Programmering & Utveckling",
    icon: CodeIcon,
    items: [
      "Hjälp med objektorienterad programmering (OOP)",
      "Felsökning, debugging och prestandaanalys",
      "Optimering av långsam eller ineffektiv kod",
      "Automatisering av repetitiva arbetsuppgifter",
      "API-integrationer och mikrotjänster",
      "Robust arkitektur från idé till färdig produkt"
    ],
    scenario: {
      title: "Java-applikation som kraschar",
      problem: "Ett Java-program som kraschar varje gång användaren klickar på en specifik knapp.",
      action: "Vi läser och analyserar källkoden, identifierar minnesläckan eller pekarfelet, åtgärdar logiken och levererar stabil kod tillsammans med en tydlig förklaring."
    }
  },
  {
    id: "fullstack",
    title: "Fullstack-utveckling",
    icon: LayoutIcon,
    items: [
      "Professionella företagshemsidor och landningssidor",
      "E-handelslösningar och säkra betalningssystem",
      "Bokningssystem och interaktiva kalendrar",
      "Kundportaler och medlemssystem",
      "Adminpaneler och avancerade dashboards",
      "Mobilappar för iOS och Android"
    ],
    scenario: {
      title: "Bokningar via telefon",
      problem: "En frisörsalong hanterar alla sina bokningar manuellt via telefon, vilket tar mycket tid och gör att kvällskunder missas.",
      action: "Vi utvecklar en modern webbplats med ett integrerat kalenderbaserat bokningssystem som skickar automatiska SMS- och e-postbekräftelser."
    }
  },
  {
    id: "data",
    title: "Data & Excel",
    icon: TableIcon,
    items: [
      "Sammanställning av hundratals spridda Excel-filer",
      "Automatisk rapportgenerering i PDF och Excel",
      "Dataanalys, statistik och interaktiv visualisering",
      "Säker datamigrering och databasdesign",
      "Effektivisering och ersättning av makron med Python"
    ],
    scenario: {
      title: "500 utspridda Excel-filer",
      problem: "En ekonom lägger flera dagar varje månad på att manuellt sammanställa 500 Excel-rapporter från olika kontor.",
      action: "Vi utvecklar ett automatiserat Python-skript som läser in filerna, tvättar datan och sparar allt i en central sökbar databas."
    }
  },
  {
    id: "cybersecurity",
    title: "Cybersäkerhet",
    icon: ShieldIcon,
    items: [
      "Säkerhetsgranskningar av kod och system",
      "Skydd av känslig kunddata och GDPR-efterlevnad",
      "Säker serverkonfiguration och härdning",
      "Sårbarhetsanalys och penetrationstestning",
      "Incidenthantering och säkra autentiseringslösningar"
    ],
    scenario: {
      title: "Säkerhetstest av webbshop",
      problem: "En snabbväxande webbshop vet inte om deras kunddata eller betalningsflöden har allvarliga säkerhetsluckor.",
      action: "Vi utför penetrationstester, identifierar kritiska sårbarheter och hjälper till att åtgärda dem."
    }
  },
  {
    id: "network",
    title: "Nätverk & IT-support",
    icon: ServerIcon,
    items: [
      "Brandväggskonfiguration och intrångsskydd",
      "Säkra VPN-lösningar för distansarbete",
      "Felsökning av lokala nätverk och IP-konflikter",
      "Serverhantering för Linux och Windows",
      "Optimering av trådlösa nätverk"
    ],
    scenario: {
      title: "Instabilt distanskontor",
      problem: "Ett kontor lider av ständiga nätverksavbrott och säkerhetsrisker vid distansanslutning till servern.",
      action: "Vi konfigurerar en robust brandvägg, sätter upp säkra VPN-tunnlar och optimerar nätverket."
    }
  },
  {
    id: "embedded",
    title: "Embedded Systems & IoT",
    icon: CpuIcon,
    items: [
      "Mikrokontrollerprogrammering med ESP32, Arduino och STM32",
      "Sensorintegrationer och datainsamling i realtid",
      "Smarta och uppkopplade IoT-produkter",
      "Kommunikationsprotokoll som MQTT, BLE, I2C och Wi-Fi",
      "Hårdvarunära mjukvaruutveckling och industriell automation"
    ],
    scenario: {
      title: "Överhettade fabriksmaskiner",
      problem: "En fabrik upplever plötsliga maskinstopp för att deras äldre maskiner blir för varma utan förvarning.",
      action: "Vi installerar temperatursensorer och kopplar dem till en dashboard som visar data i realtid."
    }
  },
  {
    id: "ai",
    title: "AI & Automation",
    icon: SparklesIcon,
    items: [
      "Skräddarsydda AI-chatbots integrerade på hemsidan",
      "Intelligent dokumentanalys och textsammanfattning",
      "Automatiska arbetsflöden och skript",
      "AI-assistenter för support och intern kunskap",
      "Automatisering av e-post och kundtjänstsvar"
    ],
    scenario: {
      title: "Överbelastad kundsupport",
      problem: "Ett företag får hundratals repetitiva frågor varje dag vilket gör att handläggningstiderna blir långa.",
      action: "Vi utvecklar en AI-chatbot tränad på företagets egen dokumentation och FAQ."
    }
  },
  {
    id: "games",
    title: "Spelutveckling",
    icon: GamepadIcon,
    items: [
      "Mobilspel för iOS och Android",
      "Multiplayer-arkitektur och spelservrar",
      "Speldesign, mekanik och prototyputveckling",
      "Integration av online-funktionalitet och sparfiler",
      "Publicering på Google Play Store och App Store"
    ],
    scenario: {
      title: "Från idé till mobilspel",
      problem: "En kreatör har en spelidé men saknar teknisk kompetens för att bygga spelet.",
      action: "Vi designar spelets mekanik, programmerar funktionaliteten, bygger gränssnittet och förbereder publicering."
    }
  }
];

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