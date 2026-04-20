import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

function formatWithdrawalMethod(
  method?: string | null,
  giftCardType?: string | null
) {
  if (!method) return "Withdrawal";
  if (method === "UPI") return "UPI Transfer";
  if (method === "BANK_TRANSFER") return "Bank Transfer";
  if (method === "GIFT_CARD") {
    return giftCardType ? `${giftCardType} Gift Card` : "Gift Card";
  }
  return method;
}

function formatWithdrawalStatus(status?: string | null) {
  if (!status) return "Pending";
  if (status === "PAID" || status === "COMPLETED") return "Transferred";
  if (status === "APPROVED" || status === "PROCESSED") return "Approved";
  if (status === "REJECTED") return "Rejected";
  if (status === "FAILED") return "Failed";
  return "Pending";
}

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
    case "PENDING":
    default:
      return "Tracking";
  }
}

export async function GET() {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json([], { status: 200 });
    }

    const userId = session.userId;

    const [cashbackTransactions, withdrawals] = await Promise.all([
      prisma.cashbackTransaction.findMany({
        where: { userId },
        orderBy: { trackedAt: "desc" },
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
        },
      }),

      prisma.withdrawalRequest.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    ]);

    const cashbackItems = cashbackTransactions.map((item) => ({
      id: item.id,
      type: "cashback",
      transactionNumber: item.externalOrderId
        ? `ORD-${item.externalOrderId}`
        : `CB-${item.id.slice(-6).toUpperCase()}`,
      title:
        item.store?.name ||
        item.coupon?.title ||
        item.cashbackOffer?.title ||
        "Cashback",
      subtitle:
        item.coupon?.title ||
        item.cashbackOffer?.title ||
        "Tracked cashback order",
      amount: item.cashbackAmount || 0,
      orderAmount: item.orderAmount || 0,
      commissionAmount: item.commissionAmount || 0,
      platformMarginAmount: item.platformMarginAmount || 0,
      status: formatCashbackStatus(item.status),
      rawStatus: item.status,
      date:
        item.purchaseAt ||
        item.trackedAt ||
        item.confirmedAt ||
        item.paidAt ||
        item.createdAt,
      storeName: item.store?.name || "Store",
      storeLogo: item.store?.logo || null,
      discount: item.coupon?.discount || null,
      externalOrderId: item.externalOrderId || null,
      note:
        item.status === "REJECTED"
          ? item.rejectionReason || "Cashback rejected"
          : item.status === "PAID"
          ? "Cashback paid to wallet"
          : item.status === "CONFIRMED" || item.status === "PAYABLE"
          ? "Cashback confirmed"
          : "Cashback tracking active",
    }));

    const withdrawalItems = withdrawals
      .filter((item) =>
        ["PAID", "COMPLETED", "APPROVED", "PROCESSED"].includes(item.status)
      )
      .map((item) => ({
        id: item.id,
        type: "withdrawal",
        transactionNumber: `TXN-${item.id.slice(-6).toUpperCase()}`,
        title: formatWithdrawalMethod(item.method, item.giftCardType || null),
        subtitle:
          item.method === "UPI"
            ? item.upiId || "UPI payout"
            : item.method === "BANK_TRANSFER"
            ? "Bank account payout"
            : item.giftCardType
            ? `${item.giftCardType} gift card payout`
            : "Gift card payout",
        amount: item.amount || 0,
        orderAmount: null,
        commissionAmount: null,
        platformMarginAmount: null,
        status: formatWithdrawalStatus(item.status),
        rawStatus: item.status,
        date:
          item.paidAt ||
          item.processedAt ||
          item.requestedAt ||
          item.createdAt,
        method: item.method,
        note:
          item.method === "UPI"
            ? "Transferred to UPI"
            : item.method === "BANK_TRANSFER"
            ? "Transferred to bank"
            : "Gift card sent",
      }));

    const combined = [...cashbackItems, ...withdrawalItems].sort((a, b) => {
      const aTime = a.date ? new Date(a.date).getTime() : 0;
      const bTime = b.date ? new Date(b.date).getTime() : 0;
      return bTime - aTime;
    });

    return NextResponse.json(combined);
  } catch (error) {
    console.error("Transactions API error:", error);

    return NextResponse.json(
      { error: "Failed to load transactions" },
      { status: 500 }
    );
  }
}