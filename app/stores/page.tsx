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

const storeBrandMeta: Record<
  string,
  {
    verified?: boolean;
    logo?: string;
  }
> = {
  Amazon: {
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
  },
  Flipkart: {
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/00/Flipkart_logo.png",
  },
  Myntra: {
    verified: true,
    logo: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Myntra_logo.png",
  },
  Ajio: {
    verified: true,
    logo: "https://upload.wikimedia.org/wikipedia/commons/7/7d/Ajio-Logo.svg",
  },
  Nykaa: {
    verified: true,
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/00/Nykaa_Logo.png",
  },
  "Tata Cliq": {
    verified: true,
    logo: "https://upload.wikimedia.org/wikipedia/commons/8/89/Tata_CLiQ_logo.png",
  },
  Meesho: {
    verified: true,
    logo: "https://upload.wikimedia.org/wikipedia/commons/3/33/Meesho_logo.png",
  },
  "Reliance Digital": {
    verified: true,
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/f7/Reliance_Digital.svg",
  },
  Croma: {
    verified: true,
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/0d/Croma_Logo.svg",
  },
};

type StoresPageProps = {
  searchParams?: Promise<{
    category?: string;
  }>;
};

export default async function StoresPage({ searchParams }: StoresPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const selectedCategory = params?.category?.trim() || "All";

  const stores = await prisma.store.findMany({
    where: {
      isActive: true,
      ...(selectedCategory !== "All"
        ? {
            coupons: {
              some: {
                isActive: true,
                status: "PUBLISHED",
                category: selectedCategory,
              },
            },
          }
        : {}),
    },
    include: {
      coupons: {
        where: {
          isActive: true,
          status: "PUBLISHED",
        },
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
    const allCategories = store.coupons
      .map((coupon) => coupon.category)
      .filter((category): category is string => Boolean(category?.trim()));

    const uniqueCategories = Array.from(new Set(allCategories));
    const brandMeta = storeBrandMeta[store.name] || {};

    const primaryCategory =
      selectedCategory !== "All" && uniqueCategories.includes(selectedCategory)
        ? selectedCategory
        : uniqueCategories[0] || "General";

    return {
      name: store.name,
      slug: store.slug,
      category: primaryCategory,
      offerCount: store.coupons.length,
      couponCount: store.coupons.filter(
        (coupon) => typeof coupon.code === "string" && coupon.code.trim() !== ""
      ).length,
      verified: brandMeta.verified ?? false,
      logo: brandMeta.logo ?? "",
    };
  });

  const allCategories = Array.from(
    new Set(
      stores.flatMap((store) =>
        store.coupons
          .map((coupon) => coupon.category)
          .filter((category): category is string => Boolean(category?.trim()))
      )
    )
  ).sort();

  const categories = ["All", ...allCategories];

  const topIndianStores = storesWithStats.filter((store) =>
    indianTopBrands.includes(store.name)
  );

  return (
    <main className="pageContainer">
      <StoresClient
        categories={categories}
        stores={storesWithStats}
        topIndianStores={topIndianStores}
        initialCategory={selectedCategory}
      />
    </main>
  );
}