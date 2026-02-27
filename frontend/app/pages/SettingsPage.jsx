// ArcTrade — SettingsPage (app/pages)
import { useState } from "react";
import { PrivacyLevelSelector } from "../components/privacy/PrivacyLevelSelector";
import { DarkPoolModeToggle } from "../components/privacy/DarkPoolModeToggle";
import { PrivacySummary } from "../components/privacy/PrivacySummary";

import { PROGRAM_ID, ARCIUM_PROGRAM_ID, CLUSTER } from "../utils/constants";

const NOTIFICATION_OPTIONS = [
  { id: "trades", label: "Trade Settlements", desc: "When trades settle" },
  { id: "liq", label: "Liquidation Alerts", desc: "Position health warnings" },
  { id: "mev", label: "MEV Attempts", desc: "Blocked MEV notifications" },
];

export function SettingsPage({ darkPool, setDarkPool, wallet, publicKey, disconnect }) {
  const [privLevel, setPrivLevel] = useState("full");
  const [notifs, setNotifs] = useState({ trades: true, liq: true, mev: false });

  const toggleNotif = (id) => setNotifs((prev) => ({ ...prev, [id]: !prev[id] }));

  const walletDisplay = wallet || "Not Connected";
  const truncatedWallet = wallet ? `${wallet.slice(0, 4)}...${wallet.slice(-4)}` : "Disconnected";

  return (
    <div style={{ animation: "fadeIn 0.4s ease", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, alignItems: "start" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <div className="card">
          <div className="card-header">
            <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, color: "var(--ghost)", letterSpacing: "0.06em" }}>
              PRIVACY DEFAULTS
            </span>
          </div>
          <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>
            <PrivacyLevelSelector value={privLevel} onChange={setPrivLevel} />
            <DarkPoolModeToggle enabled={darkPool} onToggle={() => setDarkPool((p) => !p)} />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, color: "var(--ghost)", letterSpacing: "0.06em" }}>
              NOTIFICATIONS
            </span>
          </div>
          <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 12 }}>
            {NOTIFICATION_OPTIONS.map((n) => (
              <div key={n.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px",
                background: "var(--void)", border: "1px solid var(--border)",
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--bright)" }}>{n.label}</div>
                  <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "var(--dim)" }}>{n.desc}</div>
                </div>
                <label className="toggle">
                  <input type="checkbox" checked={notifs[n.id]} onChange={() => toggleNotif(n.id)} />
                  <span className="toggle-slider" />
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, color: "var(--ghost)", letterSpacing: "0.06em" }}>
              NETWORK & PROGRAM IDS
            </span>
          </div>
          <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontFamily: "'DM Mono',monospace" }}>
              <span style={{ color: "var(--dim)" }}>CLUSTER</span>
              <span style={{ color: "var(--bright)" }}>{CLUSTER.toUpperCase()}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontFamily: "'DM Mono',monospace" }}>
              <span style={{ color: "var(--dim)" }}>PROGRAM ID</span>
              <span style={{ color: "var(--cyan)", cursor: "help" }} title={PROGRAM_ID.toBase58()}>
                {PROGRAM_ID.toBase58().slice(0, 6)}...{PROGRAM_ID.toBase58().slice(-6)}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontFamily: "'DM Mono',monospace" }}>
              <span style={{ color: "var(--dim)" }}>ARCIUM ID</span>
              <span style={{ color: "var(--ghost)", cursor: "help" }} title={ARCIUM_PROGRAM_ID.toBase58()}>
                {ARCIUM_PROGRAM_ID.toBase58().slice(0, 6)}...{ARCIUM_PROGRAM_ID.toBase58().slice(-6)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <div className="card">
          <div className="card-header">
            <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, color: "var(--ghost)", letterSpacing: "0.06em" }}>
              WALLET
            </span>
          </div>
          <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ padding: "16px", background: "var(--void)", border: "1px solid var(--border)" }}>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "var(--dim)", marginBottom: 6 }}>
                {wallet ? "CONNECTED" : "STATUS"}
              </div>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 13, color: wallet ? "var(--cyan)" : "var(--red)" }}>
                {truncatedWallet}
              </div>
              {wallet && (
                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "var(--dim)", marginTop: 4 }}>
                  Phantom • {CLUSTER}
                </div>
              )}
            </div>
            {wallet ? (
              <button
                className="btn btn-ghost"
                onClick={disconnect}
                style={{ justifyContent: "center", color: "var(--red)", borderColor: "rgba(239,68,68,0.2)" }}
              >
                Disconnect Wallet
              </button>
            ) : (
              <button className="btn btn-primary" style={{ justifyContent: "center" }} onClick={() => connect("Phantom")}>
                Connect Wallet
              </button>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, color: "var(--ghost)", letterSpacing: "0.06em" }}>
              DATA
            </span>
          </div>
          <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 8 }}>
            <button className="btn btn-ghost" style={{ justifyContent: "center" }} disabled>Export Trade History</button>
            <button className="btn btn-ghost" style={{ justifyContent: "center" }} disabled>Export Positions</button>
            <button className="btn btn-danger" style={{ justifyContent: "center", marginTop: 8 }} onClick={() => localStorage.clear()}>
              Clear Local Cache
            </button>
          </div>
        </div>

        <PrivacySummary />
      </div>
    </div>
  );
}

