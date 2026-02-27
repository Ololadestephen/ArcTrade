// ArcTrade — TopBar (app/components/layout)
import { MEVProtectionBadge } from "../privacy/MEVProtectionBadge";

export function TopBar({ page, wallet, connect, disconnect }) {
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
          <button className="btn btn-primary btn-sm" onClick={() => connect("Phantom")} style={{ fontSize: 10 }}>
            CONNECT WALLET
          </button>
        )}
      </div>
    </div>
  );
}

