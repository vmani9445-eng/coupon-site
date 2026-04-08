"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type StoreWithStats = {
  name: string;
  slug: string;
  category: string;
  offerCount: number;
  couponCount: number;
  verified?: boolean;
  logo?: string;
  isTrending?: boolean;
};

type StoresClientProps = {
  categories: string[];
  stores: StoreWithStats[];
  topIndianStores: StoreWithStats[];
  initialCategory?: string;
};

export default function StoresClient({
  categories,
  stores,
  topIndianStores,
  initialCategory,
}: StoresClientProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(initialCategory || "All");

  const filteredStores = useMemo(() => {
    return stores.filter((store) => {
      const matchSearch =
        store.name.toLowerCase().includes(search.toLowerCase()) ||
        store.slug.toLowerCase().includes(search.toLowerCase());

      const matchCategory =
        activeCategory === "All" || store.category === activeCategory;

      return matchSearch && matchCategory;
    });
  }, [stores, search, activeCategory]);

  const allCategories = useMemo(() => {
    return ["All", ...categories.filter((category) => category && category !== "All")];
  }, [categories]);

  const getDisplayName = (name: string) => {
    return name.length > 16 ? `${name.slice(0, 16)}...` : name;
  };

  const getSubLabel = (name: string) => {
    return `${name} Inc`;
  };

  const getTrendText = (offers: number) => {
    const value = Math.max(offers * 3 + 4, 4);
    return `${value}% buy vs last week`;
  };

  const getLogoText = (name: string) => {
    return name.trim().charAt(0).toUpperCase();
  };

  return (
    <div className="storesDashboardPage">
      <div className="storesDashboardLayout">
        <aside className="storesSidebar">
          <div className="storesSidebarTitle">Stores</div>

          <div className="storesSidebarSearchWrap">
            <input
              type="text"
              className="storesSidebarSearch"
              placeholder="Search stores..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <nav className="storesSidebarNav">
            {allCategories.map((category) => (
              <button
                key={category}
                type="button"
                className={`storesSidebarNavItem ${
                  activeCategory === category ? "active" : ""
                }`}
                onClick={() => setActiveCategory(category)}
              >
                <span className="storesSidebarDot" />
                <span>{category}</span>
              </button>
            ))}
          </nav>
        </aside>

        <section className="storesDashboardContent">
          {topIndianStores.length > 0 &&
            activeCategory === "All" &&
            search.trim() === "" && (
              <div className="storesTopBrandsRow">
                {topIndianStores.slice(0, 4).map((store) => (
                  <Link
                    key={store.slug}
                    href={`/stores/${store.slug}`}
                    className="storesTopBrandCard"
                  >
                    {store.logo ? (
                      <img
                        src={store.logo}
                        alt={store.name}
                        className="storesCompactLogoImage"
                      />
                    ) : (
                      <div className="storesCompactLogo">
                        {getLogoText(store.name)}
                      </div>
                    )}
                    <div className="storesTopBrandName">{store.name}</div>
                  </Link>
                ))}
              </div>
            )}

          <div className="storesGridCompact">
            {filteredStores.map((store) => (
              <Link
                key={store.slug}
                href={`/stores/${store.slug}`}
                className="storesCompactCard"
              >
                {store.verified && (
                  <span className="storesCompactVerifiedTag">Verified</span>
                )}

                <div className="storesCompactLogoWrap">
                  {store.logo ? (
                    <img
                      src={store.logo}
                      alt={store.name}
                      className="storesCompactLogoImage"
                    />
                  ) : (
                    <div className="storesCompactLogo">
                      {getLogoText(store.name)}
                    </div>
                  )}
                </div>

                <div className="storesCompactName">
                  {getDisplayName(store.name)}
                </div>

                <div className="storesCompactSub">{getSubLabel(store.name)}</div>

                <div className="storesCompactStats">
                  <span className="storesCompactStatPill">
                    {store.offerCount} offers
                  </span>
                  <span className="storesCompactStatPill">
                    {store.couponCount} coupons
                  </span>
                </div>

                <div className="storesCompactMeta">
                  <span className="storesCompactMetaArrow">↗️</span>
                  <span>{getTrendText(store.offerCount)}</span>
                </div>
              </Link>
            ))}
          </div>

          {filteredStores.length === 0 && (
            <div className="storesCompactEmpty">No stores found.</div>
          )}
        </section>
      </div>
    </div>
  );
}