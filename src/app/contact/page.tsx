import Link from "next/link";
import "../legal.css";

export default function ContactPage() {
  const brandName = "Cashlio";
  const supportEmail = "support@cashlio.in";

  return (
    <main className="legalPage">
      <div className="legalShell">
        <section className="legalHero">
          <div className="legalBadge">Contact Us</div>
          <h1>Need help with coupons or cashback?</h1>
          <p>
            Contact the {brandName} team for cashback support, offer issues,
            partnership queries, or general questions.
          </p>
        </section>

        <section className="legalCard">
          <div className="legalSection">
            <h2>Get in Touch</h2>
            <p>
              For support, cashback questions, missing transactions, or business
              inquiries, please contact us using the details below.
            </p>

            <div className="legalContactGrid">
              <div className="legalContactBox">
                <span>Email</span>
                <strong>{supportEmail}</strong>
                <p>For support and cashback-related queries.</p>
              </div>

              <div className="legalContactBox">
                <span>Support Hours</span>
                <strong>Mon – Fri, 10 AM – 6 PM</strong>
                <p>We usually reply as soon as possible.</p>
              </div>

              <div className="legalContactBox">
                <span>Location</span>
                <strong>India</strong>
                <p>Serving online shoppers across India.</p>
              </div>

              <div className="legalContactBox">
                <span>Business Queries</span>
                <strong>Affiliate / Brand Partnerships</strong>
                <p>Email us with the subject “Business Inquiry”.</p>
              </div>
            </div>
          </div>

          <div className="legalSection">
            <h2>Before Contacting</h2>
            <ul>
              <li>For cashback issues, include your registered email.</li>
              <li>For missing cashback, share store name and purchase date.</li>
              <li>For business queries, mention your company or brand name.</li>
            </ul>
          </div>

          <div className="legalSection">
            <h2>Important Note</h2>
            <p>
              Cashback approval depends on merchant confirmation and may take
              time. Please wait for the tracking and validation period before
              raising duplicate requests.
            </p>
          </div>
        </section>

        <Link href="/" className="legalBack">← Back to Home</Link>
      </div>
    </main>
  );
}