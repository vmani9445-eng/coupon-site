"use client";

import { useEffect, useState } from "react";
import Sidebar from "../dashboard/Sidebar";
import "../dashboard/dashboard.css";

export default function HelpPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  return (
    <div className="layout">

      <Sidebar />

      <div className="main">
        <div className="container helpFull">

          <div className="helpHeader">
            <h1>Help Desk</h1>
            <p>Get help with cashback & orders</p>
          </div>

          <div className="helpGrid">

            {/* LEFT - CREATE */}
            <div className="card helpCard">
              <h3>Create Ticket</h3>

              <div className="quickIssues">
                <button onClick={() => {
                  setSubject("Cashback not tracked");
                  setMessage("I made a purchase but cashback not tracked.");
                }}>Not tracked</button>

                <button onClick={() => {
                  setSubject("Cashback pending");
                  setMessage("My cashback is pending too long.");
                }}>Pending</button>

                <button onClick={() => {
                  setSubject("Cashback declined");
                  setMessage("My cashback was declined incorrectly.");
                }}>Declined</button>
              </div>

              <input
                placeholder="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />

              <textarea
                placeholder="Describe your issue..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />

              <button className="btnPrimary">Submit Ticket</button>
            </div>

            {/* RIGHT - HISTORY */}
            <div className="card helpCard">
              <h3>Your Tickets</h3>

              <div className="emptyState">
                <p>No tickets yet</p>
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}