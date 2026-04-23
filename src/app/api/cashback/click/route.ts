import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
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

    await prisma.clickLog.create({
      data: {
        userId: session?.userId ?? null,
        storeId: coupon.storeId,
        couponId: coupon.id,
        targetUrl: affiliateUrl,
        clickType: "COUPON",
        sourceLabel: "STORE_MODAL",
        storeSlug: coupon.store?.slug ?? null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("activate click error", error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Something went wrong",
      },
      { status: 500 }
    );
  }
}