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
    verified: true,
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
  },
  Flipkart: {
    verified: true,
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
};

type StoresPageProps = {
  searchParams?: Promise<{
    category?: string;
  }>;
};

function normalizeText(value?: string | null) {
  return (value || "").trim().toLowerCase();
}

function splitCategoryValues(value?: string | null) {
  if (!value) return [];

  return Array.from(
    new Set(
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    )
  );
}

function storeHasSelectedCategory(
  store: {
    coupons: Array<{
      category?: {
        name?: string | null;
      } | null;
    }>;
  },
  selectedCategory: string
) {
  const target = normalizeText(selectedCategory);

  if (!target || target === "all") return true;

  return store.coupons.some((coupon) =>
    splitCategoryValues(coupon.category?.name).some(
      (cat) => normalizeText(cat) === target
    )
  );
}

function getPrimaryStoreCategory(
  store: {
    coupons: Array<{
      category?: {
        name?: string | null;
      } | null;
    }>;
  },
  selectedCategory: string
) {
  const counts = new Map<string, number>();

  for (const coupon of store.coupons) {
    for (const category of splitCategoryValues(coupon.category?.name)) {
      counts.set(category, (counts.get(category) || 0) + 1);
    }
  }

  if (selectedCategory !== "All") {
    const matched = Array.from(counts.keys()).find(
      (cat) => normalizeText(cat) === normalizeText(selectedCategory)
    );

    if (matched) return matched;
  }

  const sorted = Array.from(counts.entries()).sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return a[0].localeCompare(b[0]);
  });

  return sorted[0]?.[0] || "General";
}

function getAllStoreCategories(store: {
  coupons: Array<{
    category?: {
      name?: string | null;
    } | null;
  }>;
}) {
  return Array.from(
    new Set(
      store.coupons.flatMap((coupon) =>
        splitCategoryValues(coupon.category?.name)
      )
    )
  );
}

function isRealCashbackSource(source?: string | null) {
  const value = (source || "").trim().toLowerCase();
  return value === "admitad" || value === "cuelinks";
}

function getBestStoreCashback(store: {
  coupons: Array<{
    source?: string | null;
    cashbackLabel?: string | null;
    userCashback?: number | null;
    networkCashback?: number | null;
  }>;
  cashbackOffers: Array<{
    source?: string | null;
    cashbackLabel?: string | null;
    userCashback?: number | null;
    networkCashback?: number | null;
    cashbackType?: "PERCENT" | "FLAT";
    cashbackValue?: number | null;
  }>;
}) {
  const labels: string[] = [];

  for (const coupon of store.coupons) {
    if (!isRealCashbackSource(coupon.source)) continue;

    if (coupon.cashbackLabel && coupon.cashbackLabel.trim()) {
      labels.push(coupon.cashbackLabel.trim());
    }
  }

  for (const offer of store.cashbackOffers) {
    if (!isRealCashbackSource(offer.source)) continue;

    if (offer.cashbackLabel && offer.cashbackLabel.trim()) {
      labels.push(offer.cashbackLabel.trim());
    }
  }

  if (labels.length > 0) {
    return labels[0];
  }

  let bestPercent: number | null = null;
  let bestFlat: number | null = null;

  for (const coupon of store.coupons) {
    if (!isRealCashbackSource(coupon.source)) continue;

    if (typeof coupon.userCashback === "number" && coupon.userCashback > 0) {
      bestPercent = Math.max(bestPercent ?? 0, coupon.userCashback);
      continue;
    }

    if (
      typeof coupon.networkCashback === "number" &&
      coupon.networkCashback > 0
    ) {
      bestPercent = Math.max(bestPercent ?? 0, coupon.networkCashback);
    }
  }

  for (const offer of store.cashbackOffers) {
    if (!isRealCashbackSource(offer.source)) continue;

    if (typeof offer.userCashback === "number" && offer.userCashback > 0) {
      if (offer.cashbackType === "FLAT") {
        bestFlat = Math.max(bestFlat ?? 0, offer.userCashback);
      } else {
        bestPercent = Math.max(bestPercent ?? 0, offer.userCashback);
      }
      continue;
    }

    if (
      typeof offer.networkCashback === "number" &&
      offer.networkCashback > 0
    ) {
      if (offer.cashbackType === "FLAT") {
        bestFlat = Math.max(bestFlat ?? 0, offer.networkCashback);
      } else {
        bestPercent = Math.max(bestPercent ?? 0, offer.networkCashback);
      }
      continue;
    }

    if (
      offer.cashbackType === "PERCENT" &&
      typeof offer.cashbackValue === "number" &&
      offer.cashbackValue > 0
    ) {
      bestPercent = Math.max(bestPercent ?? 0, offer.cashbackValue);
    }

    if (
      offer.cashbackType === "FLAT" &&
      typeof offer.cashbackValue === "number" &&
      offer.cashbackValue > 0
    ) {
      bestFlat = Math.max(bestFlat ?? 0, offer.cashbackValue);
    }
  }

  if (typeof bestPercent === "number" && bestPercent > 0) {
    return `Up to ${bestPercent}% extra cashback`;
  }

  if (typeof bestFlat === "number" && bestFlat > 0) {
    return `Up to ₹${
      Number.isInteger(bestFlat) ? bestFlat : bestFlat.toFixed(2)
    } extra cashback`;
  }

  return undefined;
}

