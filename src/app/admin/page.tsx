import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ImportOffersButton from "./ImportOffersButton";

function formatDayLabel(date: Date) {
  return date.toLocaleDateString("en-IN", { weekday: "short" });
}

function buildLinePath(
  values: number[],
  width = 320,
  height = 120,
  padding = 16
) {
  if (values.length === 0) return "";

  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = Math.max(max - min, 1);

  return values
    .map((value, index) => {
      const x =
        padding +
        (index * (width - padding * 2)) / Math.max(values.length - 1, 1);
      const y =
        height -
        padding -
        ((value - min) / range) * (height - padding * 2);

      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

function formatMoney(amount?: number | null) {
  return `₹${((amount || 0) / 100).toFixed(2)}`;
}

export default async function AdminDashboardPage() {
  const now = new Date();

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const startOf7Days = new Date(now);
  startOf7Days.setDate(startOf7Days.getDate() - 6);
  startOf7Days.setHours(0, 0, 0, 0);

  const [
    storesCount,
    couponsCount,
    cashbackOffersCount,
    submissionsCount,
    bannersCount,
    usersCount,
    walletsCount,
    allRecentClicks,
    clicksToday,
    clicksLast7Days,
    groupedStoreClicks,
    groupedBannerClicks,
    cashbackTransactionsCount,
    pendingCashbackCount,
    confirmedCashbackCount,
    rejectedCashbackCount,
    paidCashbackCount,
    walletTotals,
    recentCashbackTransactions,
  ] = await Promise.all([
    prisma.store.count(),
    prisma.coupon.count(),
    prisma.cashbackOffer.count(),
    prisma.couponSubmission.count(),
    prisma.promoBanner.count(),
    prisma.user.count(),
    prisma.wallet.count(),
    prisma.clickLog.findMany({
      where: {
        createdAt: {
          gte: startOf7Days,
        },
      },
      select: {
        id: true,
        createdAt: true,
        storeSlug: true,
        bannerId: true,
        clickType: true,
        targetUrl: true,
        userEmail: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.clickLog.count({
      where: {
        createdAt: {
          gte: startOfToday,
        },
      },
    }),
    prisma.clickLog.count({
      where: {
        createdAt: {
          gte: startOf7Days,
        },
      },
    }),
    prisma.clickLog.groupBy({
      by: ["storeSlug"],
      where: {
        createdAt: {
          gte: startOf7Days,
        },
        storeSlug: {
          not: null,
        },
      },
      _count: {
        storeSlug: true,
      },
      orderBy: {
        _count: {
          storeSlug: "desc",
        },
      },
      take: 5,
    }),
    prisma.clickLog.groupBy({
      by: ["bannerId"],
      where: {
        createdAt: {
          gte: startOf7Days,
        },
        bannerId: {
          not: null,
        },
      },
      _count: {
        bannerId: true,
      },
      orderBy: {
        _count: {
          bannerId: "desc",
        },
      },
      take: 5,
    }),
    prisma.cashbackTransaction.count(),
    prisma.cashbackTransaction.count({
      where: { status: "PENDING" },
    }),
    prisma.cashbackTransaction.count({
      where: { status: "CONFIRMED" },
    }),
    prisma.cashbackTransaction.count({
      where: { status: "REJECTED" },
    }),
    prisma.cashbackTransaction.count({
      where: { status: "PAID" },
    }),
    prisma.wallet.aggregate({
      _sum: {
        pendingBalance: true,
        confirmedBalance: true,
        availableBalance: true,
        lifetimeEarned: true,
      },
    }),
    prisma.cashbackTransaction.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        store: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        trackedAt: "desc",
      },
      take: 8,
    }),
  ]);

  const bannerIds = groupedBannerClicks
    .map((item) => item.bannerId)
    .filter((id): id is string => Boolean(id));

  const banners = bannerIds.length
    ? await prisma.promoBanner.findMany({
        where: {
          id: {
            in: bannerIds,
          },
        },
        select: {
          id: true,
          placement: true,
          bannerType: true,
          imageUrl: true,
          ctaText: true,
        },
      })
    : [];

  const bannerMap = new Map(banners.map((banner) => [banner.id, banner]));

  const dailySeries = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(startOf7Days);
    day.setDate(startOf7Days.getDate() + index);

    const nextDay = new Date(day);
    nextDay.setDate(day.getDate() + 1);

    const total = allRecentClicks.filter(
      (click) => click.createdAt >= day && click.createdAt < nextDay
    ).length;

    return {
      label: formatDayLabel(day),
      value: total,
    };
  });

  const linePath = buildLinePath(
    dailySeries.map((item) => item.value),
    320,
    120,
    18
  );

  const topStores = groupedStoreClicks.map((item) => ({
    storeSlug: item.storeSlug || "Unknown",
    clicks: item._count.storeSlug,
  }));

  const topBanners = groupedBannerClicks.map((item) => {
    const banner = item.bannerId ? bannerMap.get(item.bannerId) : null;

    return {
      id: item.bannerId || "unknown",
      placement: banner?.placement || "Unknown placement",
      type: banner?.bannerType || "Unknown",
      ctaText: banner?.ctaText || "No CTA",
      imageUrl: banner?.imageUrl || "",
      clicks: item._count.bannerId,
    };
  });

  const recentClicks = allRecentClicks.slice(0, 8);

  const totalPendingBalance = walletTotals._sum.pendingBalance || 0;
  const totalConfirmedBalance = walletTotals._sum.confirmedBalance || 0;
  const totalAvailableBalance = walletTotals._sum.availableBalance || 0;
  const totalLifetimeEarned = walletTotals._sum.lifetimeEarned || 0;

  return (
    <div className="adminPage">
      <div className="adminPageHeader">
        <div>
          <h1>Admin Dashboard</h1>
          <p>
            Manage stores, coupons, cashback, banners, users, and platform
            analytics.
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
          <span>Cashback Offers</span>
          <strong>{cashbackOffersCount}</strong>
        </div>

        <div className="adminStatCard">
          <span>Coupon Submissions</span>
          <strong>{submissionsCount}</strong>
        </div>

        <div className="adminStatCard">
          <span>Total Banners</span>
          <strong>{bannersCount}</strong>
        </div>

        <div className="adminStatCard">
          <span>Total Users</span>
          <strong>{usersCount}</strong>
        </div>

        <div className="adminStatCard">
          <span>Wallets</span>
          <strong>{walletsCount}</strong>
        </div>

        <div className="adminStatCard">
          <span>Clicks Today</span>
          <strong>{clicksToday}</strong>
        </div>

        <div className="adminStatCard">
          <span>Clicks Last 7 Days</span>
          <strong>{clicksLast7Days}</strong>
        </div>

        <div className="adminStatCard">
          <span>Total Cashback Txns</span>
          <strong>{cashbackTransactionsCount}</strong>
        </div>

        <div className="adminStatCard">
          <span>Pending Cashback</span>
          <strong>{pendingCashbackCount}</strong>
        </div>

        <div className="adminStatCard">
          <span>Confirmed Cashback</span>
          <strong>{confirmedCashbackCount}</strong>
        </div>

        <div className="adminStatCard">
          <span>Rejected Cashback</span>
          <strong>{rejectedCashbackCount}</strong>
        </div>

        <div className="adminStatCard">
          <span>Paid Cashback</span>
          <strong>{paidCashbackCount}</strong>
        </div>

        <div className="adminStatCard">
          <span>Total Pending Wallet</span>
          <strong>{formatMoney(totalPendingBalance)}</strong>
        </div>

        <div className="adminStatCard">
          <span>Total Confirmed Wallet</span>
          <strong>{formatMoney(totalConfirmedBalance)}</strong>
        </div>

        <div className="adminStatCard">
          <span>Total Available Wallet</span>
          <strong>{formatMoney(totalAvailableBalance)}</strong>
        </div>

        <div className="adminStatCard">
          <span>Lifetime Earned</span>
          <strong>{formatMoney(totalLifetimeEarned)}</strong>
        </div>
      </section>

      <section
        className="adminTableCard"
        style={{ marginTop: "24px", padding: "20px" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "16px",
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h3 style={{ margin: 0 }}>Clicks Trend</h3>
            <p style={{ margin: "6px 0 0", color: "#6b7280" }}>
              Last 7 days click activity
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              color: "#6b7280",
              fontSize: "13px",
            }}
          >
            {dailySeries.map((item) => (
              <span key={item.label}>
                {item.label}:{" "}
                <strong style={{ color: "#171c2a" }}>{item.value}</strong>
              </span>
            ))}
          </div>
        </div>

        <div
          style={{
            marginTop: "18px",
            borderRadius: "18px",
            border: "1px solid #e8ebf2",
            background: "#fff",
            padding: "16px",
          }}
        >
          <svg viewBox="0 0 320 120" width="100%" height="140" preserveAspectRatio="none">
            <path
              d={linePath}
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              style={{ color: "#2d58d6" }}
            />
            {dailySeries.map((item, index) => {
              const values = dailySeries.map((d) => d.value);
              const max = Math.max(...values, 1);
              const min = Math.min(...values, 0);
              const range = Math.max(max - min, 1);
              const x = 18 + (index * (320 - 36)) / Math.max(dailySeries.length - 1, 1);
              const y = 120 - 18 - ((item.value - min) / range) * (120 - 36);

              return (
                <g key={item.label}>
                  <circle cx={x} cy={y} r="4" fill="#2d58d6" />
                  <text
                    x={x}
                    y={116}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#7b8190"
                  >
                    {item.label}
                  </text>
                </g>
              );
            })}
          </svg>
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

          <Link href="/admin/click-logs" className="adminButton">
            Click Logs
          </Link>

          <Link href="/admin/withdrawals" className="adminButton">
            Withdrawals
          </Link>

          <Link href="/admin/users" className="adminButton">
            Users
          </Link>

          <Link href="/admin/import" className="adminButton">
            Import Orders
          </Link>

          <Link href="/admin/home" className="adminButton">
            Homepage Controls
          </Link>

          <Link href="/admin/banners" className="adminButton">
            Manage Banners
          </Link>
        </div>
      </section>

      <section
        style={{
          marginTop: "30px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "20px",
        }}
      >
        <div className="adminTableCard" style={{ padding: "20px" }}>
          <h3 style={{ marginTop: 0, marginBottom: "14px" }}>
            Top Stores by Clicks
          </h3>

          {topStores.length > 0 ? (
            <div className="adminTableWrap">
              <table className="adminTable">
                <thead>
                  <tr>
                    <th>Store</th>
                    <th>Clicks</th>
                  </tr>
                </thead>
                <tbody>
                  {topStores.map((store) => (
                    <tr key={store.storeSlug}>
                      <td>{store.storeSlug}</td>
                      <td>{store.clicks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: "#6b7280", margin: 0 }}>
              No store click data yet.
            </p>
          )}
        </div>

        <div className="adminTableCard" style={{ padding: "20px" }}>
          <h3 style={{ marginTop: 0, marginBottom: "14px" }}>Top Banners</h3>

          {topBanners.length > 0 ? (
            <div
              style={{
                display: "grid",
                gap: "12px",
              }}
            >
              {topBanners.map((banner) => (
                <div
                  key={banner.id}
                  style={{
                    display: "flex",
                    gap: "12px",
                    alignItems: "center",
                    border: "1px solid #e8ebf2",
                    borderRadius: "16px",
                    padding: "12px",
                    background: "#fff",
                  }}
                >
                  <div
                    style={{
                      width: "96px",
                      height: "56px",
                      borderRadius: "12px",
                      overflow: "hidden",
                      background: "#f5f7fb",
                      flexShrink: 0,
                    }}
                  >
                    {banner.imageUrl ? (
                      <img
                        src={banner.imageUrl}
                        alt={banner.ctaText}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    ) : null}
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 600,
                        color: "#171c2a",
                        marginBottom: "4px",
                      }}
                    >
                      {banner.placement}
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        color: "#6b7280",
                        marginBottom: "4px",
                      }}
                    >
                      {banner.type} • {banner.ctaText}
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        color: "#2d58d6",
                        fontWeight: 600,
                      }}
                    >
                      {banner.clicks} clicks
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "#6b7280", margin: 0 }}>
              No banner click data yet.
            </p>
          )}
        </div>
      </section>

      <section
        className="adminTableCard"
        style={{ marginTop: "30px", padding: "20px" }}
      >
        <h3 style={{ marginTop: 0, marginBottom: "14px" }}>Recent Cashback</h3>

        <div className="adminTableWrap">
          <table className="adminTable">
            <thead>
              <tr>
                <th>User</th>
                <th>Store</th>
                <th>Order ID</th>
                <th>Tracking</th>
                <th>Cashback</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {recentCashbackTransactions.length > 0 ? (
                recentCashbackTransactions.map((txn) => (
                  <tr key={txn.id}>
                    <td>{txn.user?.email || txn.user?.name || "-"}</td>
                    <td>{txn.store?.name || "-"}</td>
                    <td>{txn.externalOrderId || "-"}</td>
                    <td>{txn.externalTrackingId || "-"}</td>
                    <td>{formatMoney(txn.cashbackAmount)}</td>
                    <td>{txn.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6}>No cashback transactions yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section
        className="adminTableCard"
        style={{ marginTop: "30px", padding: "20px" }}
      >
        <h3 style={{ marginTop: 0, marginBottom: "14px" }}>Recent Activity</h3>

        <div className="adminTableWrap">
          <table className="adminTable">
            <thead>
              <tr>
                <th>Type</th>
                <th>User</th>
                <th>Store</th>
                <th>Target URL</th>
                <th>Date & Time</th>
              </tr>
            </thead>

            <tbody>
              {recentClicks.length > 0 ? (
                recentClicks.map((log) => (
                  <tr key={log.id}>
                    <td>{log.clickType}</td>
                    <td>{log.userEmail || "Anonymous"}</td>
                    <td>{log.storeSlug || "-"}</td>
                    <td
                      style={{
                        maxWidth: "320px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {log.targetUrl}
                    </td>
                    <td>
                      {new Date(log.createdAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5}>No click activity found yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}