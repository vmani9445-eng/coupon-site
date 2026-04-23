export type NormalizedCoupon = {
  source: string;
  externalId?: string;
  storeName: string;
  title: string;
  description?: string;
  code?: string;
  discount?: string;
  category?: string;
  affiliateUrl: string;
  expiresAt?: Date | null;
  rawPayload?: unknown;
};

export type NormalizedCashback = {
  source: string;
  externalId?: string;
  storeName: string;
  title: string;
  description?: string;
  cashbackType: "PERCENT" | "flat";
  cashbackValue: number;
  affiliateUrl: string;
  startsAt?: Date | null;
  endsAt?: Date | null;
  terms?: string;
  rawPayload?: unknown;
};