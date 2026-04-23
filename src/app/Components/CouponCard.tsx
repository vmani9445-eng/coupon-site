"use client";

import { useState } from "react";

type Coupon = {
  id?: string | number;
  title?: string;
  description?: string;
  category?: string;
  code?: string;
  discount?: string;
  users?: number;
  verified?: boolean;
  bank?: string;
  expiresAt?: string;
  affiliateUrl?: string;
  storeId?: string;
  storeSlug?: string;
};

type CouponCardProps = {
  coupon?: Coupon;
  storeName?: string;
};

export default function CouponCard({
  coupon = {},
  storeName = "Store",
}: CouponCardProps) {
  const [showCode, setShowCode] = useState(false);
  const [isTracking, setIsTracking] = useState(false);

  const title =
    typeof coupon.title === "string" && coupon.title.trim() !== ""
      ? coupon.title.trim()
      : "Special savings offer";

  const description =
    typeof coupon.description === "string" && coupon.description.trim() !== ""
      ? coupon.description.trim()
      : `Limited-time ${storeName} offer available.`;

  const discount =
    typeof coupon.discount === "string" && coupon.discount.trim() !== ""
      ? coupon.discount.trim()
      : "SAVE";

  const hasCode =
    typeof coupon.code === "string" && coupon.code.trim() !== "";

  const code = hasCode ? coupon.code!.trim() : "";

  const category =
    typeof coupon.category === "string" && coupon.category.trim() !== ""
      ? coupon.category.trim()
      : "General";

  const verified =
    typeof coupon.verified === "boolean" ? coupon.verified : true;

  const bank =
    typeof coupon.bank === "string" && coupon.bank.trim() !== ""
      ? coupon.bank.trim()
      : "";

  const expiresAt =
    typeof coupon.expiresAt === "string" && coupon.expiresAt.trim() !== ""
      ? coupon.expiresAt.trim()
      : "";

  const usersText =
    typeof coupon.users === "number" ? `${coupon.users} used today` : "All users";

  const affiliateUrl =
    typeof coupon.affiliateUrl === "string" && coupon.affiliateUrl.trim() !== ""
      ? coupon.affiliateUrl.trim()
      : "";

  async function handleCouponClick() {
    setShowCode(true);

    if (!affiliateUrl || isTracking) return;

    try {
      setIsTracking(true);

      const res = await fetch("/api/track-click", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clickType: hasCode ? "COUPON" : "STORE",
          couponId: coupon.id ? String(coupon.id) : null,
          storeId: coupon.storeId ? String(coupon.storeId) : null,
          targetUrl: affiliateUrl,
          storeSlug: coupon.storeSlug || null,
          trackingParamKey: "subid",
          sourcePage:
            typeof window !== "undefined" ? window.location.pathname : null,
          sourceLabel: hasCode ? "show_coupon" : "get_deal",
        }),
      });

      const data = await res.json();

      if (res.ok && data?.ok && data?.redirectUrl) {
        window.open(data.redirectUrl, "_blank", "noopener,noreferrer");
        return;
      }

      window.open(affiliateUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Failed to track click:", error);
      window.open(affiliateUrl, "_blank", "noopener,noreferrer");
    } finally {
      setIsTracking(false);
    }
  }

  return (
    <article className="couponCardUiClean">
      <div className="couponLeftClean">
        <div className="couponDiscountBoxUiClean">{discount}</div>
      </div>

      <div className="couponMiddleClean">
        <div className="couponBadgesClean">
          {verified && <span className="badgeClean verified">Verified</span>}
          <span className="badgeClean best">Best</span>
          <span className="badgeClean category">{category}</span>
          <span className="badgeClean users">{usersText}</span>
        </div>

        <h3 className="couponTitleUiClean">{title}</h3>
        <p className="couponDescriptionUiClean">{description}</p>

        {bank && <div className="couponBankLineClean">{bank}</div>}

        <div className="couponMetaClean">
          <span>{storeName}</span>
          {expiresAt && <span>Ends {expiresAt}</span>}
          <span>{usersText}</span>
        </div>

        <button type="button" className="couponLinkClean">
          View details & terms
        </button>
      </div>

      <div className="couponRightClean">
        <button
          type="button"
          className="couponShowBtnClean"
          onClick={handleCouponClick}
          disabled={isTracking || !affiliateUrl}
        >
          {isTracking
            ? "Opening..."
            : hasCode
            ? "Show Coupon"
            : "Get Deal"}
        </button>

        <div className="couponCodeHintClean">
          {hasCode
            ? showCode
              ? code
              : "Code hidden until click"
            : "No coupon code needed"}
        </div>
      </div>
    </article>
  );
}