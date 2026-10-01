// Google Places API (New) — Text Search, ID-tier fields only where possible.
//
// NOTE on cost: requesting ONLY `places.id`-tier fields bills the
// "Text Search Essentials (IDs Only)" SKU, which is $0 with no monthly cap.
// But an ID-only response has no business name/address, so the user can't
// pick the right business from candidates. We therefore also request
// `displayName` + `formattedAddress`, which moves the call to the
// "Text Search Pro" SKU: 5,000 free searches/month, then billed.
// At MVP scale this is $0. Set a quota cap in Google Cloud Console so a
// traffic spike can never surprise you.

export interface PlaceCandidate {
  id: string;
  name: string;
  address: string;
}

export function reviewUrl(placeId: string): string {
  return `https://search.google.com/local/writereview?placeid=${placeId}`;
}

interface PlacesApiPlace {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
}

export async function textSearch(query: string): Promise<PlaceCandidate[]> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) throw new Error("GOOGLE_PLACES_API_KEY is not configured");

  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
      // Keep this mask minimal: id-tier + display fields. Adding more fields
      // (photos, rating, hours...) pushes the call into pricier SKUs.
      "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress",
    },
    body: JSON.stringify({ textQuery: query, maxResultCount: 5 }),
  });

  if (!res.ok) {
    throw new Error(`Places API responded with ${res.status}`);
  }

  const data = (await res.json()) as { places?: PlacesApiPlace[] };
  return (data.places ?? [])
    .map((p) => ({
      id: (p.id ?? "").trim(),
      name: (p.displayName?.text ?? "").trim(),
      address: (p.formattedAddress ?? "").trim(),
    }))
    .filter((c) => c.id.length > 0);
}
