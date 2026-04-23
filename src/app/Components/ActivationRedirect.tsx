"use client";

import { useEffect } from "react";

type Props = {
  trackingCode?: string | null;
};

export default function ActivationRedirect({ trackingCode }: Props) {
  useEffect(() => {
    console.log("ActivationRedirect trackingCode:", trackingCode);

    if (!trackingCode) return;

    const timer = window.setTimeout(() => {
      try {
        window.location.assign(`/go/${trackingCode}`);
      } catch (error) {
        console.error("ACTIVATION_REDIRECT_ERROR", error);
      }
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [trackingCode]);

  return null;
}