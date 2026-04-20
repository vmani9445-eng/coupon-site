import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const dummyCoupons = await prisma.coupon.findMany({
      where: { source: "dummy" },
      select: {
        id: true,
        storeId: true,
        categoryId: true,
      },
    });

    const storeIds = [
      ...new Set(
        dummyCoupons
          .map((item) => item.storeId)
          .filter((value): value is string => Boolean(value))
      ),
    ];

    const categoryIds = [
      ...new Set(
        dummyCoupons
          .map((item) => item.categoryId)
          .filter((value): value is string => Boolean(value))
      ),
    ];

    const deletedCoupons = await prisma.coupon.deleteMany({
      where: { source: "dummy" },
    });

    let deletedStores = 0;
    let deletedCategories = 0;

    for (const storeId of storeIds) {
      const remainingCoupons = await prisma.coupon.count({
        where: { storeId },
      });

      const remainingCashbackOffers = await prisma.cashbackOffer.count({
        where: { storeId },
      });

      if (remainingCoupons === 0 && remainingCashbackOffers === 0) {
        try {
          await prisma.store.delete({
            where: { id: storeId },
          });
          deletedStores++;
        } catch {
          // keep going if store cannot be deleted
        }
      }
    }

    for (const categoryId of categoryIds) {
      const remainingCoupons = await prisma.coupon.count({
        where: { categoryId },
      });

      if (remainingCoupons === 0) {
        try {
          await prisma.category.delete({
            where: { id: categoryId },
          });
          deletedCategories++;
        } catch {
          // keep going if category cannot be deleted
        }
      }
    }

    return NextResponse.json({
      ok: true,
      message: "Dummy data removed successfully",
      deletedCoupons: deletedCoupons.count,
      deletedStores,
      deletedCategories,
    });
  } catch (err: any) {
    console.error("REMOVE DUMMY ERROR:", err);

    return NextResponse.json(
      {
        ok: false,
        error: err?.message || "failed to remove dummy data",
      },
      { status: 500 }
    );
  }
}