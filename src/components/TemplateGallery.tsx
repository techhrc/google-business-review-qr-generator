"use client";

import { useEffect, useState } from "react";
import { Reveal } from "cube-motion/react";
import { Squircle } from "./Squircle";
import { qrDataUrl } from "@/lib/qr";
import { TEMPLATES } from "@/lib/templates";

// Live previews of the printable templates, rendered with a sample QR so
// visitors can see exactly what they'll download.
export function TemplateGallery() {
  const [sampleQr, setSampleQr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    qrDataUrl("https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4", 512).then(
      (url) => {
        if (alive) setSampleQr(url);
      }
    );
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section id="templates" aria-labelledby="templates-heading" className="mx-auto w-full max-w-6xl px-5 py-20 md:py-28">
      <Reveal as="div" targets="children">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gblue">Templates</p>
        <h2 id="templates-heading" className="font-display mt-3 max-w-2xl text-3xl font-bold tracking-tight text-ink md:text-4xl">
          Not just a QR — print-ready review cards
        </h2>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted">
          A bare QR code gets ignored. These cards pair your code with a clear call to action, sized for the
          counter, the receipt, and the window. Download any of them as a high-resolution PNG.
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((t) => (
            <Squircle key={t.id} radius={20} className="overflow-hidden border border-line bg-white shadow-sm">
              <div
                className="w-full overflow-hidden bg-wash"
                style={{ aspectRatio: `${t.width} / ${t.height}` }}
              >
                {sampleQr ? (
                  <div
                    className="h-full w-full [&>svg]:h-full [&>svg]:w-full"
                    // The SVG is generated locally from a static template — no user input inside.
                    dangerouslySetInnerHTML={{ __html: t.build(sampleQr, "Sample Business") }}
                  />
                ) : (
                  <div className="h-full w-full animate-pulse bg-slate-100" aria-label="Loading template preview" />
                )}
              </div>
              <div className="border-t border-line p-5">
                <p className="text-[15px] font-semibold text-ink">{t.name}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-muted">{t.description}</p>
              </div>
            </Squircle>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
