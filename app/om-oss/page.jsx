import Footer from "../components/Footer";
import Header from "../components/Header";
import {
  CheckIcon,
  CodeIcon,
  ServerIcon,
  ShieldIcon,
  SparklesIcon
} from "../components/Icons";

export const metadata = {
  title: "Om Aegis | Säker teknik byggd för framtiden",
  description:
    "Lär känna Aegis och hur vi utvecklar säkra, tydliga och långsiktiga digitala lösningar för företag och privatpersoner."
};

const values = [
  {
    title: "Säkerhet som grund",
    description:
      "Vi tar hänsyn till säkerhet, stabilitet och integritet från första beslutet – inte som ett tillägg i slutet.",
    icon: ShieldIcon
  },
  {
    title: "Tydlighet hela vägen",
    description:
      "Du ska veta vad vi gör, varför vi gör det och vad nästa steg är. Vi kommunicerar enkelt och håller dig uppdaterad.",
    icon: SparklesIcon
  },
  {
    title: "Rätt lösning för behovet",
    description:
      "Vi börjar med problemet som ska lösas och väljer sedan teknik, omfattning och arbetssätt som passar målet.",
    icon: CodeIcon
  },
  {
    title: "Byggt för att utvecklas",
    description:
      "Vi skapar strukturerade lösningar som går att underhålla, förbättra och bygga vidare på när behoven förändras.",
    icon: ServerIcon
  }
];

const collaborationSteps = [
  {
    number: "01",
    title: "Vi lyssnar först",
    description:
      "Vi sätter oss in i nuläget, målet och de verkliga utmaningarna innan vi föreslår en lösning."
  },
  {
    number: "02",
    title: "Vi gör vägen tydlig",
    description:
      "Du får en konkret rekommendation, tydlig omfattning och offert innan utvecklingen startar."
  },
  {
    number: "03",
    title: "Vi bygger tillsammans",
    description:
      "Arbetet sker stegvis med löpande uppdateringar och möjlighet att testa och lämna synpunkter."
  },
  {
    number: "04",
    title: "Vi finns kvar",
    description:
      "Efter leveransen kan vi fortsätta hjälpa till med support, förbättringar och vidareutveckling."
  }
];

const expertise = [
  "Webbplatser och digitala tjänster",
  "Skräddarsydd mjukvaruutveckling",
  "Cybersäkerhet och teknisk kvalitet",
  "AI, automation och integrationer",
  "Inbyggda system och IoT",
  "Support och vidareutveckling"
];

const promises = [
  "Kostnadsfri första konsultation",
  "Tydlig offert före projektstart",
  "Direktkontakt genom hela arbetet"
];

