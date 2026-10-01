// Link-only system: no Google Places API is used anywhere on this site.
// A pasted link either carries the Place ID directly or is a short link
// we follow server-side — both are free and need no API key.

export function reviewUrl(placeId: string): string {
  return `https://search.google.com/local/writereview?placeid=${placeId}`;
}
