import Header from "../components/Header";
import Footer from "../components/Footer";

export const metadata = {
  title: "Cedrus kommanditbolag | Aegis",
  description:
    "Företagsinformation om Cedrus kommanditbolag, som driver Aegis inom mjukvaruutveckling, AI, IT-konsulttjänster och cybersäkerhet."
};

const areas = [
  "Mjukvaruutveckling och webbapplikationer",
  "AI-lösningar och automation",
  "IT-konsulttjänster och systemintegration",
  "Cybersäkerhet och säker utveckling",
  "Sårbarhetsanalys och auktoriserad säkerhetstestning"
];

export default function CedrusPage() {
  return (
    <main className="min-h-screen bg-brand-bg text-white">
      <Header />

      <section className="border-b border-brand-border px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-brand-primary">
            Företagsinformation
          </p>

          <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">
            Cedrus kommanditbolag
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-brand-muted">
            Aegis är en digital tjänst och teknisk verksamhet som drivs av
            Cedrus kommanditbolag i Sverige. Cedrus arbetar med
            mjukvaruutveckling, AI, IT-konsulttjänster och cybersäkerhet.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-brand-border bg-slate-950/55 p-6">
              <h2 className="text-xl font-black">Legal entity</h2>

              <dl className="mt-5 space-y-4 text-sm">
                <div>
                  <dt className="font-bold text-brand-primary">Juridiskt namn</dt>
                  <dd className="mt-1 text-brand-muted">Cedrus kommanditbolag</dd>
                </div>

                <div>
                  <dt className="font-bold text-brand-primary">Verksamhet / brand</dt>
                  <dd className="mt-1 text-brand-muted">Aegis</dd>
                </div>

                <div>
                  <dt className="font-bold text-brand-primary">Land</dt>
                  <dd className="mt-1 text-brand-muted">Sverige</dd>
                </div>

                <div>
                  <dt className="font-bold text-brand-primary">Kontakt</dt>
                  <dd className="mt-1">
                    <a
                      href="mailto:aegis.infon@gmail.com"
                      className="text-brand-primary hover:underline"
                    >
                      aegis.infon@gmail.com
                    </a>
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-3xl border border-brand-border bg-slate-950/55 p-6">
              <h2 className="text-xl font-black">Verksamhetsområden</h2>

              <ul className="mt-5 space-y-3 text-sm leading-6 text-brand-muted">
                {areas.map((area) => (
                  <li key={area} className="flex gap-3">
                    <span className="text-brand-primary" aria-hidden="true">
                      •
                    </span>
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-brand-primary/30 bg-brand-primary/10 p-6">
            <h2 className="text-xl font-black">Cybersecurity authorization</h2>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-brand-muted">
              Säkerhetstestning utförs endast på system som Cedrus
              kommanditbolag äger eller på system där uttrycklig behörighet att
              testa har lämnats. Arbetet omfattar bland annat säker
              mjukvaruutveckling, kodgranskning, sårbarhetsanalys och
              auktoriserad penetrationstestning.
            </p>

            <p className="mt-5 max-w-3xl text-sm leading-7 text-brand-muted">
              Security testing is limited to systems owned by Cedrus
              kommanditbolag or systems for which explicit authorization to
              test has been granted.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
