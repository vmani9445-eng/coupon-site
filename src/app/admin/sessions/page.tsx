"use client";

import { useEffect, useMemo, useState } from "react";

type SessionRow = {
  id: string;
  sessionKey: string;
  ipAddress: string | null;
  userAgent: string | null;
  isActive: boolean;
  createdAt: string;
  lastSeenAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  } | null;
};

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [onlyAnonymous, setOnlyAnonymous] = useState(false);

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const res = await fetch("/api/admin/sessions", { cache: "no-store" });
        const json = await res.json();
        setSessions(Array.isArray(json.sessions) ? json.sessions : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, []);

  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const q = search.trim().toLowerCase();

      const matchesSearch =
        !q ||
        (s.user?.name || "").toLowerCase().includes(q) ||
        (s.user?.email || "").toLowerCase().includes(q) ||
        s.sessionKey.toLowerCase().includes(q) ||
        (s.ipAddress || "").toLowerCase().includes(q);

      const matchesAnonymous = !onlyAnonymous || !s.user;

      return matchesSearch && matchesAnonymous;
    });
  }, [sessions, search, onlyAnonymous]);

  if (loading) return <div className="adminUsersPage">Loading sessions...</div>;

  return (
    <div className="adminUsersPage">
      <div className="adminUsersHeader">
        <h1>Recent Sessions</h1>
        <p>Track logged-in and anonymous user sessions.</p>
      </div>

      <div className="adminUsersSection">
        <div className="adminSectionTopBar">
          <div className="adminSectionHeader">
            <h2>Sessions List</h2>
          </div>

          <div className="adminFiltersRow">
            <input
              className="adminSearchInput"
              placeholder="Search by user, email, session key, IP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <label className="adminCheckLabel">
              <input
                type="checkbox"
                checked={onlyAnonymous}
                onChange={(e) => setOnlyAnonymous(e.target.checked)}
              />
              Anonymous only
            </label>
          </div>
        </div>

        <div className="adminTableWrap">
          <table className="adminTable">
            <thead>
              <tr>
                <th>User</th>
                <th>Session Key</th>
                <th>IP Address</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Last Seen</th>
              </tr>
            </thead>

            <tbody>
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "24px" }}>
                    No sessions found.
                  </td>
                </tr>
              ) : (
                filteredSessions.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div className="adminUserCell">
                        <strong>{s.user?.name || "Anonymous"}</strong>
                        <span>{s.user?.email || "-"}</span>
                      </div>
                    </td>
                    <td>{s.sessionKey}</td>
                    <td>{s.ipAddress || "-"}</td>
                    <td>
                      <span className={`statusBadge ${s.isActive ? "status-active" : "status-suspended"}`}>
                        {s.isActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>
                    <td>{new Date(s.createdAt).toLocaleString()}</td>
                    <td>{new Date(s.lastSeenAt).toLocaleString()}</td>
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