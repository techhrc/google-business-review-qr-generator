// Link-only system with a free fallback for share links.
//
// Resolution order for a pasted input:
//   1. Place ID already present (review link, place_id param, raw ID) → direct, no API.
//   2. Short link (maps.app.goo.gl / g.page / share.google) → follow redirect,
//      extract business name + coordinates from the /maps/place/<slug> URL,
//      then Places Text Search with an ID-ONLY field mask (free Essentials tier)
//      biased to those coordinates → top Place ID.
//   3. Plain /maps/place/<slug>/ address-bar URL → same as (2).
//
// The slug also gives us the business name for free, so the UI can show
// "Found: <name>" and pre-fill the template name field.

export function reviewUrl(placeId: string): string {
  return `https://search.google.com/local/writereview?placeid=${placeId}`;
}

const TEXT_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText";

interface CacheEntry {
  placeId: string | null;
  expires: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 10 * 60 * 1000;
const CACHE_MAX = 200;

function cacheGet(key: string): string | null | undefined {
  const e = cache.get(key);
  if (!e) return undefined;
  if (Date.now() > e.expires) {
    cache.delete(key);
    return undefined;
  }
  return e.placeId;
}

function cacheSet(key: string, placeId: string | null) {
  if (cache.size >= CACHE_MAX) {
    const oldest = cache.keys().next().value;
    if (oldest) cache.delete(oldest);
  }
  cache.set(key, { placeId, expires: Date.now() + CACHE_TTL_MS });
}

/**
 * ID-only Text Search — free "Places API Text Search Essentials (IDs Only)"
 * tier (unlimited). Never add displayName/address fields: they flip the call
 * to the paid Pro SKU.
 */
export async function textSearchPlaceId(
  query: string,
  lat?: number,
  lng?: number
): Promise<string | null> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) return null;

  const norm = query.trim().toLowerCase().replace(/\s+/g, " ");
  if (norm.length < 2) return null;
  const cacheKey = `${norm}|${lat ?? ""},${lng ?? ""}`;
  const cached = cacheGet(cacheKey);
  if (cached !== undefined) return cached;

  const body: Record<string, unknown> = { textQuery: query.trim(), pageSize: 1 };
  if (lat !== undefined && lng !== undefined) {
    body.locationBias = {
      circle: { center: { latitude: lat, longitude: lng }, radius: 10000 },
    };
  }

  try {
    const res = await fetch(TEXT_SEARCH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
        // ID-only → free Essentials tier.
        "X-Goog-FieldMask": "places.id",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      cacheSet(cacheKey, null);
      return null;
    }
    const data = (await res.json()) as { places?: { id?: string }[] };
    const id = data.places?.[0]?.id ?? null;
    cacheSet(cacheKey, id);
    return id;
  } catch {
    cacheSet(cacheKey, null);
    return null;
  }
}
