import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

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

export async function GET() {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.userId;

    const wallet = await prisma.wallet.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
        pendingBalance: 0,
        confirmedBalance: 0,
        availableBalance: 0,
        lifetimeEarned: 0,
        lifetimeWithdrawn: 0,
        lifetimeRejected: 0,
      },
    });

    const transactions = await prisma.cashbackTransaction.findMany({
      where: { userId },
      orderBy: { trackedAt: "desc" },
      take: 10,
      select: {
        id: true,
        cashbackAmount: true,
        orderAmount: true,
        commissionAmount: true,
        platformMarginAmount: true,
        status: true,
        trackedAt: true,
        purchaseAt: true,
        confirmedAt: true,
        paidAt: true,
        externalOrderId: true,
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
    });

    const formattedTransactions = transactions.map((item) => ({
      id: item.id,
      storeName: item.store?.name || "Store",
      storeLogo: item.store?.logo || null,
      title:
        item.coupon?.title ||
        item.cashbackOffer?.title ||
        "Tracked cashback",
      discount: item.coupon?.discount || null,
      cashbackAmount: item.cashbackAmount || 0,
      orderAmount: item.orderAmount || 0,
      commissionAmount: item.commissionAmount || 0,
      platformMarginAmount: item.platformMarginAmount || 0,
      status: formatStatus(item.status),
      rawStatus: item.status,
      trackedAt: item.trackedAt || null,
      purchaseAt: item.purchaseAt || item.trackedAt || null,
      confirmedAt: item.confirmedAt || null,
      paidAt: item.paidAt || null,
      externalOrderId: item.externalOrderId || null,
    }));

    return NextResponse.json({
      ok: true,
      wallet: {
        pendingBalance: wallet.pendingBalance || 0,
        confirmedBalance: wallet.confirmedBalance || 0,
        availableBalance: wallet.availableBalance || 0,
        lifetimeEarned: wallet.lifetimeEarned || 0,
        lifetimeWithdrawn: wallet.lifetimeWithdrawn || 0,
        lifetimeRejected: wallet.lifetimeRejected || 0,
      },
      transactions: formattedTransactions,
    });
  } catch (err) {
    console.error("WALLET ERROR:", err);

    return NextResponse.json(
      { error: "Failed to load wallet" },
      { status: 500 }
    );
  }
}