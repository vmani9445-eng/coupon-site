"use client";

export default function Footer() {
  function openCookieSettings() {
    window.dispatchEvent(new Event("open-cookie-preferences"));
  }

  return (
    <footer style={{ padding: "20px", textAlign: "center" }}>
      <button onClick={openCookieSettings}>
        Manage Cookies
      </button>
    </footer>
  );
}