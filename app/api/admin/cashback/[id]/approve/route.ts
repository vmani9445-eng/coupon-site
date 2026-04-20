import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const result = await prisma.$transaction(async (tx) => {
      const txn = await tx.cashbackTransaction.findUnique({
        where: { id },
        include: {
          wallet: true,
          store: true,
        },
      });

      if (!txn) {
        throw new Error("Cashback transaction not found");
      }

      if (!txn.walletId || !txn.wallet) {
        throw new Error("Wallet not found");
      }

      if (
        txn.status === "CONFIRMED" ||
        txn.status === "PAYABLE" ||
        txn.status === "PAID"
      ) {
        return txn;
      }

      const updatedTxn = await tx.cashbackTransaction.update({
        where: { id },
        data: {
          status: "CONFIRMED",
          confirmedAt: new Date(),
          payableAt: new Date(),
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
          entryType: "CASHBACK_CONFIRMED",
          amount: txn.cashbackAmount,
          status: "COMPLETED",
          description: `Cashback approved${txn.store?.name ? ` for ${txn.store.name}` : ""}`,
          referenceType: "CASHBACK_TRANSACTION",
          referenceId: txn.id,
        },
      });

      return updatedTxn;
    });

    return NextResponse.json({ item: result });
  } catch (error: any) {
    console.error("ADMIN_CASHBACK_APPROVE_ERROR", error);
    return NextResponse.json(
      { error: error?.message || "Failed to approve cashback" },
      { status: 500 }
    );
  }
}