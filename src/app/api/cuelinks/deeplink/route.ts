import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const apiKey = process.env.CUELINKS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { ok: false, error: "Missing CUELINKS_API_KEY" },
        { status: 500 }
      );
    }

    const targetUrl = req.nextUrl.searchParams.get("url");

    if (!targetUrl) {
      return NextResponse.json(
        { ok: false, error: "Missing url param" },
        { status: 400 }
      );
    }

    const requestUrl = `https://linksredirect.com/deeplink?url=${encodeURIComponent(
      targetUrl
    )}`;

    console.log("CUELINKS DEEPLINK REQUEST URL:", requestUrl);

    const res = await fetch(requestUrl, {
      method: "GET",
      headers: {
        Authorization: `Token ${apiKey}`,
        Accept: "*/*",
      },
      cache: "no-store",
      redirect: "manual",
    });

    console.log("CUELINKS DEEPLINK STATUS:", res.status);

    const location = res.headers.get("location");
    console.log("CUELINKS DEEPLINK LOCATION:", location);

    if (location) {
      return NextResponse.json({
        ok: true,
        url: location,
      });
    }

    const text = await res.text().catch(() => "");

    return NextResponse.json(
      {
        ok: false,
        error: `No redirect location found. Status: ${res.status}`,
        body: text || null,
      },
      { status: 500 }
    );
  } catch (err: any) {
    console.error("CUELINKS_DEEPLINK_ERROR:", err);
    console.error("CUELINKS_DEEPLINK_STACK:", err?.stack);
    console.error("CUELINKS_DEEPLINK_CAUSE:", err?.cause);

    return NextResponse.json(
      {
        ok: false,
        error: err?.message || "Something went wrong",
        cause: err?.cause ? String(err.cause) : null,
        stack: err?.stack || null,
      },
      { status: 500 }
    );
  }
}