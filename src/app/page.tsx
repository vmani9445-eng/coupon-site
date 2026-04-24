"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import "./home.css";

type QuickCategory = {
  name: string;
  icon: string;
};

type PopularCategory = {
  name: string;
  count: string;
};

type PopularStore = {
  name: string;
  slug: string;
  count: string;
};

export type HomeBrandCard = {
  name: string;
  slug: string;
  offers: string;
  tag: string;
  logo?: string | null;
};

type SliderItem = {
  id: number;
  eyebrow: string;
  title: string;
  text: string;
  cta: string;
  accent: "violet" | "blue" | "peach";
};

type CouponItem = {
  id: number | string;
  badge: string;
  store: string;
  storeSlug: string;
  title: string;
  code: string;
  verified: string;
  usage: string;
  bg: string;
  category: string;
};

type PromoBanner = {
  id: string;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  mobileImageUrl?: string | null;
  ctaText?: string | null;
  ctaUrl?: string | null;
  placement: string;
  bannerType?: string | null;
};

type HomeProps = {
  homeStores?: HomeBrandCard[];
  heroTopBanners?: PromoBanner[];
  homepageTopRightTopBanner?: PromoBanner | null;
  homepageTopRightBottomBanner?: PromoBanner | null;
  homepageMiddleStripBanner?: PromoBanner | null;
  homepageLowerBoxBanner?: PromoBanner | null;
};

const quickCategories: QuickCategory[] = [
  { name: "Fashion", icon: "👗" },
  { name: "Food", icon: "🍔" },
  { name: "Travel", icon: "✈️" },
  { name: "Beauty", icon: "💄" },
  { name: "Electronics", icon: "🎧" },
  { name: "Recharge", icon: "📱" },
];

const popularCategories: PopularCategory[] = [
  { name: "Fashion", count: "124 coupons" },
  { name: "Food", count: "86 coupons" },
  { name: "Travel", count: "64 coupons" },
  { name: "Beauty", count: "72 coupons" },
  { name: "Electronics", count: "91 coupons" },
];

const popularStores: PopularStore[] = [
  { name: "Amazon", slug: "amazon", count: "42 deals" },
  { name: "Flipkart", slug: "flipkart", count: "38 deals" },
  { name: "Myntra", slug: "myntra", count: "25 deals" },
  { name: "Nykaa", slug: "nykaa", count: "19 deals" },
];

const fallbackBrandCards: HomeBrandCard[] = [
  { name: "Amazon", slug: "amazon", offers: "42 live offers", tag: "Top Store" },
  { name: "Flipkart", slug: "flipkart", offers: "38 live offers", tag: "Trending" },
  { name: "Myntra", slug: "myntra", offers: "25 live offers", tag: "Fashion" },
  { name: "Nykaa", slug: "nykaa", offers: "19 live offers", tag: "Beauty" },
  { name: "Ajio", slug: "ajio", offers: "16 live offers", tag: "Style" },
  { name: "Swiggy", slug: "swiggy", offers: "14 live offers", tag: "Food" },
  { name: "Meesho", slug: "meesho", offers: "18 live offers", tag: "Budget" },
  { name: "Tata Cliq", slug: "tata-cliq", offers: "12 live offers", tag: "Premium" },
];

const sliderItems: SliderItem[] = [
  {
    id: 1,
    eyebrow: "Verified Deals",
    title: "Save more on top Indian brands",
    text: "Fresh coupons, clean cashback deals, and trusted shopping offers.",
    cta: "Explore Deals",
    accent: "violet",
  },
  {
    id: 2,
    eyebrow: "Bank Offers",
    title: "Extra savings with card offers",
    text: "Find coupon codes, cashback deals, and bank discounts in one place.",
    cta: "View Bank Deals",
    accent: "blue",
  },
  {
    id: 3,
    eyebrow: "Festival Picks",
    title: "Handpicked offers for daily shopping",
    text: "Minimal, verified, and user-friendly deals for Indian shoppers.",
    cta: "See Top Offers",
    accent: "peach",
  },
];

