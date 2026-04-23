import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function formatUiStatus(status?: string | null) {
  const value = (status || "").toUpperCase();

  if (value === "TRACKED") return "TRACKED";
  if (value === "CLICKED") return "CLICKED";
  if (value === "REDIRECTED") return "REDIRECTED";
  if (value === "FAILED") return "FAILED";
  if (value === "CONFIRMED") return "CONFIRMED";
  if (value === "REJECTED") return "REJECTED";
  if (value === "PAID") return "PAID";

  return value || "UNKNOWN";
}

export async function GET() {
  try {
    const clickLogs = await prisma.clickLog.findMany({
      orderBy: {
        clickedAt: "desc",
      },
      take: 200,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
          },
        },
        session: {
          select: {
            id: true,
            sessionKey: true,
          },
        },
        coupon: {
          select: {
            id: true,
            title: true,
            discount: true,
            code: true,
          },
        },
        cashback: {
          select: {
            id: true,
            title: true,
            cashbackValue: true,
          },
        },
      },
    });

    const formatted = clickLogs.map((log) => ({
      id: log.id,
      trackingCode: log.trackingCode || null,
      clickType: log.clickType || null,
      status: formatUiStatus(log.status),
      rawStatus: log.status || null,
      targetUrl: log.targetUrl || null,
      sourcePage: log.sourcePage || null,
      ipAddress: log.ipAddress || null,
      clickedAt: log.clickedAt ? log.clickedAt.toISOString() : null,
      createdAt: log.createdAt ? log.createdAt.toISOString() : null,

      user: log.user
        ? {
            id: log.user.id,
            name: log.user.name || null,
            email: log.user.email || null,
          }
        : null,

      store: log.store
        ? {
            id: log.store.id,
            name: log.store.name,
            slug: log.store.slug,
            logo: log.store.logo || null,
          }
        : null,

      session: log.session
        ? {
            id: log.session.id,
            sessionKey: log.session.sessionKey || null,
          }
        : null,

      coupon: log.coupon
        ? {
            id: log.coupon.id,
            title: log.coupon.title,
            discount: log.coupon.discount || null,
            couponCode: log.coupon.code || null,
          }
        : null,

      cashbackOffer: log.cashback
        ? {
            id: log.cashback.id,
            title: log.cashback.title,
            cashbackPercent: log.cashback.cashbackValue ?? null,
          }
        : null,
    }));

    return NextResponse.json({
      ok: true,
      clickLogs: formatted,
    });
  } catch (error) {
    console.error("ADMIN_CLICK_LOGS_GET_ERROR:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Failed to load click logs",
      },
      { status: 500 }
    );
  }
}