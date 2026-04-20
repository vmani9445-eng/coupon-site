"use client";

import { useEffect, useMemo, useState } from "react";
import "../admin.css";
import "./cashback.css";

type Transaction = {
  id: string;
  title?: string | null;
  discount?: string | null;
  source?: string | null;
  externalOrderId?: string | null;
  externalTrackingId?: string | null;
  cashbackAmount?: number | null;
  orderAmount?: number | null;
  commissionAmount?: number | null;
  platformMarginAmount?: number | null;
  status?: string | null;
  rawStatus?: string | null;
  trackedAt?: string | null;
  purchaseAt?: string | null;
  confirmedAt?: string | null;
  rejectedAt?: string | null;
  payableAt?: string | null;
  paidAt?: string | null;
  rejectionReason?: string | null;
  adminNotes?: string | null;
  user?: {
    id?: string | null;
    email?: string | null;
    name?: string | null;
  } | null;
  store?: {
    id?: string | null;
    name?: string | null;
    slug?: string | null;
    logo?: string | null;
  } | null;
  click?: {
    trackingCode?: string | null;
    clickType?: string | null;
    clickedAt?: string | null;
    status?: string | null;
  } | null;
};

function formatMoney(value?: number | null) {
  return `₹${Number(value || 0).toFixed(2)}`;
}

