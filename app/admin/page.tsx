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
      {/* HEADER */}
      <div className="adminPageHeader">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Manage stores, coupons, cashback offers, and submissions.</p>
        </div>

        {/* 🔥 IMPORT BUTTONS */}
        <div style={{ display: "flex", gap: "10px" }}>
          <ImportOffersButton source="amazon" />
          <ImportOffersButton source="flipkart" />
        </div>
      </div>

      {/* STATS */}
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

      {/* 🔥 QUICK ACTIONS (OPTIONAL BUT POWERFUL) */}
      <section style={{ marginTop: "30px" }}>
        <h3 style={{ marginBottom: "10px" }}>Quick Actions</h3>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <a href="/admin/stores" className="adminButton">
            Manage Stores
          </a>

          <a href="/admin/coupons" className="adminButton">
            Manage Coupons
          </a>

          <a href="/admin/cashback" className="adminButton">
            Manage Cashback
          </a>
        </div>
      </section>
    </div>
  );
}