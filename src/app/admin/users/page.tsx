"use client";

import { useEffect, useMemo, useState } from "react";

type AdminUser = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: string;
  status: string;
  isActive: boolean;
  createdAt: string;
  lastSeenAt: string | null;
  referralCode: string | null;
  upiId: string | null;
  upiName: string | null;
  giftCardPreference: string | null;
  wallet: {
    pendingBalance: number;
    confirmedBalance: number;
    availableBalance: number;
    lifetimeEarned: number;
    lifetimeWithdrawn: number;
    lifetimeRejected: number;
  };
  cashback: {
    pending: number;
    confirmed: number;
    rejected: number;
  };
  withdrawals: {
    pending: number;
    paid: number;
  };
  counts: {
    clicks: number;
    referrals: number;
    sessions: number;
    supportTickets: number;
  };
};

type AdminUsersResponse = {
  stats: {
    totalUsers: number;
    activeToday: number;
    signedInUsers: number;
    anonymousSessions: number;
    pendingWithdrawalCount: number;
    pendingCashbackCount: number;
  };
  users: AdminUser[];
};

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

function formatMoney(value: number) {
  return `₹${(value / 100).toFixed(2)}`;
}

const emptyData: AdminUsersResponse = {
  stats: {
    totalUsers: 0,
    activeToday: 0,
    signedInUsers: 0,
    anonymousSessions: 0,
    pendingWithdrawalCount: 0,
    pendingCashbackCount: 0,
  },
  users: [],
};

