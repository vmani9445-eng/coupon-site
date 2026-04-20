"use client";

import { useEffect } from "react";

function getSessionKey() {
  const storageKey = "dd_session_key";
  const existing = window.localStorage.getItem(storageKey);
  if (existing) return existing;

  const created =
    crypto.randomUUID?.() ||
    `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  window.localStorage.setItem(storageKey, created);
  return created;
}

export default function SessionTracker({
  email,
}: {
  email?: string | null;
}) {
  useEffect(() => {
    const sessionKey = getSessionKey();

    fetch("/api/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sessionKey,
        email: email || null,
      }),
    }).catch(() => {});
  }, [email]);

  return null;
}