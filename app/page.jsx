"use client";
import Header from "./components/Header";
import { useState } from 'react';
import ChatbotWidget from './components/ChatbotWidget';
import LogoLink from './components/LogoLink';
import {
  ShieldIcon,
  BrainIcon,
  BoltIcon,
  DevicePhoneIcon,
  ChatBubbleIcon,
  RocketIcon,
  CheckIcon
} from './components/Icons';

// Core Business Data
const brand = {
  name: "Aegis",
  slogan: "Secure by Design. Built for Tomorrow.",
  description: "Vi utvecklar säkra, intelligenta och framtidssäkra tekniska lösningar inom cybersäkerhet, inbyggda system, robust mjukvaruutveckling och digital innovation.",
  icon: ShieldIcon
};

export default function Page() {
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

    <Header />
    
      {/* Hero Section */}
      <section
        id="top"
        data-chat-section="top"
        className="relative pt-12 pb-24 overflow-hidden border-b border-brand-border"
      >
        {/* Dynamic decorative vectors */}
        <div
          className="absolute inset-0 z-0 pointer-events-none opacity-40 mix-blend-screen"
          style={{ backgroundImage: "var(--hero-pattern)" }}
        ></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 animate-slide-up">

          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] items-center gap-6">

            {/* TEXT */}
            <div className="text-center lg:text-left">

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-primary/10 border border-brand-border text-brand-primary mb-8 text-sm font-semibold tracking-wide">
                <ActiveBrandIcon className="w-4 h-4" />
                <span>KVALITET • SÄKERHET • INNOVATION</span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight text-white">
                {activeBrand.slogan}
              </h1>

              <p className="mt-8 text-lg sm:text-xl text-brand-muted max-w-2xl leading-relaxed font-light">
                {activeBrand.description}
              </p>

              <div className="mt-10 flex flex-wrap justify-center lg:justify-start gap-4">
                <a
                  href="/kalkylator"
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

                <a
                  href="/abonnemang"
                  className="px-8 py-4 rounded-xl font-bold border border-brand-border text-brand-primary hover:border-brand-primary hover:bg-brand-primary/10 transition-all duration-300"
                >
                  Se abonnemang
                </a>
              </div>

            </div>

            {/* LOGO */}
            <div className="relative flex justify-center lg:justify-end">

              <div className="absolute -inset-8 rounded-full bg-cyan-400/30 blur-[90px] animate-logo-glow"></div>

              <div className="relative overflow-hidden rounded-[30px] shadow-2xl shadow-brand-glow animate-logo-reveal">

                <img
                  src="/aegis-hero-logo.png"
                  alt="Aegis logo"
                  className="w-[340px] lg:w-[420px] rounded-[30px] object-cover scale-105"
                />

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* Why Choose Aegis */}
      <section id="why-aegis" className="py-20 border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Varför välja Aegis?
            </h2>

            <div className="w-16 h-1 bg-brand-primary mx-auto mt-4 rounded-full"></div>

            <p className="mt-6 text-brand-muted leading-8">
              Vi kombinerar modern teknik, säker utveckling och personlig service
              för att skapa digitala lösningar som är byggda för att hålla över tid.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[
              {
                icon: '🛡️',
                title: 'Säker utveckling',
                text: 'Vi bygger med fokus på säkerhet, stabilitet och framtidssäkra lösningar från start.'
              },
              {
                icon: '⚡',
                title: 'Snabb leverans',
                text: 'Vi arbetar effektivt, håller tydlig kommunikation och uppdaterar dig under hela projektet.'
              },
              {
                icon: '📱',
                title: 'Mobilanpassat',
                text: 'Alla våra lösningar fungerar lika bra på mobil, surfplatta och dator.'
              },
              {
                icon: '🤖',
                title: 'AI & Automation',
                text: 'Vi kan integrera AI-chatbots, smarta arbetsflöden och automatiseringar som sparar tid.'
              },
              {
                icon: '💬',
                title: 'Personlig support',
                text: 'Du får direkt kontakt med utvecklarna och enkel kommunikation genom hela processen.'
              },
              {
                icon: '🚀',
                title: 'Skalbara lösningar',
                text: 'Vi bygger system och webbplatser som kan växa tillsammans med ditt företag.'
              }
            ].map((item, index) => {
              const ItemIcon = [
                ShieldIcon,
                BoltIcon,
                DevicePhoneIcon,
                BrainIcon,
                ChatBubbleIcon,
                RocketIcon
              ][index];

              return (
                <div
                  key={item.title}
                  className="group rounded-3xl border border-brand-border bg-slate-950/55 p-6 transition duration-300 hover:-translate-y-1 hover:border-brand-primary hover:bg-brand-primary/10 hover:shadow-xl hover:shadow-brand-glow/10"
                >
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-border bg-brand-primary/10 text-brand-primary ring-1 ring-white/5 transition duration-300 group-hover:scale-110 group-hover:border-brand-primary group-hover:bg-brand-primary group-hover:text-brand-bg group-hover:shadow-lg group-hover:shadow-brand-glow/25">
                    <ItemIcon className="h-7 w-7" />
                  </div>

                  <h3 className="text-xl font-black text-white">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-brand-muted">
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Project Process */}
      <section id="process" className="py-20 border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Så går ett projekt till
            </h2>

            <div className="w-16 h-1 bg-brand-primary mx-auto mt-4 rounded-full"></div>

            <p className="mt-6 text-brand-muted leading-8">
              Vi arbetar med en tydlig process där du alltid vet vad nästa steg är – från första kontakt till färdig leverans.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">

            {[
              {
                number: "01",
                title: "Skicka förfrågan",
                text: "Fyll i kontaktformuläret och berätta kort om ditt projekt. Att skicka en förfrågan är alltid kostnadsfritt och inte bindande."
              },
              {
                number: "02",
                title: "Konsultation",
                text: "Vi kontaktar dig för att gå igenom dina behov och rekommendera den bästa lösningen."
              },
              {
                number: "03",
                title: "Offert",
                text: "Du får en tydlig offert med pris, omfattning, leveranstid och vad som ingår."
              },
              {
                number: "04",
                title: "Startbetalning",
                text: "När offerten godkänts betalas 25 % av projektets totala pris innan utvecklingen påbörjas."
              },
              {
                number: "05",
                title: "Utveckling",
                text: "Vi utvecklar lösningen och håller dig uppdaterad under hela projektets gång."
              },
              {
                number: "06",
                title: "Testning",
                text: "Du får möjlighet att testa projektet och lämna synpunkter innan slutleverans."
              },
              {
                number: "07",
                title: "Leverans",
                text: "När allt är godkänt levereras projektet och resterande 75 % faktureras."
              },
              {
                number: "08",
                title: "Support",
                text: "Vi finns kvar även efter leverans och hjälper till med support, förbättringar och vidareutveckling."
              }
            ].map((step) => (

              <div
                key={step.number}
                className="group rounded-3xl border border-brand-border bg-slate-950/55 p-6 transition duration-300 hover:-translate-y-1 hover:border-brand-primary hover:bg-brand-primary/10 hover:shadow-xl hover:shadow-brand-glow/10"
              >

                <div className="text-4xl font-black text-brand-primary">
                  {step.number}
                </div>

                <h3 className="mt-4 text-xl font-black text-white">
                  {step.title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-brand-muted">
                  {step.text}
                </p>

              </div>

            ))}

          </div>

          <div className="mt-14 rounded-3xl border border-brand-primary/30 bg-brand-primary/10 p-8">

            <h3 className="text-2xl font-black text-white">
              Viktig information
            </h3>

            <div className="mt-6 space-y-4 text-brand-muted leading-8">

              <p>
                ✅ Att skicka en förfrågan är alltid kostnadsfritt och inte bindande.
              </p>

              <p>
                ✅ Alla projekt inleds med en kostnadsfri konsultation och en tydlig offert.
              </p>

              <p>
                ✅ För att påbörja utvecklingen betalas endast <span className="font-bold text-white">25 %</span> av projektets totala pris.
              </p>

              <p>
                ✅ Slutbetalning sker först när projektet är färdigutvecklat och godkänt av kunden.
              </p>

            </div>

          </div>

        </div>
      </section>

      {/* Contact / Inquiry Form */}
      <section id="contact" data-chat-section="contact" className="relative overflow-hidden border-t border-brand-border bg-[radial-gradient(circle_at_12%_88%,rgba(6,182,212,0.20),transparent_34%),linear-gradient(135deg,#020617_0%,#07111f_52%,#020617_100%)] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
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
                    placeholder="Företagsnamn AB / Privatkundensnamn"
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
                    <option value="maintenance">Webbunderhåll & IT-support</option>
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

        <footer className="relative mx-auto mt-20 max-w-6xl border-t border-brand-border pt-10 text-brand-muted">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-4">

            <div>
              <LogoLink variant="footer" />
              <p className="mt-4 max-w-xs text-sm leading-6">
                Secure by Design. Built for Tomorrow.
              </p>
            </div>

            <div>
              <h3 className="mb-4 text-xs font-black uppercase tracking-[0.22em] text-brand-primary">
                Följ oss
              </h3>
              <div className="flex flex-col gap-3 text-sm">
                <a href="https://instagram.com/" target="_blank" rel="noreferrer" className="transition hover:text-brand-primary">
                  Instagram
                </a>
                <a href="https://linkedin.com/" target="_blank" rel="noreferrer" className="transition hover:text-brand-primary">
                  LinkedIn
                </a>
                <a href="https://facebook.com/" target="_blank" rel="noreferrer" className="transition hover:text-brand-primary">
                  Facebook
                </a>
                <a href="https://x.com/" target="_blank" rel="noreferrer" className="transition hover:text-brand-primary">
                  X
                </a>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-xs font-black uppercase tracking-[0.22em] text-brand-primary">
                Kontakt
              </h3>

              <div className="flex flex-col gap-3 text-sm">

                <a
                  href="mailto:aegis.infon@gmail.com"
                  className="transition hover:text-brand-primary"
                >
                  📧 aegis.infon@gmail.com
                </a>

                <a
                  href="tel:+46720202232"
                  className="transition hover:text-brand-primary"
                >
                  📞 +46 72 020 22 32
                </a>

                <div className="pt-2 border-t border-brand-border">
                  <p className="font-bold text-white">
                    Kundtjänst
                  </p>

                  <p>
                    Måndag – Fredag
                  </p>

                  <p className="text-brand-primary font-semibold">
                    09:00 – 18:00
                  </p>
                </div>

              </div>
            </div>

            <div>
              <h3 className="mb-4 text-xs font-black uppercase tracking-[0.22em] text-brand-primary">
                Juridiskt
              </h3>
              <div className="flex flex-col gap-3 text-sm">
                <a href="/privacy" className="transition hover:text-brand-primary">
                  Integritetspolicy
                </a>
                <a href="/cookies" className="transition hover:text-brand-primary">
                  Cookiepolicy
                </a>
                <a href="/terms" className="transition hover:text-brand-primary">
                  Allmänna villkor
                </a>
              </div>
            </div>

          </div>

          <div className="mt-10 border-t border-brand-border pt-6 text-center text-xs md:text-left">
            <p>
              © 2026 Aegis Core – Secure by Design. Built for Tomorrow. All rights reserved.
            </p>
          </div>
        </footer>
      </section>
      
      <ChatbotWidget />
    </div>
  );
}
