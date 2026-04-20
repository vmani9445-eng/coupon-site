import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type AdmitadOffer = {
  id?: string | number;
  name?: string;
  description?: string;
  goto_link?: string;
  image?: string;
  website_name?: string;
  categories?: Array<{ name?: string }>;
  actions_detail?: Array<{
    name?: string;
    payment_size?: string;
    payment_type?: string;
  }>;
  tariff_rate?: string;
  site_url?: string;
  status?: string;
  regions?: Array<string | { name?: string; code?: string }>;
  countries?: Array<string | { name?: string; code?: string }>;
  currency?: string;
  commission?: string | number;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function extractPercent(text?: string | null) {
  if (!text) return null;
  const match = text.match(/([\d.]+)/);
  if (!match) return null;
  const num = Number(match[1]);
  return Number.isFinite(num) ? num : null;
}

function formatPercent(value: number) {
  return `${value.toFixed(2)}%`;
}

function getStoreName(offer: AdmitadOffer) {
  return (
    String(offer.website_name || offer.name || "Unknown").trim() || "Unknown"
  );
}

function getCategoryName(offer: AdmitadOffer) {
  return offer.categories?.find((c) => c?.name)?.name?.trim() || null;
}

function getAffiliateUrl(offer: AdmitadOffer) {
  const candidates = [
    typeof offer.goto_link === "string" ? offer.goto_link.trim() : "",
    typeof offer.site_url === "string" ? offer.site_url.trim() : "",
  ];

  for (const raw of candidates) {
    if (/^https?:\/\//i.test(raw)) {
      return raw;
    }
  }

  return null;
}

function hostnameFromUrl(url?: string | null) {
  if (!url) return null;

  try {
    return new URL(url).hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return null;
  }
}

function isIndianOffer(offer: AdmitadOffer, affiliateUrl: string | null) {
  const textPool: string[] = [];

  if (offer.currency) textPool.push(String(offer.currency));
  if (offer.website_name) textPool.push(String(offer.website_name));
  if (offer.name) textPool.push(String(offer.name));
  if (offer.site_url) textPool.push(String(offer.site_url));

  if (Array.isArray(offer.regions)) {
    for (const item of offer.regions) {
      if (typeof item === "string") {
        textPool.push(item);
      } else {
        if (item?.name) textPool.push(item.name);
        if (item?.code) textPool.push(item.code);
      }
    }
  }

  if (Array.isArray(offer.countries)) {
    for (const item of offer.countries) {
      if (typeof item === "string") {
        textPool.push(item);
      } else {
        if (item?.name) textPool.push(item.name);
        if (item?.code) textPool.push(item.code);
      }
    }
  }

  const haystack = textPool.join(" ").toLowerCase();
  const host = hostnameFromUrl(affiliateUrl);

  if (host?.endsWith(".in")) return true;
  if (haystack.includes("india")) return true;
  if (haystack.includes(" in ")) return true;
  if (haystack.includes('"in"')) return true;
  if (haystack.includes("inr")) return true;

  return false;
}

function getRawCashbackText(offer: AdmitadOffer) {
  const action = offer.actions_detail?.find(
    (item) =>
      typeof item?.payment_size === "string" &&
      item.payment_size.trim().length > 0
  );

  return (
    action?.payment_size?.trim() ||
    (typeof offer.commission === "string" ? offer.commission.trim() : null) ||
    (typeof offer.commission === "number" ? String(offer.commission) : null) ||
    (typeof offer.tariff_rate === "string" ? offer.tariff_rate.trim() : null) ||
    "Up to cashback"
  );
}

export async function GET() {
  try {
    const clientId = process.env.ADMITAD_CLIENT_ID;
    const clientSecret = process.env.ADMITAD_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        {
          ok: false,
          error: "Missing ADMITAD_CLIENT_ID or ADMITAD_CLIENT_SECRET",
        },
        { status: 500 }
      );
    }

    const tokenRes = await fetch("https://api.admitad.com/token/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
        scope: "advcampaigns",
      }),
      cache: "no-store",
    });

    const tokenJson = await tokenRes.json().catch(() => null);

    if (!tokenRes.ok || !tokenJson?.access_token) {
      return NextResponse.json(
        {
          ok: false,
          error: "Failed to get Admitad access token",
          details: tokenJson,
        },
        { status: 500 }
      );
    }

    const accessToken = tokenJson.access_token as string;

    const offersRes = await fetch(
      "https://api.admitad.com/advcampaigns/?limit=100",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      }
    );

    const offersJson = await offersRes.json().catch(() => null);

    if (!offersRes.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: `Admitad request failed: ${offersRes.status}`,
          details: offersJson,
        },
        { status: 500 }
      );
    }

    const offers: AdmitadOffer[] = Array.isArray(offersJson?.results)
      ? offersJson.results
      : Array.isArray(offersJson)
        ? offersJson
        : [];

    const latestSyncedExternalIds: string[] = [];
    let skippedNonIndian = 0;
    let skippedNoUrl = 0;
    let syncedStores = 0;

    for (const offer of offers) {
      const externalId = String(offer.id ?? "").trim();
      if (!externalId) continue;

      const affiliateUrl = getAffiliateUrl(offer);

      if (!affiliateUrl) {
        skippedNoUrl += 1;
        continue;
      }

      if (!isIndianOffer(offer, affiliateUrl)) {
        skippedNonIndian += 1;
        continue;
      }

      const storeName = getStoreName(offer);
      const storeSlug = slugify(storeName);
      const categoryName = getCategoryName(offer);

      let categoryId: string | null = null;

      if (categoryName) {
        const categorySlug = slugify(categoryName);

        const category = await prisma.category.upsert({
          where: { slug: categorySlug },
          update: {
            name: categoryName,
          },
          create: {
            name: categoryName,
            slug: categorySlug,
          },
        });

        categoryId = category.id;
      }

      const store = await prisma.store.upsert({
        where: { slug: storeSlug },
        update: {
          name: storeName,
          description:
            typeof offer.description === "string" && offer.description.trim()
              ? offer.description.trim()
              : `${storeName} deals & cashback`,
        },
        create: {
          name: storeName,
          slug: storeSlug,
          description:
            typeof offer.description === "string" && offer.description.trim()
              ? offer.description.trim()
              : `${storeName} deals & cashback`,
          cashbackPercentToUser: 70,
        },
      });

      syncedStores += 1;

      const rawCashbackText = getRawCashbackText(offer);
      const networkPercent = extractPercent(rawCashbackText);

      let userCashbackText = rawCashbackText;

      if (
        networkPercent !== null &&
        Number.isFinite(networkPercent) &&
        store.cashbackPercentToUser > 0 &&
        /%/.test(rawCashbackText)
      ) {
        const userPercent =
          (networkPercent * store.cashbackPercentToUser) / 100;
        userCashbackText = `Up to ${formatPercent(userPercent)} cashback`;
      }

      const title =
        String(offer.name || `${storeName} Cashback Offer`).trim() ||
        `${storeName} Cashback Offer`;

      const description =
        typeof offer.description === "string" && offer.description.trim()
          ? offer.description.trim()
          : `Shop on ${storeName} and earn cashback on eligible orders.`;

      latestSyncedExternalIds.push(externalId);

      await prisma.coupon.upsert({
        where: {
          coupon_source_externalId: {
            source: "admitad",
            externalId,
          },
        },
        update: {
          title,
          description,
          affiliateUrl,
          discount: userCashbackText,
          storeId: store.id,
          categoryId,
          isActive: true,
          status: "PUBLISHED",
          updatedAt: new Date(),
        },
        create: {
          source: "admitad",
          externalId,
          title,
          description,
          affiliateUrl,
          discount: userCashbackText,
          storeId: store.id,
          categoryId,
          isActive: true,
          status: "PUBLISHED",
        },
      });
    }

    if (latestSyncedExternalIds.length > 0) {
      await prisma.coupon.deleteMany({
        where: {
          source: "admitad",
          externalId: {
            notIn: latestSyncedExternalIds,
          },
        },
      });

      const emptyStores = await prisma.store.findMany({
        where: {
          coupons: {
            none: {},
          },
        },
        select: { id: true },
      });

      if (emptyStores.length > 0) {
        await prisma.store.deleteMany({
          where: {
            id: {
              in: emptyStores.map((s) => s.id),
            },
          },
        });
      }

      const emptyCategories = await prisma.category.findMany({
        where: {
          coupons: {
            none: {},
          },
        },
        select: { id: true },
      });

      if (emptyCategories.length > 0) {
        await prisma.category.deleteMany({
          where: {
            id: {
              in: emptyCategories.map((c) => c.id),
            },
          },
        });
      }
    }

    return NextResponse.json({
      ok: true,
      totalFetched: offers.length,
      syncedIds: latestSyncedExternalIds.length,
      syncedStores,
      skippedNonIndian,
      skippedNoUrl,
    });
  } catch (error: any) {
    console.error("ADMITAD SYNC ERROR:", error);

    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Sync failed",
      },
      { status: 500 }
    );
  }
}