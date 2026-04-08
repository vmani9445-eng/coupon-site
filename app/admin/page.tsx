import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ImportOffersButton from "./ImportOffersButton";

export default async function AdminDashboardPage() {
  const [storesCount, couponsCount, cashbackCount, submissionsCount] =
    await Promise.all([
      prisma.store.count(),
      prisma.coupon.count(),
      prisma.cashbackOffer.count(),
      prisma.couponSubmission.count(),
    ]);

  return (
    <div className="adminPage">
      <div className="adminPageHeader">
        <div>
          <h1>Admin Dashboard</h1>
          <p>
            Manage stores, coupons, cashback offers, submissions, homepage
            banners, and featured offers.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <ImportOffersButton source="amazon" />
          <ImportOffersButton source="flipkart" />
        </div>
      </div>

      <section className="adminStatsGrid">
        <div className="adminStatCard">
          <span>Total Stores</span>
          <strong>{storesCount}</strong>
        </div>

        <div className="adminStatCard">
          <span>Total Coupons</span>
          <strong>{couponsCount}</strong>
        </div>

        <div className="adminStatCard">
          <span>Total Cashback</span>
          <strong>{cashbackCount}</strong>
        </div>

        <div className="adminStatCard">
          <span>Coupon Submissions</span>
          <strong>{submissionsCount}</strong>
        </div>
      </section>

      <section style={{ marginTop: "30px" }}>
        <h3 style={{ marginBottom: "10px" }}>Quick Actions</h3>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Link href="/admin/stores" className="adminButton">
            Manage Stores
          </Link>

          <Link href="/admin/coupons" className="adminButton">
            Manage Coupons
          </Link>

          <Link href="/admin/cashback" className="adminButton">
            Manage Cashback
          </Link>

          <Link href="/admin/home" className="adminButton">
            Homepage Controls
          </Link>

          <Link href="/admin/banners" className="adminButton">
            Manage Banners
          </Link>

          <Link href="/admin/featured-offers" className="adminButton">
            Featured Offers
          </Link>
        </div>
      </section>
    </div>
  );
}