"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import "./admin.css";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + "/");

  const isDashboardActive = pathname === "/admin";

  return (
    <div className="adminLayout">
      {/* Sidebar */}
      <aside className="adminSidebar">
        <div className="adminBrand">DealDhamaka Admin</div>

        <div className="adminNavSection">
          <span className="adminNavLabel">Core</span>

          <Link
            href="/admin"
            className={isDashboardActive ? "active" : ""}
          >
            Dashboard
          </Link>

          <Link
            href="/admin/stores"
            className={isActive("/admin/stores") ? "active" : ""}
          >
            Stores
          </Link>

          <Link
            href="/admin/coupons"
            className={isActive("/admin/coupons") ? "active" : ""}
          >
            Coupons
          </Link>

          <Link
            href="/admin/cashback"
            className={isActive("/admin/cashback") ? "active" : ""}
          >
            Cashback
          </Link>
        </div>

        <div className="adminNavSection">
          <span className="adminNavLabel">Marketing</span>

          <Link
            href="/admin/banners"
            className={isActive("/admin/banners") ? "active" : ""}
          >
            Banners
          </Link>

          <Link
            href="/admin/featured-offers"
            className={isActive("/admin/featured-offers") ? "active" : ""}
          >
            Featured Offers
          </Link>

          <Link
            href="/admin/home"
            className={isActive("/admin/home") ? "active" : ""}
          >
            Homepage Control
          </Link>
        </div>

        <div className="adminNavSection">
          <span className="adminNavLabel">Analytics</span>

          <Link
            href="/admin/click-logs"
            className={isActive("/admin/click-logs") ? "active" : ""}
          >
            Click Logs
          </Link>

          <Link
            href="/admin/users"
            className={isActive("/admin/users") ? "active" : ""}
          >
            Users
          </Link>

          <Link
            href="/admin/sessions"
            className={isActive("/admin/sessions") ? "active" : ""}
          >
            Recent Sessions
          </Link>

          <Link
            href="/admin/withdrawals"
            className={isActive("/admin/withdrawals") ? "active" : ""}
          >
            Recent Withdrawal Requests
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="adminMain">
        <header className="adminTopbar">
          <div className="adminTopbarLeft">
            <h2>Admin Panel</h2>
          </div>

          <div className="adminTopbarRight">
            <Link href="/" className="adminTopbarLink">
              View Site
            </Link>
          </div>
        </header>

        <main className="adminContent">{children}</main>
      </div>
    </div>
  );
}