export default function AdminCashbackPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const [trackingCode, setTrackingCode] = useState("");
  const [orderId, setOrderId] = useState("");
  const [orderAmount, setOrderAmount] = useState("");
  const [commission, setCommission] = useState("");
  const [cashbackAmount, setCashbackAmount] = useState("");
  const [filter, setFilter] = useState("ALL");

  const load = async () => {
    try {
      setLoading(true);

    const res = await fetch("/api/admin/cashback", {
  cache: "no-store",
  headers: {
    "x-admin-key": process.env.NEXT_PUBLIC_ADMIN_SECRET || "",
  },
});

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        console.error("ADMIN CASHBACK LOAD ERROR:", data);
        setTransactions([]);
        return;
      }

      setTransactions(Array.isArray(data?.items) ? data.items : []);
    } catch (err) {
      console.error("LOAD ERROR:", err);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredTransactions = useMemo(() => {
    if (filter === "ALL") return transactions;
    return transactions.filter((item) => item.rawStatus === filter);
  }, [transactions, filter]);

  const pendingCount = transactions.filter(
    (t) => t.rawStatus === "PENDING" || t.rawStatus === "TRACKING"
  ).length;

  const confirmedCount = transactions.filter(
    (t) => t.rawStatus === "CONFIRMED" || t.rawStatus === "PAYABLE"
  ).length;

  const rejectedCount = transactions.filter(
    (t) => t.rawStatus === "REJECTED"
  ).length;

  const paidCount = transactions.filter((t) => t.rawStatus === "PAID").length;

  const addCashback = async () => {
    if (!trackingCode.trim() || !orderId.trim() || !cashbackAmount.trim()) {
      alert("Please enter tracking code, order ID, and cashback amount.");
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch("/api/admin/track-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": process.env.NEXT_PUBLIC_ADMIN_SECRET || "",
        },
        body: JSON.stringify({
          trackingCode: trackingCode.trim(),
          orderId: orderId.trim(),
          orderAmount: Number(orderAmount || 0),
          commissionAmount: Number(commission || 0),
          cashbackAmount: Number(cashbackAmount || 0),
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Failed to add cashback");
      }

      alert(data?.message || "Cashback tracked successfully");

      setTrackingCode("");
      setOrderId("");
      setOrderAmount("");
      setCommission("");
      setCashbackAmount("");

      await load();
    } catch (err: any) {
      alert(err?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const approve = async (id: string) => {
    try {
      setActionLoadingId(id);

      const res = await fetch("/api/admin/confirm-cashback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": process.env.NEXT_PUBLIC_ADMIN_SECRET || "",
        },
        body: JSON.stringify({ transactionId: id }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "Failed to confirm cashback");
      }

      await load();
    } catch (err: any) {
      alert(err?.message || "Confirm failed");
    } finally {
      setActionLoadingId(null);
    }
  };

  const rejectTxn = async (id: string) => {
    const rejectionReason = window.prompt(
      "Enter rejection reason",
      "Rejected by admin"
    );

    if (!rejectionReason) return;

    try {
      setActionLoadingId(id);

      const res = await fetch("/api/admin/reject-cashback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": process.env.NEXT_PUBLIC_ADMIN_SECRET || "",
        },
        body: JSON.stringify({
          transactionId: id,
          rejectionReason,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || data?.error || "Failed to reject cashback");
      }

      await load();
    } catch (err: any) {
      alert(err?.message || "Reject failed");
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="cashbackAdminPage">
        <div className="cashbackAdminTop">
          <div>
            <h1>Cashback Management</h1>
            <p>Loading cashback transactions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cashbackAdminPage">
      <div className="cashbackAdminTop">
        <div>
          <h1>Cashback Management</h1>
          <p>Track, confirm, and reject cashback transactions.</p>
        </div>
      </div>

      <div className="cashbackStatsGrid">
        <div className="cashbackStatCard">
          <span>Total</span>
          <strong>{transactions.length}</strong>
        </div>

        <div className="cashbackStatCard">
          <span>Pending</span>
          <strong>{pendingCount}</strong>
        </div>

        <div className="cashbackStatCard">
          <span>Confirmed</span>
          <strong>{confirmedCount}</strong>
        </div>

        <div className="cashbackStatCard">
          <span>Rejected / Paid</span>
          <strong>{rejectedCount + paidCount}</strong>
        </div>
      </div>

      <div className="cashbackFormCard">
        <h3>Add Cashback</h3>

        <div className="cashbackFormGrid">
          <input
            className="cashbackInput"
            placeholder="Tracking Code"
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value)}
          />

          <input
            className="cashbackInput"
            placeholder="Order ID"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
          />

          <input
            className="cashbackInput"
            placeholder="Order Amount ₹"
            value={orderAmount}
            onChange={(e) => setOrderAmount(e.target.value)}
          />

          <input
            className="cashbackInput"
            placeholder="Commission ₹"
            value={commission}
            onChange={(e) => setCommission(e.target.value)}
          />

          <input
            className="cashbackInput"
            placeholder="Cashback ₹"
            value={cashbackAmount}
            onChange={(e) => setCashbackAmount(e.target.value)}
          />
        </div>

        <div className="cashbackFormActions">
          <button
            className="cashbackBtn cashbackBtnConfirm"
            onClick={addCashback}
            disabled={submitting}
          >
            {submitting ? "Adding..." : "Add Cashback"}
          </button>
        </div>
      </div>

      <div className="cashbackToolbar">
        <h3>Transactions</h3>

        <select
          className="cashbackFilter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="ALL">All</option>
          <option value="TRACKING">Tracking</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="PAYABLE">Payable</option>
          <option value="REJECTED">Rejected</option>
          <option value="PAID">Paid</option>
        </select>
      </div>

      <div className="cashbackTableWrap">
        <table className="cashbackTable">
          <thead>
            <tr>
              <th>User</th>
              <th>Store</th>
              <th>Order ID</th>
              <th>Tracking</th>
              <th>Order</th>
              <th>Commission</th>
              <th>Cashback</th>
              <th>Status</th>
              <th>Tracked At</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={10} className="cashbackEmpty">
                  No cashback transactions found.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((t) => {
                const busy = actionLoadingId === t.id;
                const canApprove =
                  t.rawStatus === "PENDING" || t.rawStatus === "TRACKING";
                const canReject =
                  t.rawStatus === "PENDING" ||
                  t.rawStatus === "TRACKING" ||
                  t.rawStatus === "CONFIRMED" ||
                  t.rawStatus === "PAYABLE";

                return (
                  <tr key={t.id}>
                    <td>
                      <div className="cashbackUserCell">
                        <strong>{t.user?.name || "User"}</strong>
                        <span>{t.user?.email || "Unknown"}</span>
                      </div>
                    </td>

                    <td>
                      <div className="cashbackStoreCell">
                        <strong>{t.store?.name || "-"}</strong>
                        <span>{t.title || "-"}</span>
                      </div>
                    </td>

                    <td>{t.externalOrderId || "-"}</td>
                    <td>{t.externalTrackingId || t.click?.trackingCode || "-"}</td>
                    <td>{formatMoney(t.orderAmount)}</td>
                    <td>{formatMoney(t.commissionAmount)}</td>
                    <td>{formatMoney(t.cashbackAmount)}</td>

                    <td>
                      <span
                        className={`cashbackStatus cashbackStatus${
                          t.rawStatus || ""
                        }`}
                      >
                        {t.status || "-"}
                      </span>

                      {t.rejectionReason ? (
                        <div className="cashbackReason">{t.rejectionReason}</div>
                      ) : null}
                    </td>

                    <td>
                      {t.trackedAt ? new Date(t.trackedAt).toLocaleString() : "-"}
                    </td>

                    <td>
                      <div className="cashbackActions">
                        <button
                          className="cashbackBtn cashbackBtnConfirm"
                          onClick={() => approve(t.id)}
                          disabled={!canApprove || busy}
                        >
                          {busy && canApprove ? "Processing..." : "Confirm"}
                        </button>

                        <button
                          className="cashbackBtn cashbackBtnReject"
                          onClick={() => rejectTxn(t.id)}
                          disabled={!canReject || busy}
                        >
                          {busy && canReject ? "Processing..." : "Reject"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}