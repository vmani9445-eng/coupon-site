import { prisma } from "@/lib/prisma";
import StoreCouponsClient from "../../Components/StoreCouponsClient";

type StorePageProps = {
  params: Promise<{ slug: string }>;
};

type ClientCoupon = {
  id: string;
  storeId?: string;
  title: string;
  description: string;
  discount: string;
  category: string;
  bankOffer?: string;
  usersToday: number;
  expiresText: string;
  verified?: boolean;
  best?: boolean;
  couponCode?: string;
  affiliateUrl: string;
  type: "coupon" | "deal";
  terms?: string[];
  extraCashback?: string;
  networkCashback?: number;
  userCashback?: number;
  adminMargin?: number;
  cashbackLabel?: string;
};

type ClientStore = {
  slug: string;
  name: string;
  description: string;
  logo?: string | null;
  logoText: string;
  offersCount: number;
  tags: string[];
  coupons: ClientCoupon[];
  categories: string[];
};

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

function cashbackValueToText(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function buildCashbackText(params: {
  cashbackLabel?: string | null;
  userCashback?: number | null;
  cashbackType?: "PERCENT" | "FLAT" | null;
  cashbackValue?: number | null;
}) {
  if (params.cashbackLabel && params.cashbackLabel.trim()) {
    return params.cashbackLabel.trim();
  }

  if (typeof params.userCashback === "number" && params.userCashback > 0) {
    return `Up to ${params.userCashback}% cashback`;
  }

  if (
    params.cashbackType === "PERCENT" &&
    typeof params.cashbackValue === "number" &&
    params.cashbackValue > 0
  ) {
    return `Up to ${params.cashbackValue}% cashback`;
  }

  if (
    params.cashbackType === "FLAT" &&
    typeof params.cashbackValue === "number" &&
    params.cashbackValue > 0
  ) {
    return `Up to ₹${cashbackValueToText(params.cashbackValue)} cashback`;
  }

  return undefined;
}

export default async function StorePage({ params }: StorePageProps) {
  const { slug } = await params;
  const now = new Date();

  const store = await prisma.store.findUnique({
    where: { slug },
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
        orderBy: {
          createdAt: "desc",
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
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!store) {
    return (
      <main className="pageContainer">
        <div className="notFoundCard">Store not found.</div>
      </main>
    );
  }

  const couponItems: ClientCoupon[] = store.coupons.map((coupon) => {
    const extraCashback = buildCashbackText({
      cashbackLabel: coupon.cashbackLabel,
      userCashback: coupon.userCashback,
    });

    return {
      id: coupon.id,
      storeId: coupon.storeId,
      title: coupon.title,
      description: coupon.description || "Limited-time deal available now.",
      discount: coupon.discount || "SAVE",
      category: coupon.category?.name || "General",
      bankOffer: coupon.bank || undefined,
      usersToday: coupon.usesToday ?? 0,
      expiresText: coupon.expiresAt
        ? `Ends ${new Date(coupon.expiresAt).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
          })}`
        : "Limited time",
      verified: coupon.verified ?? true,
      best: Boolean(coupon.isFeatured),
      couponCode: coupon.code || undefined,
      affiliateUrl: coupon.affiliateUrl || "#",
      type: coupon.code ? "coupon" : "deal",
      extraCashback: extraCashback || undefined,
      networkCashback:
        typeof coupon.networkCashback === "number" && coupon.networkCashback > 0
          ? coupon.networkCashback
          : undefined,
      userCashback:
        typeof coupon.userCashback === "number" && coupon.userCashback > 0
          ? coupon.userCashback
          : undefined,
      adminMargin:
        typeof coupon.adminMargin === "number" && coupon.adminMargin > 0
          ? coupon.adminMargin
          : undefined,
      cashbackLabel:
        coupon.cashbackLabel && coupon.cashbackLabel.trim()
          ? coupon.cashbackLabel
          : undefined,
      terms: [
        "Offer valid for a limited time only.",
        "Applicable on selected products.",
        "Final discount may vary at checkout.",
      ],
    };
  });

  const cashbackItems: ClientCoupon[] = store.cashbackOffers.map((cashback) => {
    const extraCashback = buildCashbackText({
      cashbackLabel: cashback.cashbackLabel,
      userCashback: cashback.userCashback,
      cashbackType: cashback.cashbackType,
      cashbackValue: cashback.cashbackValue,
    });

    return {
      id: cashback.id,
      storeId: cashback.storeId,
      title: cashback.title,
      description: cashback.description || "Cashback offer available now.",
      discount:
        cashback.cashbackType === "PERCENT"
          ? `${cashback.cashbackValue}% cashback`
          : `₹${cashbackValueToText(cashback.cashbackValue)} cashback`,
      category: "Cashback",
      usersToday: 0,
      expiresText: cashback.endsAt
        ? `Ends ${new Date(cashback.endsAt).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
          })}`
        : "Limited time",
      verified: true,
      best: Boolean(cashback.isFeatured),
      affiliateUrl: cashback.affiliateUrl || "#",
      type: "deal",
      extraCashback: extraCashback || undefined,
      networkCashback:
        typeof cashback.networkCashback === "number" &&
        cashback.networkCashback > 0
          ? cashback.networkCashback
          : undefined,
      userCashback:
        typeof cashback.userCashback === "number" && cashback.userCashback > 0
          ? cashback.userCashback
          : undefined,
      adminMargin:
        typeof cashback.adminMargin === "number" && cashback.adminMargin > 0
          ? cashback.adminMargin
          : undefined,
      cashbackLabel:
        cashback.cashbackLabel && cashback.cashbackLabel.trim()
          ? cashback.cashbackLabel
          : undefined,
      terms: cashback.terms
        ? [cashback.terms]
        : [
            "Cashback offer valid for a limited time only.",
            "Applicable on selected transactions.",
            "Final cashback may vary as per merchant terms.",
          ],
    };
  });

  const formattedCoupons: ClientCoupon[] = [...couponItems, ...cashbackItems];

  const categories = Array.from(
    new Set(
      formattedCoupons.flatMap((coupon) => splitCategoryValues(coupon.category))
    )
  ).filter((category) => category && category !== "General");

  const formattedStore: ClientStore = {
    slug: store.slug,
    name: store.name,
    description:
      store.description ||
      `Latest ${store.name} offers, exclusive coupon codes, and verified shopping deals for India.`,
    logo: store.logo || null,
    logoText: store.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
    offersCount: formattedCoupons.length,
    tags: ["Verified Coupons", "Updated Daily", "Best Deals"],
    coupons: formattedCoupons,
    categories: categories.length > 0 ? categories : ["General"],
  };

  return (
    <main className="pageContainer">
      <StoreCouponsClient store={formattedStore} />
    </main>
  );
}