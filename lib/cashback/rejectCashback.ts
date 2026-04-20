import { prisma } from "@/lib/prisma";
import { CashbackStatus, LedgerReferenceType, LedgerStatus, WalletEntryType } from "@prisma/client";

export async function rejectCashback(
  cashbackTransactionId: string,
  rejectionReason?: string
) {
  return prisma.$transaction(async (tx) => {
    const txn = await tx.cashbackTransaction.findUnique({
      where: { id: cashbackTransactionId },
      include: {
        wallet: true,
        store: true,
      },
    });

    if (!txn) {
      throw new Error("Cashback transaction not found");
    }

    if (!txn.walletId || !txn.wallet) {
      throw new Error("Wallet not found for cashback transaction");
    }

    if (
      txn.status === CashbackStatus.REJECTED ||
      txn.status === CashbackStatus.PAID
    ) {
      return txn;
    }

    if (txn.status === CashbackStatus.PENDING || txn.status === CashbackStatus.TRACKING) {
      await tx.wallet.update({
        where: { id: txn.walletId },
        data: {
          pendingBalance: {
            decrement: txn.cashbackAmount,
          },
          lifetimeRejected: {
            increment: txn.cashbackAmount,
          },
        },
      });
    }

    const updatedTxn = await tx.cashbackTransaction.update({
      where: { id: txn.id },
      data: {
        status: CashbackStatus.REJECTED,
        rejectedAt: new Date(),
        rejectionReason: rejectionReason || "Rejected by admin / network",
      },
    });

    await tx.walletLedger.create({
      data: {
        userId: txn.userId,
        walletId: txn.walletId,
        entryType: WalletEntryType.CASHBACK_REJECTED,
        amount: txn.cashbackAmount,
        status: LedgerStatus.COMPLETED,
        description: `Cashback rejected${txn.store?.name ? ` for ${txn.store.name}` : ""}`,
        referenceType: LedgerReferenceType.CASHBACK_TRANSACTION,
        referenceId: txn.id,
      },
    });

    return updatedTxn;
  });
}