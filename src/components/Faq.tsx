import { Reveal } from "cube-motion/react";
import { Squircle } from "./Squircle";

const FAQS = [
  {
    q: "How do I create a QR code for my Google reviews?",
    a: "Type your business name (and city) above, or paste your Google Maps link. Pick your business from the results, verify it opens the right review page, and download your QR code. The whole thing takes under a minute — no account, no cost.",
  },
  {
    q: "Is this Google review QR code generator really free?",
    a: "Yes — completely free, with no limits. QR codes are generated in your browser, and the business lookup uses Google's free Places API tier. There is no sign-up, no trial, and no watermark on your downloads.",
  },
  {
    q: "Do I need to sign up or create an account?",
    a: "No. Everything happens on this one page. We don't store your business details, your links, or your QR codes — when you close the tab, nothing of yours remains on our servers.",
  },
  {
    q: "I don't know my Google Place ID. Can I still use this?",
    a: "That's exactly what this tool is for. Just search your business name and city, or paste any Google Maps link to your business — even a short maps.app.goo.gl link. The tool finds the Place ID and builds the review link for you.",
  },
  {
    q: "How do I know the QR code points to the right business?",
    a: "Before downloading, open the generated review link and check that Google shows your business name and photos on the review page. Only print the code once you've confirmed it's yours — this takes ten seconds and avoids the most common mistake.",
  },
  {
    q: "Will my QR code expire or stop working?",
    a: "No. The code is static and encodes your Google review link directly — there's nothing in the middle that can expire, unlike dynamic QR services that charge a subscription. It keeps working as long as your Google Business Profile exists.",
  },
  {
    q: "Do customers need an app to scan the code?",
    a: "No. Every modern phone camera scans QR codes natively. The customer points their camera at the code, taps the notification, and lands straight on your Google review form.",
  },
  {
    q: "Where should I display my Google review QR code?",
    a: "Wherever customers already look: the counter, receipts, packaging, table tents, waiting areas, delivery bags, and your email signature. The printable templates above are sized for exactly these spots.",
  },
];

export const FAQ_JSON_LD = FAQS.map((item) => ({
  "@type": "Question",
  name: item.q,
  acceptedAnswer: { "@type": "Answer", text: item.a },
}));

export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-heading" className="mx-auto w-full max-w-3xl px-5 py-20 md:py-28">
      <Reveal as="div" targets="children">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gblue">FAQ</p>
        <h2 id="faq-heading" className="font-display mt-3 text-3xl font-bold tracking-tight text-ink md:text-4xl">
          Questions, answered
        </h2>
        <div className="mt-8 space-y-3">
          {FAQS.map((item) => (
            <Squircle key={item.q} radius={18} className="bg-white px-6 py-1 shadow-md shadow-slate-200/70">
              <details className="group py-4">
                <summary className="cursor-pointer list-none text-[15px] font-semibold text-ink marker:hidden [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between gap-4">
                    {item.q}
                    <span className="text-gblue transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                  </span>
                </summary>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">{item.a}</p>
              </details>
            </Squircle>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
