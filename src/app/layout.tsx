import "./globals.css";
import SessionTracker from "./Components/SessionTracker";
import AuthProvider from "./Components/AuthProvider";
import CookieConsent from "./Components/CookieConsent";
import GoogleAnalyticsLoader from "./Components/GoogleAnalyticsLoader";
import ConditionalNavbar from "./Components/ConditionalNavbar";

import "./Components/CookieConsentStyles.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <GoogleAnalyticsLoader />
          <SessionTracker />
          <ConditionalNavbar />
          {children}
          <CookieConsent />
        </AuthProvider>
      </body>
    </html>
  );
}