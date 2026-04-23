"use client";

import { useEffect, useState } from "react";
import Sidebar from "../dashboard/Sidebar"; // 👈 ADD THIS
import "../dashboard/dashboard.css";
export default function SettingsPage() {
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [upiId, setUpiId] = useState("");
  const [upiName, setUpiName] = useState("");

  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [giftPref, setGiftPref] = useState("Amazon");

  const [saving, setSaving] = useState("");

  // LOAD USER DATA
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/user", {
          credentials: "include",
        });

        const data = await res.json();

        setName(data?.name || "");
        setEmail(data?.email || "");
        setUpiId(data?.upiId || "");
        setUpiName(data?.upiName || "");
        setGiftPref(data?.giftCardPreference || "Amazon");
      } catch (err) {
        console.error("Load error", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // COMMON FETCH
  const postData = async (url: string, body: any, type: string) => {
    try {
      setSaving(type);

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Error");

      alert("Saved successfully ✅");
    } catch (err: any) {
      alert(err.message || "Something went wrong ❌");
    } finally {
      setSaving("");
    }
  };

  if (loading) return <div className="loader">Loading...</div>;

  return (
    <div className="layout"> {/* 👈 WRAPPER */}

      <Sidebar /> {/* 👈 SIDEBAR */}

      <div className="main"> {/* 👈 MAIN CONTENT */}

        <div className="settingsContainer">

          {/* HEADER */}
          <div className="settingsHeader">
            <h1>Settings</h1>
            <p>Manage your account details and preferences</p>
          </div>

          {/* PROFILE */}
          <div className="settingsCard">
            <h3>👤 Profile</h3>

            <div className="inputGroup">
              <label>Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>

            <div className="inputGroup">
              <label>Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>

            <button
              className="btnPrimary"
              disabled={saving === "profile"}
              onClick={() =>
                postData("/api/user/update-profile", { name, email }, "profile")
              }
            >
              {saving === "profile" ? "Saving..." : "Save Changes"}
            </button>
          </div>

          {/* UPI */}
          <div className="settingsCard">
            <h3>💳 UPI Details</h3>

            <div className="inputGroup">
              <label>UPI ID</label>
              <input
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="example@upi"
              />
            </div>

            <div className="inputGroup">
              <label>UPI Name</label>
              <input
                value={upiName}
                onChange={(e) => setUpiName(e.target.value)}
                placeholder="Account holder name"
              />
            </div>

            <button
              className="btnPrimary"
              disabled={saving === "upi"}
              onClick={() =>
                postData("/api/user/update-upi", { upiId, upiName }, "upi")
              }
            >
              {saving === "upi" ? "Saving..." : "Save UPI"}
            </button>
          </div>

          {/* PASSWORD */}
          <div className="settingsCard">
            <h3>🔐 Security</h3>

            <div className="inputGroup">
              <label>Current Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="inputGroup">
              <label>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <button
              className="btnPrimary"
              disabled={saving === "password"}
              onClick={() =>
                postData(
                  "/api/user/change-password",
                  { password, newPassword },
                  "password"
                )
              }
            >
              {saving === "password" ? "Updating..." : "Update Password"}
            </button>
          </div>

          {/* PREFERENCE */}
          <div className="settingsCard">
            <h3>🎁 Withdraw Preference</h3>

            <div className="inputGroup">
              <label>Select Preferred Method</label>
              <select
                value={giftPref}
                onChange={(e) => setGiftPref(e.target.value)}
              >
                <option>Amazon</option>
                <option>Flipkart</option>
                <option>Myntra</option>
              </select>
            </div>

            <button
              className="btnPrimary"
              disabled={saving === "pref"}
              onClick={() =>
                postData("/api/user/update-preference", { giftPref }, "pref")
              }
            >
              {saving === "pref" ? "Saving..." : "Save Preference"}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}