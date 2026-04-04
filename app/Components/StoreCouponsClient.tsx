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

export default function StoreCouponsClient({ store }: { store: Store }) {
  const [activeTab, setActiveTab] = useState<"all" | "coupon" | "deal">("all");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  useEffect(() => {
    document.body.style.overflow = selectedCoupon ? "hidden" : "";
  }, [selectedCoupon]);

  const filteredCoupons = useMemo(() => {
    return store.coupons.filter((item) => {
      const tabMatch = activeTab === "all" || item.type === activeTab;
      const categoryMatch =
        selectedCategories.length === 0 ||
        selectedCategories.includes(item.category);

      return tabMatch && categoryMatch;
    });
  }, [store.coupons, activeTab, selectedCategories]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  return (
    <>
      <div className="storePageNew">
        {/* HERO */}
        <div className="storeHeroNew">
          <div className="logoBox">{store.logoText}</div>

          <div>
            <h1>{store.name} Coupons & Deals</h1>
            <p>{store.description}</p>

            <div className="tagsRow">
              {store.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="tabsRow">
          {["all", "coupon", "deal"].map((tab) => (
            <button
              key={tab}
              className={activeTab === tab ? "active" : ""}
              onClick={() => setActiveTab(tab as any)}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="layoutNew">
          {/* FILTER */}
          <aside className="filtersNew">
            <h3>Filters</h3>

            {store.categories.map((cat) => (
              <label key={cat}>
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat)}
                  onChange={() => toggleCategory(cat)}
                />
                {cat}
              </label>
            ))}
          </aside>

          {/* LIST */}
          <div className="cardsGrid">
            {filteredCoupons.map((coupon) => (
              <div key={coupon.id} className="couponCardNew">
                <div className="discount">{coupon.discount}</div>

                <div className="content">
                  <h2>{coupon.title}</h2>
                  <p>{coupon.description}</p>

                  <div className="metaRow">
                    <span>{coupon.category}</span>
                    <span>{coupon.usersToday} used</span>
                    <span>{coupon.expiresText}</span>
                  </div>

                  {coupon.bankOffer && (
                    <div className="bank">{coupon.bankOffer}</div>
                  )}
                </div>

                <button
                  className="ctaBtn"
                  onClick={() => setSelectedCoupon(coupon)}
                >
                  {coupon.type === "coupon"
                    ? "Reveal Code"
                    : "Activate Deal"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <CouponModal
        isOpen={!!selectedCoupon}
        coupon={selectedCoupon}
        storeName={store.name}
        storeLogoText={store.logoText}
        copied={false}
        onClose={() => setSelectedCoupon(null)}
        onCopy={() => {}}
        onContinue={() => {}}
      />
    </>
  );
}