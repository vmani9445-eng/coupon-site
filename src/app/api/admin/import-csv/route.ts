import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parse } from "csv-parse/sync";

type RawCsvRow = Record<string, string | undefined>;

type NormalizedRow = {
  store: string;
  title: string;
  description: string | null;
  discount: string | null;
  code: string | null;
  bank: string | null;
  category: string;
  affiliateUrl: string;
  networkCashback: number | null;
  logoUrl: string | null;
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function normalizeHeader(header: string) {
  return header.trim().toLowerCase().replace(/\s+/g, "_");
}

function firstNonEmpty(row: RawCsvRow, keys: string[]) {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value.trim() !== "") {
      return value.trim();
    }
  }
  return "";
}

function cleanText(value?: string | null) {
  if (!value) return "";
  return value.replace(/\s+/g, " ").trim();
}

function toNullableNumber(value?: string | null) {
  if (!value) return null;

  const cleaned = String(value).replace(/[^\d.]/g, "").trim();
  if (!cleaned) return null;

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function toSafeUrl(value?: string | null) {
  const raw = cleanText(value);
  if (!raw) return "";

  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw;
  }

  if (raw.startsWith("www.")) {
    return `https://${raw}`;
  }

  if (raw.includes("linksredirect.com") || raw.includes("http")) {
    return raw.startsWith("http") ? raw : `https://${raw}`;
  }

  return raw;
}

function extractFinalUrl(rawUrl: string) {
  if (!rawUrl) return "";

  try {
    const decoded = decodeURIComponent(rawUrl);

    const patterns = [
      /[?&]url=(https?:\/\/[^&]+)/i,
      /[?&]destination=(https?:\/\/[^&]+)/i,
      /[?&]dest=(https?:\/\/[^&]+)/i,
      /[?&]redirect=(https?:\/\/[^&]+)/i,
      /[?&]redirect_url=(https?:\/\/[^&]+)/i,
      /[?&]target=(https?:\/\/[^&]+)/i,
      /[?&]target_url=(https?:\/\/[^&]+)/i,
      /[?&]deeplink=(https?:\/\/[^&]+)/i,
    ];

    for (const pattern of patterns) {
      const match = decoded.match(pattern);
      if (match?.[1]) {
        return match[1];
      }
    }

    return decoded;
  } catch {
    return rawUrl;
  }
}

function getStoreFromUrl(url: string) {
  try {
    const finalUrl = extractFinalUrl(url);
    const hostname = new URL(finalUrl).hostname.replace(/^www\./, "");
    const base = hostname.split(".")[0] || "";

    return base
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim();
  } catch {
    return "";
  }
}

function normalizeDiscount(value?: string | null) {
  const text = cleanText(value);
  if (!text) return null;
  return text;
}

function normalizeCode(value?: string | null) {
  const text = cleanText(value);
  if (!text) return null;

  const upper = text.toUpperCase();
  const meaningless = new Set([
    "DEAL ACTIVATED",
    "ACTIVATE DEAL",
    "NO CODE",
    "NO CODE REQUIRED",
    "NA",
    "N/A",
    "-",
  ]);

  if (meaningless.has(upper)) return null;
  return text;
}

function normalizeLogoUrl(value?: string | null) {
  const text = cleanText(value);
  if (!text) return null;

  if (
    text.startsWith("http://") ||
    text.startsWith("https://") ||
    text.startsWith("/")
  ) {
    return text;
  }

  if (text.startsWith("www.")) {
    return `https://${text}`;
  }

  return null;
}

function buildFallbackTitle(store: string, description?: string | null) {
  const cleanDescription = cleanText(description);

  if (cleanDescription) {
    return cleanDescription.length > 120
      ? `${cleanDescription.slice(0, 117)}...`
      : cleanDescription;
  }

  return `${store || "Store"} Offer`;
}

function normalizeCategory(value?: string | null) {
  const text = cleanText(value);
  return text || "General";
}

