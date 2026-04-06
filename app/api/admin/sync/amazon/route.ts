import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function getOrCreateStore(storeName: string) {
  const slug = slugify(storeName);

  return prisma.store.upsert({
    where: { slug },
    update: { name: storeName },
    create: {
      name: storeName,
      slug,
      isFeatured: true,
    },
  });
}

export async function POST() {
  try {
    // TEMP demo data
    const coupons = [
      {
        source: "amazon",
        externalId: "amz-coupon-1",
        storeName: "Amazon",
        title: "Save 40% on Mobile Accessories",
        description: "Limited-time mobile accessories deal.",
        code: "AMZ40",
        discount: "40% OFF",
        category: "Electronics",
        bank: "15% Instant Discount on Axis Card",
        affiliateUrl: "https://www.amazon.in/",
      },
    ];

    const cashbackOffers = [
      {
        source: "amazon",
        externalId: "amz-cashback-1",
        storeName: "Amazon",
        title: "3% Cashback on Electronics",
        description: "Activate cashback before shopping.",
        cashbackType: "percent",
        cashbackValue: 3,
        affiliateUrl: "https://www.amazon.in/",
        terms: "Valid on selected eligible products.",
      },
    ];

    let importedCoupons = 0;
    let importedCashback = 0;

    for (const item of coupons) {
      const store = await getOrCreateStore(item.storeName);

      await prisma.coupon.upsert({
        where: {
          coupon_source_externalId: {
            source: item.source,
            externalId: item.externalId,
          },
        },
        update: {
          storeId: store.id,
          title: item.title,
          description: item.description,
          code: item.code,
          discount: item.discount,
          category: item.category,
          bank: item.bank,
          affiliateUrl: item.affiliateUrl,
          verified: true,
          isFeatured: true,
        },
        create: {
          storeId: store.id,
          source: item.source,
          externalId: item.externalId,
          title: item.title,
          description: item.description,
          code: item.code,
          discount: item.discount,
          category: item.category,
          bank: item.bank,
          affiliateUrl: item.affiliateUrl,
          verified: true,
          isFeatured: true,
          status: "PUBLISHED",
        },
      });

      importedCoupons++;
    }

    for (const item of cashbackOffers) {
      const store = await getOrCreateStore(item.storeName);

      await prisma.cashbackOffer.upsert({
        where: {
          cashback_source_externalId: {
            source: item.source,
            externalId: item.externalId,
          },
        },
        update: {
          storeId: store.id,
          title: item.title,
          description: item.description,
          cashbackType: item.cashbackType,
          cashbackValue: item.cashbackValue,
          affiliateUrl: item.affiliateUrl,
          terms: item.terms,
          isFeatured: true,
        },
        create: {
          storeId: store.id,
          source: item.source,
          externalId: item.externalId,
          title: item.title,
          description: item.description,
          cashbackType: item.cashbackType,
          cashbackValue: item.cashbackValue,
          affiliateUrl: item.affiliateUrl,
          terms: item.terms,
          isFeatured: true,
        },
      });

      importedCashback++;
    }

    return NextResponse.json({
      success: true,
      importedCoupons,
      importedCashback,
    });
  } catch (error) {
    console.error("AMAZON IMPORT ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Amazon import failed.",
      },
      { status: 500 }
    );
  }
}