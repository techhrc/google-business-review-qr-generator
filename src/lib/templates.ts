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

// Official Google brand assets, inlined from public/Google_2026_logo.svg
// (wordmark) and public/Google_Favicon_2025.svg (G icon). They are embedded
// as markup so the self-contained template SVGs rasterize to PNG without
// any external request. Favicon gradient/filter/clip ids are namespaced
// (gi-*) to avoid collisions when several templates share one document.
const GOOGLE_LOGO_VB = "0 0 269.59 81.59";
const GOOGLE_LOGO_PATHS = `<path d="M 31.32,63.35 C 48.97,63.52 60.99,51.67 60.99,33.43 Q 61,31.14 60.56,28.35 H 31.2 v 8.76 H 51.8 C 50.7,48.58 42.62,54.55 31.53,54.55 19.09,54.55 9.57,45.2 9.57,31.61 9.57,18.2 18.67,8.84 31.53,8.84 c 6.48,0 11.26,2 16.04,6.9 L 53.71,9.31 C 48.33,3.01 40.55,0 31.41,0 13.7,0 0,13.29 0,31.48 c 0,17.4 13.25,31.7 31.32,31.87" fill="#3186ff" />
<path d="m 88.2,63.35 c 13.2,0 22.77,-9.69 22.77,-23.15 0,-13.2 -9.35,-22.98 -22.77,-22.98 -12.7,0 -22.68,9.02 -22.68,22.98 0,13.33 9.43,23.15 22.68,23.15 m 0,-8.04 c -8.04,0 -13.67,-6.6 -13.67,-15.1 0,-8.5 5.93,-14.95 13.67,-14.95 8.17,0 13.67,6.6 13.67,14.94 0,8.64 -5.63,15.11 -13.67,15.11" fill="#fc413d" />
<path d="m 137.42,63.35 c 13.29,0 22.77,-9.73 22.77,-23.15 0,-13.2 -9.35,-22.98 -22.77,-22.98 -12.7,0 -22.68,9.02 -22.68,22.98 0,13.33 9.43,23.15 22.68,23.15 m 0,-8.04 c -8.04,0 -13.67,-6.6 -13.67,-15.1 0,-8.5 5.93,-14.95 13.67,-14.95 8.17,0 13.67,6.6 13.67,14.94 0,8.64 -5.63,15.11 -13.67,15.11" fill="#ffbe00" />
<path d="m 185.37,81.59 q 21.51,0 21.5,-24.63 V 18.79 h -8.8 v 5.37 h -0.17 c -2.75,-4.27 -7.96,-6.68 -13.84,-6.68 -12.7,0 -20.44,9.69 -20.44,22.6 0,12.86 7.53,22.34 20.78,22.34 6.52,0 11.34,-3.72 13.37,-6.77 h 0.3 v 3.94 c 0,8.67 -4.49,13.8 -12.82,13.8 -5.46,0 -9.1,-3.01 -11.77,-8.05 l -7.96,3.52 c 4.2,8.84 10.16,12.73 19.85,12.73 m 0,-27.55 c -7.74,0 -12.7,-5.71 -12.7,-14.22 0,-8.2 4.92,-14.13 12.75,-14.13 7.83,0 12.65,5.5 12.65,14.09 0,8.68 -5.08,14.26 -12.7,14.26" fill="#3186ff" />
<path d="m 222.91,1.35 h -9.22 v 60.6 h 9.22 z" fill="#00af57" />
<path d="m 250.17,63.27 a 22.1,22.1 0 0 0 19,-10.54 l -6.86,-4.49 c -3,4.2 -7.1,6.6 -11.72,6.6 a 13.6,13.6 0 0 1 -11.93,-7.23 l 30.93,-13.12 a 20,20 0 0 0 -0.84,-3.22 c -3.69,-9.48 -10.12,-13.8 -18.8,-13.8 -13.24,0 -22.25,9.66 -22.25,23.03 0,13.67 9.47,22.77 22.47,22.77 m -13.5,-22.81 v -0.51 c 0,-8.76 5.03,-14.64 12.95,-14.64 3.76,0 7.15,1.69 9.44,5.67 z" fill="#fc413d" />`;