export default function OmOssPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-brand-bg text-white">
      <Header />

      <section className="relative isolate overflow-hidden border-b border-brand-border bg-[radial-gradient(circle_at_12%_15%,rgba(6,182,212,0.18),transparent_32%),radial-gradient(circle_at_88%_75%,rgba(59,130,246,0.14),transparent_34%),linear-gradient(135deg,#020617_0%,#07111f_52%,#020617_100%)] px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-brand-primary/70 to-transparent" />
        <div className="pointer-events-none absolute -right-24 top-20 -z-10 h-80 w-80 rounded-full border border-brand-primary/10" />
        <div className="pointer-events-none absolute -right-8 top-36 -z-10 h-52 w-52 rounded-full border border-brand-primary/10" />

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-border bg-brand-primary/10 px-4 py-2 text-xs font-black uppercase tracking-[0.28em] text-brand-primary">
              <ShieldIcon className="h-4 w-4" aria-hidden="true" />
              Om Aegis
            </div>

            <h1 className="mt-7 max-w-4xl text-4xl font-black leading-[1.04] tracking-tight text-white sm:text-5xl lg:text-7xl">
              Teknik som är trygg från{" "}
              <span className="bg-gradient-to-r from-cyan-300 via-brand-primary to-blue-400 bg-clip-text text-transparent">
                första beslutet
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-base font-medium leading-8 text-brand-muted sm:text-lg">
              Aegis utvecklar moderna digitala lösningar för företag och
              privatpersoner – från webbplatser och skräddarsydda system till
              AI, automation och teknisk rådgivning. Alltid med tydlighet,
              kvalitet och säkerhet i grunden.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href="/kontakt"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-6 py-3.5 text-sm font-black text-brand-bg shadow-lg shadow-brand-glow/25 transition hover:-translate-y-0.5 hover:bg-brand-primary-hover"
              >
                Berätta om ditt projekt
                <span aria-hidden="true">→</span>
              </a>

              <a
                href="/tjanster"
                className="inline-flex items-center justify-center rounded-xl border border-brand-border bg-white/5 px-6 py-3.5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:border-brand-primary hover:bg-brand-primary/10"
              >
                Se våra tjänster
              </a>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {promises.map((promise) => (
                <div key={promise} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-brand-border bg-brand-primary/10 text-brand-primary">
                    <CheckIcon className="h-3 w-3" aria-hidden="true" />
                  </span>
                  <span className="text-xs font-bold leading-5 text-white/80">
                    {promise}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute inset-8 -z-10 rounded-full bg-brand-primary/20 blur-[90px]" />

            <div className="glass-effect relative overflow-hidden rounded-[2rem] p-7 sm:p-9">
              <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-bl-full bg-brand-primary/10" />

              <div className="relative flex items-center justify-between gap-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-brand-primary/30 bg-brand-primary/10 text-brand-primary shadow-lg shadow-brand-glow/20">
                  <ShieldIcon className="h-8 w-8" aria-hidden="true" />
                </div>

                <span className="font-mono text-xs font-bold uppercase tracking-[0.24em] text-brand-primary">
                  Aegis princip
                </span>
              </div>

              <blockquote className="relative mt-10 text-2xl font-black leading-snug tracking-tight text-white sm:text-3xl">
                “Secure by Design.
                <span className="block text-brand-primary">
                  Built for Tomorrow.”
                </span>
              </blockquote>

              <p className="relative mt-6 leading-7 text-brand-muted">
                Vi ser inte säkerhet, användbarhet och långsiktighet som tre
                separata val. En bra lösning behöver alla tre.
              </p>

              <div className="relative mt-8 grid grid-cols-3 gap-3 border-t border-brand-border pt-6 text-center">
                {[
                  ["01", "Förstå"],
                  ["02", "Bygga"],
                  ["03", "Förbättra"]
                ].map(([number, label]) => (
                  <div key={number}>
                    <p className="font-mono text-xs font-black text-brand-primary">
                      {number}
                    </p>
                    <p className="mt-1 text-xs font-bold text-white/80 sm:text-sm">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-brand-border px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-brand-primary">
              Vår utgångspunkt
            </p>
            <h2 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
              Bra teknik ska inte behöva kännas komplicerad
            </h2>
          </div>

          <div className="space-y-6 text-base leading-8 text-brand-muted sm:text-lg">
            <p>
              Aegis bygger på en enkel övertygelse: teknik ska lösa rätt
              problem, vara enkel att använda och hålla över tid. Därför börjar
              vi med att förstå behovet innan vi rekommenderar en lösning.
            </p>

            <p>
              Under projektet arbetar vi steg för steg, håller dig uppdaterad
              och gör det tydligt vad som ingår. Målet är inte bara en färdig
              leverans, utan en lösning du känner dig trygg med och kan fortsätta
              utveckla.
            </p>

            <div className="rounded-2xl border-l-2 border-brand-primary bg-brand-primary/5 px-6 py-5">
              <p className="font-bold leading-7 text-white">
                Vi kombinerar teknisk kompetens med personlig service – så att
                avancerad teknik blir begriplig, användbar och värdefull.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-brand-border bg-slate-950/35 px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-brand-primary">
              Det vi står för
            </p>
            <h2 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
              Principer som märks i arbetet
            </h2>
            <p className="mt-5 leading-8 text-brand-muted">
              Våra värderingar ska inte bara låta bra. De ska göra samarbetet
              enklare och resultatet starkare.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2">
            {values.map(({ title, description, icon: Icon }, index) => (
              <article
                key={title}
                className="group relative overflow-hidden rounded-3xl border border-brand-border bg-slate-950/60 p-7 transition duration-300 hover:-translate-y-1 hover:border-brand-primary/50 hover:bg-brand-primary/5 sm:p-8"
              >
                <span className="absolute right-6 top-5 font-mono text-5xl font-black text-white/[0.035]">
                  0{index + 1}
                </span>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-border bg-brand-primary/10 text-brand-primary transition group-hover:border-brand-primary/50">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mt-6 text-xl font-black text-white">{title}</h3>
                <p className="mt-3 max-w-xl leading-7 text-brand-muted">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-brand-border px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-brand-primary">
                Så samarbetar vi
              </p>
              <h2 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                Nära, tydligt och steg för steg
              </h2>
              <p className="mt-6 leading-8 text-brand-muted">
                Hos Aegis får du direktkontakt med den som analyserar och bygger
                lösningen. Det minskar missförstånd och gör vägen från idé till
                resultat kortare.
              </p>
            </div>

            <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {collaborationSteps.map((step) => (
                <li
                  key={step.number}
                  className="rounded-3xl border border-brand-border bg-white/[0.025] p-6 transition hover:border-brand-primary/40 hover:bg-brand-primary/5"
                >
                  <span className="font-mono text-xs font-black tracking-[0.2em] text-brand-primary">
                    {step.number}
                  </span>
                  <h3 className="mt-4 text-lg font-black text-white">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-brand-muted">
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="relative border-b border-brand-border bg-[radial-gradient(circle_at_85%_25%,rgba(6,182,212,0.12),transparent_30%),linear-gradient(180deg,rgba(15,23,42,0.38),rgba(2,6,23,0.2))] px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_0.9fr] lg:gap-20">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-brand-primary">
              Kompetens med ett gemensamt mål
            </p>
            <h2 className="mt-5 max-w-3xl text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
              En teknisk partner som ser hela lösningen
            </h2>
            <p className="mt-6 max-w-2xl leading-8 text-brand-muted">
              En digital lösning består sällan av bara en sak. Därför kombinerar
              vi utveckling, säkerhet och långsiktigt tänkande – från den första
              idén till support efter leverans.
            </p>
          </div>

          <div className="rounded-3xl border border-brand-border bg-slate-950/70 p-6 shadow-2xl shadow-black/20 sm:p-8">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {expertise.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-brand-border bg-white/[0.025] p-4"
                >
                  <CheckIcon
                    className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary"
                    aria-hidden="true"
                  />
                  <span className="text-sm font-bold leading-6 text-white/85">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-brand-primary/30 bg-[linear-gradient(135deg,rgba(6,182,212,0.16),rgba(15,23,42,0.88)_48%,rgba(59,130,246,0.12))] px-6 py-12 text-center shadow-2xl shadow-brand-glow/10 sm:px-10 sm:py-16 lg:px-16">
          <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-2/3 -translate-x-1/2 rounded-full bg-brand-primary/10 blur-[80px]" />

          <div className="relative">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-primary/30 bg-brand-primary/10 text-brand-primary">
              <SparklesIcon className="h-7 w-7" aria-hidden="true" />
            </div>

            <h2 className="mx-auto mt-6 max-w-3xl text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
              Har du en idé eller något som behöver fungera bättre?
            </h2>

            <p className="mx-auto mt-5 max-w-2xl leading-8 text-brand-muted">
              Berätta kort vad du vill skapa, förbättra eller automatisera. Det
              första samtalet är kostnadsfritt och din förfrågan är inte
              bindande.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <a
                href="/kontakt"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-6 py-3.5 text-sm font-black text-brand-bg shadow-lg shadow-brand-glow/25 transition hover:-translate-y-0.5 hover:bg-brand-primary-hover"
              >
                Boka ett kostnadsfritt samtal
                <span aria-hidden="true">→</span>
              </a>

              <a
                href="/tjanster"
                className="inline-flex items-center justify-center rounded-xl border border-brand-border bg-slate-950/40 px-6 py-3.5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:border-brand-primary hover:bg-brand-primary/10"
              >
                Utforska våra tjänster
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