function detectBankFromText(input: {
  title?: string;
  description?: string | null;
  discount?: string | null;
  store?: string;
}) {
  const text = [
    input.title || "",
    input.description || "",
    input.discount || "",
    input.store || "",
  ]
    .join(" ")
    .toLowerCase();

  const banks = [
    { keys: ["hdfc"], label: "HDFC Bank" },
    { keys: ["icici"], label: "ICICI Bank" },
    { keys: ["sbi", "state bank"], label: "SBI" },
    { keys: ["axis"], label: "Axis Bank" },
    { keys: ["kotak"], label: "Kotak" },
    { keys: ["amex", "american express"], label: "Amex" },
    { keys: ["indusind"], label: "IndusInd Bank" },
    { keys: ["yes bank"], label: "Yes Bank" },
    { keys: ["au bank", "au small finance"], label: "AU Bank" },
    { keys: ["onecard", "one card"], label: "OneCard" },
    { keys: ["federal"], label: "Federal Bank" },
    { keys: ["rbl"], label: "RBL Bank" },
    { keys: ["hsbc"], label: "HSBC" },
    { keys: ["idfc"], label: "IDFC FIRST Bank" },
  ];

  for (const bank of banks) {
    if (bank.keys.some((key) => text.includes(key))) {
      return bank.label;
    }
  }

  if (
    text.includes("credit card") ||
    text.includes("debit card") ||
    text.includes("card offer") ||
    text.includes("bank offer")
  ) {
    return "Bank Offer";
  }

  return null;
}

function normalizeRow(row: RawCsvRow): NormalizedRow {
  const affiliateUrl = toSafeUrl(
    firstNonEmpty(row, [
      "affiliateurl",
      "affiliate_url",
      "tracking_url",
      "tracking_link",
      "deeplink",
      "short_url",
      "url",
      "link",
      "destination_url",
      "redirect_url",
      "trackinglink",
      "deeplink_url",
      "offer_url",
    ])
  );

  const description =
    cleanText(
      firstNonEmpty(row, [
        "description",
        "details",
        "summary",
        "offer_description",
        "desc",
        "offer_desc",
      ])
    ) || null;

  const store =
    cleanText(
      firstNonEmpty(row, [
        "store",
        "store_name",
        "merchant",
        "merchant_name",
        "brand",
        "brand_name",
        "advertiser",
        "advertiser_name",
        "campaign_name",
        "shop",
        "shop_name",
      ])
    ) || getStoreFromUrl(affiliateUrl);

  const title =
    cleanText(
      firstNonEmpty(row, [
        "title",
        "offer",
        "offer_title",
        "name",
        "campaign",
        "coupon_title",
        "deal_title",
        "offer_name",
      ])
    ) || buildFallbackTitle(store, description);

  const discount = normalizeDiscount(
    firstNonEmpty(row, [
      "discount",
      "offer_value",
      "deal",
      "savings",
      "discount_text",
      "offer_text",
      "discount_value",
    ])
  );

  const code = normalizeCode(
    firstNonEmpty(row, [
      "code",
      "coupon_code",
      "promo_code",
      "voucher_code",
      "couponcode",
      "promocode",
    ])
  );

  const category = normalizeCategory(
    firstNonEmpty(row, [
      "category",
      "group",
      "segment",
      "vertical",
      "subcategory",
      "sub_category",
      "category_name",
      "top_category",
      "product_category",
      "merchant_category",
      "store_category",
    ])
  );

  const networkCashback = toNullableNumber(
    firstNonEmpty(row, [
      "network_cashback",
      "cashback",
      "commission",
      "commission_rate",
      "payout",
      "cashback_rate",
      "rate",
      "earnings",
      "commission_text",
    ])
  );

  const logoUrl = normalizeLogoUrl(
    firstNonEmpty(row, [
      "logo",
      "logo_url",
      "image",
      "image_url",
      "store_logo",
      "merchant_logo",
      "brand_logo",
      "icon",
    ])
  );

  const bank = detectBankFromText({
    title,
    description,
    discount,
    store,
  });

  return {
    store,
    title,
    description,
    discount,
    code,
    bank,
    category,
    affiliateUrl,
    networkCashback,
    logoUrl,
  };
}

