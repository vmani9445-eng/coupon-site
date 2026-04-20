export type CashbackKind = "PERCENT" | "FLAT";

export function parsePayoutString(value?: string | null): {
  kind: CashbackKind | null;
  value: number | null;
} {
  if (!value) {
    return { kind: null, value: null };
  }

  const raw = String(value).trim();

  if (!raw) {
    return { kind: null, value: null };
  }

  const normalized = raw
    .replace(/,/g, "")
    .replace(/\b(inr|rs\.?|rupees?)\b/gi, "₹")
    .replace(/\s+/g, " ")
    .trim();

  const percentMatch = normalized.match(/(\d+(?:\.\d+)?)\s*%/);
  if (percentMatch) {
    const num = Number(percentMatch[1]);
    return {
      kind: Number.isFinite(num) ? "PERCENT" : null,
      value: Number.isFinite(num) ? num : null,
    };
  }

  const flatMatch = normalized.match(/(?:₹|\$|€|£)?\s*(\d+(?:\.\d+)?)/);
  if (flatMatch) {
    const num = Number(flatMatch[1]);
    return {
      kind: Number.isFinite(num) ? "FLAT" : null,
      value: Number.isFinite(num) ? num : null,
    };
  }

  return { kind: null, value: null };
}

export function splitCashback(
  networkPayoutValue: number | null,
  cashbackPercentToUser = 70
) {
  if (
    typeof networkPayoutValue !== "number" ||
    !Number.isFinite(networkPayoutValue) ||
    networkPayoutValue <= 0
  ) {
    return {
      userCashback: null as number | null,
      adminMargin: null as number | null,
    };
  }

  const safePercent = Math.min(Math.max(cashbackPercentToUser, 0), 100);

  const userCashback = Number(
    ((networkPayoutValue * safePercent) / 100).toFixed(2)
  );

  const adminMargin = Number((networkPayoutValue - userCashback).toFixed(2));

  return { userCashback, adminMargin };
}

export function buildCashbackLabel(
  kind: CashbackKind | null,
  userCashback: number | null
) {
  if (
    !kind ||
    typeof userCashback !== "number" ||
    !Number.isFinite(userCashback) ||
    userCashback <= 0
  ) {
    return null;
  }

  if (kind === "PERCENT") {
    return `Up to ${removeTrailingZeros(userCashback)}% cashback`;
  }

  return `Up to ₹${removeTrailingZeros(userCashback)} cashback`;
}

export function removeTrailingZeros(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
}

export function slugify(text: string) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/['’]/g, "")
    .replace(/[^\w\s-]/g, " ")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}