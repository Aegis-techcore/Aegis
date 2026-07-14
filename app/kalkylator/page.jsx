"use client";
import Footer from "../components/Footer";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import { CheckIcon, SparklesIcon } from "../components/Icons";

const projectSizes = [
  {
    id: "small",
    label: "Litet",
    description: "Excel / Script / Enkel sida",
    baseWeeks: 0.5,
    baseComplexity: 10
  },
  {
    id: "medium",
    label: "Medel",
    description: "Bokning / Databas / IoT",
    baseWeeks: 2,
    baseComplexity: 25
  },
  {
    id: "large",
    label: "Stort",
    description: "E-handel / CRM / Appar",
    baseWeeks: 5,
    baseComplexity: 40
  }
];

const calculatorServices = [
  {
    id: "frontend",
    label: "Gränssnitt / Frontend (Next.js & CSS)",
    complexityLabel: "Medel",
    complexityPoints: 10,
    weeks: 0.75,
    stack: ["Next.js", "React", "Tailwind CSS"]
  },
  {
    id: "backend",
    label: "Serverkod / Backend (API:er)",
    complexityLabel: "Medel",
    complexityPoints: 12,
    weeks: 1,
    stack: ["Node.js", "REST API"]
  },
  {
    id: "database",
    label: "Databas & lagring (SQL/NoSQL)",
    complexityLabel: "Enkel",
    complexityPoints: 8,
    weeks: 0.5,
    stack: ["PostgreSQL", "Prisma"]
  },
  {
    id: "security",
    label: "Cybersäkerhet & kryptering",
    complexityLabel: "Hög",
    complexityPoints: 18,
    weeks: 1.25,
    stack: ["Säker autentisering", "Kryptering"]
  },
  {
    id: "iot",
    label: "IoT-system & sensorer",
    complexityLabel: "Avancerad",
    complexityPoints: 24,
    weeks: 2,
    stack: ["ESP32", "MQTT", "IoT"]
  },
  {
    id: "ai",
    label: "AI & automatisering",
    complexityLabel: "Hög",
    complexityPoints: 20,
    weeks: 1.5,
    stack: ["AI API", "Automation"]
  },
  {
    id: "game",
    label: "Speldesign & grafik",
    complexityLabel: "Avancerad",
    complexityPoints: 25,
    weeks: 2.5,
    stack: ["Unity", "Godot"]
  }
];

