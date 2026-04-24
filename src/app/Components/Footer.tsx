"use client";

import Link from "next/link";
import "./footer.css";

export default function Footer() {
  function openCookieSettings() {
    window.dispatchEvent(new Event("open-cookie-preferences"));
  }

  return (
    <footer className="siteFooter">
      <div className="footerContainer">
        <div className="footerTop">
          {/* LEFT */}
          <div className="footerBrandBlock">
            <Link href="/" className="footerLogo">
              <span className="footerLogoMark">C</span>
              <span>Cashlio</span>
            </Link>

            <p>
              Discover verified coupons, cashback deals, and daily shopping offers
              from top Indian stores.
            </p>

            <form className="footerSubscribe">
              <input type="email" placeholder="Enter your email" />
              <button type="button">Subscribe</button>
            </form>

            <div className="footerSocials">
              <Link href="/">◎</Link>
              <Link href="/">f</Link>
              <Link href="/">▶️</Link>
              <Link href="/">𝕏</Link>
            </div>
          </div>

          {/* RIGHT LINKS */}
          <div className="footerLinksGrid">
            <div className="footerCol">
              <h4>Explore</h4>
              <Link href="/stores">Stores</Link>
              <Link href="/stores?category=Fashion">Fashion</Link>
              <Link href="/stores?category=Food">Food</Link>
              <Link href="/stores?category=Electronics">Electronics</Link>
            </div>

            <div className="footerCol">
              <h4>Top Stores</h4>
              <Link href="/stores/amazon">Amazon</Link>
              <Link href="/stores/flipkart">Flipkart</Link>
              <Link href="/stores/myntra">Myntra</Link>
              <Link href="/stores/nykaa">Nykaa</Link>
            </div>

            <div className="footerCol">
              <h4>Account</h4>
              <Link href="/login">Login</Link>
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/wallet">Wallet</Link>
              <Link href="/withdraw">Withdraw</Link>
            </div>

            <div className="footerCol">
              <h4>Legal</h4>
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/terms">Terms & Conditions</Link>
              <Link href="/disclaimer">Disclaimer</Link>
              <Link href="/contact">Contact Us</Link>

              <button onClick={openCookieSettings} className="cookieBtn">
                Manage Cookies
              </button>
            </div>
          </div>
        </div>

        {/* MIDDLE */}
        <div className="footerMiddle">
          <div>
            <strong>Questions? Contact us</strong>
            <p>support@cashlio.in</p>
          </div>

          <div>
            <strong>Response time</strong>
            <p>Usually within 24 hours</p>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="footerBottom">
          <p>©️ 2026 Cashlio. All rights reserved.</p>

          <div className="footerBottomLinks">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/disclaimer">Disclaimer</Link>
            <Link href="/contact">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}