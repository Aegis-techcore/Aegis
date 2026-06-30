"use client";

import { useState } from 'react';
import LogoLink from './components/LogoLink';
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
} from './components/Icons';

// Core Business Data
const brand = {
  name: "Aegis",
  slogan: "Secure by Design. Built for Tomorrow.",
  description: "Vi utvecklar säkra, intelligenta och framtidssäkra tekniska lösningar inom cybersäkerhet, inbyggda system, robust mjukvaruutveckling och digital innovation.",
  icon: ShieldIcon
};

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
      action: "Vi läser och analyserar källkoden, identifierar minnesläckan/pekarfelet, åtgärdar logiken och levererar stabil kod tillsammans med en tydlig förklaring.",
      result: "Programmet fungerar nu stabilt, snabbt och kraschfritt under belastning."
    }
  },
  {
    id: "fullstack",
    title: "Fullstack-utveckling",
    icon: LayoutIcon,
    items: [
      "Professionella företagshemsidor & landningssidor",
      "E-handelslösningar och säkra betalningssystem",
      "Bokningssystem och interaktiva kalendrar",
      "Kundportaler och medlemssystem",
      "Adminpaneler och avancerade dashboards",
      "Mobilappar för iOS och Android"
    ],
    scenario: {
      title: "Bokningar via telefon",
      problem: "En frisörsalong hanterar alla sina bokningar manuellt via telefon, vilket tar mycket tid och missar kvällskunder.",
      action: "Vi utvecklar en modern webbplats med ett integrerat kalenderbaserat bokningssystem som skickar automatiska SMS/e-postbekräftelser.",
      result: "Kunder kan nu boka dygnet runt. Salongen sparar över 10 timmar administrativt arbete varje vecka."
    }
  },
  {
    id: "data",
    title: "Data & Excel",
    icon: TableIcon,
    items: [
      "Sammanställning av hundratals spridda Excel-filer",
      "Automatisk rapportgenerering (PDF/Excel)",
      "Dataanalys, statistik och interaktiv visualisering",
      "Säker datamigrering och databasdesign",
      "Effektivisering och makro-ersättning med Python"
    ],
    scenario: {
      title: "500 utspridda Excel-filer",
      problem: "En ekonom lägger flera dagar varje månad på att manuellt sammanställa 500 Excel-rapporter från olika kontor.",
      action: "Vi utvecklar ett automatiserat Python-skript som läser in filerna, tvättar datan och sparar allt i en central sökbar databas.",
      result: "Arbetet som tidigare tog dagar är nu helt automatiserat och slutförs på under en minut."
    }
  },
  {
    id: "cybersecurity",
    title: "Cybersäkerhet",
    icon: ShieldIcon,
    items: [
      "Säkerhetsgranskningar (Audit) av kod och system",
      "Skydd av känslig kunddata och GDPR-efterlevnad",
      "Säker serverkonfiguration och härdning (hardening)",
      "Sårbarhetsanalys och penetrationstestning",
      "Incidenthantering och säkra autentiseringslösningar"
    ],
    scenario: {
      title: "Säkerhetstest av webbshop",
      problem: "En snabbväxande webbshop vet inte om deras kunddata eller betalningsflöden har allvarliga säkerhetsluckor.",
      action: "Vi utför penetrationstester, identifierar kritiska sårbarheter (t.ex. SQL-injektioner) och hjälper till att täppa till hålen.",
      result: "Förhöjd säkerhet, minskad risk för dataintrång samt ökat förtroende hos butikens kunder."
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
      "Serverhantering (Linux/Windows) och molndrift",
      "Optimering av trådlösa nätverk (WiFi)"
    ],
    scenario: {
      title: "Instabilt distanskontor",
      problem: "Ett kontor lider av ständiga nätverksavbrott och säkerhetsrisker vid distansanslutning till servern.",
      action: "Vi konfigurerar en robust brandvägg, sätter upp säkra VPN-tunnlar för personalen och optimerar IP-adresseringen.",
      result: "Stabil och blixtsnabb anslutning för alla medarbetare med kryptering i företagsklass."
    }
  },
  {
    id: "embedded",
    title: "Embedded Systems & IoT",
    icon: CpuIcon,
    items: [
      "Mikrokontrollerprogrammering (ESP32, Arduino, STM32)",
      "Sensorintegrationer och datainsamling i realtid",
      "Smarta, uppkopplade produkter (IoT)",
      "Kommunikationsprotokoll (MQTT, BLE, I2C, Wi-Fi)",
      "Hårdvarunära mjukvaruutveckling och industriell automation"
    ],
    scenario: {
      title: "Överhettade fabriksmaskiner",
      problem: "En fabrik upplever plötsliga maskinstopp för att deras äldre maskiner blir för varma utan förvarning.",
      action: "Vi installerar mjukvaran för temperatursensorer kopplade till ESP32-mikrokontrollers som skickar data i realtid till en dashboard.",
      result: "Automatiskt larm skickas direkt till teknikers telefoner innan överhettning sker. Noll oplanerade driftstopp."
    }
  },
  {
    id: "ai",
    title: "AI & Automation",
    icon: SparklesIcon,
    items: [
      "Skräddarsydda AI-chatbots integrerade på hemsidan",
      "Intelligent dokumentanalys och textsammanfattning",
      "Automatiska arbetsflöden (Zaps/Custom scripts)",
      "AI-assistenter för support och intern kunskap",
      "Automatisering av e-post och kundtjänstsvar"
    ],
    scenario: {
      title: "Överbelastad kundsupport",
      problem: "Ett företag får hundratals repetitiva frågor varje dag vilket gör att handläggningstiderna drar iväg.",
      action: "Vi utvecklar och integrerar en smart AI-chatbot tränad på företagets egen dokumentation och FAQ.",
      result: "Chatboten besvarar 70% av inkommande ärenden direkt. Kundnöjdheten ökar och supportens belastning minskar."
    }
  },
  {
    id: "games",
    title: "Spelutveckling",
    icon: GamepadIcon,
    items: [
      "Mobilspel för iOS och Android (Unity / Godot)",
      "Multiplayer-arkitektur och spelservrar",
      "Speldesign, mekanik och prototyputveckling",
      "Integration av online-funktionalitet och sparfiler",
      "Publicering på Google Play Store och App Store"
    ],
    scenario: {
      title: "Från idé till mobilspel",
      problem: "En kreatör har en fantastisk spelidé men saknar teknisk kompetens att koda och bygga spelet.",
      action: "Vi designar spelets mekanik, programmerar funktionaliteten, bygger gränssnittet och publicerar det i butikerna.",
      result: "Spelet lanseras globalt på App Store och Google Play med fungerande multiplayer och spara-i-molnet-stöd."
    }
  }
];

