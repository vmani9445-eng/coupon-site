import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type ExternalOffer = {
  store: string;
  title: string;
  discount?: string;
  url: string;
  externalId: string;
  description?: string;
  code?: string;
  terms?: string;
  category?: string;
};

type RawOffer = Record<string, unknown>;

const COUPON_SOURCE = "cuelinks";

export async function GET() {
  try {
    const offers = await getOffersToSync();

    let synced = 0;

    for (const offer of offers) {
      const store = await getOrCreateStore(offer.store);
      const categoryName = offer.category || detectCategory(offer.title);
      const category = await getOrCreateCategory(categoryName);

      await prisma.coupon.upsert({
        where: {
          coupon_source_externalId: {
            source: COUPON_SOURCE,
            externalId: offer.externalId,
          },
        },
        update: {
          title: offer.title,
          description: offer.description ?? null,
          discount: offer.discount ?? null,
          code: offer.code ?? null,
          affiliateUrl: offer.url,
          categoryId: category.id,
          storeId: store.id,
          isActive: true,
          verified: true,
        },
        create: {
          source: COUPON_SOURCE,
          externalId: offer.externalId,
          title: offer.title,
          description: offer.description ?? null,
          discount: offer.discount ?? null,
          code: offer.code ?? null,
          affiliateUrl: offer.url,
          storeId: store.id,
          categoryId: category.id,
          verified: true,
          isActive: true,
          status: "PUBLISHED",
        },
      });

      synced += 1;
    }

    return NextResponse.json({
      ok: true,
      synced,
    });
  } catch (error) {
    console.error("AFFILIATE_SYNC_ERROR:", error);

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "sync failed",
      },
      { status: 500 }
    );
  }
}

async function getOffersToSync(): Promise<ExternalOffer[]> {
  const apiUrl = process.env.CUELINKS_OFFERS_API_URL;
  const apiToken = process.env.CUELINKS_API_TOKEN;

  if (!apiUrl || !apiToken) {
    throw new Error("Missing Cuelinks API config");
  }

  const response = await fetch(apiUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Cuelinks API failed: ${response.status}`);
  }

  const json: unknown = await response.json();

  const rawItems: RawOffer[] = Array.isArray((json as { data?: unknown })?.data)
    ? (((json as { data?: unknown }).data as unknown[]) as RawOffer[])
    : Array.isArray(json)
    ? (json as RawOffer[])
    : [];

  return rawItems
    .map(mapExternalOffer)
    .filter((item): item is ExternalOffer => item !== null);
}

function mapExternalOffer(item: RawOffer): ExternalOffer | null {
  const store = normalizeText(item.store ?? item.storeName);
  const title = normalizeText(item.title ?? item.name);
  const url = normalizeText(item.url ?? item.affiliateUrl ?? item.link);
  const externalId = normalizeText(
    item.externalId ?? item.id ?? item.offer_id ?? url
  );

  if (!store || !title || !url || !externalId) {
    return null;
  }

  return {
    store,
    title,
    url,
    externalId,
    discount: optionalText(item.discount),
    description: optionalText(item.description),
    code: optionalText(item.code),
    terms: optionalText(item.terms),
    category: optionalText(item.category),
  };
}

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function optionalText(value: unknown): string | undefined {
  const text = normalizeText(value);
  return text ? text : undefined;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function detectCategory(title: string): string {
  const text = title.toLowerCase();

  if (
    text.includes("iphone") ||
    text.includes("mobile") ||
    text.includes("smartphone") ||
    text.includes("oneplus") ||
    text.includes("samsung")
  ) {
    return "Mobiles";
  }

  if (
    text.includes("laptop") ||
    text.includes("tv") ||
    text.includes("electronics") ||
    text.includes("headphone") ||
    text.includes("camera")
  ) {
    return "Electronics";
  }

  if (
    text.includes("fashion") ||
    text.includes("clothing") ||
    text.includes("shoes") ||
    text.includes("dress") ||
    text.includes("t-shirt")
  ) {
    return "Fashion";
  }

  if (
    text.includes("grocery") ||
    text.includes("food") ||
    text.includes("bigbasket")
  ) {
    return "Grocery";
  }

  if (
    text.includes("flight") ||
    text.includes("hotel") ||
    text.includes("travel") ||
    text.includes("booking")
  ) {
    return "Travel";
  }

  if (
    text.includes("cashback") ||
    text.includes("bank") ||
    text.includes("credit card")
  ) {
    return "Bank Offers";
  }

  return "General";
}

async function getOrCreateStore(name: string) {
  const slug = slugify(name);

  const existing = await prisma.store.findUnique({
    where: { slug },
  });

  if (existing) {
    return existing;
  }

  return prisma.store.create({
    data: {
      name,
      slug,
      description: `${name} deals & cashback`,
    },
  });
}

async function getOrCreateCategory(name: string) {
  const cleanName = name.trim();
  const slug = slugify(cleanName);

  const existing = await prisma.category.findUnique({
    where: { slug },
  });

  if (existing) {
    return existing;
  }

  return prisma.category.create({
    data: {
      name: cleanName,
      slug,
    },
  });
}