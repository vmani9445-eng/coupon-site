"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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

type BrandCard = {
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

const brandCards: BrandCard[] = [
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
    eyebrow: "Mega Sale",
    title: "Up to 70% off on top fashion & electronics brands",
    text: "Fresh coupons, daily verified codes, and limited-time app-exclusive offers.",
    cta: "Explore Deals",
    accent: "violet",
  },
  {
    id: 2,
    eyebrow: "Bank Offers",
    title: "Extra instant discount with HDFC, ICICI and SBI cards",
    text: "Stack cashback and coupon savings together for bigger checkout value.",
    cta: "View Bank Deals",
    accent: "blue",
  },
  {
    id: 3,
    eyebrow: "Festival Picks",
    title: "Handpicked Indian shopping offers across beauty, food and travel",
    text: "Minimal, verified, and user-friendly deal discovery for everyday savings.",
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
    bg: "#FFF7ED",
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
    bg: "#EFF6FF",
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
    bg: "#FDF2F8",
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
    bg: "#F0FDF4",
    category: "Fashion",
  },
];

function BrandLogo({
  name,
  logo,
}: {
  name: string;
  logo?: string | null;
}) {
  if (logo) {
    return (
      <div className="brandLogo">
        <img src={logo} alt={name} className="brandLogoImg" />
      </div>
    );
  }

  return <div className="brandLogo">{name.slice(0, 2).toUpperCase()}</div>;
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
  const buttonText = banner.ctaText?.trim() || "View Deals";
  const imageSrc = banner.mobileImageUrl?.trim() || banner.imageUrl;

  return (
    <Link href={href} className={`dbBannerBlock ${className}`.trim()}>
      <img src={imageSrc} alt={banner.title} className="dbBannerImage" />
      <div className="dbBannerOverlay">
        <div className="dbBannerContent">
          <span className="dbBannerTitle">{banner.title}</span>
          {banner.subtitle ? (
            <span className="dbBannerSubtitle">{banner.subtitle}</span>
          ) : null}
          <span className="dbBannerButton">{buttonText}</span>
        </div>
      </div>
    </Link>
  );
}

