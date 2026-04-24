import "./globals.css";
import SessionTracker from "./Components/SessionTracker";
import AuthProvider from "./Components/AuthProvider";
import CookieConsent from "./Components/CookieConsent";
import GoogleAnalyticsLoader from "./Components/GoogleAnalyticsLoader";
import ConditionalNavbar from "./Components/ConditionalNavbar";
import Footer from "./Components/Footer";

import "./Components/CookieConsentStyles.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* 🔴 Paste your Admitad meta tag here */}
<meta name="verify-admitad" content="4d7b22a8e9" />
      </head>

      <body className="layoutBody">
        <AuthProvider>
          <GoogleAnalyticsLoader />
          <SessionTracker />

          <ConditionalNavbar />

          <main className="layoutMain">{children}</main>

          <Footer />

          <CookieConsent />
        </AuthProvider>
      </body>
    </html>
  );
}