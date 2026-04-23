import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

function formatCashbackStatus(status?: string | null) {
  if (!status) return "Tracking";

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

function formatWithdrawalStatus(status?: string | null) {
  if (!status) return "Pending";
  if (status === "PAID" || status === "COMPLETED") return "Transferred";
  if (status === "APPROVED" || status === "PROCESSED") return "Approved";
  if (status === "REJECTED") return "Rejected";
  if (status === "FAILED") return "Failed";
  return "Pending";
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = session.user.email.toLowerCase();

    const dbUser = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        upiId: true,
        upiName: true,
      },
    });

    if (!dbUser) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const userId = dbUser.id;

    const [wallet, cashbackTransactions, withdrawalRequests] =
      await Promise.all([
        prisma.wallet.findUnique({
          where: { userId },
        }),

        prisma.cashbackTransaction.findMany({
          where: { userId },
          include: {
            store: {
              select: {
                name: true,
                logo: true,
                slug: true,
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
          orderBy: {
            trackedAt: "desc",
          },
          take: 10,
        }),

        prisma.withdrawalRequest.findMany({
          where: { userId },
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        }),
      ]);

    const pending = cashbackTransactions
      .filter((t) => t.status === "PENDING" || t.status === "TRACKING")
      .reduce((sum, t) => sum + (t.cashbackAmount || 0), 0);

    const confirmed = cashbackTransactions
      .filter((t) => ["CONFIRMED", "PAYABLE", "PAID"].includes(t.status))
      .reduce((sum, t) => sum + (t.cashbackAmount || 0), 0);

    const payable = cashbackTransactions
      .filter((t) => ["CONFIRMED", "PAYABLE"].includes(t.status))
      .reduce((sum, t) => sum + (t.cashbackAmount || 0), 0);

    const withdrawn = withdrawalRequests
      .filter((w) => w.status === "PAID")
      .reduce((sum, w) => sum + (w.amount || 0), 0);

    const formattedCashbackTransactions = cashbackTransactions.map((t) => ({
      id: t.id,
      storeName: t.store?.name || "Store",
      storeLogo: t.store?.logo || null,
      storeSlug: t.store?.slug || null,
      title:
        t.coupon?.title ||
        t.cashbackOffer?.title ||
        "Tracked cashback",
      discount: t.coupon?.discount || null,
      orderAmount: t.orderAmount || 0,
      commissionAmount: t.commissionAmount || 0,
      cashbackAmount: t.cashbackAmount || 0,
      platformMarginAmount: t.platformMarginAmount || 0,
      status: formatCashbackStatus(t.status),
      rawStatus: t.status,
      trackedAt: t.trackedAt || null,
      purchaseAt: t.purchaseAt || t.trackedAt || null,
      confirmedAt: t.confirmedAt || null,
      paidAt: t.paidAt || null,
      payableAt: t.payableAt || null,
      externalOrderId: t.externalOrderId || null,
      clickedAt: t.clickLog?.clickedAt || null,
      clickType: t.clickLog?.clickType || null,
      rejectionReason: t.rejectionReason || null,
    }));

    const formattedWithdrawalRequests = withdrawalRequests.map((w) => ({
      id: w.id,
      amount: w.amount || 0,
      method: w.method,
      status: formatWithdrawalStatus(w.status),
      rawStatus: w.status,
      requestedAt: w.requestedAt || null,
      createdAt: w.createdAt || null,
      processedAt: w.processedAt || null,
      paidAt: w.paidAt || null,
      upiId: w.upiId || null,
      upiName: w.upiName || null,
      giftCardType: w.giftCardType || null,
    }));

    return Response.json({
      wallet: {
        availableBalance: wallet?.availableBalance || 0,
        pendingBalance: wallet?.pendingBalance ?? pending,
        confirmedBalance: wallet?.confirmedBalance ?? confirmed,
        lifetimeEarned: wallet?.lifetimeEarned ?? confirmed,
        lifetimeWithdrawn: wallet?.lifetimeWithdrawn ?? withdrawn,
        lifetimeRejected: wallet?.lifetimeRejected || 0,
      },

      stats: {
        pending,
        confirmed,
        payable,
        withdrawn,
      },

      cashbackTransactions: formattedCashbackTransactions,
      withdrawalRequests: formattedWithdrawalRequests,

      user: {
        upiId: dbUser.upiId || "",
        upiName: dbUser.upiName || "",
      },
    });
  } catch (error) {
    console.error("DASHBOARD_API_ERROR:", error);

    return Response.json(
      {
        error: "Failed to load dashboard",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}