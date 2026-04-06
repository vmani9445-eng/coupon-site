import Link from "next/link";
import "./admin.css";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="adminLayout">
      <aside className="adminSidebar">
        <div className="adminBrand">Coupon Admin</div>

        <nav className="adminNav">
          <Link href="/admin">Dashboard</Link>
          <Link href="/admin/stores">Stores</Link>
          <Link href="/admin/coupons">Coupons</Link>
          <Link href="/admin/cashback">Cashback</Link>
        </nav>
      </aside>

      <section className="adminContent">{children}</section>
    </div>
  );
}