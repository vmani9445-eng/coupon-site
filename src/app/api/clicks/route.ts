import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import crypto from "crypto";

function formatUiStatus(status: string) {
  switch (status) {
    case "CONFIRMED":
    case "PAYABLE":
      return "CONFIRMED";
    case "PAID":
      return "PAID";
    case "REJECTED":
      return "REJECTED";
    case "PENDING":
    default:
      return "TRACKING";
  }
}

function getExpectedPayout(trackedAt?: Date | null, status?: string) {
  if (!trackedAt) return null;
  if (status === "PAID") return null;

  const expected = new Date(trackedAt);
  expected.setDate(expected.getDate() + 30);

  return expected.toISOString();
}

function makeTrackingCode() {
  return `trk_${Date.now()}_${crypto.randomBytes(6).toString("hex")}`;
}

export async function GET() {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json([]);
    }

    const userId = session.userId;

    const transactions = await prisma.cashbackTransaction.findMany({
      where: { userId },
      orderBy: {
        trackedAt: "desc",
      },
      take: 50,
      include: {
        store: {
          select: {
            name: true,
            logo: true,
          },
        },
        coupon: {
          select: {
            title: true,
            discount: true,
          },
        },
        cashbackOffer: {
          select: {
            title: true,
          },
        },
        clickLog: {
          select: {
            clickedAt: true,
            clickType: true,
            targetUrl: true,
          },
        },
      },
    });

    const formatted = transactions.map((txn) => {
      const title =
        txn.coupon?.title ||
        txn.cashbackOffer?.title ||
        "Tracked order";

      return {
        id: txn.id,
        storeName: txn.store?.name || "Store",
        storeLogo: txn.store?.logo || null,
        title,
        discount: txn.coupon?.discount || null,
        orderAmount: txn.orderAmount || 0,
        commissionAmount: txn.commissionAmount || 0,
        cashbackAmount: txn.cashbackAmount || 0,
        platformMarginAmount: txn.platformMarginAmount || 0,
        status: formatUiStatus(txn.status),
        rawStatus: txn.status,
        purchaseAt: txn.purchaseAt || txn.trackedAt || null,
        trackedAt: txn.trackedAt || null,
        confirmedAt: txn.confirmedAt || null,
        paidAt: txn.paidAt || null,
        clickType: txn.clickLog?.clickType || null,
        clickedAt: txn.clickLog?.clickedAt || null,
        targetUrl: txn.clickLog?.targetUrl || null,
        externalOrderId: txn.externalOrderId || null,
        expectedPayout: getExpectedPayout(txn.trackedAt, txn.status),
      };
    });

    return NextResponse.json(formatted);
  } catch (err) {
    console.error("TRANSACTIONS ERROR:", err);

    return NextResponse.json(
      { error: "Failed to load transactions" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    let session: Awaited<ReturnType<typeof getSession>> | null = null;

    try {
      session = await getSession();
    } catch (sessionError) {
      console.error("CLICK_SESSION_ERROR", sessionError);
      session = null;
    }

    const body = await req.json();

    const clickType = String(body.clickType || "COUPON").toUpperCase();
    const storeId = body.storeId ? String(body.storeId) : null;
    const couponId = body.couponId ? String(body.couponId) : null;
    const cashbackId = body.cashbackId ? String(body.cashbackId) : null;
    const bannerId = body.bannerId ? String(body.bannerId) : null;
    const targetUrl = String(body.targetUrl || "").trim();
    const sourcePage = body.sourcePage ? String(body.sourcePage) : null;
    const sourceLabel = body.sourceLabel ? String(body.sourceLabel) : null;
    const storeSlug = body.storeSlug ? String(body.storeSlug) : null;

    if (!targetUrl) {
      return NextResponse.json(
        { error: "Missing targetUrl" },
        { status: 400 }
      );
    }

    if (!["COUPON", "CASHBACK", "BANNER", "STORE"].includes(clickType)) {
      return NextResponse.json(
        { error: "Invalid clickType" },
        { status: 400 }
      );
    }

    const forwardedFor = req.headers.get("x-forwarded-for");
    const ipAddress = forwardedFor?.split(",")[0]?.trim() || null;
    const userAgent = req.headers.get("user-agent") || null;
    const referrer = req.headers.get("referer") || null;
    const trackingCode = makeTrackingCode();

    const click = await prisma.clickLog.create({
      data: {
        userId: session?.userId || null,
        trackingCode,
        clickType: clickType as any,
        storeId,
        couponId,
        cashbackId,
        bannerId,
        targetUrl,
        sourcePage,
        sourceLabel,
        storeSlug,
        userEmail: session?.email || null,
        ipAddress,
        userAgent,
        referrer,
        status: "CLICKED",
      },
    });

    return NextResponse.json({
      ok: true,
      trackingCode: click.trackingCode,
      redirectUrl: `/go/${click.trackingCode}`,
    });
  } catch (error) {
    console.error("CLICK_CREATE_ERROR", error);

    return NextResponse.json(
      {
        error: "Failed to create click",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}