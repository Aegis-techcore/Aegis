import Header from "../components/Header";
import Footer from "../components/Footer";
import { CheckIcon } from "../components/Icons";

const websitePackages = [
  {
    name: "Starter hemsida",
    price: "från 2 990 kr",
    text: "För privatpersoner eller små företag som behöver en enkel men professionell närvaro online.",
    features: [
      "1–3 sidor",
      "Mobilanpassad design",
      "Kontaktuppgifter och grundläggande innehåll",
      "Enklare kontaktformulär",
      "Publicering av hemsidan"
    ]
  },
  {
    name: "Business hemsida",
    price: "från 6 990 kr",
    text: "För företag som vill ha en mer komplett hemsida med tydlig struktur och bättre presentation.",
    features: [
      "Upp till 6 sidor",
      "Modern design anpassad efter företaget",
      "Tjänstesidor och startsida",
      "Kontaktformulär",
      "Grundläggande SEO",
      "Koppling till e-post eller externa länkar"
    ]
  },
  {
    name: "Pro hemsida",
    price: "från 13 990 kr",
    text: "För företag som vill ha fler funktioner och en hemsida som kan användas aktivt i verksamheten.",
    features: [
      "Upp till 10 sidor",
      "Bokningslänk eller enklare bokningsflöde",
      "Adminvänlig struktur",
      "Förbättrad SEO och prestanda",
      "AI-chatbot eller automation som tillval",
      "Mer avancerad design och animationer"
    ],
    highlighted: true
  },
  {
    name: "Custom system",
    price: "Offert",
    text: "För större lösningar där hemsidan behöver kopplas till system, databaser, kundportaler eller appar.",
    features: [
      "Skräddarsydd design och funktionalitet",
      "Databas och inloggning",
      "Adminpanel eller dashboard",
      "API-integrationer",
      "AI, automation eller säkerhetslösningar",
      "Långsiktig vidareutveckling"
    ]
  }
];

export default function HemsidorPage() {
  return (
    <main className="min-h-screen bg-brand-bg text-white">
      <Header />

      <section className="border-b border-brand-border py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-brand-primary">
              Hitta en lösning
            </p>

            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Hemsidor anpassade efter dina behov
            </h1>

            <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-brand-primary" />

            <p className="mt-6 leading-8 text-brand-muted">
              Vi skapar moderna, snabba och mobilanpassade hemsidor för
              privatpersoner och företag. Börja med en enklare webbplats eller
              välj en mer avancerad lösning med bokning, inloggning, AI,
              databaser och administration.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {websitePackages.map((pkg) => (
              <article
                key={pkg.name}
                className={`flex h-full flex-col rounded-3xl border p-6 transition duration-300 hover:-translate-y-1 ${
                  pkg.highlighted
                    ? "border-brand-primary bg-brand-primary/10 shadow-xl shadow-brand-glow/10"
                    : "border-brand-border bg-slate-950/55"
                }`}
              >
                {pkg.highlighted && (
                  <span className="mb-4 w-fit rounded-full bg-brand-primary px-3 py-1 text-[10px] font-black uppercase tracking-widest text-brand-bg">
                    Rekommenderad
                  </span>
                )}

                <h2 className="text-2xl font-black text-white">{pkg.name}</h2>

                <p className="mt-3 text-3xl font-black text-brand-primary">
                  {pkg.price}
                </p>

                <p className="mt-4 text-sm leading-7 text-brand-muted">
                  {pkg.text}
                </p>

                <ul className="mt-6 space-y-3">
                  {pkg.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-brand-border bg-brand-primary/10 text-brand-primary">
                        <CheckIcon className="h-3 w-3" />
                      </span>

                      <span className="text-sm leading-6 text-brand-muted">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <a
                  href="/kontakt"
                  className="mt-auto block rounded-xl bg-brand-primary px-4 py-3 pt-3 text-center text-sm font-black text-brand-bg transition hover:bg-brand-primary-hover"
                >
                  Be om offert
                </a>
              </article>
            ))}
          </div>

          {/* Betalningsinformation */}
          <div className="mt-12 rounded-3xl border border-brand-primary/30 bg-gradient-to-r from-brand-primary/10 to-cyan-500/5 p-8 shadow-xl shadow-brand-glow/10">
            <div className="mx-auto max-w-4xl text-center">
              <h2 className="text-2xl font-black text-white">
                Trygg betalningsmodell
              </h2>

              <p className="mt-5 text-base leading-8 text-brand-muted">
                För alla{" "}
                <span className="font-bold text-white">
                  projekt och engångstjänster
                </span>{" "}
                betalas endast{" "}
                <span className="font-bold text-brand-primary">
                  25&nbsp;% av det överenskomna priset
                </span>{" "}
                när offerten har godkänts och projektet påbörjas.
              </p>

              <p className="mt-4 text-base leading-8 text-brand-muted">
                Resterande{" "}
                <span className="font-bold text-white">75&nbsp;%</span>{" "}
                faktureras först när projektet är färdigutvecklat, levererat
                och godkänt av dig som kund. Du kan därför följa processen och
                bedöma resultatet innan slutbetalningen sker.
              </p>

              <div className="mt-6 inline-flex rounded-full border border-brand-primary/30 bg-brand-primary/10 px-5 py-2">
                <span className="text-sm font-bold tracking-wide text-brand-primary">
                  Gäller projekt och engångstjänster • Gäller inte abonnemang
                </span>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <h2 className="text-2xl font-black text-white">
              Osäker på vilken nivå som passar?
            </h2>

            <p className="mx-auto mt-3 max-w-2xl leading-7 text-brand-muted">
              Beskriv vad du behöver så hjälper vi dig att hitta en lösning
              med rätt omfattning, funktioner och pris.
            </p>

            <a
              href="/kontakt"
              className="mt-6 inline-block rounded-xl border border-brand-primary bg-brand-primary/10 px-6 py-3 font-black text-brand-primary transition hover:bg-brand-primary hover:text-brand-bg"
            >
              Kontakta oss kostnadsfritt
            </a>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}