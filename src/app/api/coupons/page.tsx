import { prisma } from "@/lib/prisma";
import CouponsPageClient from "./CouponsPageClient";

export default async function AdminCouponsPage() {
  const [coupons, stores] = await Promise.all([
    prisma.coupon.findMany({
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.store.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
      },
    }),
  ]);

  const formattedCoupons = coupons.map((coupon) => ({
    id: coupon.id,
    storeId: coupon.storeId,
    title: coupon.title,
    description: coupon.description,
    code: coupon.code,
    discount: coupon.discount,
    category: coupon.category?.name ?? null,
    bank: coupon.bank,
    affiliateUrl: coupon.affiliateUrl,
    expiresAt: coupon.expiresAt
      ? new Date(coupon.expiresAt).toISOString().split("T")[0]
      : null,
    isFeatured: coupon.isFeatured,
    isActive: coupon.isActive,
  }));

  return <CouponsPageClient coupons={formattedCoupons} stores={stores} />;
}