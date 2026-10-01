// Google Places API (New) — Text Search, ID-only.
//
// COST — verified against Google's pricing list
// (https://developers.google.com/maps/billing-and-pricing/pricing):
// the field mask below requests ONLY `places.id`, which bills the
// "Places API Text Search Essentials (IDs Only)" SKU: $0.00 with an
// UNLIMITED free cap. Do NOT add displayName, formattedAddress or any
// other field — those flip the call to the "Text Search Pro" SKU
// ($32 per 1,000 calls after 5,000 free/month).
//
// Because ID-only responses carry no names, we take the top result and
// the user verifies the business on Google's own review page (Step 1
// in the UI) before printing anything.

export function reviewUrl(placeId: string): string {
  return `https://search.google.com/local/writereview?placeid=${placeId}`;
}

// Tiny in-memory LRU cache (per serverless instance): repeat searches
// return instantly and cost zero API calls.
const cache = new Map<string, { ids: string[]; exp: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000;
const CACHE_MAX = 200;

function cacheGet(key: string): string[] | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.exp) {
    cache.delete(key);
    return null;
  }
  // Refresh recency.
  cache.delete(key);
  cache.set(key, entry);
  return entry.ids;
}

function cacheSet(key: string, ids: string[]): void {
  if (cache.size >= CACHE_MAX) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(key, { ids, exp: Date.now() + CACHE_TTL_MS });
}

/** Place IDs for a query (IDs only — free tier). Results are cached. */
export async function textSearchIds(query: string): Promise<string[]> {
  const norm = query.trim().toLowerCase().replace(/\s+/g, " ");
  const hit = cacheGet(norm);
  if (hit) return hit;

  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) throw new Error("GOOGLE_PLACES_API_KEY is not configured");

  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
      // ID-only mask: every call stays on the $0 Essentials (IDs Only) SKU.
      "X-Goog-FieldMask": "places.id",
    },
    body: JSON.stringify({ textQuery: query, maxResultCount: 5 }),
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) {
    throw new Error(`Places API responded with ${res.status}`);
  }

  const data = (await res.json()) as { places?: { id?: string }[] };
  const ids = (data.places ?? [])
    .map((p) => (p.id ?? "").trim())
    .filter((id) => id.length > 0);
  cacheSet(norm, ids);
  return ids;
}

/** Top Place ID for a query, or null when nothing matches. */
export async function textSearchTopId(query: string): Promise<string | null> {
  const ids = await textSearchIds(query);
  return ids[0] ?? null;
}
