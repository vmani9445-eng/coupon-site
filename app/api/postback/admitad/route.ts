import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

function mapStatus(raw?: string | null) {

  const value = String(raw || "").toLowerCase();

  if (

    ["approved", "confirmed", "paid", "payable", "processed"].includes(value)

  ) {

    return "CONFIRMED" as const;

  }

  if (

    ["declined", "rejected", "cancelled", "canceled", "failed"].includes(value)

  ) {

    return "REJECTED" as const;

  }

  return "PENDING" as const;

}

async function syncWallet(userId: string) {

  const wallet = await prisma.wallet.upsert({

    where: { userId },

    update: {},

    create: { userId },

  });

  const txns = await prisma.cashbackTransaction.findMany({

    where: { userId },

    select: {

      cashbackAmount: true,

      status: true,

    },

  });

  let pendingBalance = 0;

  let confirmedBalance = 0;

  let availableBalance = 0;

  let lifetimeEarned = 0;

  let lifetimeRejected = 0;

  for (const txn of txns) {

    const amount = txn.cashbackAmount || 0;

    if (txn.status === "PENDING" || txn.status === "TRACKING") {

      pendingBalance += amount;

    }

    if (txn.status === "CONFIRMED" || txn.status === "PAYABLE") {

      confirmedBalance += amount;

      availableBalance += amount;

      lifetimeEarned += amount;

    }

    if (txn.status === "PAID") {

      confirmedBalance += amount;

      lifetimeEarned += amount;

    }

    if (txn.status === "REJECTED") {

      lifetimeRejected += amount;

    }

  }

  const paidWithdrawals = await prisma.withdrawalRequest.aggregate({

    where: {

      userId,

      status: "PAID",

    },

    _sum: {

      amount: true,

    },

  });

  const lifetimeWithdrawn = paidWithdrawals._sum.amount || 0;

  await prisma.wallet.update({

    where: { id: wallet.id },

    data: {

      pendingBalance,

      confirmedBalance,

      availableBalance: Math.max(0, availableBalance - lifetimeWithdrawn),

      lifetimeEarned,

      lifetimeWithdrawn,

      lifetimeRejected,

    },

  });

}

export async function GET(req: NextRequest) {

  try {

    const { searchParams } = new URL(req.url);

    const trackingCode =

      searchParams.get("subid") ||

      searchParams.get("sub_id") ||

      searchParams.get("click_id") ||

      searchParams.get("uid") ||

      searchParams.get("aff_sub");

    if (!trackingCode) {

      return NextResponse.json(

        { error: "Missing tracking code" },

        { status: 400 }

      );

    }

    const clickLog = await prisma.clickLog.findUnique({

      where: { trackingCode },

    });

    if (!clickLog || !clickLog.userId) {

      return NextResponse.json(

        { error: "Click not found or not attached to user" },

        { status: 404 }

      );

    }

    const externalOrderId =

      searchParams.get("action_id") ||

      searchParams.get("order_id") ||

      searchParams.get("transaction_id") ||

      searchParams.get("sale_id");

    const rawStatus =

      searchParams.get("status") ||

      searchParams.get("action_status") ||

      searchParams.get("state");

    const orderAmount = Math.round(

      Number(

        searchParams.get("cart") ||

          searchParams.get("order_sum") ||

          searchParams.get("amount") ||

          0

      )

    );

    const commissionAmount = Math.round(

      Number(

        searchParams.get("payment") ||

          searchParams.get("commission") ||

          searchParams.get("payout") ||

          0

      )

    );

    const status = mapStatus(rawStatus);

    const cashbackAmount = Math.max(0, Math.floor(commissionAmount * 0.7));

    const platformMarginAmount = Math.max(0, commissionAmount - cashbackAmount);

    const existing = await prisma.cashbackTransaction.findFirst({

      where: {

        OR: [

          externalOrderId ? { externalOrderId } : undefined,

          { externalTrackingId: trackingCode },

        ].filter(Boolean) as any,

      },

    });

    const txn = existing

      ? await prisma.cashbackTransaction.update({

          where: { id: existing.id },

          data: {

            source: "ADMITAD",

            externalOrderId: externalOrderId || existing.externalOrderId,

            externalTrackingId: trackingCode,

            orderAmount,

            commissionAmount,

            cashbackAmount,

            platformMarginAmount,

            status,

            confirmedAt:

              status === "CONFIRMED" ? new Date() : existing.confirmedAt,

            rejectedAt:

              status === "REJECTED" ? new Date() : existing.rejectedAt,

            rejectionReason:

              status === "REJECTED"

                ? searchParams.get("reason") || existing.rejectionReason

                : existing.rejectionReason,

          },

        })

      : await prisma.cashbackTransaction.create({

          data: {

            userId: clickLog.userId,

            clickLogId: clickLog.id,

            storeId: clickLog.storeId,

            couponId: clickLog.couponId,

            cashbackOfferId: clickLog.cashbackId,

            source: "ADMITAD",

            externalOrderId: externalOrderId || null,

            externalTrackingId: trackingCode,

            orderAmount,

            commissionAmount,

            cashbackAmount,

            platformMarginAmount,

            status,

            trackedAt: new Date(),

            confirmedAt: status === "CONFIRMED" ? new Date() : null,

            rejectedAt: status === "REJECTED" ? new Date() : null,

            rejectionReason:

              status === "REJECTED" ? searchParams.get("reason") || null : null,

          },

        });

    await prisma.clickLog.update({

      where: { id: clickLog.id },

      data: {

        status:

          status === "CONFIRMED"

            ? "CONFIRMED"

            : status === "REJECTED"

            ? "REJECTED"

            : "TRACKED",

      },

    });

    await syncWallet(clickLog.userId);

    return NextResponse.json({ ok: true, transactionId: txn.id });

  } catch (error) {

    console.error("ADMITAD_POSTBACK_ERROR", error);

    return NextResponse.json(

      { error: "Admitad postback failed" },

      { status: 500 }

    );

  }

}