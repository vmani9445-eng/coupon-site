"use client";

import { useEffect, useMemo, useState } from "react";
import CouponModal from "./couponmodal";

type Coupon = {
  id: string;
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
  userType?: "all" | "first_time" | "existing";
};

type Store = {
  slug: string;
  name: string;
  description: string;
  logoText: string;
  offersCount: number;
  tags: string[];
  coupons: Coupon[];
  categories: string[];
};

type Props = {
  store: Store;
};

function detectBankName(bankOffer?: string) {
  if (!bankOffer) return null;

  const text = bankOffer.toLowerCase();

  if (text.includes("hdfc")) return "HDFC";
  if (text.includes("icici")) return "ICICI";
  if (text.includes("sbi")) return "SBI";
  if (text.includes("axis")) return "Axis";
  if (text.includes("kotak")) return "Kotak";
  if (text.includes("amex")) return "Amex";
  if (text.includes("indusind")) return "IndusInd";

  return "Other";
}

export default function StoreCouponsClient({ store }: Props) {
  const [activeTab, setActiveTab] = useState<"all" | "coupon" | "deal">("all");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBanks, setSelectedBanks] = useState<string[]>([]);
  const [selectedUserType, setSelectedUserType] = useState<
    "all" | "first_time" | "existing"
  >("all");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [openDetailsId, setOpenDetailsId] = useState<string | null>(null);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.body.style.overflow = selectedCoupon ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedCoupon]);

  const couponCount = store.coupons.filter((item) => item.type === "coupon").length;
  const dealCount = store.coupons.filter((item) => item.type === "deal").length;

  const bankOptions = Array.from(
  new Set(
    store.coupons
      .map((item) => detectBankName(item.bankOffer))
      .filter((item): item is NonNullable<ReturnType<typeof detectBankName>> =>
        item !== null
      )
  )
);

  const filteredCoupons = useMemo(() => {
    return store.coupons.filter((item) => {
      const matchTab = activeTab === "all" || item.type === activeTab;

      const matchCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(item.category);

      const bankName = detectBankName(item.bankOffer);
      const matchBank =
        selectedBanks.length === 0 ||
        (bankName ? selectedBanks.includes(bankName) : false);

      const matchUserType =
        selectedUserType === "all" ||
        item.userType === selectedUserType ||
        item.userType === undefined;

      const matchVerified = !verifiedOnly || Boolean(item.verified);

      return (
        matchTab &&
        matchCategory &&
        matchBank &&
        matchUserType &&
        matchVerified
      );
    });
  }, [
    store.coupons,
    activeTab,
    selectedCategories,
    selectedBanks,
    selectedUserType,
    verifiedOnly,
  ]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category]
    );
  };

  const toggleBank = (bank: string) => {
    setSelectedBanks((prev) =>
      prev.includes(bank)
        ? prev.filter((item) => item !== bank)
        : [...prev, bank]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedBanks([]);
    setSelectedUserType("all");
    setVerifiedOnly(false);
  };

  const toggleDetails = (id: string) => {
    setOpenDetailsId((prev) => (prev === id ? null : id));
  };

  const openCouponModal = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setCopied(false);
  };

  const closeCouponModal = () => {
    setSelectedCoupon(null);
    setCopied(false);
  };

  const copyCode = async () => {
    if (!selectedCoupon?.couponCode) return;

    try {
      await navigator.clipboard.writeText(selectedCoupon.couponCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const continueToStore = () => {
    if (!selectedCoupon?.affiliateUrl) return;
    window.location.href = selectedCoupon.affiliateUrl;
  };

  const formatDiscountDisplay = (discount: string) => {
    const clean = discount.trim();
    if (clean.toUpperCase().includes("OFF")) return clean;
    if (clean.toUpperCase().includes("DEAL")) return clean;
    return clean;
  };

  return (
    <>
      <div className="storePagePremium">
        <section className="storeHeroPremium">
          <div className="storeHeroLogoPanel">
            <div className="storeHeroLogoBox">{store.logoText}</div>
          </div>

          <div className="storeHeroContent">
            <p className="storeBreadcrumb">Home / {store.name}</p>
            <h1 className="storeTitle">{store.name} Coupons & Deals</h1>
            <p className="storeSubtitle">{store.description}</p>

            <div className="storeTagList">
              {store.tags.map((tag) => (
                <span key={tag} className="storeTag">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="storeTabsPremium">
          <button
            type="button"
            className={`storeTab ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            All ({store.coupons.length})
          </button>

          <button
            type="button"
            className={`storeTab ${activeTab === "coupon" ? "active" : ""}`}
            onClick={() => setActiveTab("coupon")}
          >
            Coupons ({couponCount})
          </button>

          <button
            type="button"
            className={`storeTab ${activeTab === "deal" ? "active" : ""}`}
            onClick={() => setActiveTab("deal")}
          >
            Deals ({dealCount})
          </button>
        </section>

        <section className="storeLayoutPremium">
          <aside className="filtersCardPremium">
            <div className="filtersTop">
              <h3>Filters</h3>
              <button
                type="button"
                className="clearTextBtn"
                onClick={clearFilters}
              >
                Clear
              </button>
            </div>

            <div className="filtersSection">
              <h4>Categories</h4>
              <div className="filtersList">
                {store.categories.map((category) => (
                  <label key={category} className="filterRow">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={() => toggleCategory(category)}
                    />
                    <span>{category}</span>
                  </label>
                ))}
              </div>
            </div>

            {bankOptions.length > 0 && (
              <div className="filtersSection">
                <h4>Banks</h4>
                <div className="filtersList">
                  {bankOptions.map((bank) => (
                    <label key={bank} className="filterRow">
                      <input
                        type="checkbox"
                        checked={selectedBanks.includes(bank)}
                        onChange={() => toggleBank(bank)}
                      />
                      <span>{bank}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="filtersSection">
              <h4>User Type</h4>
              <div className="filtersList">
                <label className="filterRow">
                  <input
                    type="radio"
                    name="userType"
                    checked={selectedUserType === "all"}
                    onChange={() => setSelectedUserType("all")}
                  />
                  <span>All users</span>
                </label>

                <label className="filterRow">
                  <input
                    type="radio"
                    name="userType"
                    checked={selectedUserType === "first_time"}
                    onChange={() => setSelectedUserType("first_time")}
                  />
                  <span>First-time users</span>
                </label>

                <label className="filterRow">
                  <input
                    type="radio"
                    name="userType"
                    checked={selectedUserType === "existing"}
                    onChange={() => setSelectedUserType("existing")}
                  />
                  <span>Existing users</span>
                </label>
              </div>
            </div>

            <div className="filtersSection filtersSectionLast">
              <h4>Other</h4>
              <div className="filtersList">
                <label className="filterRow">
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={() => setVerifiedOnly((prev) => !prev)}
                  />
                  <span>Verified only</span>
                </label>
              </div>
            </div>
          </aside>

          <div className="offersListPremium">
            {filteredCoupons.length === 0 ? (
              <div className="emptyBoxPremium">No offers found.</div>
            ) : (
              filteredCoupons.map((coupon) => {
                const isDetailsOpen = openDetailsId === coupon.id;

                return (
                  <article key={coupon.id} className="couponShowcaseCard">
                    <div className="couponShowcaseLeft">
                      <div className="couponDiscountTile">
                        <span>{formatDiscountDisplay(coupon.discount)}</span>
                      </div>
                    </div>

                    <div className="couponShowcaseBody">
                      <div className="couponBadgeRow">
                        {coupon.verified && (
                          <span className="couponMiniBadge badgeVerified">
                            Verified
                          </span>
                        )}

                        {coupon.best && (
                          <span className="couponMiniBadge badgeBest">Best</span>
                        )}

                        <span className="couponMiniBadge badgeCategory">
                          {coupon.category}
                        </span>
                      </div>

                      <h2 className="couponHeadline">{coupon.title}</h2>
                      <p className="couponDesc">{coupon.description}</p>

                      {coupon.bankOffer && (
                        <p className="couponBankLine">{coupon.bankOffer}</p>
                      )}

                      <div className="couponMetaLine">
                        <span>{store.name}</span>
                        <span>{coupon.expiresText}</span>
                        <span>{coupon.usersToday} used today</span>
                      </div>

                      <button
                        type="button"
                        className="couponDetailsToggle"
                        onClick={() => toggleDetails(coupon.id)}
                      >
                        {isDetailsOpen ? "Hide details & terms" : "View details & terms"}
                      </button>

                      {isDetailsOpen && (
                        <div className="couponTermsBox">
                          <p>
                            Apply this offer during checkout. Coupon is shown in
                            popup before redirecting to the store.
                          </p>

                          <ul>
                            {coupon.terms?.length ? (
                              coupon.terms.map((term, index) => (
                                <li key={index}>{term}</li>
                              ))
                            ) : (
                              <>
                                <li>Valid on selected products only.</li>
                                <li>Cannot be combined with some other offers.</li>
                                <li>Discount may vary by cart value.</li>
                              </>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="couponShowcaseRight">
                      <button
                        type="button"
                        className="showCouponBtn"
                        onClick={() => openCouponModal(coupon)}
                      >
                        {coupon.type === "deal" ? "Activate Deal" : "Show Coupon"}
                      </button>

                      <p className="couponActionHint">
                        {coupon.couponCode
                          ? "Click to reveal coupon code"
                          : "Click to activate this deal"}
                      </p>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>
      </div>

      <CouponModal
        isOpen={Boolean(selectedCoupon)}
        coupon={selectedCoupon}
        storeName={store.name}
        storeLogoText={store.logoText}
        copied={copied}
        onClose={closeCouponModal}
        onCopy={copyCode}
        onContinue={continueToStore}
      />
    </>
  );
}