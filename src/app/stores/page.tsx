import { prisma } from "@/lib/prisma";
import StoresClient, { type StoreWithStats } from "../Components/StoresClient";

type StoresPageProps = {
  searchParams?: Promise<{
    category?: string;
  }>;
};

type CouponCategory = {
  name?: string | null;
} | null;

type StoreCoupon = {
  code?: string | null;
  source?: string | null;
  cashbackLabel?: string | null;
  userCashback?: number | null;
  networkCashback?: number | null;
  category?: CouponCategory;
};

type StoreCashbackOffer = {
  source?: string | null;
  cashbackLabel?: string | null;
  userCashback?: number | null;
  networkCashback?: number | null;
  cashbackType?: "PERCENT" | "FLAT" | null;
  cashbackValue?: number | null;
};

type StoreWithRelations = {
  name: string;
  slug: string;
  logo?: string | null;
  isFeatured?: boolean | null;
  coupons: StoreCoupon[];
  cashbackOffers: StoreCashbackOffer[];
};

function normalizeText(value?: string | null) {
  return (value || "").trim().toLowerCase();
}

function isNonEmptyString(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function splitCategoryValues(value?: string | null) {
  if (!value) return [];

  return Array.from(
    new Set(
      value
        .split(",")
        .map((item) => item.trim())
        .filter(isNonEmptyString)
    )
  );
}

function storeHasSelectedCategory(
  store: Pick<StoreWithRelations, "coupons">,
  selectedCategory: string
) {
  const target = normalizeText(selectedCategory);

  if (!target || target === "all") return true;

  return store.coupons.some((coupon) =>
    splitCategoryValues(coupon.category?.name ?? null).some(
      (cat) => normalizeText(cat) === target
    )
  );
}

function getPrimaryStoreCategory(
  store: Pick<StoreWithRelations, "coupons">,
  selectedCategory: string
) {
  const counts = new Map<string, number>();

  for (const coupon of store.coupons) {
    for (const category of splitCategoryValues(coupon.category?.name ?? null)) {
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

function getAllStoreCategories(store: Pick<StoreWithRelations, "coupons">) {
  return Array.from(
    new Set(
      store.coupons.flatMap((coupon) =>
        splitCategoryValues(coupon.category?.name ?? null)
      )
    )
  );
}

function isRealCashbackSource(source?: string | null) {
  const value = (source || "").trim().toLowerCase();
  return (
    value === "admitad" ||
    value === "cuelinks" ||
    value === "cuelinks-manual"
  );
}

function getBestStoreCashback(
  store: Pick<StoreWithRelations, "coupons" | "cashbackOffers">
) {
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
    return `Up to ${
      Number.isInteger(bestPercent) ? bestPercent : bestPercent.toFixed(2)
    }% cashback`;
  }

  if (typeof bestFlat === "number" && bestFlat > 0) {
    return `Up to ₹${
      Number.isInteger(bestFlat) ? bestFlat : bestFlat.toFixed(2)
    } cashback`;
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
    const primaryCategory = getPrimaryStoreCategory(store, selectedCategory);

    const cashback = getBestStoreCashback({
      coupons: store.coupons.map((coupon) => ({
        code: coupon.code,
        source: coupon.source,
        cashbackLabel: coupon.cashbackLabel,
        userCashback: coupon.userCashback,
        networkCashback: coupon.networkCashback,
        category: coupon.category,
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
        (coupon) => typeof coupon.code === "string" && coupon.code.trim() !== ""
      ).length,
      verified: true,
      logo: store.logo || "",
      isTrending: Boolean(store.isFeatured),
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
  const topIndianStores = storesWithStats.filter((store) => store.isTrending);

  return (
    <main className="pageContainer">
      <StoresClient
        categories={categories}
        categoryCounts={Object.fromEntries(categoryCounts.entries())}
        stores={storesWithStats}
        topIndianStores={topIndianStores}
        initialCategory={selectedCategory}
      />
    </main>
  );
}