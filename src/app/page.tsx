import Link from "next/link";
import { Rise, Reveal } from "cube-motion/react";
import { Generator } from "@/components/Generator";
import { TemplateGallery } from "@/components/TemplateGallery";
import { Faq, FAQ_JSON_LD } from "@/components/Faq";
import { Squircle } from "@/components/Squircle";
import { Logo } from "@/components/Logo";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://googlereviewqr.vercel.app";

const STEPS = [
  {
    n: "01",
    title: "Find your business",
    text: "Search your business name and city, or paste any Google Maps link — even a short maps.app.goo.gl link. The tool resolves it to your Google Place ID for free.",
  },
  {
    n: "02",
    title: "Verify it's yours",
    text: "Open the generated review link and confirm Google shows your business name and photos. This ten-second check guarantees the QR points at the right place.",
  },
  {
    n: "03",
    title: "Download & display",
    text: "Grab the QR as a PNG or pick a print-ready template — review card, table tent, thank-you card, or sticker. Put it where customers already look.",
  },
];

const BENEFITS = [
  {
    title: "More reviews, less friction",
    text: "Every extra tap loses customers. A scanned code lands them directly on your review form — no searching, no typing, no finding your listing among competitors.",
  },
  {
    title: "Reviews lift local rankings",
    text: "Google has confirmed reviews influence local search visibility. A steady stream of fresh reviews is one of the few ranking levers fully in your control.",
  },
  {
    title: "Static codes never expire",
    text: "Unlike dynamic QR services that stop working when you stop paying, these codes encode your Google review link directly. Print a thousand table tents with confidence.",
  },
  {
    title: "Free, private, no sign-up",
    text: "QR codes are drawn in your browser and nothing you enter is stored. No accounts, no watermarks, no 'free trial' that ends — the tool costs nothing to run.",
  },
];

export default function Home() {
  return (
    <>
      {/* Structured data: WebApplication + FAQPage + Organization */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebApplication",
                name: "Google Review QR — Free QR Code Generator",
                url: SITE_URL,
                applicationCategory: "BusinessApplication",
                operatingSystem: "Any",
                offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
                description:
                  "Free Google review QR code generator. Search your business by name or paste your Google Maps link to create a scannable QR code and print-ready review templates. No sign-up.",
              },
              {
                "@type": "Organization",
                name: "Google Review QR",
                url: SITE_URL,
              },
              {
                "@type": "FAQPage",
                mainEntity: FAQ_JSON_LD,
              },
            ],
          }),
        }}
      />

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6">
        <Link href="/" aria-label="Google Review QR — home">
          <Logo />
        </Link>
        <nav aria-label="Page sections" className="hidden items-center gap-8 text-sm text-white/55 md:flex">
          <a href="#how-it-works" className="transition-colors hover:text-white">How it works</a>
          <a href="#templates" className="transition-colors hover:text-white">Templates</a>
          <a href="#faq" className="transition-colors hover:text-white">FAQ</a>
        </nav>
      </header>

      <main>
        {/* Hero + tool */}
        <section aria-labelledby="page-heading" className="mx-auto w-full max-w-6xl px-5 pb-16 pt-8 md:pt-14">
          <Rise as="div" targets="children" className="mx-auto max-w-3xl text-center">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">
              Free · No sign-up · No watermark
            </p>
            <h1 id="page-heading" className="font-display mt-4 text-4xl font-bold leading-[1.05] tracking-tight text-white md:text-6xl">
              Free Google Review QR Code Generator
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-[16px] leading-relaxed text-white/60 md:text-lg">
              Turn happy customers into Google reviews. Find your business by name, or paste your Google Maps
              link — get a scannable QR code and print-ready review cards in under a minute.
            </p>
          </Rise>
          <div className="mx-auto mt-10 max-w-4xl">
            <Generator />
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" aria-labelledby="how-heading" className="border-y border-white/5 bg-white/[0.015]">
          <div className="mx-auto w-full max-w-6xl px-5 py-20 md:py-28">
            <Reveal as="div" targets="children">
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">How it works</p>
              <h2 id="how-heading" className="font-display mt-3 max-w-2xl text-3xl font-bold tracking-tight text-white md:text-4xl">
                From business name to printed QR in three steps
              </h2>
              <ol className="mt-10 grid gap-5 md:grid-cols-3">
                {STEPS.map((s) => (
                  <li key={s.n}>
                    <Squircle radius={20} className="h-full border border-white/10 bg-panel p-7">
                      <p className="font-mono text-sm text-accent">{s.n}</p>
                      <h3 className="font-display mt-3 text-xl font-bold text-white">{s.title}</h3>
                      <p className="mt-2 text-[15px] leading-relaxed text-white/55">{s.text}</p>
                    </Squircle>
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>
        </section>

        <TemplateGallery />

        {/* Benefits */}
        <section aria-labelledby="why-heading" className="border-y border-white/5 bg-white/[0.015]">
          <div className="mx-auto w-full max-w-6xl px-5 py-20 md:py-28">
            <Reveal as="div" targets="children">
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">Why it matters</p>
              <h2 id="why-heading" className="font-display mt-3 max-w-2xl text-3xl font-bold tracking-tight text-white md:text-4xl">
                Why businesses put review QR codes everywhere
              </h2>
              <div className="mt-10 grid gap-5 md:grid-cols-2">
                {BENEFITS.map((b) => (
                  <Squircle key={b.title} radius={20} className="border border-white/10 bg-panel p-7">
                    <h3 className="font-display text-lg font-bold text-white">{b.title}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-white/55">{b.text}</p>
                  </Squircle>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        <Faq />

        {/* Final CTA */}
        <section aria-label="Create your QR code" className="mx-auto w-full max-w-6xl px-5 pb-24">
          <Reveal as="div" targets="children">
            <Squircle radius={28} className="border border-white/10 bg-gradient-to-br from-panel to-ink px-8 py-14 text-center md:py-20">
              <h2 className="font-display mx-auto max-w-xl text-3xl font-bold tracking-tight text-white md:text-4xl">
                Your next hundred reviews start with one scan
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-[15px] text-white/55">
                Free forever, no account, nothing stored. Make your QR code now.
              </p>
              <a
                href="#page-heading"
                className="mt-8 inline-block bg-accent px-8 py-4 text-[15px] font-semibold text-white transition-transform active:scale-[0.97]"
                style={{ borderRadius: 16 }}
              >
                Create my QR code
              </a>
            </Squircle>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-white/5">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 md:flex-row">
          <Logo size={24} />
          <p className="text-[13px] text-white/35">
            Free Google review QR codes for local businesses. Not affiliated with Google LLC.
          </p>
        </div>
      </footer>
    </>
  );
}
