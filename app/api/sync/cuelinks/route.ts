import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type CampaignSeed = {
  slug: string;
  storeName: string;
  fallbackPayoutText?: string;
  categoryName?: string;
};

const SOURCE = "cuelinks";

// Curated Indian stores only
const CAMPAIGNS: CampaignSeed[] = [
  {
    slug: "amazon-india-affiliate-program",
    storeName: "Amazon",
    fallbackPayoutText: "6.08% Per Sale",
    categoryName: "Shopping",
  },
  {
    slug: "flipkart-affiliate-program",
    storeName: "Flipkart",
    fallbackPayoutText: "9% Per Sale",
    categoryName: "Shopping",
  },
  {
    slug: "myntra-affiliate-program",
    storeName: "Myntra",
    fallbackPayoutText: "9% Per Sale",
    categoryName: "Fashion",
  },
  {
    slug: "ajio-affiliate-program",
    storeName: "Ajio",
    fallbackPayoutText: "10.80% Per Sale",
    categoryName: "Fashion",
  },
  {
    slug: "nykaa-affiliate-program",
    storeName: "Nykaa",
    fallbackPayoutText: "8% Per Sale",
    categoryName: "Beauty",
  },
  {
    slug: "tatacliq-affiliate-program",
    storeName: "Tata Cliq",
    fallbackPayoutText: "10.80% Per Sale",
    categoryName: "Shopping",
  },
  {
    slug: "firstcry-affiliate-program",
    storeName: "FirstCry",
    fallbackPayoutText: "₹ 27.00 / Sale",
    categoryName: "Kids",
  },
  {
    slug: "reliance-digital-affiliate-program",
    storeName: "Reliance Digital",
    fallbackPayoutText: "Up to cashback",
    categoryName: "Electronics",
  },
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function cleanText(value?: string | null) {
  return (value || "").replace(/\s+/g, " ").trim();
}

function htmlDecode(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function stripTags(value: string) {
  return cleanText(
    htmlDecode(value)
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<\/p>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  );
}

function pickMetaContent(html: string, attr: string, name: string) {
  const patterns = [
    new RegExp(
      `<meta[^>]+${attr}=["']${name}["'][^>]+content=["']([^"']+)["'][^>]*>`,
      "i"
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+${attr}=["']${name}["'][^>]*>`,
      "i"
    ),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return cleanText(htmlDecode(match[1]));
  }

  return null;
}

function pickFirstMatch(html: string, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return stripTags(match[1]);
  }
  return null;
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

function normalizeCategoryName(value?: string | null, fallback?: string | null) {
  const raw = cleanText(value || fallback || "");
  if (!raw) return null;

  const lower = raw.toLowerCase();

  if (
    lower.includes("fashion") ||
    lower.includes("clothing") ||
    lower.includes("apparel")
  ) {
    return "Fashion";
  }

  if (
    lower.includes("beauty") ||
    lower.includes("cosmetic") ||
    lower.includes("makeup")
  ) {
    return "Beauty";
  }

  if (
    lower.includes("electronic") ||
    lower.includes("laptop") ||
    lower.includes("mobile")
  ) {
    return "Electronics";
  }

  if (
    lower.includes("kid") ||
    lower.includes("baby") ||
    lower.includes("toy")
  ) {
    return "Kids";
  }

  if (
    lower.includes("travel") ||
    lower.includes("bus") ||
    lower.includes("hotel") ||
    lower.includes("flight")
  ) {
    return "Travel";
  }

  if (
    lower.includes("shopping") ||
    lower.includes("marketplace") ||
    lower.includes("retail")
  ) {
    return "Shopping";
  }

  return raw;
}

function extractExpiryDate(text?: string | null): Date | null {
  if (!text) return null;

  const normalized = cleanText(text);

  const patterns = [
    /\b(\d{4}-\d{2}-\d{2})\b/,
    /\b(\d{2}\/\d{2}\/\d{4})\b/,
    /\b(\d{2}-\d{2}-\d{4})\b/,
    /\b([A-Za-z]{3,9}\s+\d{1,2},\s+\d{4})\b/,
    /\b(\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4})\b/,
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (!match?.[1]) continue;

    const parsed = new Date(match[1]);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return null;
}

function buildStoreDescription(storeName: string, categoryName?: string | null) {
  if (categoryName) {
    return `${storeName} ${categoryName.toLowerCase()} offers, coupons and cashback`;
  }

  return `${storeName} offers, coupons and cashback`;
}

function buildUserCashbackText(
  payoutText: string,
  cashbackPercentToUser: number
) {
  const networkPercent = extractPercent(payoutText);

  if (
    networkPercent !== null &&
    Number.isFinite(networkPercent) &&
    cashbackPercentToUser > 0 &&
    /%/.test(payoutText)
  ) {
    const userPercent = (networkPercent * cashbackPercentToUser) / 100;
    return `Up to ${formatPercent(userPercent)} cashback`;
  }

  if (/sale/i.test(payoutText)) {
    return payoutText.replace(/^upto\s*/i, "Up to ");
  }

  if (/cashback/i.test(payoutText)) {
    return payoutText.replace(/^upto\s*/i, "Up to ");
  }

  return payoutText || "Up to cashback";
}

function extractBestAffiliateUrl(html: string, fallbackUrl: string) {
  const patterns = [
    /<a[^>]+href="(https?:\/\/[^"]+)"[^>]*>\s*(?:Activate|Get Deal|Shop Now|Visit Store|Grab Deal)/i,
    /<a[^>]+href="(https?:\/\/[^"]+)"[^>]+class="[^"]*(?:cta|btn|button)[^"]*"[^>]*>/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      return cleanText(htmlDecode(match[1]));
    }
  }

  return fallbackUrl;
}

