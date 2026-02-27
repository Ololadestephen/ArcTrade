import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { DashboardPage } from "../../pages/DashboardPage";
import { TradePage } from "../../pages/TradePage";
import { SettingsPage } from "../../pages/SettingsPage";

export function AppShell({ page, setPage, wallet, publicKey, program, connect, disconnect, positions, orders, history, hasAccount, darkPool, setDarkPool }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const pageMap = {
    dashboard: <DashboardPage positions={positions} orders={orders} history={history} />,
    trade: <TradePage program={program} publicKey={publicKey} wallet={wallet} positions={positions} orders={orders} hasAccount={hasAccount} />,
    settings: <SettingsPage darkPool={darkPool} setDarkPool={setDarkPool} wallet={wallet} publicKey={publicKey} connect={connect} disconnect={disconnect} />,
    history: <DashboardPage positions={positions} orders={orders} history={history} defaultTab="history" />,
  };

  return (
    <div style={{
      display: "flex", minHeight: "100vh",
      filter: darkPool ? "blur(0) contrast(0.2)" : "none",
      transition: "filter 0.3s",
    }}>
      <Sidebar
        page={page}
        setPage={setPage}
        wallet={wallet}
        darkPool={darkPool}
        setDarkPool={setDarkPool}
      />

      <div style={{ marginLeft: 220, flex: 1, minWidth: 0 }}>
        <TopBar page={page} wallet={wallet} publicKey={publicKey} connect={connect} disconnect={disconnect} />
        <div style={{ padding: 20, background: "var(--black)", minHeight: "calc(100vh - 60px)" }}>
          {pageMap[page] ?? <DashboardPage positions={positions} orders={orders} history={history} />}
        </div>
      </div>
    </div>
  );
}

