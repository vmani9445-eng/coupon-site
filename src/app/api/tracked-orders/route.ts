import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

function formatStatus(status: string) {
  switch (status) {
    case "CONFIRMED":
    case "PAYABLE":
      return "Confirmed";
    case "PAID":
      return "Paid";
    case "REJECTED":
      return "Rejected";
    case "TRACKING":
    case "PENDING":
    default:
      return "Tracking";
  }
}

function getExpectedPayoutDate(date: Date | null, status: string) {
  if (!date) return null;
  if (status === "PAID") return null;

  const payout = new Date(date);
  payout.setDate(payout.getDate() + 60);
  return payout;
}

function getProgress(status: string) {
  switch (status) {
    case "TRACKING":
      return 20;
    case "PENDING":
      return 25;
    case "CONFIRMED":
      return 60;
    case "PAYABLE":
      return 85;
    case "PAID":
      return 100;
    case "REJECTED":
      return 100;
    default:
      return 20;
  }
}

export async function GET() {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return Response.json([]);
    }

    const orders = await prisma.cashbackTransaction.findMany({
      where: { userId: session.userId },
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
          },
        },
      },
    });

    const formatted = orders.map((item) => {
      const purchaseDate = item.purchaseAt || item.trackedAt || null;

      return {
        id: item.id,
        storeName: item.store?.name || "Store",
        storeLogo: item.store?.logo || null,
        title:
          item.coupon?.title ||
          item.cashbackOffer?.title ||
          "Tracked order",
        discount: item.coupon?.discount || null,

        orderAmount: item.orderAmount || 0,
        cashbackAmount: item.cashbackAmount || 0,
        commissionAmount: item.commissionAmount || 0,
        platformMarginAmount: item.platformMarginAmount || 0,

        status: formatStatus(item.status),
        rawStatus: item.status,
        progress: getProgress(item.status),

        purchaseAt: purchaseDate,
        trackedAt: item.trackedAt || null,
        confirmedAt: item.confirmedAt || null,
        paidAt: item.paidAt || null,
        expectedPayout: getExpectedPayoutDate(purchaseDate, item.status),

        clickedAt: item.clickLog?.clickedAt || null,
        clickType: item.clickLog?.clickType || null,

        externalOrderId: item.externalOrderId || null,
        rejectionReason: item.rejectionReason || null,
      };
    });

    return Response.json(formatted);
  } catch (err) {
    console.error("TRACKED ORDERS ERROR:", err);

    return Response.json(
      { error: "Failed to load tracked orders" },
      { status: 500 }
    );
  }
}