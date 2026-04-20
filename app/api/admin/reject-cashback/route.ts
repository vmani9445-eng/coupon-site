import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function isAdmin(req: NextRequest) {
  const key = req.headers.get("x-admin-key");
  return key === process.env.ADMIN_SECRET;
}

export async function POST(req: NextRequest) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const transactionId = String(body?.transactionId || "").trim();
    const rejectionReason = String(
      body?.rejectionReason || "Rejected by affiliate"
    ).trim();

    if (!transactionId) {
      return NextResponse.json(
        { success: false, message: "transactionId required" },
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

      if (txn.status === "REJECTED") {
        throw new Error("ALREADY_REJECTED");
      }

      if (txn.status === "PAID") {
        throw new Error("ALREADY_PAID");
      }

      const wallet = txn.walletId
        ? await tx.wallet.findUnique({
            where: { id: txn.walletId },
          })
        : await tx.wallet.findUnique({
            where: { userId: txn.userId },
          });

      const updatedTxn = await tx.cashbackTransaction.update({
        where: { id: txn.id },
        data: {
          status: "REJECTED",
          rejectedAt: new Date(),
          rejectionReason,
        },
      });

      if (wallet) {
        if (txn.status === "PENDING" || txn.status === "TRACKING") {
          await tx.wallet.update({
            where: { id: wallet.id },
            data: {
              pendingBalance: {
                decrement: txn.cashbackAmount,
              },
              lifetimeRejected: {
                increment: txn.cashbackAmount,
              },
            },
          });
        } else if (txn.status === "CONFIRMED" || txn.status === "PAYABLE") {
          await tx.wallet.update({
            where: { id: wallet.id },
            data: {
              confirmedBalance: {
                decrement: txn.cashbackAmount,
              },
              availableBalance: {
                decrement: txn.cashbackAmount,
              },
              lifetimeRejected: {
                increment: txn.cashbackAmount,
              },
            },
          });
        }

        await tx.walletLedger.create({
          data: {
            userId: txn.userId,
            walletId: wallet.id,
            entryType: "CASHBACK_REJECTED",
            amount: txn.cashbackAmount,
            status: "COMPLETED",
            description: rejectionReason,
            referenceType: "CASHBACK_TRANSACTION",
            referenceId: txn.id,
          },
        });
      }

      if (txn.clickLogId) {
        await tx.clickLog.update({
          where: { id: txn.clickLogId },
          data: {
            status: "REJECTED",
          },
        });
      }

      return updatedTxn;
    });

    return NextResponse.json({
      success: true,
      txn: result,
    });
  } catch (error: any) {
    console.error("REJECT_CASHBACK_ERROR", error);

    if (error.message === "NOT_FOUND") {
      return NextResponse.json(
        { success: false, message: "Transaction not found" },
        { status: 404 }
      );
    }

    if (error.message === "ALREADY_REJECTED") {
      return NextResponse.json(
        { success: false, message: "Transaction already rejected" },
        { status: 400 }
      );
    }

    if (error.message === "ALREADY_PAID") {
      return NextResponse.json(
        { success: false, message: "Paid transaction cannot be rejected" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Reject failed",
      },
      { status: 500 }
    );
  }
}