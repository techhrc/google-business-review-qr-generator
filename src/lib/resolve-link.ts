// Parses whatever the business owner pastes and turns it into a Place ID
// (→ review link).
//
// Resolution order:
//   1. Place ID already present — review link (?placeid=), Maps URL with
//      place_id=/query_place_id=, or a raw Place ID → direct, no API.
//   2. Short link (maps.app.goo.gl / goo.gl/maps / g.page / share.google)
//      → follow server-side, then treat like (3).
//   3. /maps/place/<slug>/ URL → the slug carries the business name and often
//      coordinates for free; resolve via ID-only Places Text Search
//      (free Essentials tier), biased to those coordinates.
//
// Accepted inputs are Google Maps, Google Business, or review links.

import { textSearchPlaceId } from "./places";

export type ResolveResult =
  | { kind: "review"; placeId: string; label?: string }
  | { kind: "error"; message: string };

const RAW_ID_RE = /^(ChIJ[A-Za-z0-9_-]{10,})$/;
const WRITEREVIEW_RE = /[?&]placeid=([A-Za-z0-9_-]+)/i;
const PLACE_ID_PARAM_RE = /(?:place_id|query_place_id)[:=](ChIJ[A-Za-z0-9_-]+)/i;
const MAPS_PLACE_SLUG_RE = /\/maps\/place\/([^/@?]+)/i;
const COORDS_AT_RE = /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/;
const COORDS_DATA_RE = /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/;

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

function isShortLink(host: string, pathname: string): boolean {
  return (
    host === "maps.app.goo.gl" ||
    host === "g.page" ||
    host === "share.google" ||
    (host === "goo.gl" && pathname.startsWith("/maps"))
  );
}

/** "Mathura+Taxi+Hub,+Adarsh+Nagar..." → "Mathura Taxi Hub" */
export function slugToName(slug: string): string {
  try {
    const decoded = decodeURIComponent(slug.replace(/\+/g, " "));
    return decoded.split(",")[0].replace(/\s+/g, " ").trim();
  } catch {
    return "";
  }
}

function extractCoords(url: string): { lat: number; lng: number } | null {
  const m = url.match(COORDS_AT_RE) || url.match(COORDS_DATA_RE);
  if (!m) return null;
  const lat = parseFloat(m[1]);
  const lng = parseFloat(m[2]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng };
}

export async function resolveBusinessLink(input: string): Promise<ResolveResult> {
  const raw = input.trim();
  if (!raw) return { kind: "error", message: "Paste a link first." };
  if (raw.length > 2000) return { kind: "error", message: "That link is too long." };

  // 1. Raw Place ID or a link that already carries one — no API needed.
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

  // 2. Follow short links to the full Maps URL.
  let finalUrl = url.toString();
  if (isShortLink(host, url.pathname)) {
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

  // 3. /maps/place/<slug>/ — name (+ often coords) are in the URL for free;
  //    resolve the ID with an ID-only Text Search (free Essentials tier).
  const slugMatch = finalUrl.match(MAPS_PLACE_SLUG_RE);
  if (slugMatch) {
    const name = slugToName(slugMatch[1]);
    if (name.length >= 2) {
      const coords = extractCoords(finalUrl);
      const placeId = await textSearchPlaceId(
        name,
        coords?.lat,
        coords?.lng
      );
      if (placeId) return { kind: "review", placeId, label: name };
    }
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
