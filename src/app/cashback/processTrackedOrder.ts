import { prisma } from "@/lib/prisma";
import { CashbackStatus, LedgerStatus, LedgerReferenceType, WalletEntryType } from "@prisma/client";

type ProcessTrackedOrderInput = {
  trackingCode?: string | null;
  externalTrackingId?: string | null;
  externalOrderId?: string | null;
  storeSlug?: string | null;
  orderAmount?: number | null; // paise
  commissionAmount: number; // paise
  purchaseAt?: Date | null;
  source?: string | null;
  rawStatus?: string | null;
};

function normalizeMoney(value?: number | null) {
  if (!value || Number.isNaN(value)) return 0;
  return Math.max(0, Math.floor(value));
}

export async function processTrackedOrder(input: ProcessTrackedOrderInput) {
  const commissionAmount = normalizeMoney(input.commissionAmount);
  const orderAmount = normalizeMoney(input.orderAmount);

  if (!commissionAmount) {
    throw new Error("commissionAmount is required and must be > 0");
  }

  return prisma.$transaction(async (tx) => {
    let clickLog = null;

    if (input.trackingCode) {
      clickLog = await tx.clickLog.findUnique({
        where: { trackingCode: input.trackingCode },
        include: {
          user: true,
          store: true,
        },
      });
    }

    let store =
      clickLog?.store ||
      (input.storeSlug
        ? await tx.store.findUnique({
            where: { slug: input.storeSlug },
          })
        : null);

    if (!store) {
      throw new Error("Store not found for tracked order");
    }

    const userId = clickLog?.userId;
    if (!userId) {
      throw new Error("Tracked order has no linked user");
    }

    let wallet = await tx.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      wallet = await tx.wallet.create({
        data: {
          userId,
        },
      });
    }

    if (input.externalTrackingId) {
      const existingByTracking = await tx.cashbackTransaction.findFirst({
        where: {
          externalTrackingId: input.externalTrackingId,
        },
      });

      if (existingByTracking) {
        return existingByTracking;
      }
    }

    if (input.externalOrderId) {
      const existingByOrder = await tx.cashbackTransaction.findFirst({
        where: {
          externalOrderId: input.externalOrderId,
          userId,
          storeId: store.id,
        },
      });

      if (existingByOrder) {
        return existingByOrder;
      }
    }

    const cashbackPercentToUser = Math.min(
      100,
      Math.max(0, store.cashbackPercentToUser ?? 70)
    );

    const cashbackAmount = Math.floor(
      (commissionAmount * cashbackPercentToUser) / 100
    );

    const platformMarginAmount = commissionAmount - cashbackAmount;

    const cashbackTransaction = await tx.cashbackTransaction.create({
      data: {
        userId,
        walletId: wallet.id,
        clickLogId: clickLog?.id || null,
        storeId: store.id,
        source: input.source || null,
        externalOrderId: input.externalOrderId || null,
        externalTrackingId: input.externalTrackingId || input.trackingCode || null,
        orderAmount: orderAmount || null,
        commissionAmount,
        cashbackAmount,
        platformMarginAmount,
        status: CashbackStatus.PENDING,
        purchaseAt: input.purchaseAt || null,
        trackedAt: new Date(),
        adminNotes: `Auto tracked${input.rawStatus ? ` | source status: ${input.rawStatus}` : ""}`,
      },
    });

    await tx.wallet.update({
      where: { id: wallet.id },
      data: {
        pendingBalance: {
          increment: cashbackAmount,
        },
        lifetimeEarned: {
          increment: cashbackAmount,
        },
      },
    });

    await tx.walletLedger.create({
      data: {
        userId,
        walletId: wallet.id,
        entryType: WalletEntryType.CASHBACK_PENDING,
        amount: cashbackAmount,
        status: LedgerStatus.COMPLETED,
        description: `Pending cashback tracked for ${store.name}`,
        referenceType: LedgerReferenceType.CASHBACK_TRANSACTION,
        referenceId: cashbackTransaction.id,
      },
    });

    if (clickLog?.id) {
      await tx.clickLog.update({
        where: { id: clickLog.id },
        data: {
          status: "TRACKED",
        },
      });
    }

    return cashbackTransaction;
  });
}