"use client";

import { useState } from "react";

export default function AdminChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Failed to change password");
        return;
      }

      setSuccess(data?.message || "Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={wrap}>
      <div style={card}>
        <h1 style={title}>Change Admin Password</h1>
        <p style={sub}>
          Update your admin login password securely.
        </p>

        <form onSubmit={handleSubmit} style={form}>
          <div style={field}>
            <label style={label}>Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              style={input}
              placeholder="Enter current password"
            />
          </div>

          <div style={field}>
            <label style={label}>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={input}
              placeholder="Enter new password"
            />
          </div>

          <div style={field}>
            <label style={label}>Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={input}
              placeholder="Confirm new password"
            />
          </div>

          {error ? <div style={errorBox}>{error}</div> : null}
          {success ? <div style={successBox}>{success}</div> : null}

          <button type="submit" style={button} disabled={loading}>
            {loading ? "Updating..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

const wrap: React.CSSProperties = {
  minHeight: "100vh",
  background: "#f8fafc",
  padding: "24px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const card: React.CSSProperties = {
  width: "100%",
  maxWidth: "460px",
  background: "#ffffff",
  borderRadius: "16px",
  padding: "24px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  border: "1px solid #e5e7eb",
};

const title: React.CSSProperties = {
  margin: 0,
  fontSize: "28px",
  fontWeight: 700,
  color: "#111827",
};

const sub: React.CSSProperties = {
  marginTop: "8px",
  marginBottom: "20px",
  color: "#6b7280",
  fontSize: "14px",
};

const form: React.CSSProperties = {
  display: "grid",
  gap: "16px",
};

const field: React.CSSProperties = {
  display: "grid",
  gap: "8px",
};

const label: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: 600,
  color: "#374151",
};

const input: React.CSSProperties = {
  height: "46px",
  borderRadius: "12px",
  border: "1px solid #d1d5db",
  padding: "0 14px",
  fontSize: "14px",
  outline: "none",
};

const button: React.CSSProperties = {
  height: "48px",
  border: "none",
  borderRadius: "12px",
  background: "#111827",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: 700,
  cursor: "pointer",
};

const errorBox: React.CSSProperties = {
  background: "#fef2f2",
  color: "#b91c1c",
  border: "1px solid #fecaca",
  padding: "12px 14px",
  borderRadius: "12px",
  fontSize: "14px",
};

const successBox: React.CSSProperties = {
  background: "#ecfdf5",
  color: "#047857",
  border: "1px solid #a7f3d0",
  padding: "12px 14px",
  borderRadius: "12px",
  fontSize: "14px",
};