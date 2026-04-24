import Link from "next/link";
import "../legal.css";

export default function DisclaimerPage() {
  const brandName = "Cashlio";
  const supportEmail = "support@cashlio.in";

  return (
    <main className="legalPage">
      <div className="legalShell">
        <section className="legalHero">
          <div className="legalBadge">Disclaimer</div>
          <h1>Important cashback and affiliate notice.</h1>
          <p>
            Please read this disclaimer carefully before using coupons, deals,
            cashback links, or merchant redirects on {brandName}.
          </p>
        </section>

        <section className="legalCard">
          <div className="legalSection">
            <h2>1. Affiliate Disclaimer</h2>
            <p>
              {brandName} participates in affiliate programs. We may earn a
              commission when users click our links and purchase from merchant
              websites.
            </p>
          </div>

          <div className="legalSection">
            <h2>2. Cashback Disclaimer</h2>
            <p>
              Cashback depends on successful tracking, merchant validation, and
              affiliate partner approval. We cannot guarantee cashback for every
              transaction.
            </p>
          </div>

          <div className="legalSection">
            <h2>3. Offer Accuracy</h2>
            <p>
              We try to keep coupons, deals, and cashback information accurate.
              However, offers may expire, change, or become unavailable without
              prior notice.
            </p>
          </div>

          <div className="legalSection">
            <h2>4. External Websites</h2>
            <p>
              Our website contains links to third-party merchant websites. We are
              not responsible for their content, products, services, policies, or
              payment process.
            </p>
          </div>

          <div className="legalSection">
            <h2>5. User Responsibility</h2>
            <p>
              Users should verify final prices, coupon terms, shipping charges,
              return policies, and product details directly on the merchant
              website before purchasing.
            </p>
          </div>

          <div className="legalSection">
            <h2>6. Contact</h2>
            <p>
              For questions, email us at <strong>{supportEmail}</strong>.
            </p>
          </div>
        </section>

        <Link href="/" className="legalBack">← Back to Home</Link>
      </div>
    </main>
  );
}