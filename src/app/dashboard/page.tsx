"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useSession, signOut } from "next-auth/react";
import "./dashboard.css";
import Sidebar from "./Sidebar";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Wallet,
  Clock,
  CheckCircle,
  ArrowUpRight,
  X,
} from "lucide-react";

type DashboardApiResponse = {
  wallet: {
    availableBalance: number;
    pendingBalance: number;
    confirmedBalance: number;
    lifetimeEarned: number;
    lifetimeWithdrawn: number;
    lifetimeRejected?: number;
  };
  stats: {
    pending: number;
    confirmed: number;
    payable: number;
    withdrawn: number;
  };
  cashbackTransactions: CashbackTransactionItem[];
  withdrawalRequests: WithdrawalItem[];
  user: {
    upiId: string;
    upiName: string;
  };
};

type CashbackTransactionItem = {
  id: string;
  storeName?: string;
  storeLogo?: string | null;
  storeSlug?: string | null;
  title?: string | null;
  discount?: string | null;
  orderAmount?: number | null;
  cashbackAmount: number;
  commissionAmount?: number | null;
  platformMarginAmount?: number | null;
  status: string;
  rawStatus?: string | null;
  trackedAt: string;
  confirmedAt?: string | null;
  paidAt?: string | null;
  payableAt?: string | null;
  purchaseAt?: string | null;
  externalOrderId?: string | null;
  clickedAt?: string | null;
  clickType?: string | null;
  rejectionReason?: string | null;
};

type WithdrawalItem = {
  id: string;
  amount: number;
  status: string;
  rawStatus?: string | null;
  method: string;
  requestedAt?: string | null;
  createdAt: string;
  processedAt?: string | null;
  paidAt?: string | null;
};

type DashboardData = {
  walletBalance: number;
  totalEarned: number;
  pending: number;
  payable: number;
  withdrawn: number;
  upiId: string;
  upiName: string;
};

type OrderItem = {
  id: string;
  storeName: string;
  storeLogo?: string | null;
  storeSlug?: string | null;
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
  payableAt?: string | null;
  externalOrderId?: string | null;
  expectedPayout?: string | null;
  rejectionReason?: string | null;
};

function emptyDashboardState(): DashboardData {
  return {
    walletBalance: 0,
    totalEarned: 0,
    pending: 0,
    payable: 0,
    withdrawn: 0,
    upiId: "",
    upiName: "",
  };
}

function parseDashboardResponse(payload: unknown): {
  summary: DashboardData;
  orders: OrderItem[];
  withdrawals: WithdrawalItem[];
} {
  if (!payload || typeof payload !== "object") {
    return {
      summary: emptyDashboardState(),
      orders: [],
      withdrawals: [],
    };
  }

  const obj = payload as Partial<DashboardApiResponse>;

  const cashbackTransactions = Array.isArray(obj.cashbackTransactions)
    ? obj.cashbackTransactions
    : [];

  const withdrawalRequests = Array.isArray(obj.withdrawalRequests)
    ? obj.withdrawalRequests
    : [];

  const orders: OrderItem[] = cashbackTransactions.map((item, index) => ({
    id: typeof item?.id === "string" ? item.id : `txn-${index}`,
    storeName:
      typeof item?.storeName === "string" && item.storeName.trim()
        ? item.storeName
        : "Store",
    storeLogo: item?.storeLogo || null,
    storeSlug: item?.storeSlug || null,
    title:
      typeof item?.title === "string" && item.title.trim()
        ? item.title
        : item?.externalOrderId && item.externalOrderId.trim()
          ? `Order ID: ${item.externalOrderId}`
          : "Cashback tracked",
    discount: typeof item?.discount === "string" ? item.discount : null,
    orderAmount: typeof item?.orderAmount === "number" ? item.orderAmount : 0,
    cashbackAmount:
      typeof item?.cashbackAmount === "number" ? item.cashbackAmount : 0,
    commissionAmount:
      typeof item?.commissionAmount === "number" ? item.commissionAmount : 0,
    platformMarginAmount:
      typeof item?.platformMarginAmount === "number"
        ? item.platformMarginAmount
        : 0,
    status: typeof item?.status === "string" ? item.status : "Tracking",
    rawStatus:
      typeof item?.rawStatus === "string"
        ? item.rawStatus
        : typeof item?.status === "string"
          ? item.status
          : "PENDING",
    purchaseAt:
      typeof item?.purchaseAt === "string"
        ? item.purchaseAt
        : typeof item?.trackedAt === "string"
          ? item.trackedAt
          : null,
    trackedAt: typeof item?.trackedAt === "string" ? item.trackedAt : null,
    confirmedAt:
      typeof item?.confirmedAt === "string" ? item.confirmedAt : null,
    paidAt: typeof item?.paidAt === "string" ? item.paidAt : null,
    payableAt: typeof item?.payableAt === "string" ? item.payableAt : null,
    externalOrderId:
      typeof item?.externalOrderId === "string" ? item.externalOrderId : null,
    expectedPayout:
      typeof item?.payableAt === "string" ? item.payableAt : null,
    rejectionReason:
      typeof item?.rejectionReason === "string" ? item.rejectionReason : null,
  }));

  return {
    summary: {
      walletBalance:
        typeof obj.wallet?.availableBalance === "number"
          ? obj.wallet.availableBalance
          : 0,
      totalEarned:
        typeof obj.wallet?.lifetimeEarned === "number"
          ? obj.wallet.lifetimeEarned
          : 0,
      pending: typeof obj.stats?.pending === "number" ? obj.stats.pending : 0,
      payable: typeof obj.stats?.payable === "number" ? obj.stats.payable : 0,
      withdrawn:
        typeof obj.stats?.withdrawn === "number" ? obj.stats.withdrawn : 0,
      upiId: typeof obj.user?.upiId === "string" ? obj.user.upiId : "",
      upiName: typeof obj.user?.upiName === "string" ? obj.user.upiName : "",
    },
    orders,
    withdrawals: withdrawalRequests,
  };
}

