import { NextRequest, NextResponse } from "next/server";
import { textSearch } from "@/lib/places";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  if (!rateLimit(`search:${clientIp(req)}`, 20, 60_000)) {
    return NextResponse.json(
      { error: "Too many searches. Please wait a minute and try again." },
      { status: 429 }
    );
  }

  const body = (await req.json().catch(() => ({}))) as { name?: unknown; city?: unknown };
  const name = String(body.name ?? "").trim();
  const city = String(body.city ?? "").trim();

  if (name.length < 2) {
    return NextResponse.json({ error: "Enter your business name to search." }, { status: 400 });
  }
  if (city.length < 2) {
    return NextResponse.json({ error: "Enter your city to narrow the search." }, { status: 400 });
  }
  if (name.length > 200 || city.length > 200) {
    return NextResponse.json({ error: "Search text is too long." }, { status: 400 });
  }

  try {
    const results = await textSearch(`${name}, ${city}`);
    if (results.length === 0) {
      return NextResponse.json(
        { error: "No matching businesses found. Check the spelling of the name and city.", results: [] },
        { status: 404 }
      );
    }
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json(
      { error: "Business search is temporarily unavailable. Please try again." },
      { status: 502 }
    );
  }
}
