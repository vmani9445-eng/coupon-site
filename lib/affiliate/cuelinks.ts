import { normalizeCategory } from "@/lib/categoryMap";
import { parsePayoutString, slugify, type CashbackKind } from "./helpers";

type CuelinksRawCampaign = Record<string, unknown>;

export type NormalizedCampaign = {
  source: "cuelinks";
  externalId: string;
  name: string;
  slug: string;
  logo: string | null;
  websiteUrl: string | null;
  affiliateUrl: string | null;
  description: string | null;
  category: string;
  payoutKind: CashbackKind | null;
  networkPayoutValue: number | null;
  cashbackAllowed: boolean;
};

function firstString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
}

function firstBoolean(...values: unknown[]): boolean {
  for (const value of values) {
    if (typeof value === "boolean") return value;

    if (typeof value === "string") {
      const v = value.toLowerCase().trim();
      if (v === "true" || v === "yes" || v === "1") return true;
      if (v === "false" || v === "no" || v === "0") return false;
    }

    if (typeof value === "number") {
      if (value === 1) return true;
      if (value === 0) return false;
    }
  }

  return true;
}

function normalizeCuelinksCampaign(
  row: CuelinksRawCampaign
): NormalizedCampaign {
  const name = firstString(
    row.name,
    row.campaign_name,
    row.advertiser,
    row.store_name,
    row.store,
    row.merchant_name,
    row.brand,
    row.title
  );

  const safeName =
    name ||
    firstString(row.url, row.site_url, row.website_url, row.domain) ||
    "Unknown Store";

  const websiteUrl =
    firstString(
      row.site_url,
      row.website_url,
      row.url,
      row.website,
      row.domain
    ) || null;

  const affiliateUrl =
    firstString(
      row.gotolink,
      row.tracking_url,
      row.affiliate_url,
      row.link,
      row.deep_link,
      row.deeplink
    ) || websiteUrl;

  const description =
    firstString(
      row.description,
      row.summary,
      row.details,
      row.short_description
    ) || null;

  const payoutRaw = firstString(
    row.payout,
    row.payout_string,
    row.payment_size,
    row.commission,
    row.cashback,
    row.rate,
    row.sale_commission,
    row.payout_upto
  );

  const payout = parsePayoutString(payoutRaw);

  const cashbackAllowed = firstBoolean(
    row.cashback_allowed,
    row.incentive_allowed,
    row.incentive_cashback_allowed,
    row.allow_cashback
  );

  const rawCategories =
    Array.isArray(row.categories)
      ? row.categories
          .filter((item): item is string => typeof item === "string")
          .join(", ")
      : row.categories;

  return {
    source: "cuelinks",
    externalId: String(
      row.id ??
        row.campaign_id ??
        row.advertiser_id ??
        row.merchant_id ??
        slugify(safeName)
    ),
    name: safeName,
    slug: slugify(safeName),
    logo:
      firstString(
        row.logo,
        row.logo_url,
        row.image,
        row.image_url,
        row.advertiser_logo,
        row.store_logo
      ) || null,
    websiteUrl,
    affiliateUrl,
    description,
    category: normalizeCategory({
      rawCategory:
        firstString(
          row.category,
          rawCategories,
          row.vertical,
          row.segment,
          row.category_name,
          row.primary_category
        ) || null,
      storeName: safeName,
      websiteUrl,
      title: safeName,
      description,
    }),
    payoutKind: payout.kind,
    networkPayoutValue: payout.value,
    cashbackAllowed,
  };
}

function extractRows(data: unknown): CuelinksRawCampaign[] {
  if (Array.isArray(data)) {
    return data.filter(
      (row): row is CuelinksRawCampaign =>
        typeof row === "object" && row !== null
    );
  }

  if (typeof data !== "object" || data === null) {
    return [];
  }

  const obj = data as {
    data?: unknown;
    results?: unknown;
    merchants?: unknown;
  };

  const candidate =
    Array.isArray(obj.data) ? obj.data :
    Array.isArray(obj.results) ? obj.results :
    Array.isArray(obj.merchants) ? obj.merchants :
    [];

  return candidate.filter(
    (row): row is CuelinksRawCampaign =>
      typeof row === "object" && row !== null
  );
}

export async function fetchCuelinksCampaigns(): Promise<NormalizedCampaign[]> {
  const apiUrl =
    process.env.CUELINKS_CAMPAIGNS_URL ||
    "https://www.cuelinks.com/api/v1/all_merchants.json";

  const token =
    process.env.CUELINKS_API_TOKEN || process.env.CUELINKS_API_KEY;

  if (!token) {
    throw new Error("Missing CUELINKS_API_KEY");
  }

  console.log("CUELINKS FETCH:", apiUrl);

  const res = await fetch(apiUrl, {
    method: "GET",
    headers: {
      Authorization: `Token ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    console.log("CUELINKS ERROR RESPONSE:", text);
    throw new Error(`Cuelinks error: ${res.status} ${text}`);
  }

  const data: unknown = await res.json();

  console.log(
    "CUELINKS RESPONSE SAMPLE:",
    JSON.stringify(data).slice(0, 1000)
  );

  const rows = extractRows(data);

  return rows
    .map((row: CuelinksRawCampaign) => normalizeCuelinksCampaign(row))
    .filter(
      (row: NormalizedCampaign) => Boolean(row.name) && Boolean(row.externalId)
    );
}