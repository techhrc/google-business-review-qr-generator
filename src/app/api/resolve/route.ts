import { NextRequest, NextResponse } from "next/server";
import { resolveBusinessLink } from "@/lib/resolve-link";
import { textSearchTopId, reviewUrl } from "@/lib/places";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  if (!rateLimit(`resolve:${clientIp(req)}`, 20, 60_000)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a minute and try again." },
      { status: 429 }
    );
  }

  const body = (await req.json().catch(() => ({}))) as { input?: unknown };
  const input = String(body.input ?? "");

  const resolved = await resolveBusinessLink(input);

  if (resolved.kind === "error") {
    return NextResponse.json({ error: resolved.message }, { status: 400 });
  }

  if (resolved.kind === "review") {
    return NextResponse.json({
      placeId: resolved.placeId,
      reviewUrl: reviewUrl(resolved.placeId),
    });
  }

  // A Maps link without an embedded Place ID: take the top match from the
  // free ID-only text search. The user verifies it on Google's review
  // page before printing.
  try {
    const placeId = await textSearchTopId(resolved.query);
    if (!placeId) {
      return NextResponse.json(
        { error: `Couldn't match "${resolved.query}" to a business. Try the name search instead.` },
        { status: 404 }
      );
    }
    return NextResponse.json({ placeId, reviewUrl: reviewUrl(placeId), query: resolved.query });
  } catch {
    return NextResponse.json(
      { error: "Business lookup is temporarily unavailable. Please try again." },
      { status: 502 }
    );
  }
}
