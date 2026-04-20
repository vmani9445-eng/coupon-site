"use client";

import { useEffect, useMemo, useState } from "react";
import "../admin.css";
import "./withdrawals.css";

type Withdrawal = {
  id: string;
  amount: number;
  method: string;
  status: string;
  requestedAt: string;
  adminNotes: string | null;
  upiId?: string | null;
  upiName?: string | null;
  giftCardType?: string | null;
  giftCardEmail?: string | null;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
};

function formatMoney(value: number) {
  return `₹${(value / 100).toFixed(2)}`;
}

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
}

export default function AdminWithdrawalsPage() {
  const [data, setData] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");

  const loadWithdrawals = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/admin/withdrawals", {
        cache: "no-store",
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error || "Failed to load withdrawals");
      }

      setData(Array.isArray(json.withdrawals) ? json.withdrawals : []);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Something went wrong");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWithdrawals();
  }, []);

  const filtered = useMemo(() => {
    return data.filter((w) => {
      const q = search.trim().toLowerCase();

      const matchesSearch =
        !q ||
        (w.user.name || "").toLowerCase().includes(q) ||
        w.user.email.toLowerCase().includes(q) ||
        w.method.toLowerCase().includes(q) ||
        (w.upiId || "").toLowerCase().includes(q) ||
        (w.giftCardEmail || "").toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "ALL" || w.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [data, search, statusFilter]);

  const totalCount = data.length;
  const pendingCount = data.filter((w) => w.status === "PENDING").length;
  const approvedCount = data.filter((w) => w.status === "APPROVED").length;
  const paidCount = data.filter((w) => w.status === "PAID").length;
  const rejectedCount = data.filter((w) => w.status === "REJECTED").length;

  const updateStatus = async (
    id: string,
    status: "APPROVED" | "REJECTED" | "PAID"
  ) => {
    try {
      setSavingId(id);

      const adminNotes =
        status === "APPROVED"
          ? "Approved by admin"
          : status === "PAID"
          ? "Marked paid by admin"
          : "Rejected by admin";

      const res = await fetch(`/api/admin/withdrawals/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          adminNotes,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        alert(json?.error || "Failed to update withdrawal.");
        return;
      }

      await loadWithdrawals();
    } catch (error) {
      console.error(error);
      alert("Something went wrong while updating withdrawal.");
    } finally {
      setSavingId("");
    }
  };

  return (
    <div className="withdrawalsPage">
      <div className="withdrawalsHeader">
        <div>
          <h1>Withdrawal Requests</h1>
          <p>Manage user payout requests, approvals, rejections, and paid status.</p>
        </div>
      </div>

      {error ? <div className="adminErrorBox">{error}</div> : null}

      <div className="withdrawalsStatsGrid">
        <div className="withdrawalsStatCard">
          <span>Total</span>
          <strong>{totalCount}</strong>
        </div>
        <div className="withdrawalsStatCard">
          <span>Pending</span>
          <strong>{pendingCount}</strong>
        </div>
        <div className="withdrawalsStatCard">
          <span>Approved</span>
          <strong>{approvedCount}</strong>
        </div>
        <div className="withdrawalsStatCard">
          <span>Paid / Rejected</span>
          <strong>{paidCount + rejectedCount}</strong>
        </div>
      </div>

      <div className="withdrawalsSection">
        <div className="withdrawalsTopBar">
          <div className="withdrawalsSectionHeader">
            <h2>Recent Withdrawal Requests</h2>
          </div>

          <div className="withdrawalsFilters">
            <input
              className="withdrawalsSearchInput"
              placeholder="Search by user, email, method, UPI..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="withdrawalsSelect"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">PENDING</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
              <option value="PAID">PAID</option>
            </select>
          </div>
        </div>

        <div className="withdrawalsTableWrap">
          <table className="withdrawalsTable">
            <thead>
              <tr>
                <th>User</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Details</th>
                <th>Status</th>
                <th>Requested At</th>
                <th>Notes</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="withdrawalsEmpty">
                    Loading withdrawals...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="withdrawalsEmpty">
                    No withdrawals found.
                  </td>
                </tr>
              ) : (
                filtered.map((w) => (
                  <tr key={w.id}>
                    <td>
                      <div className="withdrawalsUserCell">
                        <strong>{w.user.name || "Unnamed User"}</strong>
                        <span>{w.user.email}</span>
                      </div>
                    </td>

                    <td>{formatMoney(w.amount)}</td>

                    <td>{w.method}</td>

                    <td>
                      <div className="withdrawalsDetailCell">
                        {w.method === "UPI" ? (
                          <>
                            <strong>{w.upiId || "-"}</strong>
                            <span>{w.upiName || "-"}</span>
                          </>
                        ) : w.method === "GIFT_CARD" ? (
                          <>
                            <strong>{w.giftCardType || "-"}</strong>
                            <span>{w.giftCardEmail || "-"}</span>
                          </>
                        ) : (
                          <span>-</span>
                        )}
                      </div>
                    </td>

                    <td>
                      <span
                        className={`withdrawalsStatus withdrawalsStatus${w.status}`}
                      >
                        {w.status}
                      </span>
                    </td>

                    <td>{formatDateTime(w.requestedAt)}</td>

                    <td className="withdrawalsNotesCell">
                      {w.adminNotes || "-"}
                    </td>

                    <td>
                      {w.status === "PENDING" ? (
                        <div className="withdrawalsActionGroup">
                          <button
                            className="withdrawalsApproveBtn"
                            disabled={savingId === w.id}
                            onClick={() => updateStatus(w.id, "APPROVED")}
                          >
                            {savingId === w.id ? "Saving..." : "Approve"}
                          </button>

                          <button
                            className="withdrawalsRejectBtn"
                            disabled={savingId === w.id}
                            onClick={() => updateStatus(w.id, "REJECTED")}
                          >
                            {savingId === w.id ? "Saving..." : "Reject"}
                          </button>
                        </div>
                      ) : w.status === "APPROVED" ? (
                        <div className="withdrawalsActionGroup">
                          <button
                            className="withdrawalsPaidBtn"
                            disabled={savingId === w.id}
                            onClick={() => updateStatus(w.id, "PAID")}
                          >
                            {savingId === w.id ? "Saving..." : "Mark Paid"}
                          </button>
                        </div>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}