export default function Page() {
  const [activeTab, setActiveTab] = useState('programming');

  // Calculator State
  const [selectedServices, setSelectedServices] = useState({
    frontend: false,
    backend: false,
    database: false,
    security: false,
    iot: false,
    ai: false,
    game: false
  });
  const [projectSize, setProjectSize] = useState('medium');

  // Contact Form State
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    service: 'fullstack',
    message: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const toggleCalculatorService = (service) => {
    setSelectedServices(prev => ({ ...prev, [service]: !prev[service] }));
  };

  // Calculator logic
  const calculateEstimate = () => {
    let baseWeeks = 1;
    let complexity = 10;
    let stack = [];

    // Base variables depending on size
    if (projectSize === 'small') {
      baseWeeks = 0.5;
      complexity = 15;
    } else if (projectSize === 'medium') {
      baseWeeks = 2;
      complexity = 40;
    } else if (projectSize === 'large') {
      baseWeeks = 5;
      complexity = 75;
    }

    // Accumulate weeks and complexity based on checks
    if (selectedServices.frontend) {
      baseWeeks += 0.5;
      complexity += 10;
      stack.push("Next.js", "Tailwind CSS v4");
    }
    if (selectedServices.backend) {
      baseWeeks += 1;
      complexity += 15;
      stack.push("Node.js", "Python / FastAPI");
    }
    if (selectedServices.database) {
      baseWeeks += 0.5;
      complexity += 10;
      stack.push("PostgreSQL / SQLite");
    }
    if (selectedServices.security) {
      baseWeeks += 1;
      complexity += 15;
      stack.push("Säkerhetsgranskning", "HTTPS / SSL");
    }
    if (selectedServices.iot) {
      baseWeeks += 2;
      complexity += 25;
      stack.push("ESP32 (C++)", "MQTT Protocol");
    }
    if (selectedServices.ai) {
      baseWeeks += 1;
      complexity += 20;
      stack.push("OpenAI API", "Vektordatabaser");
    }
    if (selectedServices.game) {
      baseWeeks += 2;
      complexity += 25;
      stack.push("Unity / C#", "Godot / GDScript");
    }

    if (stack.length === 0) {
      stack.push("Diskuteras vid konsultation");
    }

    // Limit complexity to 100%
    complexity = Math.min(complexity, 100);

    return {
      weeks: baseWeeks.toFixed(1),
      complexity,
      stack: [...new Set(stack)]
    };
  };

  const estimate = calculateEstimate();

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      const responseData = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(responseData?.message || 'Kunde inte skicka formuläret');
      }

      setFormSubmitted(true);
    } catch (error) {
      setFormError(error.message || 'Något gick fel när formuläret skulle skickas. Försök igen om en stund.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setFormData({
      name: '',
      company: '',
      email: '',
      phone: '',
      service: 'fullstack',
      message: ''
    });
    setFormError('');
    setFormSubmitted(false);
  };

  const activeBrand = brand;
  const ActiveBrandIcon = activeBrand.icon;

  return (
    <div className="min-h-screen flex flex-col font-display text-white selection:bg-brand-primary selection:text-brand-bg transition-colors duration-500">
      
      {/* Brand Switcher / Top Panel */}
      <div className="w-full bg-brand-bg/80 backdrop-blur-md border-b border-brand-border sticky top-0 z-50 transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <LogoLink showSlogan />
        </div>
      </div>

      {/* Hero Section */}
      <section id="top" className="relative pt-12 pb-24 overflow-hidden border-b border-brand-border">
        {/* Dynamic decorative vectors */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-40 mix-blend-screen" style={{ backgroundImage: 'var(--hero-pattern)' }}></div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-primary/10 border border-brand-border text-brand-primary mb-8 text-sm font-semibold tracking-wide">
            <ActiveBrandIcon className="w-4 h-4" />
            <span>KVALITET • SÄKERHET • INNOVATION</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight text-white">
            {activeBrand.slogan}
          </h1>
          
          <p className="mt-8 text-lg sm:text-xl text-brand-muted max-w-3xl mx-auto leading-relaxed font-light">
            {activeBrand.description}
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a 
              href="#calculator" 
              className="px-8 py-4 rounded-xl font-bold bg-brand-primary text-brand-bg hover:bg-brand-primary-hover shadow-lg shadow-brand-glow transition-all duration-300 hover:scale-[1.03] active:scale-95"
            >
              Beräkna ditt projekt
            </a>
            <a 
              href="#contact" 
              className="px-8 py-4 rounded-xl font-bold glass-effect border border-brand-border text-white hover:bg-white/5 transition-all duration-300"
            >
              Boka gratis konsultation
            </a>
          </div>
        </div>
      </section>


      {/* Services Explorer Section */}
      <section className="py-20 border-b border-brand-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Våra Tjänsteområden
            </h2>
            <div className="w-16 h-1 bg-brand-primary mx-auto mt-4 rounded-full"></div>
            <p className="mt-6 text-brand-muted max-w-2xl mx-auto">
              Vi erbjuder expertis över hela det moderna teknikspektrat. Välj ett område nedan för att utforska detaljer.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Tabs List */}
            <div className="lg:col-span-5 flex flex-col gap-2">
              {services.map((s) => {
                const TabIcon = s.icon;
                const isActive = activeTab === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setActiveTab(s.id)}
                    className={`w-full text-left p-4 rounded-2xl flex items-center justify-between transition-all duration-300 border ${
                      isActive 
                        ? 'bg-brand-primary/10 border-brand-primary/40 text-white shadow-md' 
                        : 'bg-transparent border-transparent hover:bg-white/5 text-brand-muted hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`p-2 rounded-xl transition-all duration-300 ${
                        isActive ? 'bg-brand-primary text-brand-bg scale-105' : 'bg-white/5 text-brand-muted'
                      }`}>
                        <TabIcon className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-sm sm:text-base">{s.title}</span>
                    </div>
                    <ChevronIcon direction={isActive ? "right" : "down"} className="w-4 h-4 opacity-50" />
                  </button>
                );
              })}
            </div>

            {/* Tab Panel Content */}
            <div className="lg:col-span-7">
              {services.map((s) => {
                if (s.id !== activeTab) return null;
                const TabIcon = s.icon;
                return (
                  <div key={s.id} className="glass-effect rounded-3xl p-6 sm:p-8 animate-fade-in flex flex-col h-full justify-between">
                    <div>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-brand-primary/10 border border-brand-border flex items-center justify-center text-brand-primary">
                          <TabIcon className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-bold text-white">{s.title}</h3>
                      </div>

                      <ul className="space-y-3.5 mb-8">
                        {s.items.map((item, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <span className="w-5 h-5 rounded-full bg-brand-primary/10 border border-brand-border flex items-center justify-center text-brand-primary shrink-0 mt-0.5">
                              <CheckIcon className="w-3 h-3" />
                            </span>
                            <span className="text-brand-muted text-sm sm:text-base leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Quick Scenario Inside Service Card */}
                    <div className="bg-black/35 rounded-2xl p-5 border border-brand-border mt-auto">
                      <div className="flex items-center gap-2 text-xs font-bold text-brand-primary font-mono tracking-widest uppercase mb-3">
                        <SparklesIcon className="w-4 h-4 animate-spin-slow" />
                        <span>VERKLIGT SCENARIO</span>
                      </div>
                      <h4 className="font-bold text-white text-base mb-1">{s.scenario.title}</h4>
                      <p className="text-xs text-brand-muted leading-relaxed font-light mb-2">
                        <strong className="text-white/80 font-semibold font-mono">Problem:</strong> {s.scenario.problem}
                      </p>
                      <p className="text-xs text-brand-muted leading-relaxed font-light">
                        <strong className="text-white/80 font-semibold font-mono">Lösning:</strong> {s.scenario.action}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>


      {/* Project Complexity & Cost Calculator */}
      <section id="calculator" className="py-20 border-b border-brand-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Projektkalkylator & Scope-byggare
            </h2>
            <div className="w-16 h-1 bg-brand-primary mx-auto mt-4 rounded-full"></div>
            <p className="mt-6 text-brand-muted max-w-2xl mx-auto">
              Välj de komponenter du tror behövs så bygger vi en dynamisk uppskattning av tidsåtgång, stack och komplexitet.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left panel: Config choices */}
            <div className="glass-effect rounded-3xl p-6 sm:p-8 flex flex-col gap-8">
              {/* Project Size selection */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4">1. Ungefärlig projektstorlek</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'small', label: 'Litet', desc: 'Excel / Script / Enkel sida' },
                    { id: 'medium', label: 'Medel', desc: 'Bokning / Databas / IoT' },
                    { id: 'large', label: 'Stort', desc: 'E-handel / CRM / Appar' }
                  ].map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setProjectSize(size.id)}
                      className={`p-3 rounded-2xl border text-center transition-all duration-300 flex flex-col gap-1 ${
                        projectSize === size.id 
                          ? 'bg-brand-primary/10 border-brand-primary text-white' 
                          : 'bg-transparent border-brand-border text-brand-muted hover:text-white'
                      }`}
                    >
                      <span className="font-extrabold text-sm">{size.label}</span>
                      <span className="text-[9px] font-mono opacity-80">{size.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Service Features checklist */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4">2. Vilka tekniska delar krävs?</h3>
                <div className="space-y-2.5">
                  {[
                    { id: 'frontend', label: 'Gränssnitt / Frontend (Next.js & CSS)', complexity: 'Medel' },
                    { id: 'backend', label: 'Server-kod / Backend (APIs)', complexity: 'Medel' },
                    { id: 'database', label: 'Databas & Lagring (SQL/NoSQL)', complexity: 'Enkel' },
                    { id: 'security', label: 'Cybersäkerhet & Kryptering (Härdning)', complexity: 'Hög' },
                    { id: 'iot', label: 'IoT-system & Sensorer (Inbyggda system)', complexity: 'Avancerad' },
                    { id: 'ai', label: 'AI & Automatisering (Chatbots/Workflows)', complexity: 'Hög' },
                    { id: 'game', label: 'Speldesign & Grafik (Mobilspel/Online)', complexity: 'Avancerad' }
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => toggleCalculatorService(s.id)}
                      className="w-full p-3.5 rounded-2xl bg-black/25 border border-brand-border hover:border-brand-border-hover transition-all duration-300 flex items-center justify-between text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all duration-300 ${
                          selectedServices[s.id] 
                            ? 'bg-brand-primary border-brand-primary text-brand-bg' 
                            : 'border-brand-border'
                        }`}>
                          {selectedServices[s.id] && <CheckIcon className="w-3.5 h-3.5" />}
                        </div>
                        <span className="font-semibold text-sm sm:text-base text-white">{s.label}</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/5 text-brand-muted">
                        {s.complexity}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right panel: Results Output */}
            <div className="glass-effect rounded-3xl p-6 sm:p-8 flex flex-col justify-between border-2 border-brand-primary/20 bg-brand-primary/5 min-h-[460px]">
              <div>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5 text-brand-primary animate-pulse" />
                  <span>Din Projektprofil</span>
                </h3>

                {/* Estimate: Timeframe */}
                <div className="mb-6">
                  <span className="block text-xs font-bold text-brand-muted font-mono tracking-wider uppercase mb-1">
                    UPPSKATTAD TIDSÅTGÅNG
                  </span>
                  <span className="text-3xl sm:text-4xl font-extrabold text-white">
                    {estimate.weeks} {estimate.weeks === "1.0" || estimate.weeks === "0.5" ? 'vecka' : 'veckor'}*
                  </span>
                </div>

                {/* Estimate: Complexity Meter */}
                <div className="mb-8">
                  <div className="flex justify-between items-center text-xs font-bold text-brand-muted font-mono mb-2">
                    <span>ARKITEKTURKOMPLEXITET</span>
                    <span>{estimate.complexity}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
                    <div 
                      className="h-full bg-brand-primary shadow-lg shadow-brand-glow transition-all duration-500 rounded-full" 
                      style={{ width: `${estimate.complexity}%` }}
                    />
                  </div>
                  <span className="block text-[10px] text-brand-muted font-light mt-1.5 font-mono">
                    {estimate.complexity < 30 ? 'ENKEL: Snabbt genomförande, minimal risk.' :
                     estimate.complexity < 60 ? 'MEDEL: Standardiserad databas och logik.' :
                     estimate.complexity < 85 ? 'AVANCERAD: Flera integrationer och API-lager.' :
                     'MYCKET KOMPLEX: Hårdvara/AI/Kryptering involverad.'}
                  </span>
                </div>

                {/* Estimate: Recommended Stack */}
                <div className="mb-8">
                  <span className="block text-xs font-bold text-brand-muted font-mono tracking-wider uppercase mb-2">
                    REKOMMENDERAD TEKNIKSTACK
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {estimate.stack.map((item, index) => (
                      <span key={index} className="px-3 py-1 rounded-xl bg-brand-primary/10 border border-brand-border text-brand-primary text-xs font-bold font-mono">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div>
                <p className="text-[10px] text-brand-muted font-light leading-relaxed mb-4">
                  *Detta är en grov uppskattning baserad på typiska tidigare lösningar. Vi ger dig en exakt tidplan efter vår konsultation.
                </p>
                <a 
                  href="#contact"
                  onClick={() => {
                    const checkedLabels = Object.keys(selectedServices)
                      .filter(k => selectedServices[k])
                      .map(k => k.charAt(0).toUpperCase() + k.slice(1));
                    
                    const msg = `Hej! Jag har byggt en projektprofil via kalkylatorn. Jag är intresserad av ett ${projectSize}-projekt som innefattar: ${checkedLabels.join(', ') || 'inget valt än'}. Uppskattad tid var ${estimate.weeks} veckor. Låt oss diskutera!`;
                    setFormData(prev => ({
                      ...prev,
                      message: msg
                    }));
                  }}
                  className="w-full block text-center px-6 py-4 rounded-xl font-bold bg-brand-primary text-brand-bg hover:bg-brand-primary-hover shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                >
                  Förfyll kontaktformulär 📩
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact / Inquiry Form */}
      <section id="contact" className="relative overflow-hidden border-t border-brand-border bg-[radial-gradient(circle_at_12%_88%,rgba(6,182,212,0.20),transparent_34%),linear-gradient(135deg,#020617_0%,#07111f_52%,#020617_100%)] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="absolute inset-x-0 bottom-0 h-44 bg-brand-primary/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_500px]">
          <div className="max-w-2xl">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-brand-border bg-brand-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-brand-primary">
              <ActiveBrandIcon className="h-4 w-4" />
              Aegis konsultation
            </div>
            <h2 className="max-w-xl text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Boka ett kostnadsfritt säkerhets- och tillväxtsamtal
            </h2>
            <p className="mt-8 max-w-xl text-base font-medium leading-8 text-brand-muted sm:text-lg">
              Få en tydlig bild av var ert projekt står idag, vilka tekniska risker som bromsar er och vilka tre steg som skulle skapa störst effekt på kort sikt.
            </p>
            <div className="mt-10 flex flex-col items-start gap-3 text-sm font-bold text-white">
              <a href="mailto:aegis.infon@gmail.com" className="inline-flex items-center gap-2 rounded-full border border-brand-border bg-white/5 px-4 py-2 transition hover:border-brand-primary hover:text-brand-primary">
                <span className="text-brand-primary">@</span>
                Aegis.infon@gmail.com
              </a>
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-border bg-white/5 px-4 py-2">
                <span className="text-brand-primary">24h</span>
                Svar inom ett dygn
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-border bg-white/5 px-4 py-2">
                <span className="text-brand-primary">SMS</span>
                Bekräftelse till mobilen
              </span>
            </div>
          </div>

          <div className="rounded-3xl border border-brand-border bg-slate-950/85 p-5 shadow-2xl shadow-brand-glow/20 backdrop-blur-xl sm:p-6">
            {formSubmitted ? (
              <div className="flex min-h-[520px] flex-col items-center justify-center text-center animate-fade-in">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                  <CheckIcon className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-extrabold text-white">Tack för din förfrågan!</h3>
                <p className="mt-3 max-w-sm text-sm leading-6 text-brand-muted">
                  Vi har mottagit ditt meddelande och återkommer snart.
                </p>
                <button
                  onClick={handleResetForm}
                  className="mt-8 rounded-xl border border-brand-border px-6 py-2.5 text-xs font-bold text-white transition hover:border-brand-primary hover:bg-brand-primary/10"
                >
                  Skicka en ny förfrågan
                </button>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-5">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-white">Namn</label>
                  <input
                    type="text"
                    required
                    placeholder="Ange ditt fullständiga namn"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl border border-brand-border bg-white px-4 py-4 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-white">Företag</label>
                  <input
                    type="text"
                    placeholder="Företagsnamn AB"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full rounded-xl border border-brand-border bg-white px-4 py-4 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30"
                  />
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-white">E-post</label>
                    <input
                      type="email"
                      required
                      placeholder="namn@foretag.se"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-xl border border-brand-border bg-white px-4 py-4 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-white">Telefon</label>
                    <input
                      type="tel"
                      required
                      inputMode="tel"
                      placeholder="070 000 00 00"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full rounded-xl border border-brand-border bg-white px-4 py-4 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-white">Huvudområde</label>
                  <select
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    className="w-full rounded-xl border border-brand-border bg-white px-4 py-4 font-semibold text-slate-950 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30"
                  >
                    <option value="programming">Programmering & Utveckling</option>
                    <option value="fullstack">Fullstack-utveckling</option>
                    <option value="data">Data & Excel-automation</option>
                    <option value="cybersecurity">Cybersäkerhet</option>
                    <option value="network">Nätverk & Brandvägg</option>
                    <option value="embedded">Embedded Systems / IoT</option>
                    <option value="ai">AI-chatbot / Automation</option>
                    <option value="games">Spelutveckling</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-white">Vad behöver ni hjälp med?</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Beskriv kort ert nuläge, vad som inte fungerar idag och vad ni vill uppnå"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full resize-y rounded-xl border border-brand-border bg-white px-4 py-4 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-brand-primary px-6 py-4 font-black text-brand-bg shadow-lg shadow-brand-glow transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? 'Skickar...' : 'Skicka'}
                </button>
                {formError && (
                  <p className="text-center text-sm font-medium text-rose-300">
                    {formError}
                  </p>
                )}
              </form>
            )}
          </div>
        </div>

        <footer className="relative mx-auto mt-20 flex max-w-6xl flex-col items-center justify-between gap-6 border-t border-brand-border pt-8 text-brand-muted md:flex-row">
          <LogoLink variant="footer" />
     
          <div className="text-center text-xs md:text-right">
            <p>© 2026 Aegis – Secure by Design. Built for Tomorrow. All rights reserved.</p>
          </div>
        </footer>
      </section>

    </div>
  );
}
