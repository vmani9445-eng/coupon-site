import { prisma } from "@/lib/prisma";
import StoresPageClient from "./StoresPageClient";

export default async function AdminStoresPage() {
  const stores = await prisma.store.findMany({
    include: {
      _count: {
        select: {
          coupons: true,
          cashback: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedStores = stores.map((store) => ({
    id: store.id,
    name: store.name,
    slug: store.slug,
    description: store.description,
    websiteUrl: store.websiteUrl,
    logo: store.logo,
    couponsCount: store._count.coupons,
    cashbackCount: store._count.cashback,
    isFeatured: store.isFeatured,
  }));

  return <StoresPageClient stores={formattedStores} />;
}