function parseCampaignPage(html: string, seed: CampaignSeed) {
  const campaignUrl = `https://www.cuelinks.com/campaigns/${seed.slug}`;

  const ogTitle = pickMetaContent(html, "property", "og:title");
  const metaDescription =
    pickMetaContent(html, "name", "description") ||
    pickMetaContent(html, "property", "og:description");

  const pageTitle =
    pickFirstMatch(html, [/<title>(.*?)<\/title>/i, /<h1[^>]*>(.*?)<\/h1>/i]) ||
    `${seed.storeName} Cashback Offer`;

  const title = cleanText(
    (ogTitle || pageTitle || `${seed.storeName} Cashback Offer`)
      .replace(/\|\s*Cuelinks.*$/i, "")
      .replace(/\s*-\s*Cuelinks.*$/i, "")
  );

  const description = cleanText(
    metaDescription || `${seed.storeName} deals, coupons and cashback`
  );

  const payoutText =
    pickFirstMatch(html, [
      /Payout\s*Upto:\s*([^<\n]+)/i,
      /Payout[^:]*:\s*([^<\n]+)/i,
      /Upto:\s*([^<\n]+)/i,
      /Commission[^:]*:\s*([^<\n]+)/i,
      /Cashback[^:]*:\s*([^<\n]+)/i,
    ]) ||
    seed.fallbackPayoutText ||
    "Up to cashback";

  const code = pickFirstMatch(html, [
    /Coupon\s*Code[^:]*:\s*([^<\n]+)/i,
    /Promo\s*Code[^:]*:\s*([^<\n]+)/i,
    /Use\s*Code\s*[:\-]?\s*([^<\n]+)/i,
  ]);

  const rawCategory =
    pickFirstMatch(html, [
      /Category[^:]*:\s*([^<\n]+)/i,
      /Vertical[^:]*:\s*([^<\n]+)/i,
      /<a[^>]+href="\/categories\/[^"]+"[^>]*>(.*?)<\/a>/i,
    ]) || seed.categoryName;

  const expiryText = pickFirstMatch(html, [
    /Expiry(?:\s*Date)?[^:]*:\s*([^<\n]+)/i,
    /Valid\s*Till[^:]*:\s*([^<\n]+)/i,
    /Offer\s*Ends[^:]*:\s*([^<\n]+)/i,
    /Expires?\s*On[^:]*:\s*([^<\n]+)/i,
  ]);

  return {
    title,
    description,
    payoutText: cleanText(payoutText),
    code: code ? cleanText(code) : null,
    categoryName: normalizeCategoryName(rawCategory, seed.categoryName),
    affiliateUrl: extractBestAffiliateUrl(html, campaignUrl),
    expiresAt: extractExpiryDate(expiryText),
    rawPayload: {
      seed,
      extracted: {
        title,
        description,
        payoutText,
        code,
        rawCategory,
        expiryText,
      },
    },
  };
}

async function getOrCreateCategoryId(categoryName?: string | null) {
  if (!categoryName) return null;

  const slug = slugify(categoryName);

  const category = await prisma.category.upsert({
    where: { slug },
    update: {
      name: categoryName,
    },
    create: {
      name: categoryName,
      slug,
    },
    select: {
      id: true,
    },
  });

  return category.id;
}