function getDefaultNetworkCashback(storeName: string) {
  const name = storeName.toLowerCase();

  if (name.includes("ajio")) return 10;
  if (name.includes("amazon")) return 7;
  if (name.includes("flipkart")) return 7.5;
  if (name.includes("myntra")) return 8;
  if (name.includes("nykaa")) return 9;
  if (name.includes("pepperfry")) return 6;
  if (name.includes("tatacliq")) return 6;
  if (name.includes("croma")) return 4;
  if (name.includes("firstcry")) return 8;

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

async function getOrCreateStore(name: string, logoUrl?: string | null) {
  const cleanName = cleanText(name) || "Unknown Store";
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
        isActive: true,
      },
    });
  } else {
    const updateData: {
      logo?: string;
    } = {};

    if (logoUrl && !store.logo) {
      updateData.logo = logoUrl;
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
  const cleanName = cleanText(name) || "General";
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

function makeExternalId(
  row: Pick<NormalizedRow, "store" | "title" | "affiliateUrl">
) {
  return slugify(`${row.store}-${row.title}-${row.affiliateUrl}`);
}

function validateNormalizedRow(row: NormalizedRow) {
  const errors: string[] = [];

  if (!row.affiliateUrl) {
    errors.push("affiliateUrl is required");
  }

  if (!row.affiliateUrl.includes("http")) {
    errors.push("invalid affiliateUrl");
  }

  return errors;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const previewOnly = formData.get("previewOnly") === "true";

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: "CSV file is required" },
        { status: 400 }
      );
    }

    const text = await file.text();

    const rawRows = parse(text, {
      columns: (headers: string[]) => headers.map(normalizeHeader),
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
      bom: true,
    }) as RawCsvRow[];

    if (!rawRows.length) {
      return NextResponse.json(
        { ok: false, error: "CSV is empty" },
        { status: 400 }
      );
    }

    const preview = rawRows.slice(0, 10).map(normalizeRow);

    const rowErrors: string[] = [];
    const skippedSamples: Array<{
      rowNumber: number;
      normalized: NormalizedRow;
      errors: string[];
    }> = [];
    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (let i = 0; i < rawRows.length; i++) {
      const normalized = normalizeRow(rawRows[i]);
      const validationErrors = validateNormalizedRow(normalized);

      if (validationErrors.length > 0) {
        skipped++;

        if (rowErrors.length < 50) {
          rowErrors.push(`Row ${i + 2}: ${validationErrors.join(", ")}`);
        }

        if (skippedSamples.length < 10) {
          skippedSamples.push({
            rowNumber: i + 2,
            normalized,
            errors: validationErrors,
          });
        }

        continue;
      }

      if (previewOnly) {
        continue;
      }

      try {
        const store = await getOrCreateStore(normalized.store, normalized.logoUrl);
        const category = await getOrCreateCategory(normalized.category);
        const externalId = makeExternalId(normalized);

        const networkCashback =
          normalized.networkCashback ?? getDefaultNetworkCashback(store.name);

        const { userCashback, adminMargin, cashbackLabel } = splitCashback(
          networkCashback,
          store.cashbackPercentToUser || 70
        );

        const existing = await prisma.coupon.findUnique({
          where: {
            coupon_source_externalId: {
              source: "csv-import",
              externalId,
            },
          },
        });

        await prisma.coupon.upsert({
          where: {
            coupon_source_externalId: {
              source: "csv-import",
              externalId,
            },
          },
          update: {
            title: normalized.title,
            description: normalized.description,
            discount: normalized.discount,
            code: normalized.code,
            bank: normalized.bank,
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
            source: "csv-import",
            externalId,
            title: normalized.title,
            description: normalized.description,
            discount: normalized.discount,
            code: normalized.code,
            bank: normalized.bank,
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
      } catch (error: any) {
        skipped++;

        if (rowErrors.length < 50) {
          rowErrors.push(`Row ${i + 2}: ${error?.message || "failed to import"}`);
        }

        if (skippedSamples.length < 10) {
          skippedSamples.push({
            rowNumber: i + 2,
            normalized,
            errors: [error?.message || "failed to import"],
          });
        }
      }
    }

    return NextResponse.json({
      ok: true,
      previewOnly,
      totalRows: rawRows.length,
      created,
      updated,
      skipped,
      preview,
      errors: rowErrors,
      skippedSamples,
    });
  } catch (error: any) {
    console.error("SMART CSV IMPORT ERROR:", error);

    return NextResponse.json(
      { ok: false, error: error?.message || "Import failed" },
      { status: 500 }
    );
  }
}