import Link from "next/link";

export default function Header() {
  return (
    <header className="headerWrap">
      <div className="headerBox">
        <Link href="/" className="brand">
          DealDhamaka
        </Link>

        <nav className="headerNav">
          <Link href="/">Home</Link>
          <Link href="/stores/flipkart">Stores</Link>
        </nav>

        <div className="headerButtons">
          <button className="ghostBtn">Login</button>
          <button className="primaryBtn">Submit Coupon</button>
        </div>
      </div>
    </header>
  );
}