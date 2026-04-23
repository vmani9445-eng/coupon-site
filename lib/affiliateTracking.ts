import { hasMarketingConsent } from "@/lib/cookieConsent";

type TrackAffiliateOptions = {
  couponId?: string;
  cashbackId?: string;
  storeId?: string;
  targetUrl: string;
  clickType: "COUPON" | "CASHBACK" | "STORE" | "BANNER";
  storeSlug?: string;
  sourcePage?: string;
  sourceLabel?: string;
};

export async function trackAffiliateClick(options: TrackAffiliateOptions) {
  // Essential first-party tracking for cashback flow
  const res = await fetch("/api/track-click", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(options),
  });

  const data = await res.json().catch(() => null);

  // Optional marketing-only events
  if (hasMarketingConsent()) {
    if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
      (window as any).gtag("event", "affiliate_click", {
        click_type: options.clickType,
        store_slug: options.storeSlug || "",
        source_page: options.sourcePage || "",
      });
    }
  }

  return data;
}