const GOOGLE_ICON_VB = "0 0 268.1522 273.8827";
const GOOGLE_ICON_INNER = `<defs> <linearGradient id="gi-a"> <stop offset="0" stop-color="#0fbc5c"/> <stop offset="1" stop-color="#0cba65"/> </linearGradient> <linearGradient id="gi-g"> <stop offset=".2312727" stop-color="#0fbc5f"/> <stop offset=".3115468" stop-color="#0fbc5f"/> <stop offset=".3660131" stop-color="#0fbc5e"/> <stop offset=".4575163" stop-color="#0fbc5d"/> <stop offset=".540305" stop-color="#12bc58"/> <stop offset=".6993464" stop-color="#28bf3c"/> <stop offset=".7712418" stop-color="#38c02b"/> <stop offset=".8605665" stop-color="#52c218"/> <stop offset=".9150327" stop-color="#67c30f"/> <stop offset="1" stop-color="#86c504"/> </linearGradient> <linearGradient id="gi-h"> <stop offset=".1416122" stop-color="#1abd4d"/> <stop offset=".2475151" stop-color="#6ec30d"/> <stop offset=".3115468" stop-color="#8ac502"/> <stop offset=".3660131" stop-color="#a2c600"/> <stop offset=".4456735" stop-color="#c8c903"/> <stop offset=".540305" stop-color="#ebcb03"/> <stop offset=".6156363" stop-color="#f7cd07"/> <stop offset=".6993454" stop-color="#fdcd04"/> <stop offset=".7712418" stop-color="#fdce05"/> <stop offset=".8605661" stop-color="#ffce0a"/> </linearGradient> <linearGradient id="gi-f"> <stop offset=".3159041" stop-color="#ff4c3c"/> <stop offset=".6038179" stop-color="#ff692c"/> <stop offset=".7268366" stop-color="#ff7825"/> <stop offset=".884534" stop-color="#ff8d1b"/> <stop offset="1" stop-color="#ff9f13"/> </linearGradient> <linearGradient id="gi-b"> <stop offset=".2312727" stop-color="#ff4541"/> <stop offset=".3115468" stop-color="#ff4540"/> <stop offset=".4575163" stop-color="#ff4640"/> <stop offset=".540305" stop-color="#ff473f"/> <stop offset=".6993464" stop-color="#ff5138"/> <stop offset=".7712418" stop-color="#ff5b33"/> <stop offset=".8605665" stop-color="#ff6c29"/> <stop offset="1" stop-color="#ff8c18"/> </linearGradient> <linearGradient id="gi-d"> <stop offset=".4084578" stop-color="#fb4e5a"/> <stop offset="1" stop-color="#ff4540"/> </linearGradient> <linearGradient id="gi-c"> <stop offset=".1315461" stop-color="#0cba65"/> <stop offset=".2097843" stop-color="#0bb86d"/> <stop offset=".2972969" stop-color="#09b479"/> <stop offset=".3962575" stop-color="#08ad93"/> <stop offset=".4771242" stop-color="#0aa6a9"/> <stop offset=".5684245" stop-color="#0d9cc6"/> <stop offset=".667385" stop-color="#1893dd"/> <stop offset=".7687273" stop-color="#258bf1"/> <stop offset=".8585063" stop-color="#3086ff"/> </linearGradient> <linearGradient id="gi-e"> <stop offset=".3660131" stop-color="#ff4e3a"/> <stop offset=".4575163" stop-color="#ff8a1b"/> <stop offset=".540305" stop-color="#ffa312"/> <stop offset=".6156363" stop-color="#ffb60c"/> <stop offset=".7712418" stop-color="#ffcd0a"/> <stop offset=".8605665" stop-color="#fecf0a"/> <stop offset=".9150327" stop-color="#fecf08"/> <stop offset="1" stop-color="#fdcd01"/> </linearGradient> <linearGradient href="#gi-a" id="gi-s" x1="219.6997" y1="329.5351" x2="254.4673" y2="329.5351" gradientUnits="userSpaceOnUse"/> <radialGradient href="#gi-b" id="gi-m" gradientUnits="userSpaceOnUse" gradientTransform="matrix(-1.936885,1.043001,1.455731,2.555422,290.5254,-400.6338)" cx="109.6267" cy="135.8619" fx="109.6267" fy="135.8619" r="71.46001"/> <radialGradient href="#gi-c" id="gi-n" gradientUnits="userSpaceOnUse" gradientTransform="matrix(-3.512595,-4.45809,-1.692547,1.260616,870.8006,191.554)" cx="45.25866" cy="279.2738" fx="45.25866" fy="279.2738" r="71.46001"/> <radialGradient href="#gi-d" id="gi-l" cx="304.0166" cy="118.0089" fx="304.0166" fy="118.0089" r="47.85445" gradientTransform="matrix(2.064353,-4.926832e-6,-2.901531e-6,2.592041,-297.6788,-151.7469)" gradientUnits="userSpaceOnUse"/> <radialGradient href="#gi-e" id="gi-o" gradientUnits="userSpaceOnUse" gradientTransform="matrix(-0.2485783,2.083138,2.962486,0.3341668,-255.1463,-331.1636)" cx="181.001" cy="177.2013" fx="181.001" fy="177.2013" r="71.46001"/> <radialGradient href="#gi-f" id="gi-p" cx="207.6733" cy="108.0972" fx="207.6733" fy="108.0972" r="41.1025" gradientTransform="matrix(-1.249206,1.343263,-3.896837,-3.425693,880.5011,194.9051)" gradientUnits="userSpaceOnUse"/> <radialGradient href="#gi-g" id="gi-r" gradientUnits="userSpaceOnUse" gradientTransform="matrix(-1.936885,-1.043001,1.455731,-2.555422,290.5254,838.6834)" cx="109.6267" cy="135.8619" fx="109.6267" fy="135.8619" r="71.46001"/> <radialGradient href="#gi-h" id="gi-j" gradientUnits="userSpaceOnUse" gradientTransform="matrix(-0.081402,-1.93722,2.926737,-0.1162508,-215.1345,632.8606)" cx="154.8697" cy="145.9691" fx="154.8697" fy="145.9691" r="71.46001"/> <filter id="gi-q" x="-.04842873" y="-.0582241" width="1.096857" height="1.116448" color-interpolation-filters="sRGB"> <feGaussianBlur stdDeviation="1.700914"/> </filter> <filter id="gi-k" x="-.01670084" y="-.01009856" width="1.033402" height="1.020197" color-interpolation-filters="sRGB"> <feGaussianBlur stdDeviation=".2419367"/> </filter> <clipPath clipPathUnits="userSpaceOnUse" id="gi-i"> <path d="M371.3784 193.2406H237.0825v53.4375h77.167c-1.2405 7.5627-4.0259 15.0024-8.1049 21.7862-4.6734 7.7723-10.4511 13.6895-16.373 18.1957-17.7389 13.4983-38.42 16.2584-52.7828 16.2584-36.2824 0-67.2833-23.2865-79.2844-54.9287-.4843-1.1482-.8059-2.3344-1.1975-3.5068-2.652-8.0533-4.101-16.5825-4.101-25.4474 0-9.226 1.5691-18.0575 4.4301-26.3985 11.2851-32.8967 42.9849-57.4674 80.1789-57.4674 7.4811 0 14.6854.8843 21.5173 2.6481 15.6135 4.0309 26.6578 11.9698 33.4252 18.2494l40.834-39.7111c-24.839-22.616-57.2194-36.3201-95.8444-36.3201-30.8782-.00066-59.3863 9.55308-82.7477 25.6992-18.9454 13.0941-34.4833 30.6254-44.9695 50.9861-9.75366 18.8785-15.09441 39.7994-15.09441 62.2934 0 22.495 5.34891 43.6334 15.10261 62.3374v.126c10.3023 19.8567 25.3678 36.9537 43.6783 49.9878 15.9962 11.3866 44.6789 26.5516 84.0307 26.5516 22.6301 0 42.6867-4.0517 60.3748-11.6447 12.76-5.4775 24.0655-12.6217 34.3012-21.8036 13.5247-12.1323 24.1168-27.1388 31.3465-44.4041 7.2297-17.2654 11.097-36.7895 11.097-57.957 0-9.858-.9971-19.8694-2.6881-28.9684Z" fill="#000"/> </clipPath> </defs> <g transform="matrix(0.957922,0,0,0.985255,-90.17436,-78.85577)"> <g clip-path="url(#gi-i)"> <path d="M92.07563 219.9585c.14844 22.14 6.5014 44.983 16.11767 63.4234v.1269c6.9482 13.3919 16.4444 23.9704 27.2604 34.4518l65.326-23.67c-12.3593-6.2344-14.2452-10.0546-23.1048-17.0253-9.0537-9.0658-15.8015-19.4735-20.0038-31.677h-.1693l.1693-.1269c-2.7646-8.0587-3.0373-16.6129-3.1393-25.5029Z" fill="url(#gi-j)" filter="url(#gi-k)"/> <path d="M237.0835 79.02491c-6.4568 22.52569-3.988 44.42139 0 57.16129 7.4561.0055 14.6388.8881 21.4494 2.6464 15.6135 4.0309 26.6566 11.97 33.424 18.2496l41.8794-40.7256c-24.8094-22.58904-54.6663-37.2961-96.7528-37.33169Z" fill="url(#gi-l)" filter="url(#gi-k)"/> <path d="M236.9434 78.84678c-31.6709-.00068-60.9107 9.79833-84.8718 26.35902-8.8968 6.149-17.0612 13.2521-24.3311 21.1509-1.9045 17.7429 14.2569 39.5507 46.2615 39.3702 15.5284-17.9373 38.4946-29.5427 64.0561-29.5427.0233 0 .046.0019.0693.002l-1.0439-57.33536c-.0472-.00003-.0929-.00406-.1401-.00406Z" fill="url(#gi-m)" filter="url(#gi-k)"/> <path d="m341.4751 226.3788-28.2685 19.2848c-1.2405 7.5627-4.0278 15.0023-8.1068 21.7861-4.6734 7.7723-10.4506 13.6898-16.3725 18.196-17.7022 13.4704-38.3286 16.2439-52.6877 16.2553-14.8415 25.1018-17.4435 37.6749 1.0439 57.9342 22.8762-.0167 43.157-4.1174 61.0458-11.7965 12.9312-5.551 24.3879-12.7913 34.7609-22.0964 13.7061-12.295 24.4421-27.5034 31.7688-45.0003 7.3267-17.497 11.2446-37.2822 11.2446-58.7336Z" fill="url(#gi-n)" filter="url(#gi-k)"/> <path d="M234.9956 191.2104v57.4981h136.0062c1.1962-7.8745 5.1523-18.0644 5.1523-26.5001 0-9.858-.9963-21.899-2.6873-30.998Z" fill="#3086ff" filter="url(#gi-k)"/> <path d="M128.3894 124.3268c-8.393 9.1191-15.5632 19.326-21.2483 30.3646-9.75351 18.8785-15.09402 41.8295-15.09402 64.3235 0 .317.02642.6271.02855.9436 4.31953 8.2244 59.66647 6.6495 62.45617 0-.0035-.3103-.0387-.6128-.0387-.9238 0-9.226 1.5696-16.0262 4.4306-24.3672 3.5294-10.2885 9.0557-19.7628 16.1223-27.9257 1.6019-2.0309 5.8748-6.3969 7.1214-9.0157.4749-.9975-.8621-1.5574-.9369-1.9085-.0836-.3927-1.8762-.0769-2.2778-.3694-1.2751-.9288-3.8001-1.4138-5.3334-1.8449-3.2772-.9215-8.7085-2.9536-11.7252-5.0601-9.5357-6.6586-24.417-14.6122-33.5047-24.2164Z" fill="url(#gi-o)" filter="url(#gi-k)"/> <path d="M162.0989 155.8569c22.1123 13.3013 28.4714-6.7139 43.173-12.9771L179.698 90.21568c-9.4075 3.92642-18.2957 8.80465-26.5426 14.50442-12.316 8.5122-23.192 18.8995-32.1763 30.7204Z" fill="url(#gi-p)" filter="url(#gi-q)"/> <path d="M171.0987 290.222c-29.6829 10.6413-34.3299 11.023-37.0622 29.2903 5.2213 5.0597 10.8312 9.74 16.7926 13.9835 15.9962 11.3867 46.766 26.5517 86.1178 26.5517.0462 0 .0904-.004.1366-.004v-59.1574c-.0298.0001-.064.002-.0938.002-14.7359 0-26.5113-3.8435-38.5848-10.5273-2.9768-1.6479-8.3775 2.7772-11.1229.799-3.7865-2.7284-12.8991 2.3508-16.1833-.9378Z" fill="url(#gi-r)" filter="url(#gi-k)"/> <path d="M219.6997 299.0227v59.9959c5.506.6402 11.2361 1.0289 17.2472 1.0289 6.0259 0 11.8556-.3073 17.5204-.8723v-59.7481c-6.3482 1.0777-12.3272 1.461-17.4776 1.461-5.9318 0-11.7005-.6858-17.29-1.8654Z" opacity=".5" fill="url(#gi-s)" filter="url(#gi-k)"/> </g> </g>`;

