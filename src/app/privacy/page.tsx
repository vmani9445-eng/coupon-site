import Link from "next/link";
import "../legal.css";

export default function PrivacyPolicyPage() {
  const brandName = "Cashlio";
  const supportEmail = "support@cashlio.in";

  return (
    <main className="legalPage">
      <div className="legalShell">
        <section className="legalHero">
          <div className="legalBadge">Privacy Policy</div>
          <h1>Your privacy matters to us.</h1>
          <p>
            This Privacy Policy explains how {brandName} collects, uses, and
            protects your information when you use our coupon and cashback
            platform.
          </p>
        </section>

        <section className="legalCard">
          <div className="legalSection">
            <h2>1. Information We Collect</h2>
            <p>We may collect your name, email address, login details, cashback activity, click data, device information, and transaction tracking details.</p>
          </div>

          <div className="legalSection">
            <h2>2. How We Use Your Information</h2>
            <ul>
              <li>To create and manage your account</li>
              <li>To track cashback and affiliate transactions</li>
              <li>To improve website performance and user experience</li>
              <li>To prevent fraud, misuse, and suspicious activity</li>
              <li>To send important service updates</li>
            </ul>
          </div>

          <div className="legalSection">
            <h2>3. Cookies & Tracking</h2>
            <p>
              We use cookies and tracking technologies to record affiliate clicks,
              improve recommendations, and help cashback tracking work correctly.
            </p>
          </div>

          <div className="legalSection">
            <h2>4. Affiliate Partners</h2>
            <p>
              We may work with affiliate networks and merchants such as Admitad,
              Cuelinks, or similar partners. These partners may use tracking links
              to confirm purchases and cashback eligibility.
            </p>
          </div>

          <div className="legalSection">
            <h2>5. Data Sharing</h2>
            <p>
              We do not sell your personal data. We may share limited information
              with trusted partners only when required for cashback tracking,
              fraud prevention, analytics, or legal compliance.
            </p>
          </div>

          <div className="legalSection">
            <h2>6. Data Security</h2>
            <p>
              We use reasonable security practices to protect your information.
              However, no online platform can guarantee 100% security.
            </p>
          </div>

          <div className="legalSection">
            <h2>7. Your Rights</h2>
            <p>
              You may request access, correction, or deletion of your account data
              by contacting us at {supportEmail}.
            </p>
          </div>

          <div className="legalSection">
            <h2>8. Contact Us</h2>
            <p>
              For privacy-related questions, email us at <strong>{supportEmail}</strong>.
            </p>
          </div>
        </section>

        <Link href="/" className="legalBack">← Back to Home</Link>
      </div>
    </main>
  );
}