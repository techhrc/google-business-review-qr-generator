import { NextRequest, NextResponse } from "next/server";
import { resolveBusinessLink } from "@/lib/resolve-link";
import { reviewUrl } from "@/lib/places";
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

  return NextResponse.json({
    placeId: resolved.placeId,
    reviewUrl: reviewUrl(resolved.placeId),
    // Business name taken from the link's /maps/place/<slug> — free, no API.
    label: resolved.label ?? null,
  });
}
