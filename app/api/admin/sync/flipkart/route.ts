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

type FlipkartNormalizedOffer = {
  source: "flipkart";
  externalId: string;
  storeName: string;
  title: string;
  description?: string;
  code?: string;
  discount?: string;
  category?: string;
  bank?: string;
  affiliateUrl: string;
};

function mapFlipkartResponseToOffers(payload: any): FlipkartNormalizedOffer[] {
  const allOffers = payload?.allOffersList;

  if (!allOffers || typeof allOffers !== "object") {
    return [];
  }

  const offers: FlipkartNormalizedOffer[] = [];

  Object.entries(allOffers).forEach(
    ([categoryKey, categoryValue]: [string, any], categoryIndex: number) => {
      const offerItems = Array.isArray(categoryValue?.offers)
        ? categoryValue.offers
        : Array.isArray(categoryValue)
        ? categoryValue
        : [];

      offerItems.forEach((item: any, index: number) => {
        offers.push({
          source: "flipkart",
          externalId: String(
            item.id ?? item.offerId ?? `fk-${categoryKey}-${categoryIndex}-${index}`
          ),
          storeName: "Flipkart",
          title: String(
            item.title ??
              item.description ??
              item.name ??
              item.offerDescription ??
              "Flipkart Offer"
          ),
          description: item.description
            ? String(item.description)
            : item.offerDescription
            ? String(item.offerDescription)
            : undefined,
          code: undefined,
          discount: item.offerDescription
            ? String(item.offerDescription)
            : item.discount
            ? String(item.discount)
            : item.title
            ? String(item.title)
            : "Special Deal",
          category: categoryValue?.categoryName
            ? String(categoryValue.categoryName)
            : item.category
            ? String(item.category)
            : categoryKey || "General",
          bank: item.bank ? String(item.bank) : undefined,
          affiliateUrl: String(
            item.url ?? item.affiliateUrl ?? "https://www.flipkart.com/"
          ),
        });
      });
    }
  );

  return offers;
}

export async function POST() {
  try {
    const affiliateId = process.env.FLIPKART_AFFILIATE_ID;
    const token = process.env.FLIPKART_AFFILIATE_TOKEN;

    if (!affiliateId || !token) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing Flipkart credentials in .env.local",
        },
        { status: 500 }
      );
    }

    const response = await fetch(
      "https://affiliate-api.flipkart.net/affiliate/offers/v1/all/json",
      {
        method: "GET",
        headers: {
          "Fk-Affiliate-Id": affiliateId,
          "Fk-Affiliate-Token": token,
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json(
        {
          success: false,
          error: `Flipkart API failed: ${response.status} ${text}`,
        },
        { status: 500 }
      );
    }

    const payload = await response.json();
    console.log("RAW FLIPKART:", JSON.stringify(payload, null, 2));

    const offers = mapFlipkartResponseToOffers(payload);

    let importedCoupons = 0;

    for (const item of offers) {
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
          code: null,
          discount: item.discount,
          category: item.category,
          bank: item.bank,
          affiliateUrl: item.affiliateUrl,
          verified: true,
          isFeatured: true,
          isActive: true,
          status: "PUBLISHED",
        },
        create: {
          storeId: store.id,
          source: item.source,
          externalId: item.externalId,
          title: item.title,
          description: item.description,
          code: null,
          discount: item.discount,
          category: item.category,
          bank: item.bank,
          affiliateUrl: item.affiliateUrl,
          verified: true,
          isFeatured: true,
          isActive: true,
          status: "PUBLISHED",
        },
      });

      importedCoupons++;
    }

    return NextResponse.json({
      success: true,
      importedCoupons,
      importedCashback: 0,
    });
  } catch (error) {
    console.error("FLIPKART IMPORT ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Flipkart import failed.",
      },
      { status: 500 }
    );
  }
}