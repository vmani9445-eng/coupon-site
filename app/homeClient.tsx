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
  logo?: string | null;
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

type FeaturedCoupon = {
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

type SectionControl = {
  hero?: boolean;
  top_brands?: boolean;
  categories?: boolean;
  featured_coupons?: boolean;
  promo_row?: boolean;
  footer_banner?: boolean;
};

type HomeProps = {
  heroTopBanners?: PromoBanner[];
  homepageTopRightTopBanner?: PromoBanner | null;
  homepageTopRightBottomBanner?: PromoBanner | null;
  homepageMiddleStripBanner?: PromoBanner | null;
  homepageLowerBoxBanner?: PromoBanner | null;
  quickCategories?: QuickCategory[];
  popularCategories?: PopularCategory[];
  popularStores?: PopularStore[];
  brandCards?: BrandCard[];
  featuredCoupons?: FeaturedCoupon[];
  sectionControl?: SectionControl;
};

const defaultQuickCategories: QuickCategory[] = [
  { name: "Fashion", icon: "👗" },
  { name: "Food", icon: "🍔" },
  { name: "Travel", icon: "✈️" },
  { name: "Beauty", icon: "💄" },
  { name: "Electronics", icon: "🎧" },
  { name: "Recharge", icon: "📱" },
];

const fallbackSliderItems: SliderItem[] = [
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

function getLogoText(name: string) {
  const parts = name.trim().split(" ").filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function BrandLogo({
  name,
  logo,
  className = "",
  imageClassName = "",
}: {
  name: string;
  logo?: string | null;
  className?: string;
  imageClassName?: string;
}) {
  const [failed, setFailed] = useState(false);
  const shouldShowImage = Boolean(logo && logo.trim() !== "" && !failed);

  return (
    <div className={`brandLogo ${className}`.trim()}>
      {shouldShowImage ? (
        <img
          src={logo!}
          alt={name}
          className={`brandLogoImg ${imageClassName}`.trim()}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <span>{getLogoText(name)}</span>
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
  const imageSrc = banner.mobileImageUrl?.trim() || banner.imageUrl;

  const handleBannerClick = async (
    event: React.MouseEvent<HTMLAnchorElement>
  ) => {
    if (!href || href === "#") return;

    event.preventDefault();

    try {
      await fetch("/api/track-click", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clickType: "banner",
          bannerId: banner.id,
          targetUrl: href,
        }),
      });
    } catch (error) {
      console.error("Failed to track banner click:", error);
    }

    window.open(href, "_blank", "noopener,noreferrer");
  };

  return (
    <Link
      href={href}
      className={`dbBannerBlock ${className}`.trim()}
      onClick={handleBannerClick}
    >
      <img
        src={imageSrc}
        alt={banner.title || "Banner"}
        className="dbBannerImage"
      />
      <div className="dbBannerOverlay"></div>
    </Link>
  );
}

function HeroBannerSlider({ banners }: { banners: PromoBanner[] }) {
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

export default function HomeClient({
  heroTopBanners = [],
  homepageTopRightTopBanner = null,
  homepageTopRightBottomBanner = null,
  homepageMiddleStripBanner = null,
  homepageLowerBoxBanner = null,
  quickCategories = defaultQuickCategories,
  popularCategories = [],
  popularStores = [],
  brandCards = [],
  featuredCoupons = [],
  sectionControl = {
    hero: true,
    top_brands: true,
    categories: true,
    featured_coupons: true,
    promo_row: true,
    footer_banner: true,
  },
}: HomeProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (heroTopBanners.length > 0) return;

    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % fallbackSliderItems.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [heroTopBanners.length]);

  const currentSlide = fallbackSliderItems[activeSlide];

  const filteredBrandCards = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    return brandCards.filter((brand) => {
      return (
        q === "" ||
        brand.name.toLowerCase().includes(q) ||
        brand.tag.toLowerCase().includes(q) ||
        brand.offers.toLowerCase().includes(q)
      );
    });
  }, [searchTerm, brandCards]);

  const filteredCoupons = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    return featuredCoupons.filter((coupon) => {
      return (
        q === "" ||
        coupon.title.toLowerCase().includes(q) ||
        coupon.store.toLowerCase().includes(q) ||
        coupon.category.toLowerCase().includes(q) ||
        coupon.code.toLowerCase().includes(q)
      );
    });
  }, [searchTerm, featuredCoupons]);

  return (
    <main className="page">
      

      

      {sectionControl.hero && (
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
                  {fallbackSliderItems.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
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
      )}

      {sectionControl.top_brands && (
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
            {filteredBrandCards.length > 0 ? (
              filteredBrandCards.map((brand) => (
                <Link
                  key={brand.slug}
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
              ))
            ) : (
              <div className="panel emptyState">
                <h3>No featured stores found</h3>
                <p>Mark stores as featured in admin to show them here.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {sectionControl.categories && (
        <>
          {homepageMiddleStripBanner ? (
            <section className="middleBannerSection">
              <BannerBlock
                banner={homepageMiddleStripBanner}
                className="middleStripBanner"
              />
            </section>
          ) : null}

          <section id="categories" className="quickSection panel">
            <div className="sectionHead">
              <div>
                <h2>Popular Categories</h2>
                <p className="sectionSub">
                  Browse trending categories and discover fresh offers.
                </p>
              </div>
              <Link href="/stores" className="ghostBtn">
                View All Categories
              </Link>
            </div>

            <div className="quickGrid">
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
        </>
      )}

      {sectionControl.featured_coupons && (
        <section className="contentSection">
          <aside className="sidebar">
            <div className="panel sideBlock">
              <h3>Popular Categories</h3>
              <div className="list">
                {popularCategories.length > 0 ? (
                  popularCategories.map((item) => (
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
                  ))
                ) : (
                  <div className="listItem">
                    <div>
                      <div className="listTitle">No categories found</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="panel sideBlock">
              <h3>Popular Stores</h3>
              <div className="list">
                {popularStores.length > 0 ? (
                  popularStores.map((item) => (
                    <Link
                      key={item.slug}
                      href={`/stores/${item.slug}`}
                      className="listItem withLogo"
                    >
                      <BrandLogo
                        name={item.name}
                        logo={item.logo}
                        className="storeLogo"
                        imageClassName="storeLogoImg"
                      />
                      <div>
                        <div className="listTitle">{item.name}</div>
                        <div className="listSub">{item.count}</div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="listItem">
                    <div>
                      <div className="listTitle">No stores found</div>
                    </div>
                  </div>
                )}
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
                    <div
                      className="discountBox"
                      style={{ background: coupon.bg }}
                    >
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
                        Premium savings for Indian shoppers with quick checkout
                        and trusted deal validation.
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
      )}

      {sectionControl.promo_row && (
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
      )}

      {sectionControl.footer_banner && (
        <section className="footerBanner panel">
          <div>
            <h2>Never miss a deal again</h2>
            <p>
              Join thousands of smart shoppers using our latest coupon updates
              and savings alerts.
            </p>
          </div>
          <button className="primaryBtn">Get Started</button>
        </section>
      )}
    </main>
  );
}