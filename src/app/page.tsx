import { prisma } from "@/lib/prisma";
import HomeClient from "./homeClient";

type SectionControl = {
  hero: boolean;
  top_brands: boolean;
  categories: boolean;
  featured_coupons: boolean;
  promo_row: boolean;
  footer_banner: boolean;
};

export default async function HomePage() {
  const [
    featuredStoresRaw,
    fallbackStores,
    popularStoresRaw,
    featuredCouponsRaw,
    heroTopBanners,
    homepageTopRightTopBanner,
    homepageTopRightBottomBanner,
    homepageMiddleStripBanner,
    homepageLowerBoxBanner,
    categoriesRaw,
    homepageSections,
  ] = await Promise.all([
    prisma.store.findMany({
      where: {
        isActive: true,
        isFeatured: true,
      },
      include: {
        coupons: { where: { isActive: true }, select: { id: true } },
        cashbackOffers: { where: { isActive: true }, select: { id: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 8,
    }),

    prisma.store.findMany({
      where: { isActive: true },
      include: {
        coupons: { where: { isActive: true }, select: { id: true } },
        cashbackOffers: { where: { isActive: true }, select: { id: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 8,
    }),

    prisma.store.findMany({
      where: { isActive: true },
      include: {
        coupons: { where: { isActive: true }, select: { id: true } },
        cashbackOffers: { where: { isActive: true }, select: { id: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 4,
    }),

    prisma.coupon.findMany({
      where: { isActive: true },
      include: {
        store: { select: { name: true, slug: true } },
        category: { select: { name: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 6,
    }),

    prisma.promoBanner.findMany({
      where: { isActive: true, placement: "homepage_top" },
      orderBy: { priority: "desc" },
    }),

    prisma.promoBanner.findFirst({
      where: { isActive: true, placement: "homepage_top_right_top" },
      orderBy: { priority: "desc" },
    }),

    prisma.promoBanner.findFirst({
      where: { isActive: true, placement: "homepage_top_right_bottom" },
      orderBy: { priority: "desc" },
    }),

    prisma.promoBanner.findFirst({
      where: { isActive: true, placement: "homepage_middle" },
      orderBy: { priority: "desc" },
    }),

    prisma.promoBanner.findFirst({
      where: { isActive: true, placement: "homepage_lower_box" },
      orderBy: { priority: "desc" },
    }),

    prisma.category.findMany({
      take: 6,
      include: {
        coupons: {
          where: { isActive: true },
          select: { id: true },
        },
      },
      orderBy: {
        coupons: {
          _count: "desc",
        },
      },
    }),

    prisma.homepageSectionControl.findMany({
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  const featuredStores =
    featuredStoresRaw.length > 0 ? featuredStoresRaw : fallbackStores;

  const brandCards = featuredStores.map((store) => {
    const totalOffers = store.coupons.length + store.cashbackOffers.length;

    return {
      name: store.name,
      slug: store.slug,
      offers: `${totalOffers || 0} live offers`,
      tag: "Top Store",
      logo: store.logo || null,
    };
  });

  const popularStores = popularStoresRaw.map((store) => {
    const totalOffers = store.coupons.length + store.cashbackOffers.length;

    return {
      name: store.name,
      slug: store.slug,
      count: `${totalOffers || 0} deals`,
      logo: store.logo || null,
    };
  });

  const featuredCoupons = featuredCouponsRaw.map((coupon, index) => ({
    id: coupon.id,
    badge: coupon.discount || "SAVE",
    store: coupon.store?.name || "Store",
    storeSlug: coupon.store?.slug || "",
    title: coupon.title,
    code: coupon.code || "NO CODE",
    verified: coupon.verified ? "Verified today" : "Deal",
    usage: `${Math.max(coupon.usesToday ?? 0, 1)} used today`,
    bg: ["#FFF7ED", "#EFF6FF", "#FDF2F8", "#F0FDF4", "#F8FAFC", "#EEF2FF"][index % 6],
    category: coupon.category?.name ?? "General",
  }));

  const popularCategories = categoriesRaw.map((cat) => ({
    name: cat.name,
    count: `${cat.coupons.length} coupons`,
  }));

  const sectionControl: SectionControl = {
    hero: true,
    top_brands: true,
    categories: true,
    featured_coupons: true,
    promo_row: true,
    footer_banner: true,
  };

  for (const section of homepageSections) {
    if (section.sectionKey in sectionControl) {
      sectionControl[section.sectionKey as keyof SectionControl] =
        section.isActive;
    }
  }

  return (
    <HomeClient
      heroTopBanners={heroTopBanners}
      homepageTopRightTopBanner={homepageTopRightTopBanner}
      homepageTopRightBottomBanner={homepageTopRightBottomBanner}
      homepageMiddleStripBanner={homepageMiddleStripBanner}
      homepageLowerBoxBanner={homepageLowerBoxBanner}
      popularStores={popularStores}
      brandCards={brandCards}
      featuredCoupons={featuredCoupons}
      popularCategories={popularCategories}
      sectionControl={sectionControl}
    />
  );
}