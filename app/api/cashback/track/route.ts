import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 🧠 CASHBACK CALCULATION ENGINE
function calculateCashback(
  commissionAmount: number,
  userType: "normal" | "first_time" | "vip"
) {
  let percent = 0.5; // default 50%

  if (userType === "first_time") percent = 0.7;
  if (userType === "vip") percent = 0.8;

  const cashbackAmount = Math.floor(commissionAmount * percent);
  const platformMargin = commissionAmount - cashbackAmount;

  return { cashbackAmount, platformMargin };
}

// 🧠 USER TYPE DETECTION
function getUserType(user: any): "normal" | "first_time" | "vip" {
  if (!user) return "normal";

  const now = Date.now();
  const created = new Date(user.createdAt).getTime();

  // 🆕 New user (7 days)
  if (now - created < 7 * 24 * 60 * 60 * 1000) {
    return "first_time";
  }

  // 💎 VIP user
  if ((user.wallet?.lifetimeEarned || 0) > 100000) {
    return "vip";
  }

  return "normal";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const trackingCode = body.trackingCode;
    const orderAmount = Number(body.orderAmount || 0);
    const commissionAmount = Number(body.commissionAmount || 0);

    // ✅ VALIDATION
    if (!trackingCode || commissionAmount <= 0) {
      return NextResponse.json(
        { error: "Invalid tracking data" },
        { status: 400 }
      );
    }

    // 🔍 FIND CLICK + USER
    const click = await prisma.clickLog.findUnique({
      where: { trackingCode },
      include: {
        user: {
          include: {
            wallet: true,
          },
        },
      },
    });

    if (!click || !click.userId) {
      return NextResponse.json(
        { error: "Invalid tracking code" },
        { status: 400 }
      );
    }

    // ❌ STRONG DUPLICATE CHECK
    const existing = await prisma.cashbackTransaction.findFirst({
      where: {
        OR: [
          { clickLogId: click.id },
          { externalTrackingId: trackingCode },
        ],
      },
    });

    if (existing) {
      return NextResponse.json({
        ok: true,
        message: "Already tracked",
      });
    }

    // 🧠 DETECT USER TYPE
    const userType = getUserType(click.user);

    // 💰 CALCULATE CASHBACK
    const { cashbackAmount, platformMargin } = calculateCashback(
      commissionAmount,
      userType
    );

    // 🪙 ENSURE WALLET EXISTS
    await prisma.wallet.upsert({
      where: { userId: click.userId },
      update: {},
      create: {
        userId: click.userId,
      },
    });

    // ✅ CREATE CASHBACK TRANSACTION
    const txn = await prisma.cashbackTransaction.create({
      data: {
        userId: click.userId,
        clickLogId: click.id,
        storeId: click.storeId,
        couponId: click.couponId,

        orderAmount,
        commissionAmount,
        cashbackAmount,
        platformMarginAmount: platformMargin,

        externalTrackingId: trackingCode,
        status: "PENDING",
        trackedAt: new Date(),
      },
    });

    // ✅ UPDATE CLICK STATUS
    await prisma.clickLog.update({
      where: { id: click.id },
      data: {
        status: "TRACKED",
      },
    });

    return NextResponse.json({
      ok: true,
      txn,
      debug: {
        userType,
        cashbackAmount,
        platformMargin,
      },
    });

  } catch (err) {
    console.error("CASHBACK TRACK ERROR:", err);

    return NextResponse.json(
      { error: "Tracking failed" },
      { status: 500 }
    );
  }
}