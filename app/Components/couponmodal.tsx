"use client";

type Coupon = {
  id: string;
  title: string;
  description?: string;
  discount?: string;
  category?: string;
  couponCode?: string;
  affiliateUrl?: string;
  extraCashback?: string;
  expiresText?: string;

  networkCashback?: number;
  userCashback?: number;
  adminMargin?: number;
  cashbackLabel?: string;
};

type Props = {
  isOpen: boolean;
  coupon: Coupon | null;
  storeName: string;
  storeLogoText: string;
  storeLogo?: string | null;
  copied: boolean;
  isLoggedIn: boolean;
  onClose: () => void;
  onCopy: () => void | Promise<void>;
  onContinue: () => void | Promise<void>;
};

function getCashbackText(coupon: Coupon | null) {
  if (!coupon) return null;

  if (coupon.cashbackLabel?.trim()) {
    return coupon.cashbackLabel.trim();
  }

  if (typeof coupon.userCashback === "number" && coupon.userCashback > 0) {
    return `Up to ${coupon.userCashback}% cashback`;
  }

  if (coupon.extraCashback?.trim()) {
    return coupon.extraCashback.trim();
  }

  return null;
}

export default function CouponModal({
  isOpen,
  coupon,
  storeName,
  storeLogoText,
  storeLogo,
  copied,
  isLoggedIn,
  onClose,
  onCopy,
  onContinue,
}: Props) {
  if (!isOpen || !coupon) return null;

  const hasCouponCode =
    typeof coupon.couponCode === "string" && coupon.couponCode.trim() !== "";

  const cashbackText = getCashbackText(coupon);

  const handleLoginSignup = () => {
    const nextUrl =
      typeof window !== "undefined"
        ? window.location.pathname + window.location.search
        : "/";

    window.location.href = `/login?next=${encodeURIComponent(nextUrl)}`;
  };

  const handlePrimaryAction = async () => {
    if (hasCouponCode) {
      await onCopy();
    }

    await onContinue();
  };

  return (
    <div className="couponModalOverlay" onClick={onClose}>
      <div className="couponModal" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="couponModalClose"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <div className="couponModalHeader">
          <div className="couponModalLogo">
            {storeLogo ? (
              <img
                src={storeLogo}
                alt={storeName}
                className="couponModalLogoImg"
              />
            ) : (
              <span>
                {storeLogoText?.charAt(0) || storeName?.charAt(0) || "S"}
              </span>
            )}
          </div>

          <div className="couponModalHeadText">
            <div className="couponModalStore">{storeName}</div>
            <h3 className="couponModalTitle">{coupon.title}</h3>
            {coupon.description ? (
              <p className="couponModalDesc">{coupon.description}</p>
            ) : null}
          </div>
        </div>

        {cashbackText ? (
          <div className="couponCashbackBox">
            <span className="couponCashbackLabel">Get additional cashback</span>
            <strong>{cashbackText}</strong>
          </div>
        ) : null}

        <div className="couponCodeBox">
          {hasCouponCode ? (
            <>
              <span className="couponCodeText">{coupon.couponCode}</span>

              <button
                type="button"
                className="couponCopyBtn"
                onClick={onCopy}
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </>
          ) : (
            <span className="couponCodeNoCode">NO CODE REQUIRED</span>
          )}
        </div>

        <div className="couponTagsRow">
          {coupon.discount ? (
            <span className="couponTag">{coupon.discount}</span>
          ) : null}

          {coupon.category ? (
            <span className="couponTag">{coupon.category}</span>
          ) : null}

          {coupon.expiresText ? (
            <span className="couponTag">{coupon.expiresText}</span>
          ) : null}
        </div>

        {!isLoggedIn && (
          <div className="couponLoginCard">
            <h4>Sign up to get additional cashback</h4>
            <p>
              Create an account to track cashback, wallet earnings, and faster
              withdrawals.
            </p>

            <button
              type="button"
              className="couponLoginBtn"
              onClick={handleLoginSignup}
            >
              Login / Signup
            </button>
          </div>
        )}

        <div className="couponPrimaryWrap">
          <button
            type="button"
            className="couponPrimaryBtn"
            onClick={handlePrimaryAction}
          >
            {hasCouponCode
              ? copied
                ? "Coupon Copied"
                : "Show Coupon"
              : "Activate Offer"}
          </button>
        </div>
      </div>
    </div>
  );
}