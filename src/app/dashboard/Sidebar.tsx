"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Home,
  CreditCard,
  MousePointerClick,
  LifeBuoy,
  Settings,
  LogOut,
} from "lucide-react";
import { useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const menu = [
    { name: "Dashboard", icon: Home, path: "/dashboard" },
    { name: "Transactions", icon: CreditCard, path: "/transactions" },
    { name: "orders", icon: MousePointerClick, path: "/orders" },
    { name: "Help Desk", icon: LifeBuoy, path: "/help" },
    { name: "Settings", icon: Settings, path: "/settings" },
  ];

  async function handleLogout() {
    try {
      setLoading(true);

      const res = await fetch("/api/logout", {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Logout failed");
      }

      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      alert("Logout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <aside className="sidebar">
      <h2 className="logo">DealDhamaka</h2>

      <nav className="nav">
        {menu.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.path}
              className={`navItem ${pathname === item.path ? "active" : ""}`}
            >
              <Icon size={18} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="sidebarBottom">
        <div className="sidebarUser">
          <div className="avatar">N</div>

          <div className="userInfo">
            <p className="name">User</p>
            <span className="email">user@email.com</span>

            <button
              type="button"
              className="logoutBtn"
              onClick={handleLogout}
              disabled={loading}
            >
              <LogOut size={14} />
              {loading ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}