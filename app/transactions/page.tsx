"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "../dashboard/Sidebar";
import "../dashboard/dashboard.css";
import "./transactions.css";
import { X } from "lucide-react";

type WithdrawalItem = {
  id: string;
  transactionNumber: string;
  title: string;
  subtitle: string;
  amount: number;
  status: string;
  date?: string | null;
  method?: string;
  note?: string;
};

const PAGE_SIZE = 10;

function formatDate(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getInitial(text?: string) {
  return (text || "W").trim().charAt(0).toUpperCase();
}

function getStatusClass(status?: string) {
  const value = (status || "").toLowerCase();

  if (value === "transferred" || value === "paid") return "txnStatus active";
  if (value === "approved" || value === "processed") return "txnStatus onboarding";
  if (value === "rejected" || value === "failed") return "txnStatus inactive";
  return "txnStatus pending";
}

function getMethodLabel(method?: string) {
  if (method === "BANK_TRANSFER") return "Bank";
  if (method === "GIFT_CARD") return "Gift Card";
  if (method === "UPI") return "UPI";
  return method || "UPI";
}

function buildPagination(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
}

export default function TransactionsPage() {
  const [items, setItems] = useState<WithdrawalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<WithdrawalItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/transactions", {
          credentials: "include",
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Failed to load transactions");
        }

        const rows = Array.isArray(data) ? data : [];
        setItems(rows);
        setError("");
        setCurrentPage(1);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
        setItems([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return items.slice(start, start + PAGE_SIZE);
  }, [items, currentPage]);

  const paginationItems = useMemo(() => {
    return buildPagination(currentPage, totalPages);
  }, [currentPage, totalPages]);

  const startItem = items.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(currentPage * PAGE_SIZE, items.length);

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
          <div className="transactionsPageHeader compactHeader">
            <div>
              <h1>Transactions</h1>
              <p>Your withdrawal transfer history</p>
            </div>
          </div>

          {error ? (
            <div className="errorBox">
              <p>⚠️ {error}</p>
            </div>
          ) : null}

          <div className="transactionsTableCard compactCard">
            <div className="transactionsTableWrap">
              <table className="transactionsTable compactTable">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>ID</th>
                    <th>Method</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>View</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedItems.length === 0 ? (
                    <tr>
                      <td colSpan={7}>
                        <div className="transactionsEmpty">
                          No withdrawal transactions yet
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedItems.map((item) => (
                      <tr key={item.id} className="transactionsRow compactRow">
                        <td>
                          <div className="txnNameSimple">
  <strong>{item.title}</strong>
  <span>{item.subtitle}</span>
</div>
                        </td>

                        <td>
                          <span className="txnIdText compactText">
                            {item.transactionNumber}
                          </span>
                        </td>

                        <td>
                          <span className="txnMethodText compactText">
                            {getMethodLabel(item.method)}
                          </span>
                        </td>

                        <td>
                          <span className="txnDeptText amountText">
                            ₹{item.amount.toFixed(2)}
                          </span>
                        </td>

                        <td>
                          <span className="txnDateText compactText">
                            {formatDate(item.date)}
                          </span>
                        </td>

                        <td>
                          <span className={getStatusClass(item.status)}>
                            {item.status}
                          </span>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="txnViewBtn compactViewBtn"
                            onClick={() => setSelected(item)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {items.length > 0 && (
              <div className="transactionsFooter compactFooter">
                <div className="transactionsFooterLeft">
                  <span>{items.length} records</span>
                </div>

                <div className="transactionsPagination">
                  <button
                    className="txnPageBtn"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    Prev
                  </button>

                  {paginationItems.map((page, index) =>
                    page === "..." ? (
                      <span key={`dots-${index}`} className="txnPageDots">
                        ...
                      </span>
                    ) : (
                      <button
                        key={page}
                        className={`txnPageBtn ${currentPage === page ? "active" : ""}`}
                        onClick={() => setCurrentPage(Number(page))}
                      >
                        {page}
                      </button>
                    )
                  )}

                  <button
                    className="txnPageBtn"
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                  >
                    Next
                  </button>
                </div>

                <div className="transactionsFooterRight">
                  <span>
                    {startItem} - {endItem}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {selected && (
  <div className="txnModalOverlay" onClick={() => setSelected(null)}>
    <div
      className="txnModalCard"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="txnPopupHeader">
        <h3>Transfer Proof</h3>
        <button onClick={() => setSelected(null)}>
          <X size={18} />
        </button>
      </div>

      <div className="txnProofTop">
        <div className="txnProofAmount">
          ₹{selected.amount.toFixed(2)}
        </div>

        <div className={`txnProofStatus ${getStatusClass(selected.status)}`}>
          {selected.status}
        </div>
      </div>

      <div className="txnProofGrid">
        <div className="txnProofRow">
          <span>Transaction No</span>
          <strong>{selected.transactionNumber}</strong>
        </div>

        <div className="txnProofRow">
          <span>Date</span>
          <strong>{formatDateTime(selected.date)}</strong>
        </div>

        <div className="txnProofRow">
          <span>Name</span>
          <strong>{selected.title}</strong>
        </div>

        <div className="txnProofRow">
          <span>Method</span>
          <strong>{getMethodLabel(selected.method)}</strong>
        </div>

        <div className="txnProofRow">
          <span>Account</span>
          <strong>{selected.subtitle}</strong>
        </div>
      </div>

      <button
        className="txnPopupClose"
        onClick={() => setSelected(null)}
      >
        Close
      </button>
    </div>
  </div>
)}
    </div>
  );
}