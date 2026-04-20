import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

function generateTrackingCode() {
  return `trk_${Date.now()}_${crypto.randomUUID().replace(/-/g, "")}`;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    const body = await req.json();

    const couponId = String(body?.couponId || "");
    const affiliateUrl = String(body?.affiliateUrl || "");

    if (!couponId || !affiliateUrl) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.findUnique({
      where: { id: couponId },
      include: { store: true },
    });

    if (!coupon) {
      return NextResponse.json(
        { success: false, message: "Coupon not found" },
        { status: 404 }
      );
    }

    const trackingCode = generateTrackingCode();

    await prisma.clickLog.create({
      data: {
        userId: session?.user?.id ?? null,
        storeId: coupon.storeId,
        couponId: coupon.id,
        targetUrl: affiliateUrl,
        clickType: "COUPON",
        sourceLabel: "STORE_MODAL",
        trackingCode, // ✅ IMPORTANT
        storeSlug: coupon.store?.slug ?? null,
        status: "CLICKED",
      },
    });

    return NextResponse.json({
      success: true,
      trackingCode,
    });
  } catch (error) {
    console.error("activate click error", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}