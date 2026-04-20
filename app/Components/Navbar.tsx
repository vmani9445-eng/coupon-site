"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Search, Menu, X, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import "./navbar.css";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [search, setSearch] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    router.push(`/stores?search=${encodeURIComponent(search.trim())}`);
    setMenuOpen(false);
  };

  const getUserInitial = () => {
    const name = session?.user?.name?.trim();
    const email = session?.user?.email?.trim();

    if (name) return name.charAt(0).toUpperCase();
    if (email) return email.charAt(0).toUpperCase();
    return "U";
  };

  const closeMenus = () => {
    setMenuOpen(false);
    setProfileOpen(false);
  };

  return (
    <header className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="navInner">
        <Link href="/" className="logo" onClick={closeMenus}>
          Cashlio
        </Link>

        <nav className="menu">
          <Link href="/" className={isActive("/") ? "active" : ""}>
            Home
          </Link>
          <Link href="/stores" className={isActive("/stores") ? "active" : ""}>
            Stores
          </Link>
          <Link
            href="/categories"
            className={isActive("/categories") ? "active" : ""}
          >
            Categories
          </Link>
          <Link
            href="/top-deals"
            className={isActive("/top-deals") ? "active" : ""}
          >
            Top Deals
          </Link>
          <Link
            href="/todays-offers"
            className={isActive("/todays-offers") ? "active" : ""}
          >
            Today’s Offers
          </Link>
        </nav>

        <div className="right">
          <form onSubmit={handleSearch} className="search">
            <Search size={16} />
            <input
              placeholder="Search deals..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>

          {status === "loading" ? (
            <div className="profileSkeleton" />
          ) : session?.user ? (
            <div className="profileWrap" ref={profileRef}>
              <button
                type="button"
                className="profileBtn"
                onClick={() => setProfileOpen((prev) => !prev)}
                aria-label="Open profile menu"
              >
                {session.user.image ? (
                 <img
  src={session.user.image}
  alt={session.user.name || "Profile"}
  width={36}
  height={36}
  className="profileAvatarImg"
/>
                ) : (
                  <span className="profileAvatarFallback">
                    {getUserInitial()}
                  </span>
                )}
                <ChevronDown size={16} className="profileChevron" />
              </button>

              {profileOpen && (
                <div className="profileDropdown">
                  <Link
                    href="/account"
                    className="profileItem"
                    onClick={() => setProfileOpen(false)}
                  >
                    Manage account
                  </Link>

                  <Link
                    href="/dashboard"
                    className="profileItem"
                    onClick={() => setProfileOpen(false)}
                  >
                    Check cashback
                  </Link>

                  <button
                    type="button"
                    className="profileItem logoutItem"
                    onClick={() => {
                      setProfileOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="loginBtn">
              Login
            </Link>
          )}

          <button
            className="menuBtn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Open menu"
            type="button"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="mobileMenu">
          <Link href="/" onClick={() => setMenuOpen(false)}>
            Home
          </Link>
          <Link href="/stores" onClick={() => setMenuOpen(false)}>
            Stores
          </Link>
          <Link href="/categories" onClick={() => setMenuOpen(false)}>
            Categories
          </Link>
          <Link href="/top-deals" onClick={() => setMenuOpen(false)}>
            Top Deals
          </Link>
          <Link href="/todays-offers" onClick={() => setMenuOpen(false)}>
            Today’s Offers
          </Link>

          {!session?.user ? (
            <Link href="/login" onClick={() => setMenuOpen(false)}>
              Login
            </Link>
          ) : (
            <>
              <Link href="/account" onClick={() => setMenuOpen(false)}>
                Manage account
              </Link>
              <Link href="/dashboard" onClick={() => setMenuOpen(false)}>
                Check cashback
              </Link>
              <button
                type="button"
                className="mobileLogoutBtn"
                onClick={() => {
                  setMenuOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
}