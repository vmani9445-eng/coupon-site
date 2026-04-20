import { prisma } from "@/lib/prisma";
import StoresPageClient, { StoreRow } from "./StoresPageClient";

export default async function AdminStoresPage() {
  const stores = await prisma.store.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          coupons: true,
          cashbackOffers: true,
        },
      },
    },
  });

  const formattedStores: StoreRow[] = stores.map((store) => ({
    id: store.id,
    name: store.name,
    slug: store.slug,
    description: store.description,
    websiteUrl: store.websiteUrl,
    logo: store.logo,
    couponsCount: store._count.coupons,
    cashbackCount: store._count.cashbackOffers,
    isFeatured: store.isFeatured,
    isActive: store.isActive,
    createdAt: store.createdAt.toISOString(),
    cashbackPercentToUser: (store as any).cashbackPercentToUser ?? 70,
  }));

  return <StoresPageClient stores={formattedStores} />;
}