import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { auth } from "@/auth";
import crypto from "crypto";

function appendTrackingParam(url: string, key: string, value: string) {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
}

type ClickTypeEnum = "COUPON" | "CASHBACK" | "BANNER" | "STORE";

export async function POST(req: NextRequest) {
  try {
    const legacySession = await getSession();
    const nextAuthSession = await auth();
    const body = await req.json();

    const {
      clickType,
      storeId,
      couponId,
      cashbackId,
      bannerId,
      targetUrl,
      storeSlug,
      trackingParamKey,
      sourcePage,
      sourceLabel,
    } = body;

    if (!clickType || !targetUrl) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const normalizedClickType = String(clickType).toUpperCase();

    const allowedClickTypes: ClickTypeEnum[] = [
      "COUPON",
      "CASHBACK",
      "BANNER",
      "STORE",
    ];

    if (!allowedClickTypes.includes(normalizedClickType as ClickTypeEnum)) {
      return NextResponse.json(
        { ok: false, error: "Invalid click type" },
        { status: 400 }
      );
    }

    if (
      typeof targetUrl !== "string" ||
      (!targetUrl.startsWith("http://") &&
        !targetUrl.startsWith("https://"))
    ) {
      return NextResponse.json(
        { ok: false, error: "Invalid URL" },
        { status: 400 }
      );
    }

    let resolvedUserId: string | null = legacySession?.userId || null;
    let resolvedUserEmail: string | null =
      typeof legacySession?.email === "string"
        ? legacySession.email.trim().toLowerCase()
        : null;

    if (!resolvedUserId && nextAuthSession?.user?.email) {
      const dbUser = await prisma.user.findUnique({
        where: { email: nextAuthSession.user.email.toLowerCase() },
        select: { id: true, email: true },
      });

      if (dbUser) {
        resolvedUserId = dbUser.id;
        resolvedUserEmail = dbUser.email.toLowerCase();
      }
    }

    const trackingCode = `clk_${crypto.randomUUID().replace(/-/g, "")}`;

    const paramKey =
      typeof trackingParamKey === "string" && trackingParamKey.trim()
        ? trackingParamKey.trim()
        : "subid";

    const forwardedFor = req.headers.get("x-forwarded-for");
    const ipAddress =
      forwardedFor?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      null;

    const click = await prisma.clickLog.create({
      data: {
        userId: resolvedUserId,

        // ❌ REMOVED sessionId (not in your schema)

        clickType: normalizedClickType as ClickTypeEnum,

        storeId: storeId ? String(storeId) : null,
        couponId: couponId ? String(couponId) : null,
        cashbackId: cashbackId ? String(cashbackId) : null,
        bannerId: bannerId ? String(bannerId) : null,

        targetUrl,

        storeSlug:
          typeof storeSlug === "string" && storeSlug.trim()
            ? storeSlug.trim()
            : null,

        sourcePage:
          typeof sourcePage === "string" && sourcePage.trim()
            ? sourcePage.trim()
            : null,

        sourceLabel:
          typeof sourceLabel === "string" && sourceLabel.trim()
            ? sourceLabel.trim()
            : null,

        userEmail: resolvedUserEmail,
        trackingCode,
        status: "CLICKED",

        userAgent: req.headers.get("user-agent") || null,
        referrer: req.headers.get("referer") || null,
        ipAddress,
      },
    });

    const redirectUrl = appendTrackingParam(
      targetUrl,
      paramKey,
      trackingCode
    );

    return NextResponse.json({
      ok: true,
      clickId: click.id,
      trackingCode,
      redirectUrl,
      loggedIn: !!resolvedUserId,
    });
  } catch (error) {
    console.error("TRACK ERROR:", error);

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Tracking failed",
      },
      { status: 500 }
    );
  }
}