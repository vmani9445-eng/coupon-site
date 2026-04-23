import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ trackingCode: string }>;
};

function appendTrackingParams(rawUrl: string, trackingCode: string) {
  const url = new URL(rawUrl);

  if (!url.searchParams.has("subid")) {
    url.searchParams.set("subid", trackingCode);
  }

  if (!url.searchParams.has("aff_sub")) {
    url.searchParams.set("aff_sub", trackingCode);
  }

  if (!url.searchParams.has("aff_sub2")) {
    url.searchParams.set("aff_sub2", trackingCode);
  }

  if (!url.searchParams.has("click_id")) {
    url.searchParams.set("click_id", trackingCode);
  }

  return url.toString();
}

function isCuelinksSource(value?: string | null) {
  return (value || "").trim().toLowerCase() === "cuelinks";
}

function isUsefulCuelinksUrl(url?: string | null) {
  if (!url) return false;

  const value = url.trim().toLowerCase();

  if (
    value === "https://www.cuelinks.com/" ||
    value === "https://www.cuelinks.com" ||
    value === "http://www.cuelinks.com/" ||
    value === "http://www.cuelinks.com"
  ) {
    return false;
  }

  return true;
}

async function createCuelinksDeepLink(targetUrl: string) {
  const apiKey = process.env.CUELINKS_API_KEY;

  if (!apiKey) {
    return {
      ok: false as const,
      error: "Missing CUELINKS_API_KEY",
    };
  }

  try {
    const requestUrl = `https://linksredirect.com/deeplink?url=${encodeURIComponent(
      targetUrl
    )}`;

    const res = await fetch(requestUrl, {
      method: "GET",
      headers: {
        Authorization: `Token ${apiKey}`,
        Accept: "*/*",
      },
      cache: "no-store",
      redirect: "manual",
    });

    const location = res.headers.get("location");

    if (location && isUsefulCuelinksUrl(location)) {
      return {
        ok: true as const,
        url: location,
      };
    }

    const text = await res.text().catch(() => "");

    return {
      ok: false as const,
      error: `Cuelinks deeplink invalid response. Status: ${res.status}. Body: ${
        text || "Empty body"
      }`,
    };
  } catch (error) {
    return {
      ok: false as const,
      error:
        error instanceof Error ? error.message : "Cuelinks deeplink failed",
    };
  }
}

export async function GET(req: NextRequest, { params }: Props) {
  try {
    const { trackingCode } = await params;

    const click = await prisma.clickLog.findUnique({
      where: { trackingCode },
      include: {
        coupon: true,
        cashback: true,
        store: true,
      },
    });

    if (!click) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    const rawDestination =
      click.targetUrl ||
      click.coupon?.affiliateUrl ||
      click.cashback?.affiliateUrl ||
      click.store?.websiteUrl ||
      null;

    if (!rawDestination) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    let destination = rawDestination;

    const shouldUseCuelinks =
      isCuelinksSource(click.coupon?.source) ||
      isCuelinksSource(click.cashback?.source);

    if (shouldUseCuelinks) {
      const deeplinkResult = await createCuelinksDeepLink(rawDestination);

      if (deeplinkResult.ok && isUsefulCuelinksUrl(deeplinkResult.url)) {
        destination = deeplinkResult.url;
      } else {
        console.error(
          "CUELINKS_DEEPLINK_FALLBACK",
          deeplinkResult.ok ? deeplinkResult.url : deeplinkResult.error
        );
      }
    }

    try {
      destination = appendTrackingParams(destination, trackingCode);
    } catch (error) {
      console.error("TRACKING_PARAM_APPEND_ERROR", error);
    }

    await prisma.clickLog.update({
      where: { id: click.id },
      data: {
        status: "REDIRECTED",
        targetUrl: destination,
      },
    });

    return NextResponse.redirect(destination, { status: 302 });
  } catch (error) {
    console.error("GO_REDIRECT_ERROR", error);
    return NextResponse.redirect(new URL("/", req.url));
  }
}