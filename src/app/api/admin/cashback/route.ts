import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function isAdmin(req: NextRequest) {
  const key = req.headers.get("x-admin-key");
  return key === process.env.ADMIN_SECRET;
}

function formatStatus(status?: string | null) {
  if (!status) return "Tracking";

  switch (status) {
    case "CONFIRMED":
    case "PAYABLE":
      return "Confirmed";
    case "PAID":
      return "Paid";
    case "REJECTED":
      return "Rejected";
    case "PENDING":
    default:
      return "Tracking";
  }
}

export async function GET(req: NextRequest) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const items = await prisma.cashbackTransaction.findMany({
      orderBy: {
        trackedAt: "desc",
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
            trackingCode: true,
            clickType: true,
            clickedAt: true,
            status: true,
          },
        },
        wallet: {
          select: {
            id: true,
          },
        },
      },
    });

    const formatted = items.map((item) => ({
      id: item.id,

      user: {
        id: item.user?.id || null,
        name: item.user?.name || "User",
        email: item.user?.email || "",
      },

      store: {
        id: item.store?.id || null,
        name: item.store?.name || "Store",
        slug: item.store?.slug || null,
        logo: item.store?.logo || null,
      },

      walletId: item.wallet?.id || item.walletId || null,

      title:
        item.coupon?.title ||
        item.cashbackOffer?.title ||
        "Tracked cashback",

      discount: item.coupon?.discount || null,

      source: item.source || null,
      externalOrderId: item.externalOrderId || null,
      externalTrackingId: item.externalTrackingId || null,

      orderAmount: item.orderAmount || 0,
      commissionAmount: item.commissionAmount || 0,
      cashbackAmount: item.cashbackAmount || 0,
      platformMarginAmount: item.platformMarginAmount || 0,

      status: formatStatus(item.status),
      rawStatus: item.status,

      trackedAt: item.trackedAt || null,
      purchaseAt: item.purchaseAt || null,
      confirmedAt: item.confirmedAt || null,
      rejectedAt: item.rejectedAt || null,
      payableAt: item.payableAt || null,
      paidAt: item.paidAt || null,

      rejectionReason: item.rejectionReason || null,
      adminNotes: item.adminNotes || null,

      click: {
        trackingCode: item.clickLog?.trackingCode || null,
        clickType: item.clickLog?.clickType || null,
        clickedAt: item.clickLog?.clickedAt || null,
        status: item.clickLog?.status || null,
      },

      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    return NextResponse.json({
      ok: true,
      items: formatted,
      total: formatted.length,
    });
  } catch (error) {
    console.error("ADMIN_CASHBACK_GET_ERROR", error);

    return NextResponse.json(
      { error: "Failed to load admin cashback data" },
      { status: 500 }
    );
  }
}