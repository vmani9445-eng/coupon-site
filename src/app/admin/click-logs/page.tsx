"use client";

import { useEffect, useMemo, useState } from "react";
import "../admin.css";
import "./click-logs.css";

type ClickLogRow = {
  id: string;
  trackingCode: string | null;
  clickType: string | null;
  status: string;
  rawStatus: string | null;
  targetUrl: string | null;
  sourcePage: string | null;
  ipAddress: string | null;
  clickedAt: string | null;
  createdAt: string | null;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  store: {
    id: string;
    name: string;
    slug: string;
    logo?: string | null;
  } | null;
  session: {
    id: string;
    sessionKey: string | null;
  } | null;
  coupon?: {
    id: string;
    title: string;
    discount: string | null;
    couponCode: string | null;
  } | null;
  cashbackOffer?: {
    id: string;
    title: string;
    cashbackPercent: number | null;
  } | null;
};

function formatDateTime(value?: string | null) {
  if (!value) return "-";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";

  return parsed.toLocaleString();
}

export default function AdminClickLogsPage() {
  const [clickLogs, setClickLogs] = useState<ClickLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  useEffect(() => {
    const loadClickLogs = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch("/api/admin/click-logs", {
          cache: "no-store",
        });

        const contentType = res.headers.get("content-type") || "";

        if (!contentType.includes("application/json")) {
          const text = await res.text();
          console.error("NON_JSON_CLICK_LOGS_RESPONSE:", text);
          throw new Error("API returned non-JSON response");
        }

        const json = await res.json();

        if (!res.ok) {
          throw new Error(json?.error || "Failed to load click logs");
        }

        setClickLogs(Array.isArray(json?.clickLogs) ? json.clickLogs : []);
      } catch (err: any) {
        console.error(err);
        setError(err?.message || "Something went wrong");
        setClickLogs([]);
      } finally {
        setLoading(false);
      }
    };

    loadClickLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    return clickLogs.filter((log) => {
      const matchStatus =
        statusFilter === "ALL" ? true : log.status === statusFilter;
      const matchType =
        typeFilter === "ALL" ? true : log.clickType === typeFilter;

      return matchStatus && matchType;
    });
  }, [clickLogs, statusFilter, typeFilter]);

  const totalLogs = clickLogs.length;
  const clickedCount = clickLogs.filter((log) => log.status === "CLICKED").length;
  const redirectedCount = clickLogs.filter(
    (log) => log.status === "REDIRECTED"
  ).length;
  const trackedCount = clickLogs.filter((log) => log.status === "TRACKED").length;
  const confirmedCount = clickLogs.filter(
    (log) => log.status === "CONFIRMED"
  ).length;

  return (
    <div className="clickLogsPage">
      <div className="clickLogsHeader">
        <div>
          <h1>Click Logs</h1>
          <p>Track coupon, cashback, banner, and store click activity.</p>
        </div>
      </div>

      {error ? <div className="adminErrorBox">{error}</div> : null}

      <div className="clickLogsStatsGrid">
        <div className="clickLogsStatCard">
          <span>Total Logs</span>
          <strong>{totalLogs}</strong>
        </div>

        <div className="clickLogsStatCard">
          <span>Clicked</span>
          <strong>{clickedCount}</strong>
        </div>

        <div className="clickLogsStatCard">
          <span>Redirected</span>
          <strong>{redirectedCount}</strong>
        </div>

        <div className="clickLogsStatCard">
          <span>Tracked / Confirmed</span>
          <strong>{trackedCount + confirmedCount}</strong>
        </div>
      </div>

      <div className="clickLogsToolbar">
        <div className="clickLogsToolbarLeft">
          <h2>Recent Click Logs</h2>
        </div>

        <div className="clickLogsFilters">
          <select
            className="clickLogsSelect"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="CLICKED">Clicked</option>
            <option value="REDIRECTED">Redirected</option>
            <option value="TRACKED">Tracked</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="REJECTED">Rejected</option>
            <option value="PAID">Paid</option>
          </select>

          <select
            className="clickLogsSelect"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="ALL">All Types</option>
            <option value="COUPON">Coupon</option>
            <option value="CASHBACK">Cashback</option>
            <option value="BANNER">Banner</option>
            <option value="STORE">Store</option>
          </select>
        </div>
      </div>

      <div className="clickLogsTableWrap">
        <table className="clickLogsTable">
          <thead>
            <tr>
              <th>User</th>
              <th>Store</th>
              <th>Type</th>
              <th>Status</th>
              <th>Tracking Code</th>
              <th>Source</th>
              <th>Target URL</th>
              <th>IP</th>
              <th>Clicked At</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="clickLogsEmpty">
                  Loading click logs...
                </td>
              </tr>
            ) : filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={9} className="clickLogsEmpty">
                  No click logs found.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td>
                    <div className="clickLogsUserCell">
                      <strong>{log.user?.name || "Anonymous"}</strong>
                      <span>{log.user?.email || "-"}</span>
                    </div>
                  </td>

                  <td>
                    <div className="clickLogsStoreCell">
                      <strong>{log.store?.name || "-"}</strong>
                      <span>{log.store?.slug || "-"}</span>
                    </div>
                  </td>

                  <td>{log.clickType || "-"}</td>

                  <td>
                    <span
                      className={`clickLogsStatus clickLogsStatus${log.status}`}
                    >
                      {log.status}
                    </span>
                  </td>

                  <td className="clickLogsMono">{log.trackingCode || "-"}</td>

                  <td className="clickLogsSourceCell">
                    <strong>{log.sourcePage || "-"}</strong>
                    <span>{log.session?.sessionKey || "-"}</span>
                  </td>

                  <td className="clickLogsTargetCell" title={log.targetUrl || ""}>
                    {log.targetUrl || "-"}
                  </td>

                  <td>{log.ipAddress || "-"}</td>

                  <td>{formatDateTime(log.clickedAt || log.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}