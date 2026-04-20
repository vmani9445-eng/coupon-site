import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const session = await getSession();

    const rawUserId = isNonEmptyString(session?.userId) ? session.userId : null;
    const rawSessionId = isNonEmptyString(body.sessionId) ? body.sessionId : null;
    const rawStoreId = isNonEmptyString(body.storeId) ? body.storeId : null;
    const rawCouponId = isNonEmptyString(body.couponId) ? body.couponId : null;
    const rawCashbackId = isNonEmptyString(body.cashbackId) ? body.cashbackId : null;
    const targetUrl = isNonEmptyString(body.targetUrl) ? body.targetUrl : null;

    if (!targetUrl) {
      return NextResponse.json(
        { success: false, error: "Missing targetUrl" },
        { status: 400 }
      );
    }

    if (!rawCouponId && !rawCashbackId) {
      return NextResponse.json(
        { success: false, error: "Missing couponId or cashbackId" },
        { status: 400 }
      );
    }

    const trackingCode = `trk_${Date.now()}_${randomUUID().replace(/-/g, "")}`;

    const [validUser, validSession, validStore, validCoupon, validCashback] =
      await Promise.all([
        rawUserId
          ? prisma.user.findUnique({
              where: { id: rawUserId },
              select: { id: true },
            })
          : Promise.resolve(null),

        rawSessionId
          ? prisma.userSession.findUnique({
              where: { id: rawSessionId },
              select: { id: true },
            })
          : Promise.resolve(null),

        rawStoreId
          ? prisma.store.findUnique({
              where: { id: rawStoreId },
              select: { id: true },
            })
          : Promise.resolve(null),

        rawCouponId
          ? prisma.coupon.findUnique({
              where: { id: rawCouponId },
              select: { id: true, storeId: true },
            })
          : Promise.resolve(null),

        rawCashbackId
          ? prisma.cashbackOffer.findUnique({
              where: { id: rawCashbackId },
              select: { id: true, storeId: true },
            })
          : Promise.resolve(null),
      ]);

    const resolvedStoreId =
      validStore?.id || validCoupon?.storeId || validCashback?.storeId || null;

    const clickData: {
      trackingCode: string;
      clickType: "COUPON" | "CASHBACK";
      targetUrl: string;
      status: "CLICKED";
      sourceLabel: string;
      userId?: string;
      sessionId?: string;
      storeId?: string;
      couponId?: string;
      cashbackId?: string;
    } = {
      trackingCode,
      clickType: validCashback ? "CASHBACK" : "COUPON",
      targetUrl,
      status: "CLICKED",
      sourceLabel: "STORE_MODAL",
    };

    if (validUser?.id) clickData.userId = validUser.id;
    if (validSession?.id) clickData.sessionId = validSession.id;
    if (resolvedStoreId) clickData.storeId = resolvedStoreId;
    if (validCoupon?.id) clickData.couponId = validCoupon.id;
    if (validCashback?.id) clickData.cashbackId = validCashback.id;

    console.log("CLICK_DEBUG", {
      rawUserId,
      rawSessionId,
      rawStoreId,
      rawCouponId,
      rawCashbackId,
      validUserId: validUser?.id || null,
      validSessionId: validSession?.id || null,
      validStoreId: validStore?.id || null,
      validCouponId: validCoupon?.id || null,
      validCashbackId: validCashback?.id || null,
      resolvedStoreId,
      clickData,
    });

    const clickLog = await prisma.clickLog.create({
      data: clickData,
    });

    const redirectUrl = new URL(targetUrl);
    if (!redirectUrl.searchParams.has("subid")) {
      redirectUrl.searchParams.set("subid", trackingCode);
    }
    if (!redirectUrl.searchParams.has("aff_sub")) {
      redirectUrl.searchParams.set("aff_sub", trackingCode);
    }
    if (!redirectUrl.searchParams.has("click_id")) {
      redirectUrl.searchParams.set("click_id", trackingCode);
    }

    return NextResponse.json({
      success: true,
      trackingCode,
      redirectUrl: redirectUrl.toString(),
      clickLogId: clickLog.id,
    });
  } catch (error) {
    console.error("CASHBACK_CLICK_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create cashback click",
      },
      { status: 500 }
    );
  }
}