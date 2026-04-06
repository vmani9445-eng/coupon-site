import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.offerClick.deleteMany();
  await prisma.couponSubmission.deleteMany();
  await prisma.cashbackOffer.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.store.deleteMany();

  const stores = await Promise.all([
    prisma.store.create({
      data: {
        name: "Amazon",
        slug: "amazon",
        description:
          "Latest Amazon offers, exclusive coupon codes, and verified shopping deals for India.",
        isFeatured: true,
        isActive: true,
        websiteUrl: "https://www.amazon.in",
      },
    }),
    prisma.store.create({
      data: {
        name: "Flipkart",
        slug: "flipkart",
        description:
          "Latest Flipkart offers, exclusive coupon codes, and verified shopping deals for India.",
        isFeatured: true,
        isActive: true,
        websiteUrl: "https://www.flipkart.com",
      },
    }),
    prisma.store.create({
      data: {
        name: "Myntra",
        slug: "myntra",
        description:
          "Latest Myntra offers, fashion deals, and verified shopping discounts.",
        isFeatured: true,
        isActive: true,
        websiteUrl: "https://www.myntra.com",
      },
    }),
    prisma.store.create({
      data: {
        name: "Ajio",
        slug: "ajio",
        description:
          "Latest Ajio offers, fashion deals, and verified shopping discounts.",
        isFeatured: true,
        isActive: true,
        websiteUrl: "https://www.ajio.com",
      },
    }),
    prisma.store.create({
      data: {
        name: "Nykaa",
        slug: "nykaa",
        description:
          "Latest Nykaa beauty offers, exclusive coupon codes, and verified deals.",
        isFeatured: true,
        isActive: true,
        websiteUrl: "https://www.nykaa.com",
      },
    }),
  ]);

  const storeMap = Object.fromEntries(stores.map((store) => [store.slug, store]));

  await prisma.coupon.createMany({
    data: [
      {
        storeId: storeMap.amazon.id,
        source: "manual",
        externalId: "manual-amazon-1",
        title: "Save 40% on Mobile Accessories",
        description: "Limited-time mobile accessories deal.",
        code: "AMZ40",
        discount: "40% OFF",
        category: "Electronics",
        bank: "15% Instant Discount on Axis Card",
        affiliateUrl: "/go/coupon/demo-amazon-1",
        verified: true,
        isFeatured: true,
        isActive: true,
        status: "PUBLISHED",
        clicks: 0,
        usesToday: 67,
      },
      {
        storeId: storeMap.amazon.id,
        source: "manual",
        externalId: "manual-amazon-2",
        title: "Flat 10% Off with SBI Card",
        description: "Instant bank discount on electronics.",
        code: "SBI10",
        discount: "10% OFF",
        category: "Electronics",
        bank: "SBI Card Offer",
        affiliateUrl: "/go/coupon/demo-amazon-2",
        verified: true,
        isFeatured: false,
        isActive: true,
        status: "PUBLISHED",
        clicks: 0,
        usesToday: 29,
      },
      {
        storeId: storeMap.amazon.id,
        source: "manual",
        externalId: "manual-amazon-3",
        title: "Extra 5% Off on Grocery Essentials",
        description: "Save extra on pantry and daily needs.",
        code: "FRESH5",
        discount: "5% OFF",
        category: "Grocery",
        affiliateUrl: "/go/coupon/demo-amazon-3",
        verified: true,
        isFeatured: false,
        isActive: true,
        status: "PUBLISHED",
        clicks: 0,
        usesToday: 16,
      },

      {
        storeId: storeMap.flipkart.id,
        source: "manual",
        externalId: "manual-flipkart-1",
        title: "Flat 20% Off on Fashion",
        description: "Extra style savings on selected fashion items.",
        code: "STYLE20",
        discount: "20% OFF",
        category: "Fashion",
        bank: "10% Instant Discount on ICICI Card",
        affiliateUrl: "/go/coupon/demo-flipkart-1",
        verified: true,
        isFeatured: true,
        isActive: true,
        status: "PUBLISHED",
        clicks: 0,
        usesToday: 34,
      },
      {
        storeId: storeMap.flipkart.id,
        source: "manual",
        externalId: "manual-flipkart-2",
        title: "Up to 70% Off on Shoes",
        description: "Huge discounts on selected sneaker brands.",
        code: "SHOE70",
        discount: "70% OFF",
        category: "Footwear",
        bank: "Extra 5% with HDFC Card",
        affiliateUrl: "/go/coupon/demo-flipkart-2",
        verified: true,
        isFeatured: false,
        isActive: true,
        status: "PUBLISHED",
        clicks: 0,
        usesToday: 18,
      },
      {
        storeId: storeMap.flipkart.id,
        source: "manual",
        externalId: "manual-flipkart-3",
        title: "Mega Deal on Mobiles",
        description: "Special mobile deal without coupon code.",
        discount: "MEGA DEAL",
        category: "Mobiles",
        affiliateUrl: "/go/coupon/demo-flipkart-3",
        verified: true,
        isFeatured: false,
        isActive: true,
        status: "PUBLISHED",
        clicks: 0,
        usesToday: 51,
      },

      {
        storeId: storeMap.myntra.id,
        source: "manual",
        externalId: "manual-myntra-1",
        title: "Buy 2 Get 1 Free on T-Shirts",
        description: "Applies on selected fashion collection.",
        code: "B2G1TEE",
        discount: "BUY 2 GET 1",
        category: "Fashion",
        affiliateUrl: "/go/coupon/demo-myntra-1",
        verified: true,
        isFeatured: false,
        isActive: true,
        status: "PUBLISHED",
        clicks: 0,
        usesToday: 25,
      },
      {
        storeId: storeMap.myntra.id,
        source: "manual",
        externalId: "manual-myntra-2",
        title: "Flat 25% Off on Sneakers",
        description: "Extra discount on selected sneaker brands.",
        code: "KICK25",
        discount: "25% OFF",
        category: "Footwear",
        affiliateUrl: "/go/coupon/demo-myntra-2",
        verified: true,
        isFeatured: false,
        isActive: true,
        status: "PUBLISHED",
        clicks: 0,
        usesToday: 31,
      },

      {
        storeId: storeMap.ajio.id,
        source: "manual",
        externalId: "manual-ajio-1",
        title: "Extra 25% Off on Kurta Sets",
        description: "Exclusive ethnic wear sale.",
        code: "AJIO25",
        discount: "25% OFF",
        category: "Fashion",
        affiliateUrl: "/go/coupon/demo-ajio-1",
        verified: true,
        isFeatured: true,
        isActive: true,
        status: "PUBLISHED",
        clicks: 0,
        usesToday: 12,
      },
      {
        storeId: storeMap.ajio.id,
        source: "manual",
        externalId: "manual-ajio-2",
        title: "Flat 30% Off on Bags",
        description: "Save more on handbags and backpacks.",
        code: "BAG30",
        discount: "30% OFF",
        category: "Accessories",
        affiliateUrl: "/go/coupon/demo-ajio-2",
        verified: true,
        isFeatured: false,
        isActive: true,
        status: "PUBLISHED",
        clicks: 0,
        usesToday: 14,
      },

      {
        storeId: storeMap.nykaa.id,
        source: "manual",
        externalId: "manual-nykaa-1",
        title: "Flat 15% Off on Beauty Essentials",
        description: "Limited-time offer on skincare and makeup.",
        code: "NYK15",
        discount: "15% OFF",
        category: "Beauty",
        affiliateUrl: "/go/coupon/demo-nykaa-1",
        verified: true,
        isFeatured: true,
        isActive: true,
        status: "PUBLISHED",
        clicks: 0,
        usesToday: 44,
      },
      {
        storeId: storeMap.nykaa.id,
        source: "manual",
        externalId: "manual-nykaa-2",
        title: "Up to 50% Off on Makeup",
        description: "Save big on top beauty brands.",
        code: "MAKE50",
        discount: "50% OFF",
        category: "Makeup",
        affiliateUrl: "/go/coupon/demo-nykaa-2",
        verified: true,
        isFeatured: false,
        isActive: true,
        status: "PUBLISHED",
        clicks: 0,
        usesToday: 38,
      },
    ],
  });

  await prisma.cashbackOffer.createMany({
    data: [
      {
        storeId: storeMap.amazon.id,
        source: "manual",
        externalId: "manual-cb-amazon-1",
        title: "Extra 3% Cashback on Electronics",
        description: "Activate cashback before shopping on electronics.",
        cashbackType: "percent",
        cashbackValue: 3,
        affiliateUrl: "/go/cashback/demo-cb-amazon-1",
        terms: "Valid on eligible products only.",
        isFeatured: true,
        isActive: true,
      },
      {
        storeId: storeMap.flipkart.id,
        source: "manual",
        externalId: "manual-cb-flipkart-1",
        title: "5% Cashback on Fashion",
        description: "Activate cashback for selected fashion purchases.",
        cashbackType: "percent",
        cashbackValue: 5,
        affiliateUrl: "/go/cashback/demo-cb-flipkart-1",
        terms: "Cashback tracked on eligible orders.",
        isFeatured: true,
        isActive: true,
      },
      {
        storeId: storeMap.myntra.id,
        source: "manual",
        externalId: "manual-cb-myntra-1",
        title: "Flat ₹150 Cashback on Orders Above ₹1999",
        description: "Extra cashback on high-value fashion orders.",
        cashbackType: "flat",
        cashbackValue: 150,
        affiliateUrl: "/go/cashback/demo-cb-myntra-1",
        terms: "Applicable once per user.",
        isFeatured: false,
        isActive: true,
      },
    ],
  });

  console.log("Seeded stores, coupons, and cashback offers successfully.");
}

main()
  .catch((e) => {
    console.error("SEED ERROR:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });