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

export async function GET(req: NextRequest, { params }: Props) {
  try {
    const { trackingCode } = await params;

    const click = await prisma.clickLog.findUnique({
      where: { trackingCode },
      include: {
        coupon: true,
        cashback: true,
      },
    });

    if (!click) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    const rawDestination =
      click.targetUrl ||
      click.coupon?.affiliateUrl ||
      click.cashback?.affiliateUrl ||
      null;

    if (!rawDestination) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    let destination = rawDestination;

    try {
      destination = appendTrackingParams(rawDestination, trackingCode);
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