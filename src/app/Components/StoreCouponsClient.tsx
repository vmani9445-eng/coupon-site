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
  source?: string | null;
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
  websiteUrl?: string | null;
};

type Props = {
  store: Store;
  isLoggedIn?: boolean;
};

type BankName =
  | "HDFC"
  | "ICICI"
  | "SBI"
  | "Axis"
  | "Kotak"
  | "Amex"
  | "IndusInd"
  | "AU"
  | "Yes Bank"
  | "IDFC FIRST"
  | "Federal"
  | "Standard Chartered"
  | "HSBC"
  | "RBL"
  | "Paytm"
  | "PhonePe"
  | "Google Pay"
  | "Amazon Pay"
  | "Mobikwik"
  | "Freecharge"
  | "UPI"
  | "Wallet"
  | "Card"
  | "EMI"
  | "Net Banking"
  | "Other";

type AudienceType = "New User Only" | "Existing Users" | "All Users";

function normalizeText(value?: string | null) {
  return (value || "").trim().toLowerCase();
}

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) =>
    a.localeCompare(b)
  );
}

function splitCommaValues(values: string[]) {
  return uniqueSorted(
    values.flatMap((value) =>
      (value || "")
        .split(",")
        .map((item) => item.trim())
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

function detectBankName(bankOffer?: string): BankName | null {
  if (!bankOffer) return null;

  const text = bankOffer.toLowerCase();

  if (text.includes("hdfc")) return "HDFC";
  if (text.includes("icici")) return "ICICI";
  if (text.includes("sbi")) return "SBI";
  if (text.includes("axis")) return "Axis";
  if (text.includes("kotak")) return "Kotak";
  if (text.includes("amex") || text.includes("american express")) return "Amex";
  if (text.includes("indusind")) return "IndusInd";
  if (text.includes("au bank") || text.includes("au small finance")) return "AU";
  if (text.includes("yes bank")) return "Yes Bank";
  if (text.includes("idfc")) return "IDFC FIRST";
  if (text.includes("federal")) return "Federal";
  if (text.includes("standard chartered")) return "Standard Chartered";
  if (text.includes("hsbc")) return "HSBC";
  if (text.includes("rbl")) return "RBL";
  if (text.includes("paytm")) return "Paytm";
  if (text.includes("phonepe")) return "PhonePe";
  if (text.includes("google pay") || text.includes("gpay")) return "Google Pay";
  if (text.includes("amazon pay")) return "Amazon Pay";
  if (text.includes("mobikwik")) return "Mobikwik";
  if (text.includes("freecharge")) return "Freecharge";
  if (text.includes("upi")) return "UPI";
  if (text.includes("wallet")) return "Wallet";
  if (text.includes("credit card") || text.includes("debit card") || text.includes("card")) return "Card";
  if (text.includes("emi")) return "EMI";
  if (text.includes("net banking")) return "Net Banking";

  return "Other";
}

function detectPaymentModes(coupon: Coupon): BankName[] {
  const text = `${coupon.bankOffer || ""} ${coupon.title} ${coupon.description}`.toLowerCase();
  const modes: BankName[] = [];
  const push = (value: BankName) => {
    if (!modes.includes(value)) modes.push(value);
  };

  const bank = detectBankName(coupon.bankOffer);
  if (bank) push(bank);

  if (text.includes("paytm")) push("Paytm");
  if (text.includes("phonepe")) push("PhonePe");
  if (text.includes("google pay") || text.includes("gpay")) push("Google Pay");
  if (text.includes("amazon pay")) push("Amazon Pay");
  if (text.includes("mobikwik")) push("Mobikwik");
  if (text.includes("freecharge")) push("Freecharge");
  if (text.includes("upi")) push("UPI");
  if (text.includes("wallet")) push("Wallet");
  if (text.includes("credit card") || text.includes("debit card") || text.includes("card")) push("Card");
  if (text.includes("emi")) push("EMI");
  if (text.includes("net banking")) push("Net Banking");

  return modes;
}

function isRealCashbackSource(source?: string | null) {
  const value = normalizeText(source);
  return value === "admitad" || value === "cuelinks";
}

function detectAudienceLabel(coupon: Coupon): AudienceType {
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
    text.includes("sign up") ||
    text.includes("new customer")
  ) {
    return "New User Only";
  }

  if (
    text.includes("existing users") ||
    text.includes("returning users") ||
    text.includes("loyal users") ||
    text.includes("repeat user") ||
    text.includes("repeat customer")
  ) {
    return "Existing Users";
  }

  return "All Users";
}

function detectDynamicCategories(coupon: Coupon) {
  const text = `${coupon.title} ${coupon.description} ${coupon.bankOffer || ""}`
    .toLowerCase()
    .replace(/[^\w\s&-]/g, " ");

  const found = new Set<string>();

  const hasWord = (patterns: string[]) =>
    patterns.some((pattern) => {
      const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`(^|\\s)${escaped}(\\s|$)`, "i");
      return regex.test(text);
    });

  const add = (value: string) => {
    if (value.trim()) found.add(value.trim());
  };

  // keep only exact category if coupon.category is meaningful
  splitSingleValue(coupon.category).forEach((value) => {
    const clean = value.trim();
    if (
      clean &&
      ![
        "general",
        "others",
        "other",
        "all",
        "best deal",
        "offers",
        "deals",
      ].includes(clean.toLowerCase())
    ) {
      add(clean);
    }
  });

  // electronics
  if (
    hasWord([
      "laptop",
      "laptops",
      "notebook",
      "macbook",
      "mobile",
      "mobiles",
      "phone",
      "phones",
      "smartphone",
      "smartphones",
      "iphone",
      "samsung",
      "oneplus",
      "realme",
      "oppo",
      "vivo",
      "earbuds",
      "headphones",
      "tablet",
      "tv",
      "ac",
      "acs",
      "refrigerator",
      "cooler",
      "fan",
      "fans",
      "electronics",
      "electronic",
    ])
  ) {
    add("Electronics");
  }

  // fashion
  if (
    hasWord([
      "shoe",
      "shoes",
      "sneaker",
      "sneakers",
      "shirt",
      "shirts",
      "tshirt",
      "tshirts",
      "t-shirt",
      "t-shirts",
      "jeans",
      "kurta",
      "kurti",
      "dress",
      "dresses",
      "top",
      "tops",
      "fashion",
      "clothing",
      "apparel",
      "wear",
      "watch",
      "bag",
      "bags",
    ])
  ) {
    add("Fashion");
  }

  // beauty
  if (
    hasWord([
      "beauty",
      "makeup",
      "skincare",
      "haircare",
      "cosmetics",
      "lipstick",
      "serum",
      "sunscreen",
      "shampoo",
      "face wash",
      "moisturizer",
    ])
  ) {
    add("Beauty");
  }

  // food & grocery
  if (
    hasWord([
      "food",
      "grocery",
      "groceries",
      "restaurant",
      "restaurants",
      "snacks",
      "fruits",
      "vegetables",
      "delivery",
      "meal",
      "meals",
    ])
  ) {
    add("Food & Grocery");
  }

  // hotel only if clearly hotel/stay
  if (
    hasWord([
      "hotel",
      "hotels",
      "resort",
      "resorts",
      "stay",
      "stays",
      "homestay",
      "homestays",
      "villa",
      "villas",
    ])
  ) {
    add("Hotels");
  }

  // flights only if clearly flight/airfare
  if (
    hasWord([
      "flight",
      "flights",
      "airfare",
      "air ticket",
      "air tickets",
      "domestic flight",
      "international flight",
    ])
  ) {
    add("Flights");
  }

  // buses/trains/cabs
  if (
    hasWord([
      "bus booking",
      "train booking",
      "cab",
      "cabs",
      "taxi",
      "taxis",
    ])
  ) {
    add("Transport");
  }

  // payment offers only when clearly payment related
  if (
    hasWord([
      "upi",
      "wallet",
      "paytm",
      "phonepe",
      "google pay",
      "gpay",
      "amazon pay",
      "mobikwik",
      "freecharge",
      "credit card",
      "debit card",
      "emi",
      "net banking",
      "bank offer",
      "instant discount",
    ])
  ) {
    add("Payment Offers");
  }

  const audience = detectAudienceLabel(coupon);
  if (audience === "New User Only") add("New User Offers");
  if (audience === "Existing Users") add("Existing User Offers");

  if (found.size === 0) {
    return ["General"];
  }

  return Array.from(found);
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
  if (!isRealCashbackSource(coupon.source)) return null;

  if (coupon.cashbackLabel?.trim()) return coupon.cashbackLabel.trim();

  if (typeof coupon.userCashback === "number" && coupon.userCashback > 0) {
    return `Up to ${coupon.userCashback}% cashback`;
  }

  if (coupon.extraCashback?.trim()) return coupon.extraCashback.trim();

  return null;
}

function setTrackingCookie(coupon: Coupon, store: Store) {
  try {
    const payload = {
      couponId: coupon.id,
      storeId: coupon.storeId || "",
      storeSlug: store.slug,
      source: coupon.source || "manual",
      ts: Date.now(),
    };

    document.cookie = `dd_tracking=${encodeURIComponent(
      JSON.stringify(payload)
    )}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`;
  } catch {}
}

export default function StoreCouponsClient({ store, isLoggedIn }: Props) {
  const [activeTab, setActiveTab] = useState<"all" | "coupon" | "deal">("all");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBanks, setSelectedBanks] = useState<string[]>([]);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [selectedAudiences, setSelectedAudiences] = useState<AudienceType[]>([]);
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
    return uniqueSorted(
      store.coupons
        .map((c) => detectBankName(c.bankOffer))
        .filter((b): b is BankName => b !== null && !["UPI", "Wallet", "Card", "EMI", "Net Banking", "Paytm", "PhonePe", "Google Pay", "Amazon Pay", "Mobikwik", "Freecharge"].includes(b))
    );
  }, [store.coupons]);

  const paymentOptions = useMemo(() => {
    return uniqueSorted(
      store.coupons.flatMap((coupon) => detectPaymentModes(coupon))
    );
  }, [store.coupons]);

  const audienceOptions = useMemo<AudienceType[]>(() => {
    return uniqueSorted(
      store.coupons.map((coupon) => detectAudienceLabel(coupon))
    ) as AudienceType[];
  }, [store.coupons]);

  const categoryOptions = useMemo(() => {
    const fromStoreCategories = splitCommaValues(store.categories || []);
    const fromCouponCategories = uniqueSorted(
      store.coupons.flatMap((coupon) => detectDynamicCategories(coupon))
    );

    return uniqueSorted([...fromStoreCategories, ...fromCouponCategories]);
  }, [store.categories, store.coupons]);

  const filteredCoupons = useMemo(() => {
    return store.coupons.filter((c) => {
      const matchTab = activeTab === "all" || c.type === activeTab;

      const couponCategories = detectDynamicCategories(c);
      const matchCategory =
        selectedCategories.length === 0 ||
        couponCategories.some((cat) => selectedCategories.includes(cat));

      const bankName = detectBankName(c.bankOffer);
      const matchBank =
        selectedBanks.length === 0 ||
        (bankName ? selectedBanks.includes(bankName) : false);

      const paymentModes = detectPaymentModes(c);
      const matchPayment =
        selectedPayments.length === 0 ||
        paymentModes.some((mode) => selectedPayments.includes(mode));

      const audienceLabel = detectAudienceLabel(c);
      const matchAudience =
        selectedAudiences.length === 0 ||
        selectedAudiences.includes(audienceLabel);

      const matchVerified = !verifiedOnly || Boolean(c.verified);

      const q = search.trim().toLowerCase();
      const cashbackText = getCashbackText(c);
      const allDynamicCategories = couponCategories.join(" ").toLowerCase();

      const matchSearch =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.discount.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        (c.bankOffer || "").toLowerCase().includes(q) ||
        (cashbackText || "").toLowerCase().includes(q) ||
        audienceLabel.toLowerCase().includes(q) ||
        paymentModes.join(" ").toLowerCase().includes(q) ||
        allDynamicCategories.includes(q);

      return (
        matchTab &&
        matchCategory &&
        matchBank &&
        matchPayment &&
        matchAudience &&
        matchVerified &&
        matchSearch
      );
    });
  }, [
    store.coupons,
    activeTab,
    selectedCategories,
    selectedBanks,
    selectedPayments,
    selectedAudiences,
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

  const togglePayment = (payment: string) => {
    setSelectedPayments((prev) =>
      prev.includes(payment)
        ? prev.filter((p) => p !== payment)
        : [...prev, payment]
    );
  };

  const toggleAudience = (audience: AudienceType) => {
    setSelectedAudiences((prev) =>
      prev.includes(audience)
        ? prev.filter((a) => a !== audience)
        : [...prev, audience]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedBanks([]);
    setSelectedPayments([]);
    setSelectedAudiences([]);
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
    setTrackingCookie(coupon, store);
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

  const getPrimaryCategory = (coupon: Coupon) => {
    const categories = detectDynamicCategories(coupon);
    return categories[0] || "General";
  };

  const activeFilterCount =
    selectedCategories.length +
    selectedBanks.length +
    selectedPayments.length +
    selectedAudiences.length +
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

            {audienceOptions.length > 0 && (
              <div className="filtersSection">
                <h4>User Type</h4>
                <div className="filtersList">
                  {audienceOptions.map((audience) => (
                    <label key={audience} className="filterRow">
                      <input
                        type="checkbox"
                        checked={selectedAudiences.includes(audience)}
                        onChange={() => toggleAudience(audience)}
                      />
                      <span>{audience}</span>
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

            {paymentOptions.length > 0 && (
              <div className="filtersSection">
                <h4>Payment Offers</h4>
                <div className="filtersList">
                  {paymentOptions.map((payment) => (
                    <label key={payment} className="filterRow">
                      <input
                        type="checkbox"
                        checked={selectedPayments.includes(payment)}
                        onChange={() => togglePayment(payment)}
                      />
                      <span>{payment}</span>
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

                        {audienceLabel !== "All Users" && (
                          <span className="couponMiniBadge badgeAudience">
                            {audienceLabel}
                          </span>
                        )}

                        <span className="couponMiniBadge badgeCategory">
                          {getPrimaryCategory(coupon)}
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
                                <li>Valid on selected products or bookings only.</li>
                                <li>Cannot be combined with some other offers.</li>
                                <li>Final discount may vary by cart, route, date, or payment mode.</li>
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

            {audienceOptions.length > 0 && (
              <div className="mobileFiltersSection">
                <div className="mobileFiltersTitleRow">
                  <h4>User Type</h4>
                </div>
                <div className="mobileChoiceList">
                  {audienceOptions.map((audience) => (
                    <label key={audience} className="mobileChoiceRow">
                      <span>{audience}</span>
                      <input
                        type="checkbox"
                        checked={selectedAudiences.includes(audience)}
                        onChange={() => toggleAudience(audience)}
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

            {paymentOptions.length > 0 && (
              <div className="mobileFiltersSection">
                <div className="mobileFiltersTitleRow">
                  <h4>Payment Offers</h4>
                </div>
                <div className="mobileChoiceList">
                  {paymentOptions.map((payment) => (
                    <label key={payment} className="mobileChoiceRow">
                      <span>{payment}</span>
                      <input
                        type="checkbox"
                        checked={selectedPayments.includes(payment)}
                        onChange={() => togglePayment(payment)}
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
        isLoggedIn={Boolean(isLoggedIn)}
        onClose={closeCouponModal}
        onCopy={copyCode}
        onContinue={continueToStore}
      />
    </>
  );
}