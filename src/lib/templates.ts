"use client";

// Printable review-card templates. Each template is a self-contained SVG
// string (system fonts only — SVG rasterized via <img> can't see page
// webfonts), converted to a high-res PNG in the browser. No server, no cost.

export interface TemplateDef {
  id: string;
  name: string;
  description: string;
  width: number;
  height: number;
  build: (qrDataUrl: string, businessName: string) => string;
}

const FONT = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function shortName(name: string, max = 42): string {
  const t = name.trim();
  return esc(t.length > max ? t.slice(0, max - 1) + "…" : t);
}

// Official Google "G" (multicolor), 24x24 viewBox.
function gMark(x: number, y: number, size: number): string {
  return `<g transform="translate(${x},${y}) scale(${size / 24})">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </g>`;
}

function star(cx: number, cy: number, r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.42;
    pts.push(`${(cx + rad * Math.cos(angle)).toFixed(1)},${(cy + rad * Math.sin(angle)).toFixed(1)}`);
  }
  return `<polygon points="${pts.join(" ")}" fill="#FBBC05"/>`;
}

function starsRow(cx: number, cy: number, size = 34, gap = 14): string {
  let s = "";
  const total = 5 * size + 4 * gap;
  let x = cx - total / 2 + size / 2;
  for (let i = 0; i < 5; i++) {
    s += star(x, cy, size / 2);
    x += size + gap;
  }
  return s;
}

function qrTile(qr: string, x: number, y: number, size: number, radius = 36): string {
  return `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${radius}" fill="#ffffff"/>
    <image href="${qr}" x="${x + 28}" y="${y + 28}" width="${size - 56}" height="${size - 56}"/>`;
}

const classic: TemplateDef = {
  id: "classic",
  name: "Review Card",
  description: "The all-rounder — counter, reception desk, packaging inserts.",
  width: 1200,
  height: 1500,
  build: (qr, businessName) => {
    const name = shortName(businessName || "Your Business");
    return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1500" viewBox="0 0 1200 1500">
      <rect width="1200" height="1500" fill="#0c0e13"/>
      <rect x="60" y="60" width="1080" height="1380" rx="48" fill="#141821" stroke="#262d3a" stroke-width="2"/>
      ${gMark(548, 150, 104)}
      <text x="600" y="360" text-anchor="middle" font-family="${FONT}" font-size="30" letter-spacing="6" fill="#8b94a7">GOOGLE REVIEW</text>
      <text x="600" y="470" text-anchor="middle" font-family="${FONT}" font-size="72" font-weight="700" fill="#f4f6fa">Review us on Google</text>
      ${starsRow(600, 560, 40, 16)}
      ${qrTile(qr, 370, 660, 460, 44)}
      <text x="600" y="1215" text-anchor="middle" font-family="${FONT}" font-size="44" font-weight="600" fill="#f4f6fa">${name}</text>
      <text x="600" y="1285" text-anchor="middle" font-family="${FONT}" font-size="28" fill="#8b94a7">Scan with your phone camera to leave a review</text>
    </svg>`;
  },
};

const tent: TemplateDef = {
  id: "tent",
  name: "Table Tent",
  description: "Tall and bold — made for restaurant tables and waiting areas.",
  width: 1200,
  height: 1600,
  build: (qr, businessName) => {
    const name = shortName(businessName || "Your Business");
    return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1600" viewBox="0 0 1200 1600">
      <rect width="1200" height="1600" fill="#0c0e13"/>
      <rect x="60" y="60" width="1080" height="1480" rx="48" fill="#141821" stroke="#262d3a" stroke-width="2"/>
      <rect x="60" y="60" width="1080" height="420" rx="48" fill="#1a2130"/>
      <rect x="60" y="380" width="1080" height="100" fill="#1a2130"/>
      ${gMark(140, 170, 88)}
      <text x="260" y="228" font-family="${FONT}" font-size="34" letter-spacing="5" fill="#8b94a7">GOOGLE REVIEW</text>
      <text x="260" y="300" font-family="${FONT}" font-size="30" fill="#c6cddb">${name}</text>
      <text x="600" y="660" text-anchor="middle" font-family="${FONT}" font-size="88" font-weight="700" fill="#f4f6fa">Enjoyed your</text>
      <text x="600" y="760" text-anchor="middle" font-family="${FONT}" font-size="88" font-weight="700" fill="#f4f6fa">visit?</text>
      ${starsRow(600, 850, 36, 14)}
      ${qrTile(qr, 400, 940, 400, 40)}
      <text x="600" y="1440" text-anchor="middle" font-family="${FONT}" font-size="32" fill="#c6cddb">Scan to share your experience</text>
      <text x="600" y="1490" text-anchor="middle" font-family="${FONT}" font-size="26" fill="#8b94a7">It takes less than a minute</text>
    </svg>`;
  },
};

