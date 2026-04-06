import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const [storesCount, couponsCount, cashbackCount] = await Promise.all([
    prisma.store.count(),
    prisma.coupon.count(),
    prisma.cashbackOffer.count(),
  ]);

  return (
    <main className="adminPage">
      <div className="adminPageHeader">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Manage stores, coupons, and cashback offers.</p>
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
          <span>Total Cashback Offers</span>
          <strong>{cashbackCount}</strong>
        </div>
      </section>
    </main>
  );
}