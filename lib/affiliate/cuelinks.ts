import { normalizeCategory } from "@/lib/categoryMap";
import { parsePayoutString, slugify, type CashbackKind } from "./helpers";

type CuelinksRawCampaign = Record<string, any>;

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

function firstString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
}

function firstBoolean(...values: unknown[]) {
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

  return null;
}

function normalizeText(value?: string | null) {
  return String(value ?? "").trim().toLowerCase();
}

function getHostname(url?: string | null) {
  if (!url) return "";

  try {
    const withProtocol =
      url.startsWith("http://") || url.startsWith("https://")
        ? url
        : `https://${url}`;

    return new URL(withProtocol).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

function includesAny(text: string, words: string[]) {
  return words.some((word) => text.includes(word));
}

function isIndianCampaign(row: CuelinksRawCampaign, normalized: NormalizedCampaign) {
  const countryText = [
    row.country,
    row.country_name,
    row.countries,
    row.region,
    row.geo,
    row.market,
    row.target_country,
    row.target_countries,
  ]
    .flat()
    .map((value) => normalizeText(String(value ?? "")))
    .join(" ");

  const currencyText = [
    row.currency,
    row.currency_code,
    row.payout_currency,
    row.sale_currency,
  ]
    .map((value) => normalizeText(String(value ?? "")))
    .join(" ");

  const nameText = normalizeText(normalized.name);
  const websiteHost = getHostname(normalized.websiteUrl);
  const affiliateHost = getHostname(normalized.affiliateUrl);
  const combinedHost = `${websiteHost} ${affiliateHost}`;

  if (
    includesAny(countryText, ["india", " in ", "inr"]) ||
    currencyText.includes("inr")
  ) {
    return true;
  }

  if (
    websiteHost.endsWith(".in") ||
    affiliateHost.endsWith(".in") ||
    includesAny(combinedHost, [".in", "amazon.in", "flipkart", "myntra", "ajio", "nykaa"])
  ) {
    return true;
  }

  if (
    includesAny(nameText, [
      "amazon india",
      "flipkart",
      "myntra",
      "ajio",
      "nykaa",
      "tatacliq",
      "tata cliq",
      "croma",
      "reliance digital",
      "firstcry",
      "meesho",
      "bigbasket",
      "pepperfry",
      "netmeds",
      "pharmeasy",
      "paytm",
      "airtel",
      "jio",
    ])
  ) {
    return true;
  }

  return false;
}

function isDigitalGlobalCategory(category: string) {
  const value = normalizeText(category);

  return includesAny(value, [
    "software",
    "saas",
    "services",
    "hosting",
    "domain",
    "education",
    "online course",
    "vpn",
    "subscription",
    "business tools",
  ]);
}

function isAllowedGlobalMerchant(normalized: NormalizedCampaign) {
  const nameText = normalizeText(normalized.name);
  const hostText = `${getHostname(normalized.websiteUrl)} ${getHostname(
    normalized.affiliateUrl
  )}`;

  return (
    isDigitalGlobalCategory(normalized.category) ||
    includesAny(nameText, [
      "hostinger",
      "namecheap",
      "godaddy",
      "canva",
      "adobe",
      "udemy",
      "coursera",
      "nordvpn",
      "surfshark",
      "grammarly",
      "envato",
      "wps",
      "ipvanish",
      "proton",
    ]) ||
    includesAny(hostText, [
      "hostinger",
      "namecheap",
      "godaddy",
      "canva",
      "adobe",
      "udemy",
      "coursera",
      "nordvpn",
      "surfshark",
      "grammarly",
      "envato",
      "wps.com",
    ])
  );
}

function shouldKeepCampaign(row: CuelinksRawCampaign, normalized: NormalizedCampaign) {
  if (!normalized.name || !normalized.externalId) {
    return false;
  }

  if (isIndianCampaign(row, normalized)) {
    return true;
  }

  if (isAllowedGlobalMerchant(normalized)) {
    return true;
  }

  return false;
}

function normalizeCuelinksCampaign(row: CuelinksRawCampaign): NormalizedCampaign {
  const name = firstString(
    row.name,
    row.campaign_name,
    row.advertiser,
    row.store_name,
    row.store,
    row.merchant_name,
    row.brand
  );

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
    ) || null;

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

  const cashbackAllowed =
    firstBoolean(
      row.cashback_allowed,
      row.incentive_allowed,
      row.incentive_cashback_allowed,
      row.cashback,
      row.allow_cashback
    ) ?? true;

  return {
    source: "cuelinks",
    externalId: String(
      row.id ??
        row.campaign_id ??
        row.advertiser_id ??
        row.merchant_id ??
        slugify(name)
    ),
    name,
    slug: slugify(name),
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
          row.categories,
          row.vertical,
          row.segment,
          row.category_name,
          row.primary_category
        ) || null,
      storeName: name,
      websiteUrl,
      title: name,
      description,
    }),
    payoutKind: payout.kind,
    networkPayoutValue: payout.value,
    cashbackAllowed,
  };
}

export async function fetchCuelinksCampaigns(): Promise<NormalizedCampaign[]> {
  const apiUrl = process.env.CUELINKS_CAMPAIGNS_URL;
  const token = process.env.CUELINKS_API_TOKEN;

  if (!apiUrl) {
    throw new Error("Missing CUELINKS_CAMPAIGNS_URL");
  }

  if (!token) {
    throw new Error("Missing CUELINKS_API_TOKEN");
  }

  console.log("CUELINKS URL:", apiUrl);
  console.log("CUELINKS TOKEN EXISTS:", Boolean(token));

  let res: Response;

  try {
    res = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Token ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });
  } catch (error: any) {
    console.error("CUELINKS FETCH ERROR:", error);
    throw new Error(error?.message || "Cuelinks fetch failed");
  }

  if (!res.ok) {
    const text = await res.text();

    console.log("❌ CUELINKS ERROR RESPONSE:");
    console.log(text);

    throw new Error(`Cuelinks campaigns error: ${res.status} ${text}`);
  }

  const data = await res.json();

  const rows: CuelinksRawCampaign[] = Array.isArray(data)
    ? data
    : Array.isArray(data?.results)
      ? data.results
      : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.campaigns)
          ? data.campaigns
          : Array.isArray(data?.merchants)
            ? data.merchants
            : [];

  return rows
    .map(normalizeCuelinksCampaign)
    .filter((row) => row.name && row.externalId);
}
