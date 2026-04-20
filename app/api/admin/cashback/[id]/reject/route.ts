import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const rejectionReason =
      typeof body?.rejectionReason === "string" && body.rejectionReason.trim()
        ? body.rejectionReason.trim()
        : "Rejected by admin";

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

      if (txn.status === "REJECTED") {
        return txn;
      }

      if (txn.status === "PENDING" || txn.status === "TRACKING") {
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
        where: { id },
        data: {
          status: "REJECTED",
          rejectedAt: new Date(),
          rejectionReason,
        },
      });

      await tx.walletLedger.create({
        data: {
          userId: txn.userId,
          walletId: txn.walletId,
          entryType: "CASHBACK_REJECTED",
          amount: txn.cashbackAmount,
          status: "COMPLETED",
          description: `Cashback rejected${txn.store?.name ? ` for ${txn.store.name}` : ""}`,
          referenceType: "CASHBACK_TRANSACTION",
          referenceId: txn.id,
        },
      });

      return updatedTxn;
    });

    return NextResponse.json({ item: result });
  } catch (error: any) {
    console.error("ADMIN_CASHBACK_REJECT_ERROR", error);
    return NextResponse.json(
      { error: error?.message || "Failed to reject cashback" },
      { status: 500 }
    );
  }
}