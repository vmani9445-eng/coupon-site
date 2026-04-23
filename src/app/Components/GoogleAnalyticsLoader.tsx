"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

type ConsentState = {
  essential: true;
  analytics: boolean;
  marketing: boolean;
};

const COOKIE_CONSENT_KEY = "cookie_consent_v1";

function readConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ConsentState;
  } catch {
    return null;
  }
}

export default function GoogleAnalyticsLoader() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    function sync() {
      const consent = readConsent();
      setEnabled(Boolean(consent?.analytics));
    }

    sync();

    window.addEventListener("cookie-consent-updated", sync);

    return () => {
      window.removeEventListener("cookie-consent-updated", sync);
    };
  }, []);

  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  // ❌ Don't load anything without consent
  if (!enabled || !gaId) return null;

  return (
    <>
      {/* ✅ Load GA script */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />

      {/* ✅ Init GA */}
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;

          gtag('consent', 'default', {
            analytics_storage: 'granted',
            ad_storage: 'denied'
          });

          gtag('js', new Date());

          gtag('config', '${gaId}', {
            page_path: window.location.pathname,
            anonymize_ip: true
          });
        `}
      </Script>
    </>
  );
}