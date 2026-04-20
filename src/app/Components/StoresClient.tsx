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

function splitCategories(value?: string) {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function StoresClient({
  categories,
  stores,
  topIndianStores,
  initialCategory,
}: StoresClientProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(initialCategory || "All");

  const cleanedCategories = useMemo(() => {
    const fromProps = categories.flatMap((category) => splitCategories(category));
    const fromStores = stores.flatMap((store) => splitCategories(store.category));

    return Array.from(
      new Set([...fromProps, ...fromStores].filter((category) => category !== "All"))
    ).sort((a, b) => a.localeCompare(b));
  }, [categories, stores]);

  const allCategories = useMemo(() => {
    return ["All", ...cleanedCategories];
  }, [cleanedCategories]);

  const filteredStores = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return stores.filter((store) => {
      const matchSearch =
        searchValue === "" ||
        store.name.toLowerCase().includes(searchValue) ||
        store.slug.toLowerCase().includes(searchValue);

      const storeCategories = splitCategories(store.category);

      const matchCategory =
        activeCategory === "All" || storeCategories.includes(activeCategory);

      return matchSearch && matchCategory;
    });
  }, [stores, search, activeCategory]);

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
          <div className="storesSidebarSticky">
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
          </div>
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

          <div className="storesResultsCount">
            Showing {filteredStores.length} of {stores.length} stores
          </div>

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