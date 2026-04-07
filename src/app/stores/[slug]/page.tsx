import { prisma } from "@/lib/prisma";
import StoreCouponsClient from "../../Components/StoreCouponsClient";

type StorePageProps = {
  params: Promise<{ slug: string }>;
};

type ClientCoupon = {
  id: string;
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
};

type ClientStore = {
  slug: string;
  name: string;
  description: string;
  logoText: string;
  offersCount: number;
  tags: string[];
  coupons: ClientCoupon[];
  categories: string[];
};

export default async function StorePage({ params }: StorePageProps) {
  const { slug } = await params;

  const store = await prisma.store.findUnique({
    where: { slug },
    include: {
      coupons: {
        orderBy: { createdAt: "desc" },
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

  const formattedCoupons: ClientCoupon[] = store.coupons.map((coupon) => ({
    id: coupon.id,
    title: coupon.title,
    description: coupon.description || "Limited-time deal available now.",
    discount: coupon.discount || "SAVE",
    category: coupon.category || "General",
    bankOffer: coupon.bank || undefined,
  usersToday: coupon.usesToday ?? 0,
    expiresText: coupon.expiresAt
      ? `Ends ${new Date(coupon.expiresAt).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
        })}`
      : "Limited time",
    verified: coupon.verified ?? true,
    best: true,
    couponCode: coupon.code || undefined,
    affiliateUrl: "#",
    type: coupon.code ? "coupon" : "deal",
    terms: [
      "Offer valid for a limited time only.",
      "Applicable on selected products.",
      "Final discount may vary at checkout.",
    ],
  }));

  const formattedStore: ClientStore = {
    slug: store.slug,
    name: store.name,
    description:
      store.description ||
      `Latest ${store.name} offers, exclusive coupon codes, and verified shopping deals for India.`,
    logoText: store.name.slice(0, 2).toUpperCase(),
    offersCount: formattedCoupons.length,
    tags: ["Verified Coupons", "Updated Daily", "Best Deals"],
    coupons: formattedCoupons,
    categories:
      formattedCoupons.length > 0
        ? Array.from(new Set(formattedCoupons.map((item) => item.category)))
        : ["General"],
  };

  return (
    <main className="pageContainer">
      <StoreCouponsClient store={formattedStore} />
    </main>
  );
}