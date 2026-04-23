"use client";

import { useEffect, useState } from "react";
import {
  getDefaultConsent,
  readConsent,
  writeConsent,
  type ConsentState,
} from "@/lib/cookieConsent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [consent, setConsent] = useState<ConsentState>(getDefaultConsent());

  useEffect(() => {
    const existing = readConsent();

    if (!existing) {
      setVisible(true);
      setConsent(getDefaultConsent());
      return;
    }

    setConsent(existing);
    setVisible(false);
  }, []);

  useEffect(() => {
    function openManager() {
      const existing = readConsent();
      setConsent(existing || getDefaultConsent());
      setVisible(true);
      setManageOpen(true);
    }

    window.addEventListener("open-cookie-preferences", openManager);
    return () => {
      window.removeEventListener("open-cookie-preferences", openManager);
    };
  }, []);

  function acceptAll() {
    const next = {
      essential: true as const,
      analytics: true,
      marketing: true,
    };

    writeConsent(next);
    setConsent(next);
    setVisible(false);
    setManageOpen(false);
  }

  function rejectOptional() {
    const next = {
      essential: true as const,
      analytics: false,
      marketing: false,
    };

    writeConsent(next);
    setConsent(next);
    setVisible(false);
    setManageOpen(false);
  }

  function savePreferences() {
    const next = {
      essential: true as const,
      analytics: consent.analytics,
      marketing: consent.marketing,
    };

    writeConsent(next);
    setConsent(next);
    setVisible(false);
    setManageOpen(false);
  }

  if (!visible) return null;

  return (
    <div className="cookieOverlay">
      <div className="cookieCard">
        <h3>Cookies & Privacy</h3>
        <p>
          We use essential cookies to keep login and cashback tracking working.
          With your permission, we also use analytics and marketing cookies to
          improve performance and measure affiliate campaigns.
        </p>

        {manageOpen && (
          <div className="cookieOptions">
            <label className="cookieOption">
              <div>
                <strong>Essential</strong>
                <p>Required for login, security, and cashback flow.</p>
              </div>
              <input type="checkbox" checked readOnly />
            </label>

            <label className="cookieOption">
              <div>
                <strong>Analytics</strong>
                <p>Helps us understand traffic and improve the website.</p>
              </div>
              <input
                type="checkbox"
                checked={consent.analytics}
                onChange={(e) =>
                  setConsent((prev) => ({
                    ...prev,
                    analytics: e.target.checked,
                  }))
                }
              />
            </label>

            <label className="cookieOption">
              <div>
                <strong>Marketing</strong>
                <p>Allows optional affiliate and campaign measurement.</p>
              </div>
              <input
                type="checkbox"
                checked={consent.marketing}
                onChange={(e) =>
                  setConsent((prev) => ({
                    ...prev,
                    marketing: e.target.checked,
                  }))
                }
              />
            </label>
          </div>
        )}

        <div className="cookieActions">
          <button className="cookieBtn secondary" onClick={rejectOptional}>
            Reject Optional
          </button>

          {!manageOpen ? (
            <button
              className="cookieBtn light"
              onClick={() => setManageOpen(true)}
            >
              Manage
            </button>
          ) : (
            <button className="cookieBtn light" onClick={savePreferences}>
              Save
            </button>
          )}

          <button className="cookieBtn primary" onClick={acceptAll}>
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}