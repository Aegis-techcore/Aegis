import LogoLink from '../components/LogoLink';

export default function OmOssPage() {
  return (
    <main className="min-h-screen bg-brand-bg px-4 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <LogoLink />

        <section className="mt-12">
          <h1 className="text-4xl font-black">Om Aegis Core</h1>
          <p className="mt-4 text-brand-muted">
            Här presenterar vi företaget, visionen och teamet.
          </p>
        </section>
      </div>
    </main>
  );
}