export default async function StoresPage({ searchParams }: StoresPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const selectedCategory = params?.category?.trim() || "All";
  const now = new Date();

  const stores = await prisma.store.findMany({
    where: {
      isActive: true,
    },
    include: {
      coupons: {
        where: {
          isActive: true,
          status: "PUBLISHED",
          OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        },
        include: {
          category: true,
        },
      },
      cashbackOffers: {
        where: {
          isActive: true,
          AND: [
            {
              OR: [{ startsAt: null }, { startsAt: { lte: now } }],
            },
            {
              OR: [{ endsAt: null }, { endsAt: { gt: now } }],
            },
          ],
        },
        select: {
          id: true,
          source: true,
          cashbackLabel: true,
          userCashback: true,
          networkCashback: true,
          cashbackType: true,
          cashbackValue: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  const storesWithOffers = stores.filter(
    (store) => store.coupons.length > 0 || store.cashbackOffers.length > 0
  );

  const filteredStores =
    selectedCategory === "All"
      ? storesWithOffers
      : storesWithOffers.filter((store) =>
          storeHasSelectedCategory(store, selectedCategory)
        );

  const storesWithStats: StoreWithStats[] = filteredStores.map((store) => {
    const allStoreCategories = getAllStoreCategories(store);
    const brandMeta = storeBrandMeta[store.name] || {};
    const primaryCategory = getPrimaryStoreCategory(store, selectedCategory);
    const cashback = getBestStoreCashback({
      coupons: store.coupons.map((coupon) => ({
        source: coupon.source,
        cashbackLabel: coupon.cashbackLabel,
        userCashback: coupon.userCashback,
        networkCashback: coupon.networkCashback,
      })),
      cashbackOffers: store.cashbackOffers,
    });

    return {
      name: store.name,
      slug: store.slug,
      category: primaryCategory,
      categories: allStoreCategories,
      offerCount: store.coupons.length + store.cashbackOffers.length,
      couponCount: store.coupons.filter(
        (coupon) => coupon.code && coupon.code.trim() !== ""
      ).length,
      verified: brandMeta.verified ?? true,
      logo: store.logo || brandMeta.logo || "",
      isTrending: indianTopBrands.includes(store.name),
      cashback: cashback || undefined,
    };
  });

  const categoryCounts = new Map<string, number>();

  for (const store of storesWithOffers) {
    const storeCategories = getAllStoreCategories(store);

    for (const category of storeCategories) {
      categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
    }
  }

  const allCategories = Array.from(categoryCounts.keys()).sort((a, b) =>
    a.localeCompare(b)
  );

  const categories = ["All", ...allCategories];
  const topIndianStores = storesWithStats.filter((store) =>
    indianTopBrands.includes(store.name)
  );

  return (
    <main className="pageContainer">
      <StoresClient
        categories={categories}
        categoryCounts={Object.fromEntries(categoryCounts)}
        stores={storesWithStats}
        topIndianStores={topIndianStores}
        initialCategory={selectedCategory}
      />
    </main>
  );
}