function formatRupees(value?: number) {
  return `₹${Number(value || 0).toFixed(2)}`;
}

function formatTxnDate(date?: string | null) {
  if (!date) return "—";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getSafeTime(date?: string | null) {
  if (!date) return 0;
  const parsed = new Date(date).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function normalizeStatus(status?: string) {
  const value = (status || "").trim().toLowerCase();

  if (
    value === "confirmed" ||
    value === "approved" ||
    value === "success" ||
    value === "payable"
  ) {
    return "confirmed";
  }

  if (value === "paid" || value === "withdrawn" || value === "transferred") {
    return "paid";
  }

  if (value === "rejected" || value === "cancelled" || value === "failed") {
    return "rejected";
  }

  return "tracking";
}

function displayStatus(status?: string) {
  const value = (status || "").trim().toLowerCase();

  if (value === "approved") return "Confirmed";
  if (value === "confirmed") return "Confirmed";
  if (value === "payable") return "Approved";
  if (value === "paid") return "Paid";
  if (value === "withdrawn") return "Paid";
  if (value === "transferred") return "Paid";
  if (value === "rejected") return "Rejected";
  if (value === "cancelled") return "Rejected";
  if (value === "failed") return "Rejected";
  if (value === "pending") return "Tracking";
  if (value === "tracked") return "Tracking";

  return status || "Tracking";
}

export default function Dashboard() {
  const { status: sessionStatus } = useSession();

  const [data, setData] = useState<DashboardData>(emptyDashboardState());
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalItem[]>([]);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("UPI");
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const [upiId, setUpiId] = useState("");
  const [upiName, setUpiName] = useState("");
  const [giftType, setGiftType] = useState("Amazon");

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      void load();
      return;
    }

    if (sessionStatus === "unauthenticated") {
      window.location.href = "/login";
    }
  }, [sessionStatus]);

  async function load() {
    try {
      setLoading(true);
      setPageError("");

      const dashboardRes = await fetch("/api/dashboard", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const dashboardJson = await dashboardRes.json().catch(() => null);

      if (dashboardRes.status === 401) {
        setPageError("Session not ready. Please wait...");
        return;
      }

      if (!dashboardRes.ok) {
        throw new Error(
          (dashboardJson && dashboardJson.error) || "Failed to load dashboard"
        );
      }

      const parsed = parseDashboardResponse(dashboardJson);

      setData(parsed.summary);
      setOrders(parsed.orders);
      setWithdrawals(parsed.withdrawals);
      setUpiId(parsed.summary.upiId || "");
      setUpiName(parsed.summary.upiName || "");
    } catch (error) {
      console.error("Dashboard load error:", error);
      setData(emptyDashboardState());
      setOrders([]);
      setWithdrawals([]);
      setPageError(
        error instanceof Error ? error.message : "Failed to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  }

  const latestOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => getSafeTime(b.purchaseAt) - getSafeTime(a.purchaseAt))
      .slice(0, 6);
  }, [orders]);

  const chartData = useMemo(() => {
    return [...orders]
      .filter((item) => item.cashbackAmount > 0 && getSafeTime(item.purchaseAt))
      .sort((a, b) => getSafeTime(a.purchaseAt) - getSafeTime(b.purchaseAt))
      .map((item) => ({
        date: new Date(item.purchaseAt as string).toLocaleDateString(undefined, {
          day: "2-digit",
          month: "short",
        }),
        amount: Number(item.cashbackAmount || 0),
      }));
  }, [orders]);

  const recentWithdrawals = useMemo(() => {
    return [...withdrawals]
      .sort(
        (a, b) =>
          getSafeTime(b.requestedAt || b.createdAt) -
          getSafeTime(a.requestedAt || a.createdAt)
      )
      .slice(0, 6);
  }, [withdrawals]);

  const handleWithdraw = async () => {
    if (!amount) {
      alert("Enter amount");
      return;
    }

    const amountNumber = Number(amount);

    if (Number.isNaN(amountNumber) || amountNumber <= 0) {
      alert("Enter valid amount");
      return;
    }

    if (amountNumber < 100) {
      alert("Minimum withdrawal ₹100");
      return;
    }

    try {
      const res = await fetch("/api/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          amount: amountNumber,
          method,
          upiId: method === "UPI" ? upiId : undefined,
          upiName: method === "UPI" ? upiName : undefined,
          giftType: method === "GIFT_CARD" ? giftType : undefined,
        }),
      });

      const json = await res.json().catch(() => null);

      if (res.status === 401) {
        alert("Please log in again.");
        return;
      }

      if (!res.ok) {
        throw new Error(json?.error || "Failed to request withdrawal");
      }

      alert("Withdrawal requested ✅");
      setAmount("");
      setShowPopup(false);
      void load();
    } catch (error) {
      console.error("Withdrawal error:", error);
      alert(error instanceof Error ? error.message : "Failed ❌");
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  if (
    sessionStatus === "loading" ||
    (sessionStatus === "authenticated" && loading)
  ) {
    return <div className="loader">Loading...</div>;
  }

  return (
    <div className="layout">
      <Sidebar />

      <div className="main">
        <div className="container">
          <div className="topGrid">
            <div className="mainCard">
              <div>
                <p>Main account</p>
                <h2>DealDhamaka Wallet</h2>

                <div className="actions">
                  <button
                    className="btnPrimary"
                    onClick={() => setShowPopup(true)}
                  >
                    Withdraw
                  </button>

                  <button className="btnSecondary" onClick={() => void handleLogout()}>
                    Logout
                  </button>
                </div>
              </div>

              <div className="walletAmountWrap">
                <h1>{formatRupees(data.walletBalance)}</h1>
                <span className="walletSub">Available to withdraw</span>
              </div>
            </div>

            <div className="promoCard">
              <h3>Smart Withdraw</h3>
              <p>UPI • Bank • Gift Cards</p>
              <button onClick={() => setShowPopup(true)}>Withdraw Now</button>
            </div>
          </div>

          <div className="statsRow">
            <Stat title="Earned" value={data.totalEarned} />
            <Stat title="Pending" value={data.pending} />
            <Stat title="Approved" value={data.payable ?? 0} />
            <Stat title="Withdrawn" value={data.withdrawn} />
          </div>

          <div className="contentGrid">
            <div className="card">
              <h3>Latest Transactions</h3>

              {pageError ? <p className="empty">{pageError}</p> : null}

              {latestOrders.length > 0 ? (
                latestOrders.map((item) => (
                  <div key={item.id} className="txn">
                    <div className="txnLeft">
                      <div className="txnLogo">
                        {item.storeLogo ? (
                          <img src={item.storeLogo} alt={item.storeName} />
                        ) : (
                          <span>
                            {(item.storeName || "S").charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div className="txnContent">
                        <p className="txnStore">{item.storeName}</p>
                        <span className="trackingNote">{item.title}</span>
                        <span className="txnDate">
                          {formatTxnDate(item.purchaseAt)}
                        </span>
                      </div>
                    </div>

                    <div className="right">
                      <div className="txnRightInline">
                        <span
                          className={`status ${normalizeStatus(item.rawStatus || item.status)}`}
                        >
                          {displayStatus(item.rawStatus || item.status)}
                        </span>

                        <span className="txnAmount">
                          +{formatRupees(item.cashbackAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                !pageError && <p className="empty">No transactions yet</p>
              )}
            </div>

            <div className="card">
              <h3>Analytics</h3>

              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={chartData}>
                    <XAxis dataKey="date" />
                    <YAxis hide />
                    <Tooltip formatter={(value) => [`₹${value}`, "Cashback"]} />
                    <Line type="monotone" dataKey="amount" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty">No analytics yet</div>
              )}
            </div>
          </div>

          <div className="contentGrid">
            <div className="card">
              <h3>Recent Withdrawals</h3>

              {recentWithdrawals.length > 0 ? (
                recentWithdrawals.map((item) => (
                  <div key={item.id} className="txn">
                    <div className="txnLeft">
                      <div className="txnLogo">
                        <span>₹</span>
                      </div>

                      <div className="txnContent">
                        <p className="txnStore">{item.method}</p>
                        <span className="trackingNote">
                          Requested:{" "}
                          {formatTxnDate(item.requestedAt || item.createdAt)}
                        </span>
                        <span className="txnDate">
                          Paid: {formatTxnDate(item.paidAt)}
                        </span>
                      </div>
                    </div>

                    <div className="right">
                      <div className="txnRightInline">
                        <span
                          className={`status ${normalizeStatus(
                            item.rawStatus || item.status
                          )}`}
                        >
                          {displayStatus(item.rawStatus || item.status)}
                        </span>

                        <span className="txnAmount">
                          {formatRupees(item.amount)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="empty">No withdrawals yet</p>
              )}
            </div>

            <div className="card">
              <h3>Wallet Details</h3>

              <div className="txn">
                <div className="txnLeft">
                  <div className="txnContent">
                    <p className="txnStore">UPI ID</p>
                    <span className="trackingNote">
                      {data.upiId || "Not added"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="txn">
                <div className="txnLeft">
                  <div className="txnContent">
                    <p className="txnStore">UPI Name</p>
                    <span className="trackingNote">
                      {data.upiName || "Not added"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="txn">
                <div className="txnLeft">
                  <div className="txnContent">
                    <p className="txnStore">Withdrawable Balance</p>
                    <span className="trackingNote">
                      {formatRupees(data.walletBalance)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPopup && (
        <div className="popup" onClick={() => setShowPopup(false)}>
          <div className="popupBox" onClick={(e) => e.stopPropagation()}>
            <div className="popupHeader">
              <h3>Withdraw</h3>
              <button onClick={() => setShowPopup(false)}>
                <X size={18} />
              </button>
            </div>

            <input
              placeholder="Amount ₹"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <div className="methodRow">
              <button
                className={method === "UPI" ? "active" : ""}
                onClick={() => setMethod("UPI")}
              >
                UPI
              </button>

              <button
                className={method === "BANK_TRANSFER" ? "active" : ""}
                onClick={() => setMethod("BANK_TRANSFER")}
              >
                Bank
              </button>

              <button
                className={method === "GIFT_CARD" ? "active" : ""}
                onClick={() => setMethod("GIFT_CARD")}
              >
                Gift
              </button>
            </div>

            {method === "UPI" && (
              <>
                <input
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="UPI ID"
                />
                <input
                  value={upiName}
                  onChange={(e) => setUpiName(e.target.value)}
                  placeholder="UPI Name"
                />
              </>
            )}

            {method === "GIFT_CARD" && (
              <div className="giftOptions">
                {["Amazon", "Flipkart", "Myntra"].map((g) => (
                  <div
                    key={g}
                    className={`giftCard ${giftType === g ? "active" : ""}`}
                    onClick={() => setGiftType(g)}
                  >
                    <span>{g}</span>
                  </div>
                ))}
              </div>
            )}

            <button className="submit" onClick={() => void handleWithdraw()}>
              Submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({
  title,
  value,
}: {
  title: string;
  value?: number;
}) {
  const icons: Record<string, ReactNode> = {
    Earned: <Wallet size={18} />,
    Pending: <Clock size={18} />,
    Approved: <CheckCircle size={18} />,
    Withdrawn: <ArrowUpRight size={18} />,
  };

  return (
    <div className="stat">
      <div className="statIcon">{icons[title]}</div>

      <div>
        <p>{title}</p>
        <h2>{formatRupees(value)}</h2>
      </div>
    </div>
  );
}