export default function AdminUsersPage() {
  const [data, setData] = useState<AdminUsersResponse>(emptyData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [activityFilter, setActivityFilter] = useState("ALL");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch("/api/admin/users", {
          cache: "no-store",
        });

        const json = await res.json();

        if (!res.ok) {
          setError(json?.error || "Failed to load admin users data.");
          setData(emptyData);
          return;
        }

        setData({
          stats: json?.stats || emptyData.stats,
          users: Array.isArray(json?.users) ? json.users : [],
        });
      } catch (err) {
        console.error(err);
        setError("Something went wrong while loading users.");
        setData(emptyData);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return data.users.filter((user) => {
      const q = search.trim().toLowerCase();

      const matchesSearch =
        !q ||
        (user.name || "").toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        (user.phone || "").toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "ALL" || user.status === statusFilter;

      const matchesActivity =
        activityFilter === "ALL" ||
        (activityFilter === "ACTIVE" && user.isActive) ||
        (activityFilter === "INACTIVE" && !user.isActive);

      return matchesSearch && matchesStatus && matchesActivity;
    });
  }, [data.users, search, statusFilter, activityFilter]);

  if (loading) {
    return <div className="adminUsersPage">Loading users data...</div>;
  }

  return (
    <div className="adminUsersPage">
      <div className="adminUsersHeader">
        <h1>Users</h1>
        <p>Track user accounts, wallet, cashback and profile details.</p>
      </div>

      {error ? <div className="adminErrorBox">{error}</div> : null}

      <div className="adminUsersStatsGrid">
        <div className="adminStatCard">
          <span>Total Users</span>
          <strong>{data.stats.totalUsers}</strong>
        </div>
        <div className="adminStatCard">
          <span>Active Today</span>
          <strong>{data.stats.activeToday}</strong>
        </div>
        <div className="adminStatCard">
          <span>Signed-in Users</span>
          <strong>{data.stats.signedInUsers}</strong>
        </div>
        <div className="adminStatCard">
          <span>Pending Cashback</span>
          <strong>{data.stats.pendingCashbackCount}</strong>
        </div>
      </div>

      <div className="adminUsersSection">
        <div className="adminSectionTopBar">
          <div className="adminSectionHeader">
            <h2>Users List</h2>
          </div>

          <div className="adminFiltersRow">
            <input
              className="adminSearchInput"
              placeholder="Search by name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="adminSelect"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="BLOCKED">BLOCKED</option>
              <option value="SUSPENDED">SUSPENDED</option>
            </select>

            <select
              className="adminSelect"
              value={activityFilter}
              onChange={(e) => setActivityFilter(e.target.value)}
            >
              <option value="ALL">All Activity</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive Only</option>
            </select>
          </div>
        </div>

        <div className="adminTableWrap">
          <table className="adminTable">
            <thead>
              <tr>
                <th>User</th>
                <th>Status</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Last Seen</th>
                <th>Wallet</th>
                <th>Pending Cashback</th>
                <th>Confirmed Cashback</th>
                <th>Clicks</th>
                <th>Referrals</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ textAlign: "center", padding: "24px" }}>
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="adminUserCell">
                        <strong>{user.name || "Unnamed User"}</strong>
                        <span>{user.email}</span>
                        {user.phone ? <small>{user.phone}</small> : null}
                      </div>
                    </td>
                    <td>
                      <span className={`statusBadge status-${user.status.toLowerCase()}`}>
                        {user.status}
                      </span>
                    </td>
                    <td>{user.role}</td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>{formatDate(user.lastSeenAt)}</td>
                    <td>{formatMoney(user.wallet.availableBalance)}</td>
                    <td>{formatMoney(user.cashback.pending)}</td>
                    <td>{formatMoney(user.cashback.confirmed)}</td>
                    <td>{user.counts.clicks}</td>
                    <td>{user.counts.referrals}</td>
                    <td>
                      <button
                        className="adminActionBtn"
                        onClick={() => setSelectedUser(user)}
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
      </div>

      {selectedUser ? (
        <div className="adminModalOverlay" onClick={() => setSelectedUser(null)}>
          <div className="adminModalCard" onClick={(e) => e.stopPropagation()}>
            <div className="adminModalHeader">
              <h3>User Details</h3>
              <button onClick={() => setSelectedUser(null)}>✕</button>
            </div>

            <div className="adminDetailGrid">
              <div className="adminDetailBlock">
                <h4>Profile</h4>
                <p><strong>Name:</strong> {selectedUser.name || "Unnamed User"}</p>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Phone:</strong> {selectedUser.phone || "-"}</p>
                <p><strong>Status:</strong> {selectedUser.status}</p>
                <p><strong>Role:</strong> {selectedUser.role}</p>
                <p><strong>Joined:</strong> {formatDate(selectedUser.createdAt)}</p>
                <p><strong>Last Seen:</strong> {formatDate(selectedUser.lastSeenAt)}</p>
              </div>

              <div className="adminDetailBlock">
                <h4>Wallet</h4>
                <p><strong>Available:</strong> {formatMoney(selectedUser.wallet.availableBalance)}</p>
                <p><strong>Pending:</strong> {formatMoney(selectedUser.wallet.pendingBalance)}</p>
                <p><strong>Confirmed:</strong> {formatMoney(selectedUser.wallet.confirmedBalance)}</p>
                <p><strong>Lifetime Earned:</strong> {formatMoney(selectedUser.wallet.lifetimeEarned)}</p>
                <p><strong>Lifetime Withdrawn:</strong> {formatMoney(selectedUser.wallet.lifetimeWithdrawn)}</p>
                <p><strong>Lifetime Rejected:</strong> {formatMoney(selectedUser.wallet.lifetimeRejected)}</p>
              </div>

              <div className="adminDetailBlock">
                <h4>Cashback</h4>
                <p><strong>Pending:</strong> {formatMoney(selectedUser.cashback.pending)}</p>
                <p><strong>Confirmed:</strong> {formatMoney(selectedUser.cashback.confirmed)}</p>
                <p><strong>Rejected:</strong> {formatMoney(selectedUser.cashback.rejected)}</p>
                <p><strong>Pending Withdrawals:</strong> {formatMoney(selectedUser.withdrawals.pending)}</p>
                <p><strong>Paid Withdrawals:</strong> {formatMoney(selectedUser.withdrawals.paid)}</p>
              </div>

              <div className="adminDetailBlock">
                <h4>Payout Info</h4>
                <p><strong>UPI ID:</strong> {selectedUser.upiId || "-"}</p>
                <p><strong>UPI Name:</strong> {selectedUser.upiName || "-"}</p>
                <p><strong>Gift Card Preference:</strong> {selectedUser.giftCardPreference || "-"}</p>
                <p><strong>Referral Code:</strong> {selectedUser.referralCode || "-"}</p>
                <p><strong>Clicks:</strong> {selectedUser.counts.clicks}</p>
                <p><strong>Referrals:</strong> {selectedUser.counts.referrals}</p>
                <p><strong>Sessions:</strong> {selectedUser.counts.sessions}</p>
                <p><strong>Support Tickets:</strong> {selectedUser.counts.supportTickets}</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}