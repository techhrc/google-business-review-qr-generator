"use client";

// Printable review-card templates, based on the Google-brand reference
// cards (counter display, thank-you card, sticker). Each template is a
// self-contained SVG authored in the reference's own coordinate space and
// scaled to print width via the width/height attributes — vectors stay
// crisp and the layout matches the reference 1:1.
// System font stack only: SVG rasterized via <img> can't see page webfonts.

export interface TemplateDef {
  id: string;
  name: string;
  description: string;
  width: number;
  height: number;
  build: (qrDataUrl: string, businessName: string) => string;
}

// Reference palette
const BLUE = "#4285F4";
const RED = "#EA4335";
const YELLOW = "#FBBC05";
const GREEN = "#34A853";
const INK = "#202124";
const MUTED = "#5f6368";
const STAR = "#F9AB00";
const RAINBOW_MID = "#e8b95f"; // muted gold used in the reference rainbow bar
const HAIRLINE = "#e7e9ec";

const FONT = `'Google Sans Flex','Google Sans',Roboto,system-ui,-apple-system,'Segoe UI',sans-serif`;

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

function wrapLines(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = w;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// Multicolor Google "G" glyph (same paths as the site logo), centered at (cx, cy)
const G_GLYPH = [
  { fill: BLUE, d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" },
  { fill: GREEN, d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" },
  { fill: YELLOW, d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" },
  { fill: RED, d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" },
];

function gMark(cx: number, cy: number, size: number): string {
  const s = (size / 24).toFixed(3);
  const x = (cx - size / 2).toFixed(1);
  const y = (cy - size / 2).toFixed(1);
  const paths = G_GLYPH.map((p) => `<path fill="${p.fill}" d="${p.d}"/>`).join("");
  return `<g transform="translate(${x},${y}) scale(${s})">${paths}</g>`;
}

// Per-letter Google wordmark: G=blue o=red o=yellow g=blue l=green e=red
const G_COLORS = [BLUE, RED, YELLOW, BLUE, GREEN, RED];

function googleWord(
  cx: number,
  y: number,
  size: number,
  text = "Google",
  weight = 700
): string {
  const tspans = [...text]
    .map((ch, i) => `<tspan fill="${G_COLORS[i % G_COLORS.length]}">${esc(ch)}</tspan>`)
    .join("");
  return `<text x="${cx}" y="${y}" text-anchor="middle" font-family="${FONT}" font-size="${size}" font-weight="${weight}" letter-spacing="-0.055em">${tspans}</text>`;
}

function star(cx: number, cy: number, r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.42;
    pts.push(`${(cx + rad * Math.cos(angle)).toFixed(1)},${(cy + rad * Math.sin(angle)).toFixed(1)}`);
  }
  return `<polygon points="${pts.join(" ")}" fill="${STAR}"/>`;
}

function starsRow(cx: number, cy: number, size = 30, gap = 12): string {
  let s = "";
  const total = 5 * size + 4 * gap;
  let x = cx - total / 2 + size / 2;
  for (let i = 0; i < 5; i++) {
    s += star(x, cy, size / 2);
    x += size + gap;
  }
  return s;
}

// Hard-stop rainbow bar, like the reference (.rainbow-bar)
function rainbowDef(id: string): string {
  return `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="${RED}"/><stop offset="0.25" stop-color="${RED}"/>
    <stop offset="0.25" stop-color="${BLUE}"/><stop offset="0.5" stop-color="${BLUE}"/>
    <stop offset="0.5" stop-color="${RAINBOW_MID}"/><stop offset="0.75" stop-color="${RAINBOW_MID}"/>
    <stop offset="0.75" stop-color="${GREEN}"/><stop offset="1" stop-color="${GREEN}"/>
  </linearGradient>`;
}

// QR with the reference's corner accents:
// yellow top, red right, blue bottom, green left.
function qrCorners(x: number, y: number, size: number): string {
  const t = 9;
  const len = size * 0.55;
  const o = (size - len) / 2;
  const f = (n: number) => n.toFixed(2);
  return `<g>
    <rect x="${f(x + o)}" y="${y}" width="${f(len)}" height="${t}" fill="${YELLOW}"/>
    <rect x="${x + size - t}" y="${f(y + o)}" width="${t}" height="${f(len)}" fill="${RED}"/>
    <rect x="${f(x + o)}" y="${y + size - t}" width="${f(len)}" height="${t}" fill="${BLUE}"/>
    <rect x="${x}" y="${f(y + o)}" width="${t}" height="${f(len)}" fill="${GREEN}"/>
    <rect x="${x + 10}" y="${y + 10}" width="${size - 20}" height="${size - 20}" fill="#ffffff"/>
  </g>`;
}

// NFC arcs (white), like the reference sticker badge
function nfcArcs(cx: number, cy: number): string {
  const r1 = 20.5;
  const r2 = 11.5;
  const c1 = 2 * Math.PI * r1;
  const c2 = 2 * Math.PI * r2;
  return `<g fill="none" stroke="#ffffff" stroke-width="3">
    <circle cx="${cx}" cy="${cy}" r="${r1}" stroke-dasharray="${(c1 * 0.72).toFixed(1)} ${(c1 * 0.28).toFixed(1)}" transform="rotate(45 ${cx} ${cy})"/>
    <circle cx="${cx}" cy="${cy}" r="${r2}" stroke-dasharray="${(c2 * 0.72).toFixed(1)} ${(c2 * 0.28).toFixed(1)}" transform="rotate(45 ${cx} ${cy})"/>
  </g>`;
}

const counter: TemplateDef = {
  id: "counter",
  name: "Counter Display",
  description: "Tall card with rainbow bars — made for reception desks and checkout counters.",
  width: 1200,
  height: 1696,
  build: (qr, businessName) => {
    const name = shortName(businessName || "Your Business", 30);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1696" viewBox="0 0 460 650">
      <defs>${rainbowDef("rb-counter")}</defs>
      <rect width="460" height="650" rx="30" fill="#ffffff"/>
      <rect x="42" y="48" width="376" height="10" rx="2" fill="url(#rb-counter)"/>
      <text x="230" y="126" text-anchor="middle" font-family="${FONT}" font-size="50" font-weight="650" letter-spacing="-0.06em" fill="${INK}">review</text>
      <text x="230" y="152" text-anchor="middle" font-family="${FONT}" font-size="22" font-weight="700" letter-spacing="0.02em" fill="${INK}">US ON GOOGLE</text>
      ${qrCorners(105, 180, 250)}
      <image href="${qr}" x="125" y="200" width="210" height="210"/>
      ${gMark(230, 480, 84)}
      ${starsRow(230, 547, 30, 12)}
      <rect x="42" y="575" width="376" height="9" rx="2" fill="url(#rb-counter)"/>
      <text x="230" y="609" text-anchor="middle" font-family="${FONT}" font-size="16" font-weight="600" fill="${MUTED}">${name}</text>
    </svg>`;
  },
};

const thanks: TemplateDef = {
  id: "thanks",
  name: "Thank-You Card",
  description: "Compact card with a rainbow border — slips into bags, receipts, and deliveries.",
  width: 1200,
  height: 1886,
  build: (qr, businessName) => {
    const name = shortName(businessName || "Your Business", 32);
    const lines = wrapLines(
      "We’d love your feedback. Scan the QR code and leave us a Google review.",
      34
    ).slice(0, 3);
    const msg = lines
      .map(
        (ln, i) =>
          `<text x="210" y="${467 + i * 25}" text-anchor="middle" font-family="${FONT}" font-size="17" font-weight="620" fill="${INK}">${esc(ln)}</text>`
      )
      .join("");
    return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1886" viewBox="0 0 420 660">
      <defs>
        <linearGradient id="tb-thanks" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${RED}"/><stop offset="0.18" stop-color="${RED}"/>
          <stop offset="0.28" stop-color="${YELLOW}"/><stop offset="0.48" stop-color="${GREEN}"/>
          <stop offset="0.72" stop-color="${BLUE}"/><stop offset="1" stop-color="${RED}"/>
        </linearGradient>
      </defs>
      <rect width="420" height="660" rx="28" fill="#ffffff"/>
      <rect x="14" y="14" width="392" height="632" rx="22" fill="url(#tb-thanks)"/>
      <rect x="22" y="22" width="376" height="616" rx="17" fill="#ffffff"/>
      <text x="210" y="82" text-anchor="middle" font-family="${FONT}" font-size="24" font-weight="650" fill="${MUTED}">Review us on</text>
      ${googleWord(210, 132, 58)}
      ${starsRow(210, 168, 26, 10)}
      <rect x="95" y="194" width="230" height="230" rx="22" fill="#ffffff" stroke="${HAIRLINE}" stroke-width="1"/>
      <image href="${qr}" x="105" y="204" width="210" height="210"/>
      ${msg}
      <text x="210" y="${467 + lines.length * 25 + 20}" text-anchor="middle" font-family="${FONT}" font-size="14" fill="${MUTED}">${name}</text>
    </svg>`;
  },
};

const sticker: TemplateDef = {
  id: "sticker",
  name: "Sticker / NFC Card",
  description: "Bold Google-color decal — for doors, windows, and tabletops.",
  width: 1200,
  height: 1680,
  build: (qr, businessName) => {
    const name = shortName(businessName || "Your Business", 30);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1680" viewBox="0 0 500 700">
      <defs>
        <clipPath id="clip-sticker"><rect width="500" height="700" rx="34"/></clipPath>
        <linearGradient id="sg-blue-l" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="${BLUE}"/><stop offset="0.18" stop-color="${BLUE}"/>
          <stop offset="0.18" stop-color="${BLUE}" stop-opacity="0"/><stop offset="1" stop-color="${BLUE}" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="sg-red-t" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="${RED}"/><stop offset="0.24" stop-color="${RED}"/>
          <stop offset="0.24" stop-color="${RED}" stop-opacity="0"/><stop offset="1" stop-color="${RED}" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="sg-red-r" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="${RED}" stop-opacity="0"/><stop offset="0.82" stop-color="${RED}" stop-opacity="0"/>
          <stop offset="0.82" stop-color="${RED}"/><stop offset="1" stop-color="${RED}"/>
        </linearGradient>
        <linearGradient id="sg-yellow-b" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="${YELLOW}" stop-opacity="0"/><stop offset="0.74" stop-color="${YELLOW}" stop-opacity="0"/>
          <stop offset="0.74" stop-color="${YELLOW}"/><stop offset="1" stop-color="${YELLOW}"/>
        </linearGradient>
        <linearGradient id="sg-green-l" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="${GREEN}"/><stop offset="0.18" stop-color="${GREEN}"/>
          <stop offset="0.18" stop-color="${GREEN}" stop-opacity="0"/><stop offset="1" stop-color="${GREEN}" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="sg-diag-br" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${BLUE}"/><stop offset="0.17" stop-color="${BLUE}"/>
          <stop offset="0.17" stop-color="${BLUE}" stop-opacity="0"/><stop offset="0.67" stop-color="${RED}" stop-opacity="0"/>
          <stop offset="0.67" stop-color="${RED}"/><stop offset="1" stop-color="${RED}"/>
        </linearGradient>
        <linearGradient id="sg-diag-gy" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stop-color="${GREEN}"/><stop offset="0.19" stop-color="${GREEN}"/>
          <stop offset="0.19" stop-color="${GREEN}" stop-opacity="0"/><stop offset="0.73" stop-color="${YELLOW}" stop-opacity="0"/>
          <stop offset="0.73" stop-color="${YELLOW}"/><stop offset="1" stop-color="${YELLOW}"/>
        </linearGradient>
        <filter id="sh-sticker" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="${INK}" flood-opacity="0.18"/>
        </filter>
      </defs>
      <rect width="500" height="700" rx="34" fill="#ffffff"/>
      <g clip-path="url(#clip-sticker)">
        <rect width="500" height="700" fill="url(#sg-blue-l)"/>
        <rect width="500" height="700" fill="url(#sg-red-t)"/>
        <rect width="500" height="700" fill="url(#sg-red-r)"/>
        <rect width="500" height="700" fill="url(#sg-yellow-b)"/>
        <rect width="500" height="700" fill="url(#sg-green-l)"/>
        <rect width="500" height="700" fill="url(#sg-diag-br)"/>
        <rect width="500" height="700" fill="url(#sg-diag-gy)"/>
      </g>
      ${nfcArcs(450, 46)}
      <rect x="68" y="95" width="364" height="530" rx="28" fill="#ffffff" filter="url(#sh-sticker)"/>
      ${gMark(250, 147, 64)}
      ${starsRow(250, 212, 24, 10)}
      <text x="250" y="262" text-anchor="middle" font-family="${FONT}" font-size="34" font-weight="760" letter-spacing="-0.03em" fill="${INK}">WE’D LOVE</text>
      <text x="250" y="297" text-anchor="middle" font-family="${FONT}" font-size="34" font-weight="760" letter-spacing="-0.03em" fill="${INK}">YOUR FEEDBACK</text>
      <image href="${qr}" x="140" y="313" width="220" height="220"/>
      <text x="250" y="566" text-anchor="middle" font-family="${FONT}" font-size="18" font-weight="750" letter-spacing="0.05em" fill="${INK}">TAP OR SCAN</text>
      <text x="250" y="672" text-anchor="middle" font-family="${FONT}" font-size="15" font-weight="700" fill="#ffffff">${name}</text>
    </svg>`;
  },
};

export const TEMPLATES: TemplateDef[] = [counter, thanks, sticker];

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
