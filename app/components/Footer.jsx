import LogoLink from "./LogoLink";

export default function Footer() {
  return (
    <footer className="border-t border-brand-border bg-brand-bg px-4 py-12 text-brand-muted sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div>
            <LogoLink variant="footer" />

            <p className="mt-4 max-w-xs text-sm leading-6">
              Secure by Design. Built for Tomorrow.
            </p>

            <p className="mt-3 max-w-xs text-xs leading-6 text-brand-muted">
              Aegis drivs av Cedrus kommanditbolag, Sverige.
            </p>

            <a
              href="/cedrus"
              className="mt-2 inline-block text-xs font-bold text-brand-primary transition hover:underline"
            >
              Företagsinformation
            </a>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-black uppercase tracking-[0.22em] text-brand-primary">
              Följ oss
            </h3>

            <div className="flex flex-col gap-3 text-sm">
              <a
                href="https://instagram.com/"
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-brand-primary"
              >
                Instagram
              </a>

              <a
                href="https://linkedin.com/"
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-brand-primary"
              >
                LinkedIn
              </a>

              <a
                href="https://facebook.com/"
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-brand-primary"
              >
                Facebook
              </a>

              <a
                href="https://x.com/"
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-brand-primary"
              >
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

              <div className="border-t border-brand-border pt-3">
                <p className="font-bold text-white">Kundtjänst</p>

                <p className="mt-1">Måndag–fredag</p>

                <p className="font-semibold text-brand-primary">
                  09:00–18:00
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-black uppercase tracking-[0.22em] text-brand-primary">
              Juridiskt
            </h3>

            <div className="flex flex-col gap-3 text-sm">
              <a
                href="/cedrus"
                className="transition hover:text-brand-primary"
              >
                Cedrus kommanditbolag
              </a>

              <a
                href="/privacy"
                className="transition hover:text-brand-primary"
              >
                Integritetspolicy
              </a>

              <a
                href="/cookies"
                className="transition hover:text-brand-primary"
              >
                Cookiepolicy
              </a>

              <a
                href="/terms"
                className="transition hover:text-brand-primary"
              >
                Allmänna villkor
              </a>

              <a
                href="/angra"
                className="transition hover:text-brand-primary"
              >
                Använd ångerrätten
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-brand-border pt-6 text-center text-xs md:text-left">
          <p>
            © 2026 Cedrus kommanditbolag. Aegis drivs av Cedrus kommanditbolag.
            All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
