import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const storesData = [
  {
    name: "Amazon",
    slug: "amazon",
    description:
      "Latest Amazon offers, exclusive coupon codes, and verified shopping deals for India.",
    logo: "/logos/amazon.png",
    websiteUrl: "https://www.amazon.in",
    isFeatured: true,
    isActive: true,
  },
  {
    name: "Flipkart",
    slug: "flipkart",
    description:
      "Latest Flipkart offers, exclusive coupon codes, and verified shopping deals for India.",
    logo: "/logos/flipkart.png",
    websiteUrl: "https://www.flipkart.com",
    isFeatured: true,
    isActive: true,
  },
  {
    name: "Myntra",
    slug: "myntra",
    description:
      "Latest Myntra offers, fashion deals, and verified shopping discounts.",
    logo: "/logos/myntra.png",
    websiteUrl: "https://www.myntra.com",
    isFeatured: true,
    isActive: true,
  },
  {
    name: "Ajio",
    slug: "ajio",
    description:
      "Latest Ajio offers, fashion deals, and verified shopping discounts.",
    logo: "/logos/ajio.png",
    websiteUrl: "https://www.ajio.com",
    isFeatured: true,
    isActive: true,
  },
  {
    name: "Nykaa",
    slug: "nykaa",
    description:
      "Latest Nykaa beauty offers, exclusive coupon codes, and verified deals.",
    logo: "/logos/nykaa.png",
    websiteUrl: "https://www.nykaa.com",
    isFeatured: true,
    isActive: true,
  },

  {
    name: "Tata Cliq",
    slug: "tata-cliq",
    description: "Tata Cliq shopping deals and coupon offers.",
    logo: "/logos/tata-cliq.png",
    websiteUrl: "https://www.tatacliq.com",
    isFeatured: true,
    isActive: true,
  },
  {
    name: "Meesho",
    slug: "meesho",
    description: "Latest Meesho offers and shopping discounts.",
    logo: "/logos/meesho.png",
    websiteUrl: "https://www.meesho.com",
    isFeatured: true,
    isActive: true,
  },
  {
    name: "Snapdeal",
    slug: "snapdeal",
    description: "Snapdeal offers and discount deals.",
    logo: "/logos/snapdeal.png",
    websiteUrl: "https://www.snapdeal.com",
    isFeatured: false,
    isActive: true,
  },
  {
    name: "Reliance Digital",
    slug: "reliance-digital",
    description: "Reliance Digital electronics deals and offers.",
    logo: "/logos/reliance-digital.png",
    websiteUrl: "https://www.reliancedigital.in",
    isFeatured: false,
    isActive: true,
  },
  {
    name: "Croma",
    slug: "croma",
    description: "Croma electronics offers and coupon deals.",
    logo: "/logos/croma.png",
    websiteUrl: "https://www.croma.com",
    isFeatured: false,
    isActive: true,
  },
  {
    name: "Vijay Sales",
    slug: "vijay-sales",
    description: "Vijay Sales latest deals and offers.",
    logo: "/logos/vijay-sales.png",
    websiteUrl: "https://www.vijaysales.com",
    isFeatured: false,
    isActive: true,
  },
  {
    name: "Nykaa Fashion",
    slug: "nykaa-fashion",
    description: "Nykaa Fashion coupons and offers.",
    logo: "/logos/nykaa-fashion.png",
    websiteUrl: "https://www.nykaafashion.com",
    isFeatured: false,
    isActive: true,
  },
  {
    name: "FirstCry",
    slug: "firstcry",
    description: "FirstCry baby products deals and coupons.",
    logo: "/logos/firstcry.png",
    websiteUrl: "https://www.firstcry.com",
    isFeatured: false,
    isActive: true,
  },
  {
    name: "Pepperfry",
    slug: "pepperfry",
    description: "Pepperfry furniture offers and discounts.",
    logo: "/logos/pepperfry.png",
    websiteUrl: "https://www.pepperfry.com",
    isFeatured: false,
    isActive: true,
  },
  {
    name: "Urban Ladder",
    slug: "urban-ladder",
    description: "Urban Ladder furniture deals and offers.",
    logo: "/logos/urban-ladder.png",
    websiteUrl: "https://www.urbanladder.com",
    isFeatured: false,
    isActive: true,
  },
  {
    name: "Mamaearth",
    slug: "mamaearth",
    description: "Mamaearth beauty and personal care offers.",
    logo: "/logos/mamaearth.png",
    websiteUrl: "https://mamaearth.in",
    isFeatured: false,
    isActive: true,
  },
  {
    name: "Swiggy",
    slug: "swiggy",
    description: "Swiggy food delivery deals and offers.",
    logo: "/logos/swiggy.png",
    websiteUrl: "https://www.swiggy.com",
    isFeatured: true,
    isActive: true,
  },
  {
    name: "Zomato",
    slug: "zomato",
    description: "Zomato food offers and dining deals.",
    logo: "/logos/zomato.png",
    websiteUrl: "https://www.zomato.com",
    isFeatured: true,
    isActive: true,
  },
  {
    name: "BigBasket",
    slug: "bigbasket",
    description: "BigBasket grocery deals and offers.",
    logo: "/logos/bigbasket.png",
    websiteUrl: "https://www.bigbasket.com",
    isFeatured: false,
    isActive: true,
  },
  {
    name: "Blinkit",
    slug: "blinkit",
    description: "Blinkit instant grocery offers.",
    logo: "/logos/blinkit.png",
    websiteUrl: "https://blinkit.com",
    isFeatured: false,
    isActive: true,
  },
];
async function main() {
  await prisma.offerClick.deleteMany();
  await prisma.couponSubmission.deleteMany();
  await prisma.cashbackOffer.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.store.deleteMany();

  await prisma.store.createMany({
    data: storesData,
  });

  const stores = await prisma.store.findMany();
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
        isFeatured: true,
        isActive: true,
        status: "PUBLISHED",
        clicks: 0,
        usesToday: 25,
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
    ],
  });

  console.log(`Seeded ${stores.length} stores successfully.`);
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