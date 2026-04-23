"use client";

import "../store.css";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export type StoreWithStats = {
  name: string;
  slug: string;
  category: string;
  categories?: string[];
  offerCount: number;
  couponCount: number;
  verified?: boolean;
  logo?: string;
  isTrending?: boolean;
  cashback?: string;
};

type StoresClientProps = {
  categories: string[];
  categoryCounts?: Record<string, number>;
  stores: StoreWithStats[];
  topIndianStores: StoreWithStats[];
  initialCategory?: string;
};

const STORES_PER_PAGE = 30;

function splitCategories(value?: string) {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function StoresClient({
  categories,
  categoryCounts,
  stores,
  topIndianStores,
  initialCategory,
}: StoresClientProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(initialCategory || "All");
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const categoryData = useMemo(() => {
    const counts = new Map<string, number>();

    stores.forEach((store) => {
      const sourceCategories =
        store.categories && store.categories.length > 0
          ? store.categories
          : splitCategories(store.category);

      const uniqueStoreCategories = Array.from(new Set(sourceCategories));

      uniqueStoreCategories.forEach((category) => {
        if (!category || category === "All") return;
        counts.set(category, (counts.get(category) || 0) + 1);
      });
    });

    if (categoryCounts) {
      Object.entries(categoryCounts).forEach(([category, count]) => {
        if (!category || category === "All") return;
        counts.set(category, count);
      });
    }

    const cleanedCategories = categories.flatMap((category) =>
      splitCategories(category)
    );

    const uniqueCategories = Array.from(
      new Set(
        [...cleanedCategories, ...Array.from(counts.keys())].filter(
          (category) => category && category !== "All"
        )
      )
    ).sort((a, b) => a.localeCompare(b));

    return uniqueCategories.map((category) => ({
      name: category,
      count: counts.get(category) || 0,
    }));
  }, [categories, stores, categoryCounts]);

  const filteredStores = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return stores.filter((store) => {
      const storeCategories =
        store.categories && store.categories.length > 0
          ? store.categories
          : splitCategories(store.category);

      const matchSearch =
        !searchValue ||
        store.name.toLowerCase().includes(searchValue) ||
        store.slug.toLowerCase().includes(searchValue) ||
        storeCategories.some((category) =>
          category.toLowerCase().includes(searchValue)
        );

      const matchCategory =
        activeCategory === "All" ||
        storeCategories.some((category) => category === activeCategory);

      return matchSearch && matchCategory;
    });
  }, [stores, search, activeCategory]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredStores.length / STORES_PER_PAGE)
  );

  const paginatedStores = useMemo(() => {
    const startIndex = (currentPage - 1) * STORES_PER_PAGE;
    const endIndex = startIndex + STORES_PER_PAGE;
    return filteredStores.slice(startIndex, endIndex);
  }, [filteredStores, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeCategory]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const getDisplayName = (name: string) => {
    return name.length > 16 ? `${name.slice(0, 16)}...` : name;
  };

  const getSubLabel = (name: string) => {
    return `${name} Offers`;
  };

  const getLogoText = (name: string) => {
    return name.trim().charAt(0).toUpperCase();
  };

  const getCashbackNumber = (cashback?: string) => {
    if (!cashback) return 0;
    const match = cashback.match(/(\d+(\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
  };

  const scrollToTopOfGrid = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setCurrentPage(page);
    scrollToTopOfGrid();
  };

  const paginationItems = useMemo(() => {
    const pages: (number | string)[] = [];

    if (totalPages <= 8) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    if (currentPage <= 5) {
      pages.push(
        1,
        2,
        3,
        4,
        5,
        6,
        "...",
        totalPages - 2,
        totalPages - 1,
        totalPages
      );
      return pages;
    }

    if (currentPage >= totalPages - 4) {
      pages.push(
        1,
        2,
        3,
        "...",
        totalPages - 5,
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages
      );
      return pages;
    }

    pages.push(
      1,
      2,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages - 1,
      totalPages
    );

    return pages;
  }, [currentPage, totalPages]);

  return (
    <div className="storesDashboardPage">
      <div
        className={`storesDashboardLayout ${sidebarOpen ? "" : "sidebarCollapsed"}`}
      >
        <aside className={`storesSidebar ${sidebarOpen ? "open" : "collapsed"}`}>
          <div className="storesSidebarInner">
            {sidebarOpen && (
              <>
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
                  <button
                    type="button"
                    className={`storesSidebarNavItem ${
                      activeCategory === "All" ? "active" : ""
                    }`}
                    onClick={() => setActiveCategory("All")}
                  >
                    <span className="storesSidebarDot" />
                    <span className="storesSidebarLabel">All</span>
                    <span className="storesSidebarCount">{stores.length}</span>
                  </button>

                  {categoryData.map((category) => (
                    <button
                      key={category.name}
                      type="button"
                      className={`storesSidebarNavItem ${
                        activeCategory === category.name ? "active" : ""
                      }`}
                      onClick={() => setActiveCategory(category.name)}
                    >
                      <span className="storesSidebarDot" />
                      <span className="storesSidebarLabel">{category.name}</span>
                      <span className="storesSidebarCount">{category.count}</span>
                    </button>
                  ))}
                </nav>
              </>
            )}
          </div>
        </aside>

        <section className="storesDashboardContent">
          <div className="storesMobileTopFilters">
            <div className="storesMobilePills">
              <button
                type="button"
                className={`storesMobilePill ${
                  activeCategory === "All" ? "active" : ""
                }`}
                onClick={() => setActiveCategory("All")}
              >
                All
                <span>{stores.length}</span>
              </button>

              {categoryData.map((category) => (
                <button
                  key={category.name}
                  type="button"
                  className={`storesMobilePill ${
                    activeCategory === category.name ? "active" : ""
                  }`}
                  onClick={() => setActiveCategory(category.name)}
                >
                  {category.name}
                  <span>{category.count}</span>
                </button>
              ))}
            </div>

            <div className="storesMobileSearchWrap">
              <input
                type="text"
                className="storesMobileSearch"
                placeholder="Search stores, brands, categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {!sidebarOpen && (
            <div className="storesCollapsedTopbar">
              <button
                type="button"
                className="storesSidebarToggle floating"
                onClick={() => setSidebarOpen(true)}
              >
                Open Filters
              </button>
            </div>
          )}

          <div className="storesResultsTop">
            <div className="storesResultsCount">
              Showing {paginatedStores.length} of {filteredStores.length} stores
            </div>
            <div className="storesResultsPageInfo">
              Page {currentPage} of {totalPages}
            </div>
          </div>

          <div className="storesGridCompact">
            {paginatedStores.map((store) => {
              const cashbackValue = getCashbackNumber(store.cashback);
              const showCashback = Boolean(store.cashback && store.cashback.trim());

              return (
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

                  {showCashback && (
                    <div className="storesCompactCashbackWrap">
                      {cashbackValue >= 7 && (
                        <span className="bestCashbackBadge">🔥 Best Cashback</span>
                      )}

                      <div className="cashbackPill">
                        <span className="cashbackIcon">💰</span>
                        <span className="cashbackText">{store.cashback}</span>
                      </div>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>

          {filteredStores.length > 0 && totalPages > 1 && (
            <div className="storesPagination">
              <button
                type="button"
                className="storesPaginationBtn nav"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Prev
              </button>

              {paginationItems.map((item, index) =>
                item === "..." ? (
                  <span key={`dots-${index}`} className="storesPaginationDots">
                    ...
                  </span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    className={`storesPaginationBtn ${
                      currentPage === item ? "active" : ""
                    }`}
                    onClick={() => goToPage(item as number)}
                  >
                    {item}
                  </button>
                )
              )}

              <button
                type="button"
                className="storesPaginationBtn nav"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}

          {filteredStores.length === 0 && (
            <div className="storesCompactEmpty">No stores found.</div>
          )}
        </section>
      </div>
    </div>
  );
}