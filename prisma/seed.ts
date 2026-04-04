import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.coupon.deleteMany();
  await prisma.store.deleteMany();

  await prisma.store.createMany({
    data: [
      {
        name: "Amazon",
        slug: "amazon",
        description:
          "Latest Amazon offers, exclusive coupon codes, and verified shopping deals for India.",
      },
      {
        name: "Flipkart",
        slug: "flipkart",
        description:
          "Latest Flipkart offers, exclusive coupon codes, and verified shopping deals for India.",
      },
      {
        name: "Myntra",
        slug: "myntra",
        description:
          "Latest Myntra offers, fashion deals, and verified shopping discounts.",
      },
      {
        name: "Ajio",
        slug: "ajio",
        description:
          "Latest Ajio offers, fashion deals, and verified shopping discounts.",
      },
      {
        name: "Nykaa",
        slug: "nykaa",
        description:
          "Latest Nykaa beauty offers, exclusive coupon codes, and verified deals.",
      },
    ],
  });

  await prisma.coupon.createMany({
    data: [
      {
        title: "Save 40% on Mobile Accessories",
        description: "Limited-time mobile accessories deal.",
        code: "AMZ40",
        discount: "40% OFF",
        category: "Electronics",
        bank: "15% Instant Discount on Axis Card",
        verified: true,
        users: 67,
        storeSlug: "amazon",
      },
      {
        title: "Flat 10% Off with SBI Card",
        description: "Instant bank discount on electronics.",
        code: "SBI10",
        discount: "10% OFF",
        category: "Electronics",
        bank: "SBI Card Offer",
        verified: true,
        users: 29,
        storeSlug: "amazon",
      },
      {
        title: "Extra 5% Off on Grocery Essentials",
        description: "Save extra on pantry and daily needs.",
        code: "FRESH5",
        discount: "5% OFF",
        category: "Grocery",
        verified: true,
        users: 16,
        storeSlug: "amazon",
      },

      {
        title: "Flat 20% Off on Fashion",
        description: "Extra style savings on selected fashion items.",
        code: "STYLE20",
        discount: "20% OFF",
        category: "Fashion",
        bank: "10% Instant Discount on ICICI Card",
        verified: true,
        users: 34,
        storeSlug: "flipkart",
      },
      {
        title: "Up to 70% Off on Shoes",
        description: "Huge discounts on selected sneaker brands.",
        code: "SHOE70",
        discount: "70% OFF",
        category: "Footwear",
        bank: "Extra 5% with HDFC Card",
        verified: true,
        users: 18,
        storeSlug: "flipkart",
      },
      {
        title: "Mega Deal on Mobiles",
        description: "Special mobile deal without coupon code.",
        discount: "MEGA DEAL",
        category: "Mobiles",
        verified: true,
        users: 51,
        storeSlug: "flipkart",
      },

      {
        title: "Buy 2 Get 1 Free on T-Shirts",
        description: "Applies on selected fashion collection.",
        code: "B2G1TEE",
        discount: "BUY 2 GET 1",
        category: "Fashion",
        verified: true,
        users: 25,
        storeSlug: "myntra",
      },
      {
        title: "Flat 25% Off on Sneakers",
        description: "Extra discount on selected sneaker brands.",
        code: "KICK25",
        discount: "25% OFF",
        category: "Footwear",
        verified: true,
        users: 31,
        storeSlug: "myntra",
      },
      {
        title: "Flat 15% Off on Beauty Essentials",
        description: "Limited-time beauty offer on selected items.",
        code: "BEAUTY15",
        discount: "15% OFF",
        category: "Beauty",
        verified: true,
        users: 20,
        storeSlug: "myntra",
      },

      {
        title: "Extra 25% Off on Kurta Sets",
        description: "Exclusive ethnic wear sale.",
        code: "AJIO25",
        discount: "25% OFF",
        category: "Fashion",
        verified: true,
        users: 12,
        storeSlug: "ajio",
      },
      {
        title: "Flat 30% Off on Bags",
        description: "Save more on handbags and backpacks.",
        code: "BAG30",
        discount: "30% OFF",
        category: "Accessories",
        verified: true,
        users: 14,
        storeSlug: "ajio",
      },
      {
        title: "Deal on Premium Shirts",
        description: "Limited-time no-code offer on premium shirts.",
        discount: "SPECIAL DEAL",
        category: "Fashion",
        verified: true,
        users: 9,
        storeSlug: "ajio",
      },

      {
        title: "Flat 15% Off on Beauty Essentials",
        description: "Limited-time offer on skincare and makeup.",
        code: "NYK15",
        discount: "15% OFF",
        category: "Beauty",
        verified: true,
        users: 44,
        storeSlug: "nykaa",
      },
      {
        title: "Up to 50% Off on Makeup",
        description: "Save big on top beauty brands.",
        code: "MAKE50",
        discount: "50% OFF",
        category: "Makeup",
        verified: true,
        users: 38,
        storeSlug: "nykaa",
      },
      {
        title: "Free Gift on Orders Above ₹999",
        description: "Get a free beauty gift on eligible orders.",
        discount: "FREE GIFT",
        category: "Beauty",
        verified: true,
        users: 11,
        storeSlug: "nykaa",
      },
    ],
  });

  console.log("Demo coupons seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });