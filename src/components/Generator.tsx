"use client";

import { useState } from "react";
import { Rise, Morph } from "cube-motion/react";
import { Squircle } from "./Squircle";
import { qrDataUrl, downloadDataUrl } from "@/lib/qr";
import { TEMPLATES, templateToPng, type TemplateDef } from "@/lib/templates";
import type { PlaceCandidate } from "@/lib/places";

type Phase = "input" | "loading" | "candidates" | "ready";

interface SearchResponse {
  results?: PlaceCandidate[];
  error?: string;
}

interface ResolveResponse {
  placeId?: string;
  reviewUrl?: string;
  results?: PlaceCandidate[];
  query?: string;
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
  const [tab, setTab] = useState<"search" | "link">("search");
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [link, setLink] = useState("");
  const [phase, setPhase] = useState<Phase>("input");
  const [candidates, setCandidates] = useState<PlaceCandidate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [reviewUrl, setReviewUrl] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState("");
  const [qr, setQr] = useState<string | null>(null);
  const [busyTemplate, setBusyTemplate] = useState<string | null>(null);

  function fail(message: string) {
    setError(message);
    setPhase("input");
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPhase("loading");
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, city }),
      });
      const data = (await res.json()) as SearchResponse;
      if (!res.ok) return fail(data.error || "Search failed. Try again.");
      setCandidates(data.results ?? []);
      setPhase("candidates");
    } catch {
      fail("Couldn't reach the search service. Check your connection and try again.");
    }
  }

  async function handleResolve(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPhase("loading");
    try {
      const res = await fetch("/api/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: link }),
      });
      const data = (await res.json()) as ResolveResponse;
      if (!res.ok) return fail(data.error || "Couldn't read that link.");
      if (data.reviewUrl && data.placeId) {
        await showResult(data.placeId, data.reviewUrl, "");
      } else if (data.results) {
        setCandidates(data.results);
        setPhase("candidates");
      }
    } catch {
      fail("Couldn't reach the lookup service. Check your connection and try again.");
    }
  }

  async function showResult(placeId: string, url: string, nameGuess: string) {
    setReviewUrl(url);
    setBusinessName(nameGuess);
    setPhase("ready");
    const dataUrl = await qrDataUrl(url, 1024);
    setQr(dataUrl);
    document.getElementById("result")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function choose(c: PlaceCandidate) {
    const url = `https://search.google.com/local/writereview?placeid=${c.id}`;
    void showResult(c.id, url, c.name);
  }

  function reset() {
    setPhase("input");
    setCandidates([]);
    setReviewUrl(null);
    setQr(null);
    setError(null);
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
      <Squircle radius={28} className="border border-line bg-white p-6 shadow-xl shadow-slate-200/70 md:p-10">
        {/* Rainbow accent */}
        <div className="bg-google-rainbow -mx-6 -mt-6 h-1.5 md:-mx-10 md:-mt-10" aria-hidden="true" />
        {/* Tabs */}
        <div className="flex gap-2 pt-6 md:pt-8" role="tablist" aria-label="How to find your business">
          {(
            [
              { id: "search", label: "Search business" },
              { id: "link", label: "Paste a link" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => {
                setTab(t.id);
                reset();
              }}
              className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
                tab === t.id ? "text-ink" : "text-muted/70 hover:text-ink"
              }`}
            >
              <Morph active={tab === t.id} off={t.label} on={t.label} />
              <span
                className={`mt-2 block h-0.5 w-full ${tab === t.id ? "bg-gblue" : "bg-transparent"}`}
                aria-hidden="true"
              />
            </button>
          ))}
        </div>

        {phase !== "ready" && (
          <div className="mt-6">
            {tab === "search" ? (
              <form onSubmit={handleSearch} className="flex flex-col gap-3 md:flex-row">
                <div className="flex-1">
                  <label htmlFor="biz-name" className="sr-only">
                    Business name
                  </label>
                  <input
                    id="biz-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Business name — e.g. Bright Aadhar Seva Kendra"
                    autoComplete="organization"
                    className="w-full border border-line bg-white px-5 py-4 text-[15px] text-ink outline-none placeholder:text-muted/60 focus:border-gblue"
                    style={{ borderRadius: 16 }}
                  />
                </div>
                <div className="md:w-52">
                  <label htmlFor="biz-city" className="sr-only">
                    City (optional)
                  </label>
                  <input
                    id="biz-city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City (optional)"
                    autoComplete="address-level2"
                    className="w-full border border-line bg-white px-5 py-4 text-[15px] text-ink outline-none placeholder:text-muted/60 focus:border-gblue"
                    style={{ borderRadius: 16 }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={phase === "loading"}
                  className="bg-gblue px-7 py-4 text-[15px] font-semibold text-white transition hover:bg-[#3367d6] active:scale-[0.97] disabled:opacity-50"
                  style={{ borderRadius: 16 }}
                >
                  {phase === "loading" ? "Searching…" : "Find my business"}
                </button>
              </form>
            ) : (
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
                    className="w-full border border-line bg-white px-5 py-4 text-[15px] text-ink outline-none placeholder:text-muted/60 focus:border-gblue"
                    style={{ borderRadius: 16 }}
                  />
                </div>
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  <p className="flex-1 text-[13px] leading-relaxed text-muted">
                    Works with review links, Maps share links (even short{" "}
                    <span className="font-mono">maps.app.goo.gl</span> links), and raw Place IDs.
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
            )}

            {error && (
              <p role="alert" className="mt-4 border border-gred/30 bg-[#fce8e6] px-5 py-3 text-sm text-[#b3261e]" style={{ borderRadius: 14 }}>
                {error}
              </p>
            )}

            {phase === "candidates" && (
              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                  Pick your business — {candidates.length} match{candidates.length === 1 ? "" : "es"}
                </p>
                <ul className="mt-3 space-y-2">
                  {candidates.map((c) => (
                    <li key={c.id}>
                      <button
                        onClick={() => choose(c)}
                        className="flex w-full items-center justify-between gap-4 border border-line bg-white px-5 py-4 text-left transition-colors hover:border-gblue/60"
                        style={{ borderRadius: 16 }}
                      >
                        <span>
                          <span className="block text-[15px] font-semibold text-ink">{c.name || "Unnamed business"}</span>
                          {c.address && <span className="mt-0.5 block text-[13px] text-muted">{c.address}</span>}
                        </span>
                        <span className="shrink-0 text-sm font-semibold text-gblue">Use this →</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {phase === "ready" && reviewUrl && (
          <div id="result" className="mt-6 scroll-mt-24">
            <div className="flex flex-col gap-8 lg:flex-row">
              {/* QR preview */}
              <div className="flex flex-col items-center gap-4">
                <Squircle radius={24} className="border border-line bg-white p-4 shadow-sm">
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
                  className="mt-1 w-full border border-line bg-white px-4 py-3 text-[15px] text-ink outline-none placeholder:text-muted/60 focus:border-gblue"
                  style={{ borderRadius: 12 }}
                />

                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-muted">Step 3 — Print-ready templates</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {TEMPLATES.map((t) => (
                    <div key={t.id} className="border border-line bg-wash p-4" style={{ borderRadius: 16 }}>
                      <p className="text-[15px] font-semibold text-ink">{t.name}</p>
                      <p className="mt-1 text-[13px] leading-relaxed text-muted">{t.description}</p>
                      <button
                        onClick={() => handleDownloadTemplate(t)}
                        disabled={!qr || busyTemplate !== null}
                        className="mt-3 w-full border border-gblue/40 bg-gblue/10 px-4 py-2.5 text-sm font-semibold text-gblue transition-colors hover:bg-gblue/20 disabled:opacity-50"
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