const coupons: CouponItem[] = [
  {
    id: 1,
    badge: "60% OFF",
    store: "Amazon",
    storeSlug: "amazon",
    title: "Up to 60% OFF on Electronics & Accessories",
    code: "SAVE60",
    verified: "Verified today",
    usage: "92% success",
    bg: "#fff3df",
    category: "Electronics",
  },
  {
    id: 2,
    badge: "₹500 OFF",
    store: "Flipkart",
    storeSlug: "flipkart",
    title: "Extra ₹500 OFF on orders above ₹2,999",
    code: "FLAT500",
    verified: "Verified 2 hrs ago",
    usage: "88% success",
    bg: "#eaf3ff",
    category: "Electronics",
  },
  {
    id: 3,
    badge: "35% OFF",
    store: "Nykaa",
    storeSlug: "nykaa",
    title: "Flat 35% OFF on beauty essentials & skincare",
    code: "GLOW35",
    verified: "Verified now",
    usage: "90% success",
    bg: "#fff0f7",
    category: "Beauty",
  },
  {
    id: 4,
    badge: "BOGO",
    store: "Myntra",
    storeSlug: "myntra",
    title: "Buy 1 Get 1 Free on selected fashion styles",
    code: "STYLEBOGO",
    verified: "Verified today",
    usage: "85% success",
    bg: "#ecfff4",
    category: "Fashion",
  },
];

function BrandLogo({ name, logo }: { name: string; logo?: string | null }) {
  return (
    <div className="brandLogo">
      {logo ? (
        <img src={logo} alt={name} className="brandLogoImg" />
      ) : (
        <span>{name.slice(0, 2).toUpperCase()}</span>
      )}
    </div>
  );
}

