import { prisma } from "@/lib/prisma";
import CouponsPageClient from "./CouponsPageClient";

export default async function AdminCouponsPage() {
  const [coupons, stores] = await Promise.all([
    prisma.coupon.findMany({
      include: {
        store: true,
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
    title: coupon.title,
    storeName: coupon.store.name,
    code: coupon.code,
    type: coupon.code ? "Coupon" : "Deal",
    source: coupon.source,
    discount: coupon.discount,
    category: coupon.category,
    affiliateUrl: coupon.affiliateUrl,
    isFeatured: coupon.isFeatured,
    verified: coupon.verified,
  }));

  return (
    <CouponsPageClient
      coupons={formattedCoupons}
      stores={stores}
    />
  );
}