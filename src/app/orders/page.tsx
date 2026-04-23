"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../dashboard/Sidebar";
import "../dashboard/dashboard.css";

type OrderItem = {
  id: string;
  storeName: string;
  storeLogo?: string | null;
  title: string;
  discount?: string | null;
  orderAmount: number;
  cashbackAmount: number;
  commissionAmount?: number | null;
  platformMarginAmount?: number | null;
  status: string;
  rawStatus?: string;
  purchaseAt?: string | null;
  trackedAt?: string | null;
  confirmedAt?: string | null;
  paidAt?: string | null;
  expectedPayout?: string | null;
  progress?: number;
  externalOrderId?: string | null;
  rejectionReason?: string | null;
};

type UiOrderItem = OrderItem & {
  storeInitial: string;
  formattedDate: string;
  progressPercent: number;
  progressLabel: string;
  expectedPayoutDate: string;
  brokenLogo: boolean;
};

function getStatusClass(status: string) {
  const value = (status || "").toLowerCase();

  if (value === "confirmed" || value === "payable") return "statusConfirmed";
  if (value === "paid") return "statusPaid";
  if (value === "pending") return "statusPending";
  if (value === "rejected" || value === "cancelled") return "statusRejected";

  return "statusTracking";
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";

  try {
    return new Date(value).toLocaleString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function formatDateOnly(value?: string | null) {
  if (!value) return "—";

  try {
    return new Date(value).toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function getStoreInitial(name?: string) {
  return (name || "S").trim().charAt(0).toUpperCase() || "S";
}

function getProgressPercent(item: OrderItem) {
  if (typeof item.progress === "number") return item.progress;

  const value = (item.rawStatus || item.status || "").toLowerCase();

  if (value === "paid") return 100;
  if (value === "payable") return 85;
  if (value === "confirmed") return 72;
  if (value === "pending") return 42;
  if (value === "rejected" || value === "cancelled") return 100;

  return 18;
}

function getProgressLabel(status?: string) {
  const value = (status || "").toLowerCase();

  if (value === "paid") return "Cashback paid";
  if (value === "payable") return "Ready for payout";
  if (value === "confirmed") return "Cashback confirmed";
  if (value === "pending") return "Waiting for confirmation";
  if (value === "rejected" || value === "cancelled") return "Not eligible";

  return "Tracking started";
}

function getExpectedPayoutDate(item: OrderItem) {
  if (item.expectedPayout) return formatDateOnly(item.expectedPayout);

  const baseDate =
    item.paidAt ||
    item.confirmedAt ||
    item.trackedAt ||
    item.purchaseAt ||
    undefined;

  if (!baseDate) return "—";

  try {
    const date = new Date(baseDate);
    const status = (item.rawStatus || item.status || "").toLowerCase();

    if (status === "paid") return formatDateOnly(item.paidAt || baseDate);

    if (status === "payable") {
      date.setDate(date.getDate() + 7);
      return formatDateOnly(date.toISOString());
    }

    if (status === "confirmed") {
      date.setDate(date.getDate() + 15);
      return formatDateOnly(date.toISOString());
    }

    if (status === "pending") {
      date.setDate(date.getDate() + 45);
      return formatDateOnly(date.toISOString());
    }

    if (status === "tracking") {
      date.setDate(date.getDate() + 60);
      return formatDateOnly(date.toISOString());
    }

    return "—";
  } catch {
    return "—";
  }
}

function formatMoney(value?: number | null) {
  return `₹${Number(value || 0).toFixed(2)}`;
}

export default function OrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [brokenLogos, setBrokenLogos] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const res = await fetch("/api/tracked-orders", {
          credentials: "include",
          cache: "no-store",
        });

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          setError(data?.error || "Failed to load tracked orders");
          setOrders([]);
          return;
        }

        setOrders(Array.isArray(data) ? data : []);
        setError("");
      } catch (err: any) {
        setError(err?.message || "Something went wrong");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const purchaseItems = useMemo<UiOrderItem[]>(() => {
    return orders.map((item) => ({
      ...item,
      storeInitial: getStoreInitial(item.storeName),
      formattedDate: formatDateTime(item.purchaseAt || item.trackedAt),
      progressPercent: getProgressPercent(item),
      progressLabel: getProgressLabel(item.rawStatus || item.status),
      expectedPayoutDate: getExpectedPayoutDate(item),
      brokenLogo: Boolean(brokenLogos[item.id]),
    }));
  }, [orders, brokenLogos]);

  const handleLogoError = (id: string) => {
    setBrokenLogos((prev) => ({ ...prev, [id]: true }));
  };

  if (loading) {
    return (
      <div className="layout">
        <Sidebar />
        <div className="main">
          <div className="loader">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="layout">
      <Sidebar />

      <div className="main">
        <div className="container">
          <div className="pageHeader purchasesHeader">
            <div>
              <h1>Tracked Orders</h1>
              <p>Track your purchases and cashback progress</p>
            </div>
          </div>

          {error && (
            <div className="errorBox">
              <p>⚠️ {error}</p>
            </div>
          )}

          <div className="card purchasesCard">
            {purchaseItems.length === 0 ? (
              <div className="emptyState">
                <div className="emptyIcon">🛍️✨</div>
                <h3>No tracked orders yet</h3>
                <p>Your purchases and cashback status will appear here.</p>

                <button
                  className="startShoppingBtn"
                  onClick={() => router.push("/stores")}
                >
                  Start Shopping →
                </button>
              </div>
            ) : (
              <div className="purchaseList">
                {purchaseItems.map((item) => (
                  <div key={item.id} className="purchaseRow minimalRow">
                    <div className="purchaseLeft">
                      <div className="purchaseLogo minimalLogo">
                        {item.storeLogo && !item.brokenLogo ? (
                          <img
                            src={item.storeLogo}
                            alt={item.storeName}
                            onError={() => handleLogoError(item.id)}
                          />
                        ) : (
                          <span>{item.storeInitial}</span>
                        )}
                      </div>

                      <div className="purchaseInfo">
                        <div className="purchaseTopLine minimalTopLine">
                          <p className="purchaseStore">{item.storeName}</p>

                          <span
                            className={`purchaseStatus minimalStatus ${getStatusClass(
                              item.rawStatus || item.status
                            )}`}
                          >
                            {item.status}
                          </span>
                        </div>

                        <p className="purchaseTitle minimalTitle">
                          {item.title}
                        </p>

                        <div className="purchaseMeta minimalMeta">
                          <span>{item.formattedDate}</span>
                          <span>Order {formatMoney(item.orderAmount)}</span>
                          <span>Cashback {formatMoney(item.cashbackAmount)}</span>
                        </div>

                        {item.externalOrderId ? (
                          <div className="purchaseMeta minimalMeta">
                            <span>Order ID: {item.externalOrderId}</span>
                          </div>
                        ) : null}

                        {item.rejectionReason ? (
                          <div className="purchaseMeta minimalMeta">
                            <span>Reason: {item.rejectionReason}</span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}