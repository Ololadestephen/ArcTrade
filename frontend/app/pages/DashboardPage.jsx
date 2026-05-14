// ArcTrade — DashboardPage (app/pages)
import { useState } from "react";
import { SummaryCards } from "../components/portfolio/SummaryCards";
import { PositionsList } from "../components/portfolio/PositionsList";
import { OrdersList } from "../components/portfolio/OrdersList";
import { HistoryList } from "../components/portfolio/HistoryList";

export function DashboardPage({ positions = [], orders = [], history = [], defaultTab = "positions" }) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2, animation: "fadeIn 0.4s ease" }}>
      <div style={{ padding: "10px 0 26px", borderBottom: "1px solid var(--border)", marginBottom: 18 }}>
        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, color: "var(--cyan)", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 14 }}>
          Private account
        </div>
        <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(48px,6vw,76px)", fontWeight: 400, lineHeight: 0.95, color: "var(--ink)" }}>
          Positions without public intent.
        </h1>
      </div>

      <SummaryCards positions={positions} orders={orders} />

      <div className="card" style={{ padding: "0" }}>
        <div className="tabs" style={{ padding: "0 16px" }}>
          <button className={`tab ${activeTab === "positions" ? "active" : ""}`} onClick={() => setActiveTab("positions")}>Positions</button>
          <button className={`tab ${activeTab === "orders" ? "active" : ""}`} onClick={() => setActiveTab("orders")}>Orders</button>
          <button className={`tab ${activeTab === "history" ? "active" : ""}`} onClick={() => setActiveTab("history")}>History</button>
        </div>
      </div>

      <div style={{ minHeight: 400 }}>
        {activeTab === "positions" && <PositionsList positions={positions} />}
        {activeTab === "orders" && <OrdersList orders={orders} />}
        {activeTab === "history" && <HistoryList history={history} />}
      </div>
    </div>
  );
}
