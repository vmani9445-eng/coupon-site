import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type ApiOffer = Record<string, any>;

function isAuthorized(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  return authHeader === `Bearer ${process.env.CRON_SECRET}`;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function firstString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function toNullableNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;

  const cleaned = value.replace(/[^\d.]/g, "").trim();
  if (!cleaned) return null;

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function getDefaultNetworkCashback(storeName: string) {
  const name = storeName.toLowerCase();

  if (name.includes("ajio")) return 10;
  if (name.includes("amazon")) return 7;
  if (name.includes("flipkart")) return 7.5;
  if (name.includes("myntra")) return 8;
  if (name.includes("nykaa")) return 9;

  return 5;
}

function splitCashback(
  networkCashback: number | null,
  cashbackPercentToUser: number
) {
  if (typeof networkCashback !== "number" || networkCashback <= 0) {
    return {
      userCashback: null as number | null,
      adminMargin: null as number | null,
      cashbackLabel: null as string | null,
    };
  }

  const userCashback = Number(
    ((networkCashback * cashbackPercentToUser) / 100).toFixed(2)
  );

  const adminMargin = Number((networkCashback - userCashback).toFixed(2));

  return {
    userCashback,
    adminMargin,
    cashbackLabel: `Up to ${userCashback}% cashback`,
  };
}

async function getOrCreateStore(
  name: string,
  logoUrl?: string | null,
  networkCashback?: number | null
) {
  const cleanName = name.trim();
  const slug = slugify(cleanName);

  let store = await prisma.store.findUnique({
    where: { slug },
  });

  if (!store) {
    store = await prisma.store.create({
      data: {
        name: cleanName,
        slug,
        description: `${cleanName} deals & cashback`,
        logo: logoUrl || null,
        networkCashback: networkCashback ?? null,
        isActive: true,
      },
    });
  } else {
    const updateData: {
      logo?: string;
      networkCashback?: number;
    } = {};

    if (logoUrl && store.logo !== logoUrl) {
      updateData.logo = logoUrl;
    }

    if (
      typeof networkCashback === "number" &&
      networkCashback > 0 &&
      (store.networkCashback === null || store.networkCashback === undefined)
    ) {
      updateData.networkCashback = networkCashback;
    }

    if (Object.keys(updateData).length > 0) {
      store = await prisma.store.update({
        where: { id: store.id },
        data: updateData,
      });
    }
  }

  return store;
}

async function getOrCreateCategory(name: string) {
  const cleanName = name.trim() || "General";
  const slug = slugify(cleanName);

  let category = await prisma.category.findUnique({
    where: { slug },
  });

  if (!category) {
    category = await prisma.category.create({
      data: {
        name: cleanName,
        slug,
      },
    });
  }

  return category;
}

function makeExternalId(params: {
  store: string;
  title: string;
  affiliateUrl: string;
}) {
  return slugify(`${params.store}-${params.title}-${params.affiliateUrl}`);
}

function normalizeOffer(offer: ApiOffer) {
  const store = firstString(
    offer.store,
    offer.store_name,
    offer.merchant,
    offer.brand,
    offer.advertiser,
    offer.campaign_name
  );

  const title = firstString(
    offer.title,
    offer.offer,
    offer.offer_title,
    offer.name
  );

  const description =
    firstString(offer.description, offer.details, offer.summary) || null;

  const discount =
    firstString(offer.discount, offer.offer_value, offer.deal, offer.savings) ||
    null;

  const code = firstString(
    offer.code,
    offer.coupon_code,
    offer.promo_code
  ) || null;

  const category =
    firstString(offer.category, offer.group, offer.segment) || "General";

  const affiliateUrl = firstString(
    offer.affiliateurl,
    offer.affiliate_url,
    offer.url,
    offer.link,
    offer.tracking_url,
    offer.tracked_url
  );

  const logoUrl =
    firstString(
      offer.logo,
      offer.logo_url,
      offer.image,
      offer.image_url,
      offer.store_logo
    ) || null;

  const networkCashback = toNullableNumber(
    offer.network_cashback ??
      offer.cashback ??
      offer.commission ??
      offer.commission_rate ??
      offer.payout ??
      offer.cashback_rate
  );

  return {
    store,
    title,
    description,
    discount,
    code,
    category,
    affiliateUrl,
    logoUrl,
    networkCashback,
  };
}

async function fetchOffersFromCuelinks() {
  const apiUrl = process.env.CUELINKS_OFFERS_API_URL;
  const token = process.env.CUELINKS_API_TOKEN;

  if (!apiUrl) {
    throw new Error("Missing CUELINKS_OFFERS_API_URL");
  }

  if (!token) {
    throw new Error("Missing CUELINKS_API_TOKEN");
  }

  const res = await fetch(apiUrl, {
    method: "GET",
    headers: {
      token,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Cuelinks API failed with status ${res.status}`);
  }

  const data = await res.json();

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.offers)) return data.offers;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.results)) return data.results;

  throw new Error("Unsupported Cuelinks API response format");
}

export async function GET(req: NextRequest) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const offers = await fetchOffersFromCuelinks();

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const offer of offers) {
      const normalized = normalizeOffer(offer);

      if (!normalized.store || !normalized.title || !normalized.affiliateUrl) {
        skipped++;
        continue;
      }

      const store = await getOrCreateStore(
        normalized.store,
        normalized.logoUrl,
        normalized.networkCashback
      );

      const category = await getOrCreateCategory(normalized.category);
      const externalId = makeExternalId(normalized);

      const networkCashback =
        normalized.networkCashback ??
        store.networkCashback ??
        getDefaultNetworkCashback(store.name);

      const { userCashback, adminMargin, cashbackLabel } = splitCashback(
        networkCashback,
        store.cashbackPercentToUser || 70
      );

      const existing = await prisma.coupon.findUnique({
        where: {
          coupon_source_externalId: {
            source: "cuelinks-api",
            externalId,
          },
        },
      });

      await prisma.coupon.upsert({
        where: {
          coupon_source_externalId: {
            source: "cuelinks-api",
            externalId,
          },
        },
        update: {
          title: normalized.title,
          description: normalized.description,
          discount: normalized.discount,
          code: normalized.code,
          affiliateUrl: normalized.affiliateUrl,
          storeId: store.id,
          categoryId: category.id,
          networkCashback,
          userCashback,
          adminMargin,
          cashbackLabel,
          verified: true,
          isActive: true,
          status: "PUBLISHED",
        },
        create: {
          source: "cuelinks-api",
          externalId,
          title: normalized.title,
          description: normalized.description,
          discount: normalized.discount,
          code: normalized.code,
          affiliateUrl: normalized.affiliateUrl,
          storeId: store.id,
          categoryId: category.id,
          networkCashback,
          userCashback,
          adminMargin,
          cashbackLabel,
          verified: true,
          isActive: true,
          status: "PUBLISHED",
        },
      });

      if (existing) updated++;
      else created++;
    }

    return NextResponse.json({
      ok: true,
      totalRows: offers.length,
      created,
      updated,
      skipped,
    });
  } catch (error: any) {
    console.error("CUELINKS_API_SYNC_ERROR", error);

    return NextResponse.json(
      { ok: false, error: error?.message || "Sync failed" },
      { status: 500 }
    );
  }
}