function HeroBannerSlider({
  banners,
}: {
  banners: PromoBanner[];
}) {
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;

    const timer = setInterval(() => {
      setActiveHeroIndex((prev) => (prev + 1) % banners.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [banners.length]);

  if (banners.length === 0) return null;

  const activeBanner = banners[activeHeroIndex];

  return (
    <div className="heroSliderWrap">
      <BannerBlock banner={activeBanner} className="heroMainBanner" />

      {banners.length > 1 ? (
        <div className="heroSliderDots heroSliderDotsOverlay">
          {banners.map((banner, index) => (
            <button
              key={banner.id}
              type="button"
              className={index === activeHeroIndex ? "dot active" : "dot"}
              onClick={() => setActiveHeroIndex(index)}
              aria-label={`Go to hero banner ${index + 1}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function Home({
  heroTopBanners = [],
  homepageTopRightTopBanner = null,
  homepageTopRightBottomBanner = null,
  homepageMiddleStripBanner = null,
  homepageLowerBoxBanner = null,
}: HomeProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (heroTopBanners.length > 0) return;

    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % sliderItems.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [heroTopBanners.length]);

  const currentSlide = sliderItems[activeSlide];

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

    return brandCards.filter((brand) => {
      return (
        q === "" ||
        brand.name.toLowerCase().includes(q) ||
        brand.tag.toLowerCase().includes(q)
      );
    });
  }, [searchTerm]);

  return (
    <main className="page">
      <header className="header">
        <div className="logo">DealDhamaka</div>

        <nav className="nav">
          <Link href="/">Home</Link>
          <Link href="/stores">Stores</Link>
          <a href="#categories">Categories</a>
          <a href="#featured-coupons">Top Deals</a>
        </nav>

        <div className="headerActions">
          <Link href="/admin" className="ghostBtn">
            Login
          </Link>
          <Link href="/submit" className="primaryBtn">
            Submit Coupon
          </Link>
        </div>
      </header>

      <div className="stickySearchBar">
        <div className="stickySearchInner">
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Amazon, Flipkart, Myntra, travel, food..."
          />
          <button className="primaryBtn">Search</button>
        </div>
      </div>

      <section className="heroWrap">
        <div className="heroMainArea">
          {heroTopBanners.length > 0 ? (
            <HeroBannerSlider banners={heroTopBanners} />
          ) : (
            <div className={`heroSlider hero-${currentSlide.accent}`}>
              <div className="heroSliderContent">
                <span className="heroEyebrow">{currentSlide.eyebrow}</span>
                <h1>{currentSlide.title}</h1>
                <p>{currentSlide.text}</p>

                <div className="heroSliderActions">
                  <a href="#featured-coupons" className="primaryBtn">
                    {currentSlide.cta}
                  </a>
                  <Link href="/stores" className="ghostBtn">
                    Top Stores
                  </Link>
                </div>

                <div className="heroPills">
                  <span>Verified Coupons</span>
                  <span>Updated Daily</span>
                  <span>Best Indian Brands</span>
                </div>
              </div>

              <div className="heroSliderDots">
                {sliderItems.map((item, index) => (
                  <button
                    key={item.id}
                    className={index === activeSlide ? "dot active" : "dot"}
                    onClick={() => setActiveSlide(index)}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="heroSide">
          {homepageTopRightTopBanner ? (
            <BannerBlock
              banner={homepageTopRightTopBanner}
              className="heroMiniBanner"
            />
          ) : (
            <div className="sideCard dark">
              <span className="smallChip">TRENDING</span>
              <h3>Festival Deals Are Live</h3>
              <p>Extra savings on fashion, beauty, and electronics.</p>
              <a href="#featured-coupons" className="lightBtn">
                Explore Offers
              </a>
            </div>
          )}

          {homepageTopRightBottomBanner ? (
            <BannerBlock
              banner={homepageTopRightBottomBanner}
              className="heroMiniBanner"
            />
          ) : (
            <div className="sideCard light">
              <h3>Cashback + Coupons</h3>
              <p>Stack savings for smarter shopping.</p>
            </div>
          )}
        </div>
      </section>

      <section className="panel brandsSection">
        <div className="sectionHead">
          <div>
            <h2>Top Indian Brands</h2>
            <p className="sectionSub">
              Explore the most searched stores with fresh daily deals.
            </p>
          </div>
          <Link href="/stores" className="ghostBtn">
            View All Stores
          </Link>
        </div>

        <div className="brandGrid">
          {filteredBrandCards.map((brand) => (
            <Link
              key={brand.name}
              href={`/stores/${brand.slug}`}
              className="brandCard"
            >
              <BrandLogo name={brand.name} logo={brand.logo} />
              <div className="brandMeta">
                <div className="brandTopRow">
                  <h3>{brand.name}</h3>
                  <span className="softMiniTag">{brand.tag}</span>
                </div>
                <p>{brand.offers}</p>
                <span className="brandLink">View Offers</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {homepageMiddleStripBanner ? (
        <section className="middleBannerSection">
          <BannerBlock
            banner={homepageMiddleStripBanner}
            className="middleStripBanner"
          />
        </section>
      ) : null}

      <section id="categories" className="quickSection panel">
        <h2>Popular Categories</h2>
        <div className="quickGrid">
          <Link href="/stores" className="quickCard">
            <div className="quickIcon">✨</div>
            <div className="quickName">All</div>
            <div className="quickSub">All stores</div>
          </Link>

          {quickCategories.map((item) => (
            <Link
              key={item.name}
              href={`/stores?category=${encodeURIComponent(item.name)}`}
              className="quickCard"
            >
              <div className="quickIcon">{item.icon}</div>
              <div className="quickName">{item.name}</div>
              <div className="quickSub">Trending offers</div>
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
              <p className="sectionSub">
                Best verified savings for Indian shoppers.
              </p>
            </div>
            <Link href="/stores" className="ghostBtn">
              View All
            </Link>
          </div>

          <div className="couponList">
            {filteredCoupons.length > 0 ? (
              filteredCoupons.map((coupon) => (
                <div key={coupon.id} className="couponCard panel">
                  <div className="discountBox" style={{ background: coupon.bg }}>
                    <div className="discountText">{coupon.badge}</div>
                    <div className="discountSub">Limited Deal</div>
                  </div>

                  <div className="couponInfo">
                    <Link
                      href={`/stores/${coupon.storeSlug}`}
                      className="storeTag"
                    >
                      {coupon.store}
                    </Link>
                    <h3>{coupon.title}</h3>

                    <div className="metaRow">
                      <span className="okTag">{coupon.verified}</span>
                      <span className="softTag">Ends Soon</span>
                      <span className="softTag">{coupon.category}</span>
                    </div>

                    <p>
                      Premium savings for Indian shoppers with quick checkout and
                      trusted deal validation.
                    </p>
                  </div>

                  <div className="couponAction">
                    <div className="codeBox">
                      <div className="codeLabel">Coupon Code</div>
                      <div className="codeValue">{coupon.code}</div>
                    </div>

                    <Link
                      href={`/stores/${coupon.storeSlug}`}
                      className="primaryBtn fullBtn"
                    >
                      Show Coupon
                    </Link>

                    <div className="usageRow">
                      <span>👍 {coupon.usage}</span>
                      <span>Used today</span>
                    </div>
                  </div>
                </div>
              ))
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
          <BannerBlock
            banner={homepageLowerBoxBanner}
            className="promoBoxBanner"
          />
        ) : (
          <div className="panel promoCard yellow">
            <div>
              <div className="promoKicker">Special Picks</div>
              <h3>Top Handpicked Offers</h3>
              <p>Daily updated coupon picks from top stores.</p>
            </div>
          </div>
        )}

        <div className="panel promoCard blue">
          <div>
            <div className="promoKicker">Mobile App</div>
            <h3>Get Deal Alerts Instantly</h3>
            <p>Never miss trending offers and flash sales.</p>
          </div>
        </div>

        <div className="panel promoCard purple">
          <div>
            <div className="promoKicker">Shopping News</div>
            <h3>Big Sale Updates</h3>
            <p>Festival sales, cashback boosts, and new launches.</p>
          </div>
        </div>
      </section>

      <section className="footerBanner panel">
        <div>
          <h2>Never miss a deal again</h2>
          <p>
            Join thousands of smart shoppers using our latest coupon updates and
            savings alerts.
          </p>
        </div>
        <button className="primaryBtn">Get Started</button>
      </section>
    </main>
  );
}
