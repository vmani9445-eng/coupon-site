import { prisma } from "@/lib/prisma";
import { CashbackStatus, LedgerReferenceType, LedgerStatus, WalletEntryType } from "@prisma/client";

export async function confirmCashback(cashbackTransactionId: string) {
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

    if (txn.status !== CashbackStatus.PENDING && txn.status !== CashbackStatus.TRACKING) {
      return txn;
    }

    const updatedTxn = await tx.cashbackTransaction.update({
      where: { id: txn.id },
      data: {
        status: CashbackStatus.CONFIRMED,
        confirmedAt: new Date(),
      },
    });

    await tx.wallet.update({
      where: { id: txn.walletId },
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
        walletId: txn.walletId,
        entryType: WalletEntryType.CASHBACK_CONFIRMED,
        amount: txn.cashbackAmount,
        status: LedgerStatus.COMPLETED,
        description: `Cashback confirmed${txn.store?.name ? ` for ${txn.store.name}` : ""}`,
        referenceType: LedgerReferenceType.CASHBACK_TRANSACTION,
        referenceId: txn.id,
      },
    });

    return updatedTxn;
  });
}