export default function KalkylatorPage() {
  const router = useRouter();

  const [projectSize, setProjectSize] = useState("small");

  const [selectedServices, setSelectedServices] = useState({
    frontend: true,
    backend: false,
    database: false,
    security: false,
    iot: false,
    ai: false,
    game: false
  });

  const toggleCalculatorService = (serviceId) => {
    setSelectedServices((current) => ({
      ...current,
      [serviceId]: !current[serviceId]
    }));
  };

  const estimate = useMemo(() => {
    const selectedSize =
      projectSizes.find((size) => size.id === projectSize) || projectSizes[0];

    const activeServices = calculatorServices.filter(
      (service) => selectedServices[service.id]
    );

    const additionalWeeks = activeServices.reduce(
      (total, service) => total + service.weeks,
      0
    );

    const additionalComplexity = activeServices.reduce(
      (total, service) => total + service.complexityPoints,
      0
    );

    const stack = [
      ...new Set(activeServices.flatMap((service) => service.stack))
    ];

    return {
      weeks: Math.max(
        0.5,
        selectedSize.baseWeeks + additionalWeeks
      ).toFixed(1),
      complexity: Math.min(
        100,
        selectedSize.baseComplexity + additionalComplexity
      ),
      stack: stack.length > 0 ? stack : ["Teknik väljs efter konsultation"]
    };
  }, [projectSize, selectedServices]);

  const openContactPage = () => {
    const selectedSize =
      projectSizes.find((size) => size.id === projectSize)?.label || projectSize;

    const selectedLabels = calculatorServices
      .filter((service) => selectedServices[service.id])
      .map((service) => service.label);

    const message = [
      "Hej! Jag har skapat en projektprofil via projektkalkylatorn.",
      "",
      `Projektstorlek: ${selectedSize}`,
      `Valda tekniska delar: ${
        selectedLabels.length > 0
          ? selectedLabels.join(", ")
          : "Inga tekniska delar valda ännu"
      }`,
      `Uppskattad tidsåtgång: ${estimate.weeks} veckor`,
      `Uppskattad komplexitet: ${estimate.complexity}%`,
      "",
      "Jag vill gärna diskutera projektet vidare."
    ].join("\n");

    router.push(`/kontakt?message=${encodeURIComponent(message)}`);
  };

  return (
    <main className="min-h-screen bg-brand-bg text-white">
      <Header />

      <section
        id="calculator"
        data-chat-section="calculator"
        className="border-b border-brand-border py-20"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-brand-primary">
              Planera din lösning
            </p>

            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Projektkalkylator & Scope-byggare
            </h1>

            <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-brand-primary" />

            <p className="mx-auto mt-6 max-w-2xl leading-8 text-brand-muted">
              Välj projektstorlek och tekniska komponenter så skapar vi en
              preliminär uppskattning av tidsåtgång, teknikstack och
              komplexitet.
            </p>
          </div>

          <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2">
            {/* Vänster: val */}
            <div className="glass-effect flex flex-col gap-8 rounded-3xl p-6 sm:p-8">
              <div>
                <h2 className="mb-4 text-lg font-bold text-white">
                  1. Ungefärlig projektstorlek
                </h2>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {projectSizes.map((size) => (
                    <button
                      key={size.id}
                      type="button"
                      onClick={() => setProjectSize(size.id)}
                      className={`flex flex-col gap-1 rounded-2xl border p-3 text-center transition-all duration-300 ${
                        projectSize === size.id
                          ? "border-brand-primary bg-brand-primary/10 text-white"
                          : "border-brand-border bg-transparent text-brand-muted hover:text-white"
                      }`}
                    >
                      <span className="text-sm font-extrabold">
                        {size.label}
                      </span>

                      <span className="font-mono text-[9px] opacity-80">
                        {size.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="mb-4 text-lg font-bold text-white">
                  2. Vilka tekniska delar krävs?
                </h2>

                <div className="space-y-2.5">
                  {calculatorServices.map((service) => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => toggleCalculatorService(service.id)}
                      className="flex w-full items-center justify-between rounded-2xl border border-brand-border bg-black/25 p-3.5 text-left transition-all duration-300 hover:border-brand-primary"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded border transition-all duration-300 ${
                            selectedServices[service.id]
                              ? "border-brand-primary bg-brand-primary text-brand-bg"
                              : "border-brand-border"
                          }`}
                        >
                          {selectedServices[service.id] && (
                            <CheckIcon className="h-3.5 w-3.5" />
                          )}
                        </div>

                        <span className="text-sm font-semibold text-white sm:text-base">
                          {service.label}
                        </span>
                      </div>

                      <span className="ml-3 rounded border border-white/5 bg-white/5 px-2 py-0.5 font-mono text-[10px] text-brand-muted">
                        {service.complexityLabel}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Höger: resultat */}
            <div className="glass-effect flex min-h-[460px] flex-col justify-between rounded-3xl border-2 border-brand-primary/20 bg-brand-primary/5 p-6 sm:p-8">
              <div>
                <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-white">
                  <SparklesIcon className="h-5 w-5 animate-pulse text-brand-primary" />
                  Din projektprofil
                </h2>

                <div className="mb-6">
                  <span className="mb-1 block font-mono text-xs font-bold uppercase tracking-wider text-brand-muted">
                    Uppskattad tidsåtgång
                  </span>

                  <span className="text-3xl font-extrabold text-white sm:text-4xl">
                    {estimate.weeks}{" "}
                    {estimate.weeks === "1.0" ||
                    estimate.weeks === "0.5"
                      ? "vecka"
                      : "veckor"}
                    *
                  </span>
                </div>

                <div className="mb-8">
                  <div className="mb-2 flex items-center justify-between font-mono text-xs font-bold text-brand-muted">
                    <span>Arkitekturkomplexitet</span>
                    <span>{estimate.complexity}%</span>
                  </div>

                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-brand-primary shadow-lg shadow-brand-glow transition-all duration-500"
                      style={{ width: `${estimate.complexity}%` }}
                    />
                  </div>

                  <span className="mt-1.5 block font-mono text-[10px] font-light text-brand-muted">
                    {estimate.complexity < 30
                      ? "ENKEL: Snabbt genomförande och begränsad teknisk risk."
                      : estimate.complexity < 60
                        ? "MEDEL: Standardiserad databas, gränssnitt och logik."
                        : estimate.complexity < 85
                          ? "AVANCERAD: Flera integrationer och API-lager."
                          : "MYCKET KOMPLEX: Hårdvara, AI eller avancerad säkerhet involverad."}
                  </span>
                </div>

                <div className="mb-8">
                  <span className="mb-2 block font-mono text-xs font-bold uppercase tracking-wider text-brand-muted">
                    Rekommenderad teknikstack
                  </span>

                  <div className="flex flex-wrap gap-1.5">
                    {estimate.stack.map((item) => (
                      <span
                        key={item}
                        className="rounded-xl border border-brand-border bg-brand-primary/10 px-3 py-1 font-mono text-xs font-bold text-brand-primary"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <p className="mb-4 text-[10px] font-light leading-relaxed text-brand-muted">
                  *Uppskattningen är preliminär. Exakt pris, omfattning och
                  leveranstid bestäms efter en kostnadsfri konsultation.
                </p>

                <button
                  type="button"
                  onClick={openContactPage}
                  className="block w-full rounded-xl bg-brand-primary px-6 py-4 text-center font-bold text-brand-bg shadow-md transition-all duration-300 hover:scale-[1.02] hover:bg-brand-primary-hover active:scale-[0.98]"
                >
                  Skicka projektprofil 📩
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}