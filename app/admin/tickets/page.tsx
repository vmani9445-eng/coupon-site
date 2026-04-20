"use client";

import { useEffect, useState } from "react";

export default function AdminTickets() {
  const [tickets, setTickets] = useState<any[]>([]);

  async function load() {
    const res = await fetch("/api/admin/tickets");
    const data = await res.json();
    setTickets(data);
  }

  useEffect(() => {
    load();
  }, []);

  const closeTicket = async (id: string) => {
    await fetch(`/api/admin/tickets/${id}`, {
      method: "PATCH",
    });
    load();
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>All Tickets</h1>

      {tickets.map((t) => (
        <div key={t.id}>
          <h3>{t.subject}</h3>
          <p>{t.message}</p>
          <span>{t.status}</span>

          {t.status === "OPEN" && (
            <button onClick={() => closeTicket(t.id)}>
              Close
            </button>
          )}
        </div>
      ))}
    </div>
  );
}