export async function GET() {
  try {
    const latestExternalIds: string[] = [];
    const activeStoreIds = new Set<string>();

    const results: Array<{
      store: string;
      title: string;
      externalId: string;
      discount: string;
      affiliateUrl: string;
      expiresAt: string | null;
      status: string;
    }> = [];

    let synced = 0;
    let skipped = 0;
    let deactivated = 0;

    for (const seed of CAMPAIGNS) {
      const campaignUrl = `https://www.cuelinks.com/campaigns/${seed.slug}`;

      try {
        const res = await fetch(campaignUrl, {
          cache: "no-store",
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          },
        });

        if (!res.ok) {
          console.error(`Failed fetching ${campaignUrl}: ${res.status}`);
          skipped += 1;
          continue;
        }

        const html = await res.text();
        const parsed = parseCampaignPage(html, seed);

        const storeSlug = slugify(seed.storeName);

        const store = await prisma.store.upsert({
          where: { slug: storeSlug },
          update: {
            name: seed.storeName,
            description: buildStoreDescription(
              seed.storeName,
              parsed.categoryName || seed.categoryName
            ),
            isActive: true,
          },
          create: {
            name: seed.storeName,
            slug: storeSlug,
            description: buildStoreDescription(
              seed.storeName,
              parsed.categoryName || seed.categoryName
            ),
            cashbackPercentToUser: 70,
            isActive: true,
          },
          select: {
            id: true,
            cashbackPercentToUser: true,
          },
        });

        const categoryId = await getOrCreateCategoryId(
          parsed.categoryName || seed.categoryName || null
        );

        const externalId = seed.slug;
        latestExternalIds.push(externalId);

        const discount = buildUserCashbackText(
          parsed.payoutText,
          store.cashbackPercentToUser || 0
        );

        const title = parsed.title || `${seed.storeName} Cashback Offer`;
        const description =
          parsed.description ||
          buildStoreDescription(
            seed.storeName,
            parsed.categoryName || seed.categoryName
          );

        const affiliateUrl = parsed.affiliateUrl || campaignUrl;

        if (!affiliateUrl) {
          console.error(`Missing affiliate URL for ${seed.slug}`);
          skipped += 1;
          continue;
        }

        const isExpired =
          parsed.expiresAt instanceof Date &&
          !Number.isNaN(parsed.expiresAt.getTime()) &&
          parsed.expiresAt.getTime() < Date.now();

        await prisma.coupon.upsert({
          where: {
            coupon_source_externalId: {
              source: SOURCE,
              externalId,
            },
          },
          update: {
            storeId: store.id,
            categoryId,
            title,
            description,
            code: parsed.code || null,
            discount,
            affiliateUrl,
            expiresAt: parsed.expiresAt,
            isActive: !isExpired,
            status: !isExpired ? "PUBLISHED" : "EXPIRED",
            rawPayload: parsed.rawPayload,
            updatedAt: new Date(),
          },
          create: {
            storeId: store.id,
            categoryId,
            source: SOURCE,
            externalId,
            title,
            description,
            code: parsed.code || null,
            discount,
            affiliateUrl,
            expiresAt: parsed.expiresAt,
            isActive: !isExpired,
            status: !isExpired ? "PUBLISHED" : "EXPIRED",
            rawPayload: parsed.rawPayload,
          },
        });

        if (!isExpired) {
          activeStoreIds.add(store.id);
        }

        results.push({
          store: seed.storeName,
          title,
          externalId,
          discount,
          affiliateUrl,
          expiresAt: parsed.expiresAt ? parsed.expiresAt.toISOString() : null,
          status: !isExpired ? "PUBLISHED" : "EXPIRED",
        });

        synced += 1;
      } catch (error) {
        console.error(`CUELINKS_CAMPAIGN_SYNC_ERROR for ${seed.slug}:`, error);
        skipped += 1;
      }
    }

    if (latestExternalIds.length > 0) {
      const deactivateMissing = await prisma.coupon.updateMany({
        where: {
          source: SOURCE,
          externalId: {
            notIn: latestExternalIds,
          },
          isActive: true,
        },
        data: {
          isActive: false,
          status: "EXPIRED",
          updatedAt: new Date(),
        },
      });

      deactivated += deactivateMissing.count;
    }

    const deactivateExpired = await prisma.coupon.updateMany({
      where: {
        source: SOURCE,
        expiresAt: {
          lt: new Date(),
        },
        isActive: true,
      },
      data: {
        isActive: false,
        status: "EXPIRED",
        updatedAt: new Date(),
      },
    });

    deactivated += deactivateExpired.count;

    if (activeStoreIds.size > 0) {
      await prisma.store.updateMany({
        where: {
          id: {
            in: Array.from(activeStoreIds),
          },
        },
        data: {
          isActive: true,
        },
      });
    }

    const storesWithoutActiveCoupons = await prisma.store.findMany({
      where: {
        coupons: {
          none: {
            isActive: true,
          },
        },
      },
      select: {
        id: true,
      },
    });

    if (storesWithoutActiveCoupons.length > 0) {
      await prisma.store.updateMany({
        where: {
          id: {
            in: storesWithoutActiveCoupons.map((s) => s.id),
          },
        },
        data: {
          isActive: false,
        },
      });
    }

    return NextResponse.json({
      ok: true,
      source: SOURCE,
      totalSeeds: CAMPAIGNS.length,
      synced,
      skipped,
      deactivated,
      results,
    });
  } catch (error: any) {
    console.error("CUELINKS SYNC ERROR:", error);

    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Sync failed",
      },
      { status: 500 }
    );
  }
}