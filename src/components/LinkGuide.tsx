"use client";

import { useEffect, useState } from "react";

type Device = "web" | "ios" | "android";

const DEVICES: { id: Device; label: string }[] = [
  { id: "web", label: "Web" },
  { id: "ios", label: "iPhone" },
  { id: "android", label: "Android" },
];

function detectDevice(): Device {
  if (typeof window === "undefined") return "web";
  const ua = navigator.userAgent || "";
  if (/android/i.test(ua)) return "android";
  if (/iphone|ipod/i.test(ua)) return "ios";
  if (/ipad/i.test(ua)) return "ios";
  // iPadOS 13+ reports itself as Macintosh — touch points give it away.
  if (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1) return "ios";
  return "web";
}

interface Method {
  title: string;
  steps: string[];
}

const GUIDES: Record<Device, Method[]> = {
  web: [
    {
      title: "From Google Maps",
      steps: [
        "Go to **google.com/maps** and search for your business name.",
        "Click your business in the results to open its profile panel.",
        "Click the **Share** button.",
        "Click **Copy link** in the popup.",
        "Paste the link in the box above — done.",
      ],
    },
    {
      title: "From your Google Business dashboard",
      steps: [
        "Go to **business.google.com** and select your business.",
        "On the Home screen, find the **“Ask for reviews”** card.",
        "Click **Share review form** and copy the link it shows.",
        "Paste it in the box above — this link opens your review form directly.",
      ],
    },
  ],
  ios: [
    {
      title: "From the Google Maps app",
      steps: [
        "Open the **Google Maps** app.",
        "Search for your business and tap it to open its profile.",
        "Tap the **Share** button.",
        "Tap **Copy**.",
        "Paste the link in the box above — done.",
      ],
    },
    {
      title: "From your Google Business dashboard",
      steps: [
        "In Safari or Chrome, go to **business.google.com** and select your business.",
        "On the Home screen, find the **“Ask for reviews”** card.",
        "Tap **Share review form** and copy the link it shows.",
        "Paste it in the box above — this link opens your review form directly.",
      ],
    },
  ],
  android: [
    {
      title: "From the Google Maps app",
      steps: [
        "Open the **Google Maps** app.",
        "Search for your business and tap it to open its profile.",
        "Tap **Share** (scroll the button row sideways if you don't see it).",
        "Tap **Copy to clipboard**.",
        "Paste the link in the box above — done.",
      ],
    },
    {
      title: "From your Google Business dashboard",
      steps: [
        "In Chrome, go to **business.google.com** and select your business.",
        "On the Home screen, find the **“Ask for reviews”** card.",
        "Tap **Share review form** and copy the link it shows.",
        "Paste it in the box above — this link opens your review form directly.",
      ],
    },
  ],
};

/** Renders **bold** segments inside a step string. */
function renderStep(text: string, key: number) {
  const parts = text.split("**");
  return (
    <span key={key}>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-semibold text-ink">
            {p}
          </strong>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </span>
  );
}

const NUM_COLORS = ["bg-gblue", "bg-gred", "bg-gyellow", "bg-ggreen"];

export function LinkGuide() {
  const [device, setDevice] = useState<Device>("web");
  const [auto, setAuto] = useState(true);

  // Detect after mount so the first paint matches the server render.
  useEffect(() => {
    const t = setTimeout(() => setDevice(detectDevice()), 0);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="mt-8" aria-label="How to get your Google link">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
          How to get your link
        </p>
        <div className="flex gap-1" role="tablist" aria-label="Choose your device">
          {DEVICES.map((d) => (
            <button
              key={d.id}
              role="tab"
              aria-selected={device === d.id}
              onClick={() => {
                setDevice(d.id);
                setAuto(false);
              }}
              className={`px-3 py-1.5 text-[13px] font-semibold transition-colors ${
                device === d.id ? "bg-ink text-white" : "text-muted hover:text-ink"
              }`}
              style={{ borderRadius: 999 }}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>
      {auto && (
        <p className="mt-1 text-[12px] text-muted">
          Showing steps for your device — switch anytime.
        </p>
      )}

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {GUIDES[device].map((method) => (
          <div key={method.title} className="bg-wash p-5" style={{ borderRadius: 18 }}>
            <p className="text-[14px] font-semibold text-ink">{method.title}</p>
            <ol className="mt-3 space-y-2.5">
              {method.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center text-[12px] font-bold text-white ${NUM_COLORS[i % NUM_COLORS.length]}`}
                    style={{ borderRadius: 999 }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-[13.5px] leading-relaxed text-muted">
                    {renderStep(step, i)}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>

      <div className="mt-3 bg-wash p-5" style={{ borderRadius: 18 }}>
        <p className="text-[14px] font-semibold text-ink">Already have a link?</p>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">
          Paste it directly — a review link with <code className="text-ink">placeid=</code> in
          it, a <code className="text-ink">maps.app.goo.gl</code>,{" "}
          <code className="text-ink">g.page</code> or{" "}
          <code className="text-ink">share.google</code> short link, or a raw Place ID
          (starts with <code className="text-ink">ChIJ</code>) all work.
        </p>
      </div>
    </div>
  );
}
