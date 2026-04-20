"use client";

import "../storepage.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import CouponModal from "./couponmodal";

type Coupon = {
  id: string;
  storeId?: string;
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
  extraCashback?: string;

  networkCashback?: number;
  userCashback?: number;
  adminMargin?: number;
  cashbackLabel?: string;
};

type Store = {
  slug: string;
  name: string;
  description: string;
  logo?: string | null;
  logoText: string;
  offersCount: number;
  tags: string[];
  coupons: Coupon[];
  categories: string[];
};

type Props = {
  store: Store;
  isLoggedIn?: boolean;
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

function splitCommaValues(values: string[]) {
  return Array.from(
    new Set(
      values
        .flatMap((value) =>
          value
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        )
        .filter(Boolean)
    )
  );
}

function splitSingleValue(value?: string) {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function detectAudienceLabel(coupon: Coupon) {
  if (coupon.userType === "first_time") return "New User Only";
  if (coupon.userType === "existing") return "Existing Users";

  const text =
    `${coupon.title} ${coupon.description} ${coupon.bankOffer || ""}`.toLowerCase();

  if (
    text.includes("first order") ||
    text.includes("new user") ||
    text.includes("new users") ||
    text.includes("first-time") ||
    text.includes("first time") ||
    text.includes("signup") ||
    text.includes("sign up")
  ) {
    return "New User Only";
  }

  if (
    text.includes("existing users") ||
    text.includes("returning users") ||
    text.includes("loyal users")
  ) {
    return "Existing Users";
  }

  return null;
}

function formatDiscountDisplay(
  discount: string,
  title?: string,
  description?: string
) {
  const extractBestOffer = (text?: string) => {
    if (!text) return null;

    const upper = text.toUpperCase().trim();
    if (!upper) return null;

    const upToMatches = Array.from(
      upper.matchAll(/UP\s*TO\s*(\d+)\s*%/g)
    ).map((match) => Number(match[1]));

    if (upToMatches.length > 0) {
      return `UP TO ${Math.max(...upToMatches)}%`;
    }

    const percentMatches = Array.from(upper.matchAll(/(\d+)\s*%/g)).map(
      (match) => Number(match[1])
    );

    if (percentMatches.length > 0) {
      return `${Math.max(...percentMatches)}% OFF`;
    }

    const amountMatches = Array.from(upper.matchAll(/₹\s*([\d,]+)/g)).map(
      (match) => match[1]
    );

    if (amountMatches.length > 0) {
      return `₹${amountMatches[0]} OFF`;
    }

    if (/BUY\s*\d+/i.test(upper)) return upper;

    return null;
  };

  const discountValue = (discount || "").trim().toUpperCase();

  const genericOnlyValues = new Set([
    "",
    "SAVE",
    "SALE",
    "DEAL",
    "OFFER",
    "DISCOUNT",
    "BEST DEAL",
  ]);

  const fromDiscount = extractBestOffer(discount);
  if (fromDiscount) return fromDiscount;

  if (!genericOnlyValues.has(discountValue) && discountValue) {
    return discountValue;
  }

  const fromTitle = extractBestOffer(title);
  if (fromTitle) return fromTitle;

  const fromDescription = extractBestOffer(description);
  if (fromDescription) return fromDescription;

  return "BEST DEAL";
}

function getCashbackText(coupon: Coupon) {
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

export default function StoreCouponsClient({
  store,
  isLoggedIn,
}: Props) {
  const [activeTab, setActiveTab] = useState<"all" | "coupon" | "deal">("all");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBanks, setSelectedBanks] = useState<string[]>([]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [openDetailsId, setOpenDetailsId] = useState<string | null>(null);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [copied, setCopied] = useState(false);
  const lastOpenedCouponIdRef = useRef<string | null>(null);

  const [search, setSearch] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow =
      selectedCoupon || mobileFiltersOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedCoupon, mobileFiltersOpen]);

  const couponCount = store.coupons.filter((c) => c.type === "coupon").length;
  const dealCount = store.coupons.filter((c) => c.type === "deal").length;

  const bankOptions = useMemo(() => {
    return Array.from(
      new Set(
        store.coupons
          .map((c) => detectBankName(c.bankOffer))
          .filter((b): b is string => Boolean(b))
      )
    ).sort((a, b) => a.localeCompare(b));
  }, [store.coupons]);

  const categoryOptions = useMemo(() => {
    const fromStoreCategories = splitCommaValues(store.categories || []);
    const fromCouponCategories = splitCommaValues(
      store.coupons.map((c) => c.category).filter(Boolean)
    );

    return Array.from(
      new Set([...fromStoreCategories, ...fromCouponCategories])
    ).sort((a, b) => a.localeCompare(b));
  }, [store.categories, store.coupons]);

  const filteredCoupons = useMemo(() => {
    return store.coupons.filter((c) => {
      const matchTab = activeTab === "all" || c.type === activeTab;

      const couponCategories = splitSingleValue(c.category);
      const matchCategory =
        selectedCategories.length === 0 ||
        couponCategories.some((cat) => selectedCategories.includes(cat));

      const bankName = detectBankName(c.bankOffer);
      const matchBank =
        selectedBanks.length === 0 ||
        (bankName ? selectedBanks.includes(bankName) : false);

      const matchVerified = !verifiedOnly || Boolean(c.verified);

      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.discount.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        (c.bankOffer || "").toLowerCase().includes(q) ||
        (c.cashbackLabel || "").toLowerCase().includes(q);

      return (
        matchTab &&
        matchCategory &&
        matchBank &&
        matchVerified &&
        matchSearch
      );
    });
  }, [
    store.coupons,
    activeTab,
    selectedCategories,
    selectedBanks,
    verifiedOnly,
    search,
  ]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleBank = (bank: string) => {
    setSelectedBanks((prev) =>
      prev.includes(bank) ? prev.filter((b) => b !== bank) : [...prev, bank]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedBanks([]);
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
    lastOpenedCouponIdRef.current = null;
  };

  const copyCode = async () => {
    if (!selectedCoupon?.couponCode) return;

    try {
      await navigator.clipboard.writeText(selectedCoupon.couponCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const openActivationPage = (coupon: Coupon) => {
    const outUrl = `/out/${coupon.id}`;
    window.open(outUrl, "_blank");
  };

  const openCouponFlow = (coupon: Coupon) => {
    openCouponModal(coupon);

    if (lastOpenedCouponIdRef.current !== coupon.id) {
      openActivationPage(coupon);
      lastOpenedCouponIdRef.current = coupon.id;
    }
  };

  const continueToStore = async () => {
    if (!selectedCoupon) return;
    openActivationPage(selectedCoupon);
  };

  const getPrimaryCategory = (category: string) => {
    const categories = splitSingleValue(category);
    return categories[0] || "General";
  };

  const activeFilterCount =
    selectedCategories.length +
    selectedBanks.length +
    (verifiedOnly ? 1 : 0);

  return (
    <>
      <div className="storePagePremium">
        <section className="storeHeroPremium">
          <div className="storeHeroLogoPanel">
            <div className="storeHeroLogoBox">
              {store.logo ? (
                <img src={store.logo} alt={store.name} />
              ) : (
                <span>{store.logoText}</span>
              )}
            </div>
          </div>

          <div className="storeHeroContent">
            <h1>{store.name} Coupons & Deals</h1>
            <p>{store.description}</p>

            <div className="storeTagList storeTagListDesktop">
              {store.tags.map((tag) => (
                <span key={`desktop-${tag}`}>{tag}</span>
              ))}
            </div>
          </div>

          <div className="storeTagList storeTagListMobile">
            {store.tags.map((tag) => (
              <span key={`mobile-${tag}`}>{tag}</span>
            ))}
          </div>
        </section>

        <section className="storeTabsPremium">
          <button
            type="button"
            className={`storeTab ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            All ({store.offersCount})
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

        <div className="mobileStickyTools">
          <div className="mobileStickyToolsInner">
            <button
              type="button"
              className="mobileFilterBtn"
              onClick={() => setMobileFiltersOpen(true)}
            >
              <SlidersHorizontal size={18} />
              <span>Filters</span>
              {activeFilterCount > 0 && <strong>{activeFilterCount}</strong>}
            </button>

            <div className="mobileSearchBar">
              <Search size={17} />
              <input
                type="text"
                placeholder="Search deals..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

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

            {categoryOptions.length > 0 && (
              <div className="filtersSection">
                <h4>Categories</h4>
                <div className="filtersList">
                  {categoryOptions.map((category) => (
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
            )}

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
                const audienceLabel = detectAudienceLabel(coupon);
                const cashbackText = getCashbackText(coupon);

                return (
                  <article key={coupon.id} className="couponShowcaseCard">
                    <div className="couponShowcaseLeft">
                      <div className="couponDiscountTile">
                        <span>
                          {formatDiscountDisplay(
                            coupon.discount,
                            coupon.title,
                            coupon.description
                          )}
                        </span>
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
                          <span className="couponMiniBadge badgeBest">
                            Best
                          </span>
                        )}

                        {audienceLabel && (
                          <span className="couponMiniBadge badgeAudience">
                            {audienceLabel}
                          </span>
                        )}

                        <span className="couponMiniBadge badgeCategory">
                          {getPrimaryCategory(coupon.category)}
                        </span>
                      </div>

                      <h2 className="couponHeadline">{coupon.title}</h2>
                      <p className="couponDesc">{coupon.description}</p>

                      {cashbackText && (
                        <div className="extraCashbackBadge">
                          💰 {cashbackText}
                        </div>
                      )}

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
                        {isDetailsOpen
                          ? "Hide details & terms"
                          : "View details & terms"}
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
                        onClick={() => openCouponFlow(coupon)}
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

      {mobileFiltersOpen && (
        <div
          className="mobileFiltersOverlay"
          onClick={() => setMobileFiltersOpen(false)}
        >
          <div
            className="mobileFiltersSheet"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mobileFiltersHeader">
              <h3>Filters</h3>
              <button
                type="button"
                className="mobileFiltersClose"
                onClick={() => setMobileFiltersOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            {categoryOptions.length > 0 && (
              <div className="mobileFiltersSection">
                <div className="mobileFiltersTitleRow">
                  <h4>Categories</h4>
                </div>
                <div className="mobileChoiceList">
                  {categoryOptions.map((category) => (
                    <label key={category} className="mobileChoiceRow">
                      <span>{category}</span>
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => toggleCategory(category)}
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {bankOptions.length > 0 && (
              <div className="mobileFiltersSection">
                <div className="mobileFiltersTitleRow">
                  <h4>Banks</h4>
                </div>
                <div className="mobileChoiceList">
                  {bankOptions.map((bank) => (
                    <label key={bank} className="mobileChoiceRow">
                      <span>{bank}</span>
                      <input
                        type="checkbox"
                        checked={selectedBanks.includes(bank)}
                        onChange={() => toggleBank(bank)}
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="mobileFiltersSection">
              <div className="mobileChoiceList">
                <label className="mobileChoiceRow">
                  <span>Verified only</span>
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={() => setVerifiedOnly((prev) => !prev)}
                  />
                </label>
              </div>
            </div>

            <div className="mobileFiltersActions">
              <button
                type="button"
                className="mobileClearBtn"
                onClick={clearFilters}
              >
                Clear
              </button>
              <button
                type="button"
                className="mobileApplyBtn"
                onClick={() => setMobileFiltersOpen(false)}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      <CouponModal
        isOpen={Boolean(selectedCoupon)}
        coupon={selectedCoupon}
        storeName={store.name}
        storeLogoText={store.logoText}
        storeLogo={store.logo}
        copied={copied}
        isLoggedIn={isLoggedIn}
        onClose={closeCouponModal}
        onCopy={copyCode}
        onContinue={continueToStore}
      />
    </>
  );
}