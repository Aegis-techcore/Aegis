"use client";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";
import Header from "../components/Header";
import {
  CheckIcon,
  ShieldIcon,
  SparklesIcon
} from "../components/Icons";

const initialFormData = {
  name: "",
  company: "",
  email: "",
  phone: "",
  service: "programming",
  message: ""
};

const serviceOptions = [
  {
    value: "programming",
    label: "Programmering & Utveckling"
  },
  {
    value: "fullstack",
    label: "Fullstack-utveckling"
  },
  {
    value: "data",
    label: "Data & Excel-automation"
  },
  {
    value: "cybersecurity",
    label: "Cybersäkerhet"
  },
  {
    value: "network",
    label: "Nätverk & Brandvägg"
  },
  {
    value: "embedded",
    label: "Embedded Systems / IoT"
  },
  {
    value: "ai",
    label: "AI-chatbot / Automation"
  },
  {
    value: "maintenance",
    label: "Webbunderhåll & IT-support"
  },
  {
    value: "games",
    label: "Spelutveckling"
  }
];

export default function KontaktPage() {
  const [formData, setFormData] = useState(initialFormData);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  /*
   * Hämtar det förifyllda meddelandet från projektkalkylatorn:
   * /kontakt?message=...
   */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const messageFromCalculator = params.get("message");

    if (messageFromCalculator) {
      setFormData((current) => ({
        ...current,
        message: messageFromCalculator
      }));
    }
  }, []);

  const updateFormField = (field, value) => {
    setFormData((current) => ({
      ...current,
      [field]: value
    }));
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    setIsSubmitting(true);
    setFormError("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Kunde inte skicka förfrågan. Försök igen om en stund."
        );
      }

      setFormSubmitted(true);
    } catch (error) {
      setFormError(
        error.message ||
          "Något gick fel när förfrågan skickades. Försök igen."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setFormData(initialFormData);
    setFormSubmitted(false);
    setFormError("");

    // Tar bort det gamla kalkylatormeddelandet från URL-adressen.
    window.history.replaceState({}, "", "/kontakt");
  };

  return (
    <main className="min-h-screen bg-brand-bg text-white">
      <Header />

      <section
        id="contact"
        data-chat-section="contact"
        className="relative min-h-[calc(100vh-80px)] overflow-hidden border-b border-brand-border bg-[radial-gradient(circle_at_12%_88%,rgba(6,182,212,0.20),transparent_34%),radial-gradient(circle_at_88%_12%,rgba(6,182,212,0.12),transparent_30%),linear-gradient(135deg,#020617_0%,#07111f_52%,#020617_100%)] px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
      >
        {/* Dekorativ glöd */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-brand-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-16 h-72 w-72 rounded-full bg-brand-primary/10 blur-[110px]" />

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-start gap-12 lg:grid-cols-[1fr_520px]">
          {/* Vänster sida */}
          <div className="max-w-2xl lg:sticky lg:top-32">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-brand-border bg-brand-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-brand-primary">
              <ShieldIcon className="h-4 w-4" />
              Kostnadsfri konsultation
            </div>

            <h1 className="max-w-2xl text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Berätta vad du behöver – vi hjälper dig hitta rätt lösning
            </h1>

            <p className="mt-8 max-w-xl text-base font-medium leading-8 text-brand-muted sm:text-lg">
              Skicka en kostnadsfri och icke-bindande förfrågan. Vi går igenom
              dina behov, tekniska utmaningar och mål och återkommer med ett
              förslag på nästa steg.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-brand-border bg-white/5 p-5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                  <span className="font-black">@</span>
                </div>

                <p className="text-xs font-black uppercase tracking-widest text-brand-muted">
                  E-post
                </p>

                <a
                  href="mailto:aegis.infon@gmail.com"
                  className="mt-2 block break-all text-sm font-bold text-white transition hover:text-brand-primary"
                >
                  aegis.infon@gmail.com
                </a>
              </div>

              <div className="rounded-2xl border border-brand-border bg-white/5 p-5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                  <span className="font-black">24h</span>
                </div>

                <p className="text-xs font-black uppercase tracking-widest text-brand-muted">
                  Svarstid
                </p>

                <p className="mt-2 text-sm font-bold text-white">
                  Vanligtvis inom ett dygn
                </p>
              </div>

              <div className="rounded-2xl border border-brand-border bg-white/5 p-5">
                <p className="text-xs font-black uppercase tracking-widest text-brand-muted">
                  Telefon
                </p>

                <a
                  href="tel:+46720202232"
                  className="mt-2 block text-sm font-bold text-white transition hover:text-brand-primary"
                >
                  +46 72 020 22 32
                </a>

                <p className="mt-2 text-xs leading-5 text-brand-muted">
                  Måndag–fredag, 09:00–18:00
                </p>
              </div>

              <div className="rounded-2xl border border-brand-border bg-white/5 p-5">
                <p className="text-xs font-black uppercase tracking-widest text-brand-muted">
                  Förfrågan
                </p>

                <p className="mt-2 text-sm font-bold text-white">
                  Kostnadsfri och inte bindande
                </p>

                <p className="mt-2 text-xs leading-5 text-brand-muted">
                  Inget arbete startar innan du har godkänt en tydlig offert.
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-brand-primary/30 bg-brand-primary/10 p-5">
              <div className="flex items-start gap-3">
                <SparklesIcon className="mt-0.5 h-5 w-5 shrink-0 text-brand-primary" />

                <div>
                  <p className="font-black text-white">
                    Har du använt projektkalkylatorn?
                  </p>

                  <p className="mt-2 text-sm leading-6 text-brand-muted">
                    Din projektprofil fylls automatiskt i i meddelandefältet
                    när du kommer hit från kalkylatorn.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Formulär */}
          <div className="rounded-3xl border border-brand-border bg-slate-950/85 p-5 shadow-2xl shadow-brand-glow/20 backdrop-blur-xl sm:p-7">
            {formSubmitted ? (
              <div className="flex min-h-[590px] flex-col items-center justify-center text-center animate-fade-in">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                  <CheckIcon className="h-10 w-10" />
                </div>

                <h2 className="text-3xl font-extrabold text-white">
                  Tack för din förfrågan!
                </h2>

                <p className="mt-4 max-w-sm text-sm leading-7 text-brand-muted">
                  Vi har mottagit ditt meddelande. En bekräftelse skickas till
                  din e-post och vi återkommer så snart vi har gått igenom
                  informationen.
                </p>

                <div className="mt-6 rounded-2xl border border-brand-border bg-white/5 px-5 py-4">
                  <p className="text-xs font-black uppercase tracking-widest text-brand-primary">
                    Nästa steg
                  </p>

                  <p className="mt-2 text-sm leading-6 text-brand-muted">
                    Vi bedömer projektets omfattning och kontaktar dig för en
                    kostnadsfri genomgång.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleResetForm}
                  className="mt-8 rounded-xl border border-brand-border px-6 py-3 text-sm font-bold text-white transition hover:border-brand-primary hover:bg-brand-primary/10 hover:text-brand-primary"
                >
                  Skicka en ny förfrågan
                </button>
              </div>
            ) : (
              <>
                <div className="mb-7">
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-brand-primary">
                    Starta ditt projekt
                  </p>

                  <h2 className="mt-3 text-2xl font-black text-white">
                    Skicka en förfrågan
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-brand-muted">
                    Fyll i informationen nedan så återkommer vi med nästa steg.
                  </p>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-5">
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="contact-name"
                      className="text-sm font-bold text-white"
                    >
                      Namn
                    </label>

                    <input
                      id="contact-name"
                      type="text"
                      required
                      autoComplete="name"
                      placeholder="Ange ditt fullständiga namn"
                      value={formData.name}
                      onChange={(event) =>
                        updateFormField("name", event.target.value)
                      }
                      className="w-full rounded-xl border border-brand-border bg-white px-4 py-4 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="contact-company"
                      className="text-sm font-bold text-white"
                    >
                      Företag{" "}
                      <span className="font-normal text-brand-muted">
                        (valfritt)
                      </span>
                    </label>

                    <input
                      id="contact-company"
                      type="text"
                      autoComplete="organization"
                      placeholder="Företagsnamn eller privatkund"
                      value={formData.company}
                      onChange={(event) =>
                        updateFormField("company", event.target.value)
                      }
                      className="w-full rounded-xl border border-brand-border bg-white px-4 py-4 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="contact-email"
                        className="text-sm font-bold text-white"
                      >
                        E-post
                      </label>

                      <input
                        id="contact-email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="namn@foretag.se"
                        value={formData.email}
                        onChange={(event) =>
                          updateFormField("email", event.target.value)
                        }
                        className="w-full rounded-xl border border-brand-border bg-white px-4 py-4 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="contact-phone"
                        className="text-sm font-bold text-white"
                      >
                        Telefon
                      </label>

                      <input
                        id="contact-phone"
                        type="tel"
                        required
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="070 000 00 00"
                        value={formData.phone}
                        onChange={(event) =>
                          updateFormField("phone", event.target.value)
                        }
                        className="w-full rounded-xl border border-brand-border bg-white px-4 py-4 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="contact-service"
                      className="text-sm font-bold text-white"
                    >
                      Huvudområde
                    </label>

                    <select
                      id="contact-service"
                      value={formData.service}
                      onChange={(event) =>
                        updateFormField("service", event.target.value)
                      }
                      className="w-full rounded-xl border border-brand-border bg-white px-4 py-4 font-semibold text-slate-950 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30"
                    >
                      {serviceOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="contact-message"
                      className="text-sm font-bold text-white"
                    >
                      Vad behöver du hjälp med?
                    </label>

                    <textarea
                      id="contact-message"
                      required
                      rows={6}
                      placeholder="Beskriv ditt nuläge, vad du behöver hjälp med och vad du vill uppnå."
                      value={formData.message}
                      onChange={(event) =>
                        updateFormField("message", event.target.value)
                      }
                      className="w-full resize-y rounded-xl border border-brand-border bg-white px-4 py-4 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30"
                    />
                  </div>

                  <div className="rounded-xl border border-brand-border bg-white/5 p-4">
                    <p className="text-xs leading-6 text-brand-muted">
                      Genom att skicka formuläret godkänner du att Aegis Core
                      behandlar uppgifterna för att hantera din förfrågan. Läs
                      mer i vår{" "}
                      <a
                        href="/privacy"
                        className="font-bold text-brand-primary hover:underline"
                      >
                        integritetspolicy
                      </a>
                      .
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-xl bg-brand-primary px-6 py-4 font-black text-brand-bg shadow-lg shadow-brand-glow transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting
                      ? "Skickar förfrågan..."
                      : "Skicka kostnadsfri förfrågan"}
                  </button>

                  {formError && (
                    <p
                      role="alert"
                      className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-center text-sm font-medium text-rose-200"
                    >
                      {formError}
                    </p>
                  )}

                  <p className="text-center text-xs leading-5 text-brand-muted">
                    Formuläret är kostnadsfritt och innebär ingen bindande
                    beställning.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}