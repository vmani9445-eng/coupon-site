import Link from "next/link";
import "../legal.css";

export default function TermsPage() {
  const brandName = "Cashlio";
  const supportEmail = "support@cashlio.in";

  return (
    <main className="legalPage">
      <div className="legalShell">
        <section className="legalHero">
          <div className="legalBadge">Terms & Conditions</div>
          <h1>Simple rules for using {brandName}.</h1>
          <p>
            By using our website, you agree to these terms related to coupons,
            cashback tracking, accounts, and withdrawals.
          </p>
        </section>

        <section className="legalCard">
          <div className="legalSection">
            <h2>1. Use of Website</h2>
            <p>
              You agree to use {brandName} only for lawful purposes and not to
              misuse the website, tracking links, offers, or cashback system.
            </p>
          </div>

          <div className="legalSection">
            <h2>2. Cashback Policy</h2>
            <ul>
              <li>Cashback is tracked through affiliate partners and merchants.</li>
              <li>Cashback is not guaranteed until confirmed by the merchant.</li>
              <li>Cashback approval may take 30 to 90 days depending on the store.</li>
              <li>Cancelled, returned, or modified orders may not receive cashback.</li>
            </ul>
          </div>

          <div className="legalSection">
            <h2>3. User Accounts</h2>
            <p>
              You are responsible for your account information. Fake accounts,
              duplicate accounts, or suspicious activity may lead to account
              suspension.
            </p>
          </div>

          <div className="legalSection">
            <h2>4. Coupons & Offers</h2>
            <p>
              Offers, coupons, prices, and cashback rates may change without
              notice. Final offer availability depends on the merchant website.
            </p>
          </div>

          <div className="legalSection">
            <h2>5. Withdrawals</h2>
            <p>
              Cashback withdrawals are subject to minimum withdrawal limits,
              account verification, and successful merchant confirmation.
            </p>
          </div>

          <div className="legalSection">
            <h2>6. Tracking Failures</h2>
            <p>
              Cashback may fail due to ad blockers, broken sessions, using other
              coupon websites, merchant restrictions, cancelled orders, or
              incomplete purchases.
            </p>
          </div>

          <div className="legalSection">
            <h2>7. Termination</h2>
            <p>
              We may suspend or terminate accounts involved in fraud, abuse,
              policy violations, or suspicious activity.
            </p>
          </div>

          <div className="legalSection">
            <h2>8. Contact</h2>
            <p>
              For support, contact us at <strong>{supportEmail}</strong>.
            </p>
          </div>
        </section>

        <Link href="/" className="legalBack">← Back to Home</Link>
      </div>
    </main>
  );
}