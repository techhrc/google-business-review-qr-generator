# Google Review QR — Free QR Code Generator

**Find your business and create a Google review QR code in seconds.** No sign-up, no watermark, no cost.

A one-page tool for local businesses: search your business by name, or paste any Google Maps link — get a scannable QR code that opens your Google review page directly, plus print-ready review cards (review card, table tent, thank-you card, sticker).

> **Not affiliated with Google LLC.** "Google" is a trademark of Google LLC.

## How it works

1. **Search business tab** — enter your exact business name and city. The server looks up your Google Place ID and builds your review link.
2. **Paste a link tab** — paste a Google review link, a Maps share link (even short `maps.app.goo.gl` links), or a raw Place ID. The server resolves it to your review link.
3. **Verify** — open the generated review link and confirm Google shows *your* business name and photos before printing.
4. **Download** — grab the QR as a PNG, or download any of the four print-ready templates with your business name on them.

The QR encodes:

```text
https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID
```

## Zero-cost design

Google's Places **Text Search Essentials (IDs Only)** tier is unlimited and free. This project requests **only** the `places.id` field:

```text
places.id
```

It deliberately does **not** request `displayName` or `formattedAddress` — those flip the call into Text Search Pro (paid). The trade-off: search by exact business name + city, then verify on Google's review page before printing. This keeps the tool free forever, at any volume.

## Tech stack

- [Next.js](https://nextjs.org) 16 (App Router) + TypeScript + Tailwind CSS v4
- [cube-motion](https://www.npmjs.com/package/cube-motion) — scroll reveals and mount animations
- [@spatio-labs/squircle](https://www.npmjs.com/package/@spatio-labs/squircle) — true continuous (squircle) corners
- [qrcode](https://www.npmjs.com/package/qrcode) — client-side QR generation
- No database, no auth, no tracking. API routes are rate-limited (20 req/min/IP, in-memory).

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

Copy `.env.example` to `.env`:

| Variable | Required | Description |
|---|---|---|
| `GOOGLE_PLACES_API_KEY` | Yes (for name search) | Google Cloud API key with **Places API (New)** → Text Search enabled. **Server-side only** — never prefix with `NEXT_PUBLIC_`. |
| `NEXT_PUBLIC_SITE_URL` | Yes | Canonical site URL, e.g. `https://googlereviewqr.vercel.app`. Used for canonical tags, sitemap, and social metadata. |

The **Paste a link** tab works without an API key (link resolution is keyless). Only the **Search business** tab needs the key.

### Scripts

```bash
npm run dev    # start dev server
npm run build  # production build
npm run start  # run production build
npm run lint   # eslint
```

## Deploying to Vercel (free)

1. Push this repo to GitHub (or import the folder directly).
2. In Vercel, **Add New → Project → Import** the repository.
3. Add environment variables:
   - `GOOGLE_PLACES_API_KEY` = your key
   - `NEXT_PUBLIC_SITE_URL` = your `https://<project>.vercel.app` URL
4. Deploy. That's it — no build settings to change, no database to provision.

### Getting a Google Places API key

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → create/select a project.
2. **APIs & Services → Library** → enable **Places API (New)**.
3. **APIs & Services → Credentials** → Create Credentials → API key.
4. Restrict the key: under *API restrictions* select **Places API (New)** only. Add HTTP-referrer or IP restrictions for production.

## API routes

| Route | Method | Description |
|---|---|---|
| `/api/search` | `GET ?name=&city=` | Places Text Search (ID-only field mask) → `{ placeId, reviewUrl }`. Requires `GOOGLE_PLACES_API_KEY`. |
| `/api/resolve` | `POST { input }` | Resolves review links, Maps URLs (incl. `place_id` / `query_place_id` params), `maps.app.goo.gl` short links (via redirect), Maps place slugs (via search), and raw Place IDs → `{ placeId, reviewUrl }`. |

Both are rate-limited to 20 requests/minute per IP. Errors never leak the API key or config details.

## SEO

- Title: *Free Google Review QR Code Generator | No Sign-Up*
- `WebApplication`, `FAQPage`, and `Organization` JSON-LD
- Dynamic OG image (`/opengraph-image`), Twitter cards, canonical URL
- `robots.ts` (disallows `/api/`), `sitemap.ts`, `public/llms.txt`
- Server-rendered FAQ, how-it-works, and benefits copy for crawlability

## Project structure

```text
src/
  app/
    page.tsx            # one-page composition (hero, generator, how-it-works, templates, FAQ, CTA, footer)
    layout.tsx          # metadata, JSON-LD, fonts
    opengraph-image.tsx # dynamic 1200×630 OG image
    robots.ts / sitemap.ts
    api/search/route.ts   # Places ID-only text search
    api/resolve/route.ts  # link / Place ID resolver
  components/
    Generator.tsx       # search + paste-link tabs, verify step, QR display, template downloads
    TemplateGallery.tsx # SVG template previews
    Faq.tsx / Logo.tsx / Squircle.tsx
  lib/
    places.ts / resolve-link.ts  # Places API + URL parsing
    qr.ts / templates.ts         # QR generation + printable SVG templates
    rate-limit.ts
```

## License

MIT. This project is not affiliated with Google LLC.