function BannerBlock({
  banner,
  className = "",
}: {
  banner?: PromoBanner | null;
  className?: string;
}) {
  if (!banner) return null;

  const href = banner.ctaUrl?.trim() || "#";

  return (
    <Link href={href} className={`dbBannerBlock ${className}`.trim()}>
      <picture>
        {banner.mobileImageUrl ? (
          <source media="(max-width: 640px)" srcSet={banner.mobileImageUrl} />
        ) : null}
        <img src={banner.imageUrl} alt={banner.title} className="dbBannerImage" />
      </picture>

      <div className="dbBannerVerified">Verified</div>

      <div className="dbBannerOverlay">
        <div className="dbBannerContent">
          <span className="dbBannerTitle">{banner.title}</span>
          {banner.subtitle ? (
            <span className="dbBannerSubtitle">{banner.subtitle}</span>
          ) : null}
          {banner.ctaText ? (
            <span className="dbBannerButton">{banner.ctaText}</span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

function HeroSwipeSlider({ banners }: { banners: PromoBanner[] }) {
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;

    const timer = setInterval(() => {
      const next = (activeIndex + 1) % banners.length;
      setActiveIndex(next);

      sliderRef.current?.scrollTo({
        left: next * sliderRef.current.clientWidth,
        behavior: "smooth",
      });
    }, 3500);

    return () => clearInterval(timer);
  }, [activeIndex, banners.length]);

  const handleScroll = () => {
    if (!sliderRef.current) return;

    const index = Math.round(
      sliderRef.current.scrollLeft / sliderRef.current.clientWidth
    );

    setActiveIndex(index);
  };

  return (
    <div className="realHeroSlider">
      <div ref={sliderRef} className="realHeroTrack" onScroll={handleScroll}>
        {banners.map((banner) => (
          <BannerBlock key={banner.id} banner={banner} className="heroMainBanner" />
        ))}
      </div>

      {banners.length > 1 ? (
        <div className="heroSliderDots heroSliderDotsCenter">
          {banners.map((banner, index) => (
            <button
              key={banner.id}
              type="button"
              className={index === activeIndex ? "dot active" : "dot"}
              onClick={() => {
                setActiveIndex(index);
                sliderRef.current?.scrollTo({
                  left: index * sliderRef.current.clientWidth,
                  behavior: "smooth",
                });
              }}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function Home({
  homeStores = [],
  heroTopBanners = [],
  homepageTopRightTopBanner = null,
  homepageTopRightBottomBanner = null,
  homepageMiddleStripBanner = null,
  homepageLowerBoxBanner = null,
}: HomeProps) {
  const fallbackSliderRef = useRef<HTMLDivElement | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCouponIds, setVisibleCouponIds] = useState<(number | string)[]>(
    []
  );

  useEffect(() => {
    if (heroTopBanners.length > 0) return;

    const timer = setInterval(() => {
      const next = (activeSlide + 1) % sliderItems.length;
      setActiveSlide(next);

      fallbackSliderRef.current?.scrollTo({
        left: next * fallbackSliderRef.current.clientWidth,
        behavior: "smooth",
      });
    }, 3500);

    return () => clearInterval(timer);
  }, [activeSlide, heroTopBanners.length]);

  const storesForHome = useMemo(() => {
    return homeStores.length > 0 ? homeStores : fallbackBrandCards;
  }, [homeStores]);

  const filteredCoupons = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    return coupons.filter((coupon) => {
      return (
        q === "" ||
        coupon.title.toLowerCase().includes(q) ||
        coupon.store.toLowerCase().includes(q) ||
        coupon.category.toLowerCase().includes(q) ||
        coupon.code.toLowerCase().includes(q)
      );
    });
  }, [searchTerm]);

  const filteredBrandCards = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    return storesForHome.filter((brand) => {
      return (
        q === "" ||
        brand.name.toLowerCase().includes(q) ||
        brand.tag.toLowerCase().includes(q)
      );
    });
  }, [searchTerm, storesForHome]);

  const toggleCouponCode = (id: number | string) => {
    setVisibleCouponIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleFallbackScroll = () => {
    if (!fallbackSliderRef.current) return;

    const index = Math.round(
      fallbackSliderRef.current.scrollLeft / fallbackSliderRef.current.clientWidth
    );

    setActiveSlide(index);
  };

  return (
    <main className="page">
      <section className="heroWrap">
        <div className="heroMainArea">
          {heroTopBanners.length > 0 ? (
            <HeroSwipeSlider banners={heroTopBanners} />
          ) : (
            <div className="fallbackHeroSlider">
              <div
                ref={fallbackSliderRef}
                className="fallbackHeroTrack"
                onScroll={handleFallbackScroll}
              >
                {sliderItems.map((slide) => (
                  <div key={slide.id} className={`heroSlider hero-${slide.accent}`}>
                    <span className="heroVerifiedTag">Verified</span>

                    <div className="heroSliderContent">
                      <span className="heroEyebrow">{slide.eyebrow}</span>
                      <h1>{slide.title}</h1>
                      <p>{slide.text}</p>

                      <div className="heroSliderActions">
                        <a href="#featured-coupons" className="primaryBtn">
                          {slide.cta}
                        </a>
                        <Link href="/stores" className="ghostBtn">
                          Top Stores
                        </Link>
                      </div>

                      <div className="heroPills">
                        <span>Verified Coupons</span>
                        <span>Daily Updated</span>
                        <span>Top Indian Brands</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="heroSliderDots heroSliderDotsCenter">
                {sliderItems.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    className={index === activeSlide ? "dot active" : "dot"}
                    onClick={() => {
                      setActiveSlide(index);
                      fallbackSliderRef.current?.scrollTo({
                        left: index * fallbackSliderRef.current.clientWidth,
                        behavior: "smooth",
                      });
                    }}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="heroSide">
          {homepageTopRightTopBanner ? (
            <BannerBlock banner={homepageTopRightTopBanner} className="heroMiniBanner" />
          ) : (
            <div className="sideCard sideCardGreen">
              <span className="smallChip">Trending</span>
              <h3>Festival Deals Are Live</h3>
              <p>Extra savings on fashion, beauty, and electronics.</p>
              
            </div>
          )}

          {homepageTopRightBottomBanner ? (
            <BannerBlock banner={homepageTopRightBottomBanner} className="heroMiniBanner" />
          ) : (
            <div className="sideCard sideCardLavender">
              <span className="smallChip">Cashback</span>
              <h3>Cashback + Coupons</h3>
              <p>Stack savings for smarter shopping.</p>
            </div>
          )}
        </div>
      </section>

      <section className="panel brandsSection">
        <div className="sectionHead">
          <div>
            <h2>Top Stores</h2>
            <p className="sectionSub">Fresh daily deals from popular Indian brands.</p>
          </div>

          <Link href="/stores" className="textLink">
            View All
          </Link>
        </div>

        <div className="brandGrid">
          {filteredBrandCards.map((brand) => (
            <Link key={brand.slug} href={`/stores/${brand.slug}`} className="brandCard">
              <BrandLogo name={brand.name} logo={brand.logo} />

              <div className="brandMeta">
                <div className="brandTopRow">
                  <h3>{brand.name}</h3>
                  <span className="softMiniTag">{brand.tag}</span>
                </div>

                <p>{brand.offers}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {homepageMiddleStripBanner ? (
        <section className="middleBannerSection">
          <BannerBlock banner={homepageMiddleStripBanner} className="middleStripBanner" />
        </section>
      ) : null}

      <section id="categories" className="quickSection panel">
        <div className="sectionHead">
          <div>
            <h2>Shop By Category</h2>
            <p className="sectionSub">Swipe categories on mobile.</p>
          </div>

          <Link href="/stores" className="textLink">
            View All
          </Link>
        </div>

        <div className="quickGrid">
          <Link href="/stores" className="quickCard quickAll">
            <div className="quickIcon">✨</div>
            <div>
              <div className="quickName">All</div>
              <div className="quickSub">All stores</div>
            </div>
          </Link>

          {quickCategories.map((item) => (
            <Link
              key={item.name}
              href={`/stores?category=${encodeURIComponent(item.name)}`}
              className="quickCard"
            >
              <div className="quickIcon">{item.icon}</div>
              <div>
                <div className="quickName">{item.name}</div>
                <div className="quickSub">Trending offers</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="contentSection">
        <aside className="sidebar">
          <div className="panel sideBlock">
            <h3>Popular Categories</h3>

            <div className="list">
              {popularCategories.map((item) => (
                <Link
                  key={item.name}
                  href={`/stores?category=${encodeURIComponent(item.name)}`}
                  className="listItem listButton"
                >
                  <div>
                    <div className="listTitle">{item.name}</div>
                    <div className="listSub">{item.count}</div>
                  </div>
                  <span>›</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="panel sideBlock">
            <h3>Popular Stores</h3>

            <div className="list">
              {popularStores.map((item) => (
                <Link
                  key={item.name}
                  href={`/stores/${item.slug}`}
                  className="listItem withLogo"
                >
                  <div className="storeLogo">{item.name.charAt(0)}</div>
                  <div>
                    <div className="listTitle">{item.name}</div>
                    <div className="listSub">{item.count}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </aside>

        <div className="mainCoupons" id="featured-coupons">
          <div className="sectionHead">
            <div>
              <h2>Featured Coupons</h2>
              <p className="sectionSub">Click Show Coupon to reveal the code.</p>
            </div>

            <Link href="/stores" className="textLink">
              View All
            </Link>
          </div>

          <div className="searchBar">
            <span>⌕</span>
            <input
              type="text"
              placeholder="Search coupons, stores, categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="couponList">
            {filteredCoupons.length > 0 ? (
              filteredCoupons.map((coupon) => {
                const isVisible = visibleCouponIds.includes(coupon.id);

                return (
                  <div key={coupon.id} className="couponCard panel">
                    <div className="discountBox" style={{ background: coupon.bg }}>
                      <div className="discountText">{coupon.badge}</div>
                      <div className="discountSub">Limited Deal</div>
                    </div>

                    <div className="couponInfo">
                      <Link href={`/stores/${coupon.storeSlug}`} className="storeTag">
                        {coupon.store}
                      </Link>

                      <h3>{coupon.title}</h3>

                      <div className="metaRow">
                        <span className="okTag">{coupon.verified}</span>
                        <span className="softTag">Ends Soon</span>
                        <span className="softTag">{coupon.category}</span>
                      </div>

                      <p>
                        Premium savings for Indian shoppers with quick checkout and trusted
                        deal validation.
                      </p>
                    </div>

                    <div className="couponAction">
                      <div className={`codeBox ${isVisible ? "revealed" : ""}`}>
                        <div className="codeLabel">Coupon Code</div>
                        <div className="codeValue">{isVisible ? coupon.code : "••••••••"}</div>
                      </div>

                      <button
                        type="button"
                        className="primaryBtn fullBtn"
                        onClick={() => toggleCouponCode(coupon.id)}
                      >
                        {isVisible ? "Hide Code" : "Show Coupon"}
                      </button>

                      <div className="usageRow">
                        <span>👍 {coupon.usage}</span>
                        <span>Used today</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="panel emptyState">
                <h3>No offers found</h3>
                <p>Try another store or keyword.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="promoRow">
        {homepageLowerBoxBanner ? (
          <BannerBlock banner={homepageLowerBoxBanner} className="promoBoxBanner" />
        ) : (
          <div className="panel promoCard yellow">
            <div className="promoKicker">Special Picks</div>
            <h3>Top Handpicked Offers</h3>
            <p>Daily updated coupon picks from top stores.</p>
          </div>
        )}

        <div className="panel promoCard blue">
          <div className="promoKicker"> everyday </div>
          <h3>Get Deal Alerts Instantly</h3>
          <p>Never miss trending offers and flash sales.</p>
        </div>

        <div className="panel promoCard purple">
          <div className="promoKicker">Shopping News</div>
          <h3>Big Sale Updates</h3>
          <p>Festival sales, cashback boosts, and new launches.</p>
        </div>
      </section>

      <section className="footerBanner panel">
        <div>
          <h2>Never miss a deal again</h2>
          <p>Join smart shoppers using latest coupon updates and savings alerts.</p>
        </div>

        <Link href="/stores" className="primaryBtn">
          Get Started
        </Link>
      </section>
    </main>
  );
}