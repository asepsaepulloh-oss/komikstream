import { NextResponse } from "next/server";

const SANSEKAI_BASE = (process.env.SANSEKAI_BASE_URL ?? "https://api.sansekai.my.id/api").replace(/\/$/, "");

function getFallbackPayload(path: string) {
  if (/^\/anime\/(latest|recommended|movie|search|schedule|genre|genres|batch)/.test(path)) {
    return [];
  }

  if (/^\/komik\/(latest|popular|recommended|berwarna|pustaka|search|genre|scroll|genres)/.test(path)) {
    return [];
  }

  return null;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api\/proxy\/sansekai/, "");
  const target = `${SANSEKAI_BASE}${path}${url.search}`;

  try {
    const response = await fetch(target, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0",
      },
    });

    if (!response.ok) {
      const fallback = getFallbackPayload(path);
      return NextResponse.json(fallback, {
        status: 200,
        headers: {
          "cache-control": "no-store",
        },
      });
    }

    const body = await response.text();

    return new NextResponse(body, {
      status: response.status,
      headers: {
        "content-type": response.headers.get("content-type") ?? "application/json",
        "cache-control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch {
    const fallback = getFallbackPayload(path);
    return NextResponse.json(fallback, {
      status: 200,
      headers: {
        "cache-control": "no-store",
      },
    });
  }
}

export async function POST(request: Request) {
  return new NextResponse("Method not allowed", { status: 405 });
}
