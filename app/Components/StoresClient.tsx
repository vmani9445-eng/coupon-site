"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type StoreWithStats = {
  name: string;
  slug: string;
  category: string;
  offerCount: number;
  couponCount: number;
};

type StoresClientProps = {
  categories: string[];
  stores: StoreWithStats[];
  topIndianStores: StoreWithStats[];
};

export default function StoresClient({
  categories,
  stores,
  topIndianStores,
}: StoresClientProps) {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [search, setSearch] = useState("");

  const filteredStores = useMemo(() => {
    return stores.filter((store) => {
      const matchesCategory =
        activeCategory === "All" || store.category === activeCategory;

      const matchesSearch =
        search.trim() === "" ||
        store.name.toLowerCase().includes(search.toLowerCase()) ||
        store.category.toLowerCase().includes(search.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [stores, activeCategory, search]);

  return (
    <main className="storesDirectoryPage">
      <section className="storesHeroCard">
        <div className="storesHeroContent">
          <p className="storesBreadcrumb">Home / Stores</p>
          <h1 className="storesHeroTitle">Browse All Stores</h1>
          <p className="storesHeroSubtitle">
            Explore top brands, verified coupon codes, and latest shopping deals.
          </p>
        </div>
      </section>

      {topIndianStores.length > 0 && (
        <section className="topStoresSection">
          <div className="sectionHeadingRow">
            <div>
              <h2>Top Indian Stores</h2>
              <p>Popular brands users search most often.</p>
            </div>
          </div>

          <div className="topStoresGrid">
            {topIndianStores.map((store) => (
              <Link
                key={store.slug}
                href={`/stores/${store.slug}`}
                className="topStoreCard"
              >
                <div className="topStoreLogo">
                  {store.name.slice(0, 2).toUpperCase()}
                </div>

                <div className="topStoreBody">
                  <div className="topStoreHead">
                    <h3>{store.name}</h3>
                    <span className="storeCategoryPill">{store.category}</span>
                  </div>

                  <div className="storeStatsRow">
                    <span>{store.offerCount} offers</span>
                    <span>{store.couponCount} coupons</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="storesToolbarCard">
        <div className="storesSearchBox">
          <input
            type="text"
            placeholder="Search stores..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="storesCategoryTabs">
          <button
            type="button"
            className={`categoryTab ${activeCategory === "All" ? "active" : ""}`}
            onClick={() => setActiveCategory("All")}
          >
            All
          </button>

          {categories.map((category) => (
            <button
              type="button"
              key={category}
              className={`categoryTab ${
                activeCategory === category ? "active" : ""
              }`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      <section className="storesGrid">
        {filteredStores.length === 0 ? (
          <div className="emptyStoresState">
            <h3>No stores found</h3>
            <p>Try another category or search term.</p>
          </div>
        ) : (
          filteredStores.map((store) => (
            <Link
              key={store.slug}
              href={`/stores/${store.slug}`}
              className="storeDirectoryCard"
            >
              <div className="storeDirectoryLogo">
                {store.name.slice(0, 2).toUpperCase()}
              </div>

              <div className="storeDirectoryBody">
                <div className="storeDirectoryTop">
                  <div>
                    <h3>{store.name}</h3>
                    <p className="storeDirectorySlug">/{store.slug}</p>
                  </div>
                  <span className="storeCategoryPill">{store.category}</span>
                </div>

                <div className="storeDirectoryMeta">
                  <div className="metaStat">
                    <strong>{store.offerCount}</strong>
                    <span>Offers</span>
                  </div>
                  <div className="metaStat">
                    <strong>{store.couponCount}</strong>
                    <span>Coupons</span>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </section>
    </main>
  );
}