const thanks: TemplateDef = {
  id: "thanks",
  name: "Thank-You Card",
  description: "Landscape layout — receipts, delivery bags, email footers.",
  width: 1600,
  height: 1200,
  build: (qr, businessName) => {
    const name = shortName(businessName || "Your Business", 30);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1200" viewBox="0 0 1600 1200">
      <rect width="1600" height="1200" fill="#0c0e13"/>
      <rect x="60" y="60" width="1480" height="1080" rx="48" fill="#141821" stroke="#262d3a" stroke-width="2"/>
      ${gMark(180, 220, 96)}
      <text x="180" y="400" font-family="${FONT}" font-size="30" letter-spacing="6" fill="#8b94a7">THANK YOU</text>
      <text x="180" y="500" font-family="${FONT}" font-size="76" font-weight="700" fill="#f4f6fa">Loved your</text>
      <text x="180" y="590" font-family="${FONT}" font-size="76" font-weight="700" fill="#f4f6fa">experience?</text>
      <text x="180" y="680" font-family="${FONT}" font-size="34" fill="#c6cddb">Tell the world — review ${name}</text>
      <text x="180" y="740" font-family="${FONT}" font-size="34" fill="#c6cddb">on Google.</text>
      ${starsRow(330, 860, 36, 14)}
      <text x="180" y="980" font-family="${FONT}" font-size="26" fill="#8b94a7">Point your phone camera at the code →</text>
      ${qrTile(qr, 1050, 330, 400, 40)}
    </svg>`;
  },
};

const minimal: TemplateDef = {
  id: "minimal",
  name: "Sticker",
  description: "Compact square — stickers, window decals, social posts.",
  width: 1200,
  height: 1200,
  build: (qr, businessName) => {
    const name = shortName(businessName || "Your Business", 30);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200">
      <rect width="1200" height="1200" fill="#0c0e13"/>
      <rect x="60" y="60" width="1080" height="1080" rx="48" fill="#141821" stroke="#262d3a" stroke-width="2"/>
      ${gMark(552, 130, 96)}
      <text x="600" y="330" text-anchor="middle" font-family="${FONT}" font-size="52" font-weight="700" fill="#f4f6fa">Scan to review us</text>
      <text x="600" y="385" text-anchor="middle" font-family="${FONT}" font-size="30" fill="#8b94a7">on Google · ${name}</text>
      ${qrTile(qr, 360, 450, 480, 44)}
      ${starsRow(600, 1020, 30, 12)}
    </svg>`;
  },
};

export const TEMPLATES: TemplateDef[] = [classic, tent, thanks, minimal];

export async function templateToPng(
  template: TemplateDef,
  qrDataUrl: string,
  businessName: string,
  scale = 2
): Promise<string> {
  const svg = template.build(qrDataUrl, businessName);
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Could not render template"));
      img.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = template.width * scale;
    canvas.height = template.height * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png");
  } finally {
    URL.revokeObjectURL(url);
  }
}
