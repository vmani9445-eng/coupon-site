const quickCategories = [
  { name: "Fashion", icon: "👗" },
  { name: "Food", icon: "🍔" },
  { name: "Travel", icon: "✈️" },
  { name: "Beauty", icon: "💄" },
  { name: "Electronics", icon: "🎧" },
  { name: "Recharge", icon: "📱" },
];

const popularCategories = [
  { name: "Fashion", count: "124 coupons" },
  { name: "Food & Dining", count: "86 coupons" },
  { name: "Travel", count: "64 coupons" },
  { name: "Beauty", count: "72 coupons" },
  { name: "Electronics", count: "91 coupons" },
];

const popularStores = [
  { name: "Amazon", count: "42 deals" },
  { name: "Flipkart", count: "38 deals" },
  { name: "Myntra", count: "25 deals" },
  { name: "Nykaa", count: "19 deals" },
];

const coupons = [
  {
    id: 1,
    badge: "60% OFF",
    store: "Amazon",
    title: "Up to 60% OFF on Electronics & Accessories",
    code: "SAVE60",
    verified: "Verified today",
    usage: "92% success",
    bg: "#FFF7ED",
  },
  {
    id: 2,
    badge: "₹500 OFF",
    store: "Flipkart",
    title: "Extra ₹500 OFF on orders above ₹2,999",
    code: "FLAT500",
    verified: "Verified 2 hrs ago",
    usage: "88% success",
    bg: "#EFF6FF",
  },
  {
    id: 3,
    badge: "35% OFF",
    store: "Nykaa",
    title: "Flat 35% OFF on beauty essentials & skincare",
    code: "GLOW35",
    verified: "Verified now",
    usage: "90% success",
    bg: "#FDF2F8",
  },
  {
    id: 4,
    badge: "BOGO",
    store: "Myntra",
    title: "Buy 1 Get 1 Free on selected fashion styles",
    code: "STYLEBOGO",
    verified: "Verified today",
    usage: "85% success",
    bg: "#F0FDF4",
  },
];

export default function Home() {
  return (
    <main className="page">
      <header className="header">
        <div className="logo">DealDhamaka</div>

        <nav className="nav">
          <a href="#">Stores</a>
          <a href="#">Categories</a>
          <a href="#">Top Deals</a>
          <a href="#">App</a>
        </nav>

        <div className="headerActions">
          <button className="ghostBtn">Login</button>
          <button className="primaryBtn">Submit Coupon</button>
        </div>
      </header>

      <section className="heroWrap">
        <div className="heroMain">
          <div className="heroTag">🇮🇳 Best Coupons for India</div>
          <h1>Save Bigger on Every Shopping Order</h1>
          <p>
            Verified coupon codes, cashback offers, app deals, and top discounts
            from India&apos;s most popular brands.
          </p>

          <div className="searchBar">
            <input placeholder="Search Amazon, Myntra, food, travel..." />
            <button>Search Deals</button>
          </div>

          <div className="heroPills">
            <span>Amazon</span>
            <span>Flipkart</span>
            <span>Myntra</span>
            <span>Nykaa</span>
            <span>Swiggy</span>
          </div>
        </div>

        <div className="heroSide">
          <div className="sideCard dark">
            <span className="smallChip">TRENDING</span>
            <h3>Festival Deals Are Live</h3>
            <p>Extra savings on fashion, beauty, and electronics.</p>
            <button>Explore Offers</button>
          </div>

          <div className="sideCard light">
            <h3>Cashback + Coupons</h3>
            <p>Stack savings for smarter shopping.</p>
          </div>
        </div>
      </section>

      <section className="quickSection panel">
        <h2>Popular Categories</h2>
        <div className="quickGrid">
          {quickCategories.map((item) => (
            <div key={item.name} className="quickCard">
              <div className="quickIcon">{item.icon}</div>
              <div className="quickName">{item.name}</div>
              <div className="quickSub">Trending offers</div>
            </div>
          ))}
        </div>
      </section>

      <section className="contentSection">
        <aside className="sidebar">
          <div className="panel sideBlock">
            <h3>Popular Categories</h3>
            <div className="list">
              {popularCategories.map((item) => (
                <div key={item.name} className="listItem">
                  <div>
                    <div className="listTitle">{item.name}</div>
                    <div className="listSub">{item.count}</div>
                  </div>
                  <span>›</span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel sideBlock">
            <h3>Popular Stores</h3>
            <div className="list">
              {popularStores.map((item) => (
                <div key={item.name} className="listItem">
                  <div className="storeLogo">{item.name.charAt(0)}</div>
                  <div>
                    <div className="listTitle">{item.name}</div>
                    <div className="listSub">{item.count}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <div className="mainCoupons">
          <div className="sectionHead">
            <h2>Featured Coupons</h2>
            <button className="ghostBtn">View All</button>
          </div>

          <div className="couponList">
            {coupons.map((coupon) => (
              <div key={coupon.id} className="couponCard panel">
                <div className="discountBox" style={{ background: coupon.bg }}>
                  <div className="discountText">{coupon.badge}</div>
                  <div className="discountSub">Limited Deal</div>
                </div>

                <div className="couponInfo">
                  <div className="storeTag">{coupon.store}</div>
                  <h3>{coupon.title}</h3>

                  <div className="metaRow">
                    <span className="okTag">{coupon.verified}</span>
                    <span className="softTag">Ends Soon</span>
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

                  <button className="primaryBtn fullBtn">Show Coupon</button>

                  <div className="usageRow">
                    <span>👍 {coupon.usage}</span>
                    <span>Used today</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="promoRow">
        <div className="panel promoCard yellow">
          <div>
            <div className="promoKicker">Special Picks</div>
            <h3>Top Handpicked Offers</h3>
            <p>Daily updated coupon picks from top stores.</p>
          </div>
        </div>

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