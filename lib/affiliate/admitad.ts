import { normalizeCategory } from "@/lib/categoryMap";
import { parsePayoutString, slugify, type CashbackKind } from "./helpers";

type AdmitadTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
};

type AdmitadCampaignCategory = {
  name?: string;
};

type AdmitadCampaignAction = {
  id?: number;
  name?: string;
  type?: string;
  payment_size?: string;
};

type AdmitadCampaign = {
  id: number;
  name: string;
  image?: string;
  description?: string;
  site_url?: string;
  gotolink?: string;
  categories?: AdmitadCampaignCategory[];
  actions?: AdmitadCampaignAction[];
  status?: string;
  countries?: string[] | string;
  currency?: string;
};

type AdmitadProgramsResponse = {
  results: AdmitadCampaign[];
  next?: string | null;
};

export type NormalizedCampaign = {
  source: "admitad";
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

function normalizeText(value?: string | null) {
  return String(value ?? "").trim().toLowerCase();
}

function normalizeImage(url?: string | null) {
  if (!url) return null;
  if (url.startsWith("//")) return `https:${url}`;
  return url;
}

function getHostname(url?: string | null) {
  if (!url) return "";

  try {
    const safeUrl =
      url.startsWith("http://") || url.startsWith("https://")
        ? url
        : `https://${url}`;

    return new URL(safeUrl).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

function includesAny(text: string, words: string[]) {
  return words.some((word) => text.includes(word));
}

function pickBestAction(actions?: AdmitadCampaignAction[]) {
  if (!actions?.length) return null;

  const saleAction =
    actions.find(
      (action) => action.type?.toLowerCase() === "sale" && action.payment_size
    ) || actions.find((action) => action.payment_size);

  return saleAction || null;
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

function isAllowedGlobalMerchant(campaign: NormalizedCampaign) {
  const nameText = normalizeText(campaign.name);
  const hostText = `${getHostname(campaign.websiteUrl)} ${getHostname(
    campaign.affiliateUrl
  )}`;

  return (
    isDigitalGlobalCategory(campaign.category) ||
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

function isIndianCampaign(
  rawCampaign: AdmitadCampaign,
  normalizedCampaign: NormalizedCampaign
) {
  const countriesText = Array.isArray(rawCampaign.countries)
    ? rawCampaign.countries.map((item) => normalizeText(item)).join(" ")
    : normalizeText(rawCampaign.countries);

  const currencyText = normalizeText(rawCampaign.currency);
  const nameText = normalizeText(normalizedCampaign.name);
  const websiteHost = getHostname(normalizedCampaign.websiteUrl);
  const affiliateHost = getHostname(normalizedCampaign.affiliateUrl);
  const combinedHost = `${websiteHost} ${affiliateHost}`;

  if (
    includesAny(countriesText, ["india", " in ", "inr"]) ||
    currencyText.includes("inr")
  ) {
    return true;
  }

  if (
    websiteHost.endsWith(".in") ||
    affiliateHost.endsWith(".in") ||
    includesAny(combinedHost, [
      ".in",
      "amazon.in",
      "flipkart",
      "myntra",
      "ajio",
      "nykaa",
    ])
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
      "goibibo",
    ])
  ) {
    return true;
  }

  return false;
}

function shouldKeepCampaign(
  rawCampaign: AdmitadCampaign,
  normalizedCampaign: NormalizedCampaign
) {
  if (!normalizedCampaign.name?.trim()) return false;
  if (!normalizedCampaign.externalId?.trim()) return false;
  if (!normalizedCampaign.slug?.trim()) return false;
  if (!normalizedCampaign.affiliateUrl && !normalizedCampaign.websiteUrl) {
    return false;
  }

  if (isIndianCampaign(rawCampaign, normalizedCampaign)) {
    return true;
  }

  if (isAllowedGlobalMerchant(normalizedCampaign)) {
    return true;
  }

  return false;
}

export async function getAdmitadAccessToken() {
  const clientId = process.env.ADMITAD_CLIENT_ID;
  const clientSecret = process.env.ADMITAD_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing Admitad credentials");
  }

  const form = new URLSearchParams();
  form.set("grant_type", "client_credentials");
  form.set("client_id", clientId);
  form.set("client_secret", clientSecret);
form.set("scope", "advcampaigns");

  const res = await fetch("https://api.admitad.com/token/", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: form.toString(),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Admitad token error: ${res.status} ${text}`);
  }

  return (await res.json()) as AdmitadTokenResponse;
}

export async function fetchAdmitadCampaigns(): Promise<NormalizedCampaign[]> {
  const websiteId = process.env.ADMITAD_WEBSITE_ID;

  if (!websiteId) {
    throw new Error("Missing ADMITAD_WEBSITE_ID");
  }

  const token = await getAdmitadAccessToken();
  const all: Array<{
    raw: AdmitadCampaign;
    normalized: NormalizedCampaign;
  }> = [];

  let offset = 0;
  const limit = 100;

  while (true) {
    const url = new URL("https://api.admitad.com/advcampaigns/");
    url.searchParams.set("website", websiteId);
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("offset", String(offset));

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token.access_token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Admitad campaigns error: ${res.status} ${text}`);
    }

    const data = (await res.json()) as AdmitadProgramsResponse;
    const results = data.results || [];

    console.log("ADMITAD RESULTS COUNT:", results.length);
    console.log("ADMITAD FIRST ITEM:", results[0] || null);

    for (const campaign of results) {
      const action = pickBestAction(campaign.actions);
      const payout = parsePayoutString(action?.payment_size);

      const normalized: NormalizedCampaign = {
        source: "admitad",
        externalId: String(campaign.id),
        name: campaign.name,
        slug: slugify(campaign.name),
        logo: normalizeImage(campaign.image),
        websiteUrl: campaign.site_url || null,
        affiliateUrl: campaign.gotolink || null,
        description: campaign.description || null,
        category: normalizeCategory({
          rawCategory: campaign.categories?.[0]?.name || null,
          storeName: campaign.name,
          websiteUrl: campaign.site_url || null,
          title: campaign.name,
          description: campaign.description || null,
        }),
        payoutKind: payout.kind,
        networkPayoutValue: payout.value,
        cashbackAllowed: true,
      };

      all.push({
        raw: campaign,
        normalized,
      });
    }

    if (results.length < limit) {
      break;
    }

    offset += limit;
  }

 console.log("ADMITAD TOTAL RAW:", all.length);
console.log("ADMITAD TOTAL FILTERED:", all.length);

return all.map(({ normalized }) => normalized);
}