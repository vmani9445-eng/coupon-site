import { prisma } from "@/lib/prisma";
import StoresClient, { type StoreWithStats } from "../Components/StoresClient";

const indianTopBrands = [
  "Amazon",
  "Flipkart",
  "Myntra",
  "Ajio",
  "Nykaa",
  "Tata Cliq",
  "Meesho",
  "Reliance Digital",
];

export default async function StoresPage() {
  const stores = await prisma.store.findMany({
    include: {
      coupons: {
        select: {
          code: true,
          category: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  const storesWithStats: StoreWithStats[] = stores.map((store) => {
    const categories = store.coupons
      .map((coupon) => coupon.category)
      .filter((category): category is string => Boolean(category?.trim()));

    return {
      name: store.name,
      slug: store.slug,
      category: categories[0] || "General",
      offerCount: store.coupons.length,
      couponCount: store.coupons.filter(
        (coupon) => typeof coupon.code === "string" && coupon.code.trim() !== ""
      ).length,
    };
  });

  const categories = Array.from(
    new Set(storesWithStats.map((store) => store.category))
  );

  const topIndianStores = storesWithStats.filter((store) =>
    indianTopBrands.includes(store.name)
  );

  return (
    <main className="pageContainer">
      <StoresClient
        categories={categories}
        stores={storesWithStats}
        topIndianStores={topIndianStores}
      />
    </main>
  );
}