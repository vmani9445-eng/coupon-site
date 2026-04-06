import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const coupon = await prisma.coupon.findUnique({
    where: { id },
  });

  if (!coupon) {
    return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
  }

  await prisma.coupon.update({
    where: { id },
    data: {
      clicks: {
        increment: 1,
      },
      usesToday: {
        increment: 1,
      },
    },
  });

  return NextResponse.json({
    success: true,
    code: coupon.code,
    affiliateUrl: coupon.affiliateUrl || "#",
  });
}