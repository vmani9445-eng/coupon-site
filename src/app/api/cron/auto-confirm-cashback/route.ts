import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const AUTO_CONFIRM_DAYS = 30;

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - AUTO_CONFIRM_DAYS);

    const pendingItems = await prisma.cashbackTransaction.findMany({
      where: {
        status: "PENDING",
        trackedAt: {
          lte: cutoff,
        },
      },
      include: {
        wallet: true,
        store: true,
      },
      take: 100,
    });

    let confirmed = 0;

    for (const txn of pendingItems) {
      if (!txn.walletId || !txn.wallet) continue;

      await prisma.$transaction(async (tx) => {
        await tx.cashbackTransaction.update({
          where: { id: txn.id },
          data: {
            status: "CONFIRMED",
            confirmedAt: new Date(),
            payableAt: new Date(),
          },
        });

        await tx.wallet.update({
          where: { id: txn.walletId! },
          data: {
            pendingBalance: {
              decrement: txn.cashbackAmount,
            },
            confirmedBalance: {
              increment: txn.cashbackAmount,
            },
            availableBalance: {
              increment: txn.cashbackAmount,
            },
          },
        });

        await tx.walletLedger.create({
          data: {
            userId: txn.userId,
            walletId: txn.walletId!,
            entryType: "CASHBACK_CONFIRMED",
            amount: txn.cashbackAmount,
            status: "COMPLETED",
            description: `Auto-confirmed cashback${txn.store?.name ? ` for ${txn.store.name}` : ""}`,
            referenceType: "CASHBACK_TRANSACTION",
            referenceId: txn.id,
          },
        });
      });

      confirmed += 1;
    }

    return NextResponse.json({
      ok: true,
      confirmed,
    });
  } catch (error) {
    console.error("AUTO_CONFIRM_CASHBACK_ERROR", error);
    return NextResponse.json(
      { error: "Failed to auto-confirm cashback" },
      { status: 500 }
    );
  }
}