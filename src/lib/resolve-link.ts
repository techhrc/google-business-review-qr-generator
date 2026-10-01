// Parses whatever the business owner pastes and turns it into either a
// Place ID (→ review link) or a search query (→ candidate list).
//
// Accepted inputs:
//  1. A Google review link:        .../local/writereview?placeid=ChIJ...
//  2. A Maps link with a Place ID:  /maps/place/?q=place_id:ChIJ...  or  ?query_place_id=ChIJ...
//  3. A short link:                maps.app.goo.gl/xxxx  (resolved server-side)
//  4. A Google Business link:      g.page/r/xxxx  (short link from Business Profile, resolved server-side)
//  5. A plain Maps place link:     /maps/place/<Business-Name>/...  (name → free text search)
//  6. A raw Place ID:              ChIJ...

export type ResolveResult =
  | { kind: "review"; placeId: string }
  | { kind: "search"; query: string }
  | { kind: "error"; message: string };

const RAW_ID_RE = /^(ChIJ[A-Za-z0-9_-]{10,})$/;
const WRITEREVIEW_RE = /[?&]placeid=([A-Za-z0-9_-]+)/i;
const PLACE_ID_PARAM_RE = /(?:place_id|query_place_id)[:=](ChIJ[A-Za-z0-9_-]+)/i;
const MAPS_PLACE_SLUG_RE = /\/maps\/place\/([^/@?]+)/i;

function isGoogleHost(host: string): boolean {
  return (
    host === "google.com" ||
    host.endsWith(".google.com") ||
    host === "maps.app.goo.gl" ||
    host === "goo.gl" ||
    host === "g.page" ||
    host === "business.google.com"
  );
}

export async function resolveBusinessLink(input: string): Promise<ResolveResult> {
  const raw = input.trim();
  if (!raw) return { kind: "error", message: "Paste a link first." };
  if (raw.length > 2000) return { kind: "error", message: "That link is too long." };

  const rawId = raw.match(RAW_ID_RE);
  if (rawId) return { kind: "review", placeId: rawId[1] };

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return { kind: "error", message: "That doesn't look like a valid link." };
  }

  const host = url.hostname.toLowerCase();
  if (!isGoogleHost(host)) {
    return { kind: "error", message: "Please paste a Google Maps or Google review link." };
  }

  // Resolve short links (maps.app.goo.gl / goo.gl/maps / g.page) to the full URL.
  let finalUrl = url.toString();
  if (host === "maps.app.goo.gl" || host === "g.page" || (host === "goo.gl" && url.pathname.startsWith("/maps"))) {
    try {
      const r = await fetch(finalUrl, { redirect: "follow" });
      finalUrl = r.url;
    } catch {
      return {
        kind: "error",
        message: "Couldn't open that short link. Try the full Google Maps link instead.",
      };
    }
  }

  const reviewMatch = finalUrl.match(WRITEREVIEW_RE);
  if (reviewMatch) return { kind: "review", placeId: reviewMatch[1] };

  const paramMatch = finalUrl.match(PLACE_ID_PARAM_RE);
  if (paramMatch) return { kind: "review", placeId: paramMatch[1] };

  // Plain /maps/place/<Name>/ links rarely carry a Place ID — turn the
  // URL slug into a search query and let the free text search resolve it.
  const slugMatch = finalUrl.match(MAPS_PLACE_SLUG_RE);
  if (slugMatch) {
    const name = decodeURIComponent(slugMatch[1]).replace(/\+/g, " ").trim();
    if (name.length >= 2) return { kind: "search", query: name };
  }

  const q = url.searchParams.get("q") || url.searchParams.get("query");
  if (q && q.trim().length >= 2) return { kind: "search", query: q.trim() };

  return {
    kind: "error",
    message: "Couldn't find a business in that link. Try searching by business name instead.",
  };
}
