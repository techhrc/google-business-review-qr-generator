// Parses whatever the business owner pastes and turns it into a Place ID
// (→ review link). No Places API is used — every accepted input either
// carries the Place ID directly or is a short link we follow server-side.
//
// Accepted inputs:
//  1. A Google review link:        .../local/writereview?placeid=ChIJ...
//  2. A Maps link with a Place ID:  /maps/place/?q=place_id:ChIJ...  or  ?query_place_id=ChIJ...
//  3. A short link:                maps.app.goo.gl/xxxx  (resolved server-side)
//  4. A Google Business link:      g.page/r/xxxx or share.google/xxxx  (short links, resolved server-side)
//  5. A raw Place ID:              ChIJ...
//
// NOT accepted: plain /maps/place/<Business-Name>/ address-bar URLs — they
// contain no Place ID. The error message guides the user to the Share button.

export type ResolveResult =
  | { kind: "review"; placeId: string }
  | { kind: "error"; message: string };

const RAW_ID_RE = /^(ChIJ[A-Za-z0-9_-]{10,})$/;
const WRITEREVIEW_RE = /[?&]placeid=([A-Za-z0-9_-]+)/i;
const PLACE_ID_PARAM_RE = /(?:place_id|query_place_id)[:=](ChIJ[A-Za-z0-9_-]+)/i;
const MAPS_PLACE_SLUG_RE = /\/maps\/place\/([^/@?]+)/i;

const SHARE_GUIDANCE =
  "That link doesn't contain a business ID. In Google Maps, open your business, tap Share, and paste that link instead — the guide below shows how.";

function isGoogleHost(host: string): boolean {
  return (
    host === "google.com" ||
    host.endsWith(".google.com") ||
    host === "maps.app.goo.gl" ||
    host === "goo.gl" ||
    host === "g.page" ||
    host === "business.google.com" ||
    host === "share.google"
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
    return { kind: "error", message: "Please paste a Google Maps, Google Business, or review link." };
  }

  // Resolve short links (maps.app.goo.gl / goo.gl/maps / g.page / share.google) to the full URL.
  let finalUrl = url.toString();
  if (
    host === "maps.app.goo.gl" ||
    host === "g.page" ||
    host === "share.google" ||
    (host === "goo.gl" && url.pathname.startsWith("/maps"))
  ) {
    try {
      const r = await fetch(finalUrl, {
        redirect: "follow",
        signal: AbortSignal.timeout(8000),
      });
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

  // Plain /maps/place/<Name>/ links carry no Place ID — guide the user to Share.
  if (MAPS_PLACE_SLUG_RE.test(finalUrl)) {
    return { kind: "error", message: SHARE_GUIDANCE };
  }

  const q = url.searchParams.get("q") || url.searchParams.get("query");
  if (q && q.trim().length >= 2) {
    return { kind: "error", message: SHARE_GUIDANCE };
  }

  return {
    kind: "error",
    message: "Couldn't find a business in that link. Try the Share button in Google Maps instead — the guide below shows how.",
  };
}