// Google wordmark logo, centered at (cx) with its top at y.
function googleLogo(cx: number, y: number, width: number): string {
  const h = (width * 81.59) / 269.59;
  const f = (n: number) => n.toFixed(1);
  return `<svg x="${f(cx - width / 2)}" y="${f(y)}" width="${f(width)}" height="${f(h)}" viewBox="${GOOGLE_LOGO_VB}">${GOOGLE_LOGO_PATHS}</svg>`;
}

// Google "G" icon, centered at (cx, cy) with the given width.
function googleIcon(cx: number, cy: number, width: number): string {
  const h = (width * 273.8827) / 268.1522;
  const f = (n: number) => n.toFixed(1);
  return `<svg x="${f(cx - width / 2)}" y="${f(cy - h / 2)}" width="${f(width)}" height="${f(h)}" viewBox="${GOOGLE_ICON_VB}">${GOOGLE_ICON_INNER}</svg>`;
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
      <text x="230" y="98" text-anchor="middle" font-family="${FONT}" font-size="20" font-weight="700" letter-spacing="0.18em" fill="${MUTED}">REVIEW US ON</text>
      ${googleLogo(230, 114, 190)}
      ${qrCorners(105, 192, 250)}
      <image href="${qr}" x="125" y="212" width="210" height="210"/>
      ${googleIcon(230, 480, 84)}
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
      <text x="210" y="78" text-anchor="middle" font-family="${FONT}" font-size="24" font-weight="650" fill="${MUTED}">Review us on</text>
      ${googleLogo(210, 96, 200)}
      ${starsRow(210, 184, 26, 10)}
      <rect x="95" y="210" width="230" height="230" rx="22" fill="#ffffff" stroke="${HAIRLINE}" stroke-width="1"/>
      <image href="${qr}" x="105" y="220" width="210" height="210"/>
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
      ${googleIcon(250, 147, 64)}
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
