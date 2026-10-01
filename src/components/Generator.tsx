"use client";

import { useState } from "react";
import { Rise } from "cube-motion/react";
import { Squircle } from "./Squircle";
import { LinkGuide } from "./LinkGuide";
import { qrDataUrl, downloadDataUrl } from "@/lib/qr";
import { TEMPLATES, templateToPng, type TemplateDef } from "@/lib/templates";

type Phase = "input" | "loading" | "ready";

interface ResolveResponse {
  placeId?: string;
  reviewUrl?: string;
  label?: string | null;
  error?: string;
}

function filenameSafe(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "business"
  );
}

export function Generator() {
  const [link, setLink] = useState("");
  const [phase, setPhase] = useState<Phase>("input");
  const [error, setError] = useState<string | null>(null);
  const [reviewUrl, setReviewUrl] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState("");
  const [foundName, setFoundName] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [busyTemplate, setBusyTemplate] = useState<string | null>(null);

  function fail(message: string) {
    setError(message);
    setPhase("input");
  }

  async function handleResolve(e: React.FormEvent) {
    e.preventDefault();
    if (!link.trim()) return fail("Paste your Google link first.");
    setError(null);
    setPhase("loading");
    try {
      const res = await fetch("/api/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: link }),
      });
      const data = (await res.json()) as ResolveResponse;
      if (!res.ok || !data.placeId || !data.reviewUrl)
        return fail(data.error || "Couldn't read that link.");
      await showResult(data.placeId, data.reviewUrl, data.label || undefined);
    } catch {
      fail("Couldn't reach the lookup service. Check your connection and try again.");
    }
  }

  async function showResult(placeId: string, url: string, label?: string) {
    setReviewUrl(url);
    setFoundName(label ?? null);
    // Pre-fill the template name from the link's business name (free, from the URL slug).
    if (label) setBusinessName(label);
    setPhase("ready");
    const dataUrl = await qrDataUrl(url, 1024);
    setQr(dataUrl);
    document.getElementById("result")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function reset() {
    setPhase("input");
    setReviewUrl(null);
    setQr(null);
    setError(null);
    setFoundName(null);
  }

  function handleDownloadQr() {
    if (!qr) return;
    downloadDataUrl(qr, `google-review-qr-${filenameSafe(businessName)}.png`);
  }

  async function handleDownloadTemplate(t: TemplateDef) {
    if (!qr || busyTemplate) return;
    setBusyTemplate(t.id);
    try {
      const png = await templateToPng(t, qr, businessName || "Your Business", 2);
      downloadDataUrl(png, `${t.id}-google-review-${filenameSafe(businessName)}.png`);
    } catch {
      setError("Couldn't render that template. Try again.");
    } finally {
      setBusyTemplate(null);
    }
  }

  return (
    <Rise as="div" targets="children" className="w-full">
      <Squircle radius={28} className="bg-white p-6 shadow-xl shadow-slate-200/70 md:p-10">
        {/* Rainbow accent */}
        <div className="bg-google-rainbow -mx-6 -mt-6 h-1.5 md:-mx-10 md:-mt-10" aria-hidden="true" />

        {phase !== "ready" && (
          <div className="mt-6 pt-6 md:pt-8">
            <form onSubmit={handleResolve} className="flex flex-col gap-3">
              <div>
                <label htmlFor="biz-link" className="sr-only">
                  Google Maps link, review link, or Place ID
                </label>
                <input
                  id="biz-link"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="Paste your Google Maps link, review link, or Place ID"
                  inputMode="url"
                  autoComplete="off"
                  className="w-full bg-wash px-5 py-4 text-[15px] text-ink outline-none placeholder:text-muted/80 focus:bg-white focus:ring-2 focus:ring-gblue/40"
                  style={{ borderRadius: 16 }}
                />
              </div>
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <p className="flex-1 text-[13px] leading-relaxed text-muted">
                  Works with review links, Google Business (g.page / share.google) links, Maps share links, and raw Place IDs. Free forever — no sign-up.
                </p>
                <button
                  type="submit"
                  disabled={phase === "loading"}
                  className="bg-gblue px-7 py-4 text-[15px] font-semibold text-white transition hover:bg-[#3367d6] active:scale-[0.97] disabled:opacity-50"
                  style={{ borderRadius: 16 }}
                >
                  {phase === "loading" ? "Reading link…" : "Get review link"}
                </button>
              </div>
            </form>

            {error && (
              <p role="alert" className="mt-4 bg-[#fce8e6] px-5 py-3 text-sm text-[#b3261e]" style={{ borderRadius: 14 }}>
                {error}
              </p>
            )}

            <LinkGuide />
          </div>
        )}

        {phase === "ready" && reviewUrl && (
          <div id="result" className="mt-6 scroll-mt-24 pt-6 md:pt-8">
            <div className="flex flex-col gap-8 lg:flex-row">
              {/* QR preview */}
              <div className="flex flex-col items-center gap-4">
                <Squircle radius={24} className="bg-white p-4 shadow-md shadow-slate-200/70">
                  {qr ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={qr} alt="QR code linking to your Google review page" width={240} height={240} className="block h-60 w-60" />
                  ) : (
                    <div className="h-60 w-60 animate-pulse bg-wash" aria-label="Generating QR code" />
                  )}
                </Squircle>
                <button
                  onClick={handleDownloadQr}
                  disabled={!qr}
                  className="w-full bg-gblue px-6 py-3.5 text-[15px] font-semibold text-white transition hover:bg-[#3367d6] active:scale-[0.97] disabled:opacity-50"
                  style={{ borderRadius: 14 }}
                >
                  Download QR (PNG)
                </button>
                <button onClick={reset} className="text-sm text-muted underline-offset-4 hover:text-ink hover:underline">
                  Start over
                </button>
              </div>

              {/* Verify + customize */}
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Step 1 — Verify</p>
                {foundName && (
                  <p className="mt-2 text-[15px] text-ink">
                    Found: <strong className="font-semibold">{foundName}</strong>
                  </p>
                )}
                <a
                  href={reviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-2 text-[15px] font-semibold text-gblue hover:underline"
                >
                  Open your Google review page
                  <span aria-hidden="true">↗</span>
                </a>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  Check that Google shows <em>your</em> business name and photos. Only print the code once you&apos;ve confirmed
                  it&apos;s yours.
                </p>

                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-muted">Step 2 — Customize</p>
                <label htmlFor="tpl-name" className="mt-2 block text-sm text-muted">
                  Business name on templates
                </label>
                <input
                  id="tpl-name"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Your business name"
                  className="mt-1 w-full bg-wash px-4 py-3 text-[15px] text-ink outline-none placeholder:text-muted/80 focus:bg-white focus:ring-2 focus:ring-gblue/40"
                  style={{ borderRadius: 12 }}
                />

                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-muted">Step 3 — Print-ready templates</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {TEMPLATES.map((t) => (
                    <div key={t.id} className="bg-wash p-4" style={{ borderRadius: 16 }}>
                      <div
                        className="overflow-hidden bg-white"
                        style={{ aspectRatio: `${t.width} / ${t.height}`, borderRadius: 10 }}
                      >
                        {qr && (
                          <div
                            className="h-full w-full [&>svg]:h-full [&>svg]:w-full"
                            // SVG is generated locally from a static template — no user input inside.
                            dangerouslySetInnerHTML={{ __html: t.build(qr, businessName || "Your Business") }}
                          />
                        )}
                      </div>
                      <p className="mt-3 text-[15px] font-semibold text-ink">{t.name}</p>
                      <p className="mt-1 text-[13px] leading-relaxed text-muted">{t.description}</p>
                      <button
                        onClick={() => handleDownloadTemplate(t)}
                        disabled={!qr || busyTemplate !== null}
                        className="mt-3 w-full bg-gblue px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#3367d6] disabled:opacity-50"
                        style={{ borderRadius: 10 }}
                      >
                        {busyTemplate === t.id ? "Rendering…" : "Download PNG"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </Squircle>
    </Rise>
  );
}
