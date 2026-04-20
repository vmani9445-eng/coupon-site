import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function isAdmin(req: NextRequest) {
  const key = req.headers.get("x-admin-key");
  return key === process.env.ADMIN_SECRET;
}

export async function POST(req: NextRequest) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const transactionId = String(body?.transactionId || "");

    if (!transactionId) {
      return NextResponse.json(
        { error: "transactionId required" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const txn = await tx.cashbackTransaction.findUnique({
        where: { id: transactionId },
      });

      if (!txn) {
        throw new Error("NOT_FOUND");
      }

      if (txn.status === "CONFIRMED" || txn.status === "PAYABLE" || txn.status === "PAID") {
        throw new Error("ALREADY_PROCESSED");
      }

      if (txn.status === "REJECTED") {
        throw new Error("REJECTED_TRANSACTION");
      }

      const wallet = await tx.wallet.upsert({
        where: { userId: txn.userId },
        update: {},
        create: {
          userId: txn.userId,
        },
      });

      const updatedTxn = await tx.cashbackTransaction.update({
        where: { id: txn.id },
        data: {
          status: "CONFIRMED",
          confirmedAt: new Date(),
        },
      });

      const walletUpdateData =
        txn.status === "PENDING" || txn.status === "TRACKING"
          ? {
              pendingBalance: {
                decrement: txn.cashbackAmount,
              },
              confirmedBalance: {
                increment: txn.cashbackAmount,
              },
              availableBalance: {
                increment: txn.cashbackAmount,
              },
              lifetimeEarned: {
                increment: txn.cashbackAmount,
              },
            }
          : {
              confirmedBalance: {
                increment: txn.cashbackAmount,
              },
              availableBalance: {
                increment: txn.cashbackAmount,
              },
              lifetimeEarned: {
                increment: txn.cashbackAmount,
              },
            };

      await tx.wallet.update({
        where: { id: wallet.id },
        data: walletUpdateData,
      });

      await tx.walletLedger.create({
        data: {
          userId: txn.userId,
          walletId: wallet.id,
          entryType: "CASHBACK_CONFIRMED",
          amount: txn.cashbackAmount,
          status: "COMPLETED",
          description: `Cashback confirmed for transaction ${txn.id}`,
          referenceType: "CASHBACK_TRANSACTION",
          referenceId: txn.id,
        },
      });

      await tx.clickLog.updateMany({
        where: {
          id: txn.clickLogId || undefined,
        },
        data: {
          status: "CONFIRMED",
        },
      });

      return updatedTxn;
    });

    return NextResponse.json({
      ok: true,
      txn: result,
    });
  } catch (err: any) {
    console.error("CONFIRM ERROR:", err);

    if (err.message === "NOT_FOUND") {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    if (err.message === "ALREADY_PROCESSED") {
      return NextResponse.json(
        { error: "Already processed" },
        { status: 400 }
      );
    }

    if (err.message === "REJECTED_TRANSACTION") {
      return NextResponse.json(
        { error: "Rejected transaction cannot be confirmed" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Confirm failed",
      },
      { status: 500 }
    );
  }
}