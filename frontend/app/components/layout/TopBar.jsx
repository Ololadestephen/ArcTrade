// ArcTrade — TopBar (app/components/layout)
import { useState } from "react";
import { MEVProtectionBadge } from "../privacy/MEVProtectionBadge";

export function TopBar({ page, wallet, connect, disconnect }) {
  const [showWallets, setShowWallets] = useState(false);

  return (
    <div style={{
      height: 60,
      background: "var(--black)",
      borderBottom: "1px solid var(--border)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 28px",
      position: "sticky", top: 0, zIndex: 40,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "var(--dim)", letterSpacing: "0.08em" }}>
          /app/
        </span>
        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 13, color: "var(--bright)", fontWeight: 500 }}>
          {page}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "'DM Mono',monospace", fontSize: 11, color: "var(--green)" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)", animation: "blink 1.5s infinite" }} />
          Devnet
        </div>
        <MEVProtectionBadge />
        <div style={{ width: 1, height: 20, background: "var(--border)", margin: "0 8px" }} />
        {wallet ? (
          <button className="btn btn-ghost btn-sm" onClick={disconnect} style={{ color: "var(--red)", borderColor: "var(--red)", fontSize: 10 }}>
            DISCONNECT
          </button>
        ) : (
          <div style={{ position: "relative" }}>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowWallets(!showWallets)}
              style={{ fontSize: 10 }}
            >
              CONNECT WALLET ▾
            </button>
            {showWallets && (
              <div style={{
                position: "absolute", top: "100%", right: 0, marginTop: 8,
                background: "var(--panel)", border: "1px solid var(--border)",
                display: "flex", flexDirection: "column", padding: 8, gap: 4,
                zIndex: 100, minWidth: 150, boxShadow: "0 4px 12px rgba(0,0,0,0.5)"
              }}>
                {["Phantom", "Solflare", "Backpack"].map(w => (
                  <button
                    key={w}
                    className="btn btn-ghost btn-sm"
                    onClick={() => { connect(w); setShowWallets(false); }}
                    style={{ justifyContent: "flex-start", fontSize: 11, padding: "8px 12px", color: "var(--bright)" }}
                  >
                    {w}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
