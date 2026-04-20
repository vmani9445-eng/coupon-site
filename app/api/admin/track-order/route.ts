import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function isAdmin(req: NextRequest) {
  const key = req.headers.get("x-admin-key");
  return key === process.env.ADMIN_SECRET;
}

function getCashbackDays() {
  return 30;
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

    const trackingCode = String(body?.trackingCode || "").trim();
    const orderId = String(body?.orderId || "").trim();
    const orderAmount = Number(body?.orderAmount || 0);
    const commissionAmount = Number(body?.commissionAmount || 0);
    const cashbackAmount = Number(body?.cashbackAmount || 0);
    const storeId = body?.storeId ? String(body.storeId) : null;
    const couponId = body?.couponId ? String(body.couponId) : null;

    if (!trackingCode || !orderId || cashbackAmount <= 0) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    if (orderAmount < 0 || commissionAmount < 0) {
      return NextResponse.json(
        { success: false, message: "Amounts cannot be negative" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const click = await tx.clickLog.findUnique({
        where: { trackingCode },
      });

      if (!click || !click.userId) {
        throw new Error("CLICK_NOT_FOUND");
      }

      const alreadyTracked = await tx.cashbackTransaction.findFirst({
        where: {
          OR: [
            { externalOrderId: orderId },
            { externalTrackingId: trackingCode },
          ],
        },
      });

      if (alreadyTracked) {
        return {
          alreadyTracked: true,
          cashbackTransactionId: alreadyTracked.id,
          walletId: alreadyTracked.walletId,
        };
      }

      const wallet = await tx.wallet.upsert({
        where: { userId: click.userId },
        update: {},
        create: {
          userId: click.userId,
        },
      });

      const now = new Date();
      const payableAt = new Date(now);
      payableAt.setDate(payableAt.getDate() + getCashbackDays());

      const cashbackTxn = await tx.cashbackTransaction.create({
        data: {
          userId: click.userId,
          walletId: wallet.id,
          clickLogId: click.id,
          storeId: storeId || click.storeId || null,
          couponId: couponId || click.couponId || null,
          source: "AFFILIATE_SYNC",
          externalOrderId: orderId,
          externalTrackingId: trackingCode,
          orderAmount,
          commissionAmount,
          cashbackAmount,
          platformMarginAmount: Math.max(
            0,
            commissionAmount - cashbackAmount
          ),
          status: "PENDING",
          trackedAt: now,
          payableAt,
        },
      });

      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          pendingBalance: {
            increment: cashbackAmount,
          },
        },
      });

      await tx.walletLedger.create({
        data: {
          userId: click.userId,
          walletId: wallet.id,
          entryType: "CASHBACK_PENDING",
          amount: cashbackAmount,
          status: "COMPLETED",
          description: `Cashback tracked for order ${orderId}`,
          referenceType: "CASHBACK_TRANSACTION",
          referenceId: cashbackTxn.id,
        },
      });

      await tx.clickLog.update({
        where: { id: click.id },
        data: {
          status: "TRACKED",
        },
      });

      return {
        alreadyTracked: false,
        cashbackTransactionId: cashbackTxn.id,
        walletId: wallet.id,
      };
    });

    if (result.alreadyTracked) {
      return NextResponse.json({
        success: true,
        message: "Order already tracked",
        cashbackTransactionId: result.cashbackTransactionId,
        walletId: result.walletId,
      });
    }

    return NextResponse.json({
      success: true,
      cashbackTransactionId: result.cashbackTransactionId,
      walletId: result.walletId,
    });
  } catch (error: any) {
    console.error("TRACK_ORDER_ERROR", error);

    if (error.message === "CLICK_NOT_FOUND") {
      return NextResponse.json(
        { success: false, message: "Click/user not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Something went wrong",
      },
      { status: 500 }
    );
  }
}