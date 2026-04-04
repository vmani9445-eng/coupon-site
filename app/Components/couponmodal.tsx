"use client";

type Coupon = {
  id: number;
  title: string;
  description: string;
  discount: string;
  category: string;
  bankOffer?: string;
  usersToday: number;
  expiresText: string;
  verified?: boolean;
  best?: boolean;
  couponCode?: string;
  affiliateUrl: string;
  type: "coupon" | "deal";
  terms?: string[];
};

type CouponModalProps = {
  isOpen: boolean;
  coupon: Coupon | null;
  storeName: string;
  storeLogoText: string;
  copied: boolean;
  onClose: () => void;
  onCopy: () => void;
  onContinue: () => void;
};

export default function CouponModal({
  isOpen,
  coupon,
  storeName,
  storeLogoText,
  copied,
  onClose,
  onCopy,
  onContinue,
}: CouponModalProps) {
  if (!isOpen || !coupon) return null;

  return (
    <div className="couponModalOverlay" onClick={onClose}>
      <div className="couponModal" onClick={(e) => e.stopPropagation()}>
        <button className="couponModalClose" onClick={onClose} aria-label="Close">
          ×
        </button>

        <div className="couponModalTop">
          <div className="couponModalLogo">{storeLogoText}</div>

          <div className="couponModalHeadings">
            <p className="couponModalStore">{storeName}</p>
            <h3 className="couponModalTitle">{coupon.title}</h3>
            <p className="couponModalSubtitle">{coupon.description}</p>
          </div>
        </div>

        <div className="couponModalCodeWrap">
          <div className="couponModalCode">
            {coupon.couponCode || "NO CODE REQUIRED"}
          </div>

          {coupon.couponCode && (
            <button className="couponCopyBtn" onClick={onCopy}>
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <div className="couponModalMeta">
          <span>{coupon.discount}</span>
          <span>{coupon.category}</span>
          <span>{coupon.expiresText}</span>
        </div>

        <div className="couponModalActions">
          <button className="couponModalGhostBtn" onClick={onClose}>
            Close
          </button>
          <button className="couponModalPrimaryBtn" onClick={onContinue}>
            Continue to Store
          </button>
        </div>
      </div>
    </div>
  );
}