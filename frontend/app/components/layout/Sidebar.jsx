// ArcTrade — Sidebar (app/components/layout)
import { Logo } from "../common/Logo";
import { EncryptionStatus } from "../privacy/EncryptionStatus";
import { DarkPoolModeToggle } from "../privacy/DarkPoolModeToggle";
import { NAV_ITEMS } from "../../utils/navigation";

export function Sidebar({ page, setPage, wallet, darkPool, setDarkPool }) {
  return (
    <div style={{
      width: 220,
      background: "var(--black)",
      borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column",
      height: "100vh",
      position: "fixed", top: 0, left: 0,
      zIndex: 50,
    }}>
      <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid var(--border)" }}>
        <Logo onClick={() => setPage("landing")} />
      </div>

      <div style={{ padding: "12px 8px", flex: 1 }}>
        {NAV_ITEMS.map((item) => {
          const active = page === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              style={{
                width: "100%",
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 12px",
                background: active ? "var(--cyan)" : "transparent",
                border: active ? "1px solid var(--cyan)" : "1px solid transparent",
                cursor: "pointer", marginBottom: 2,
                transition: "all 0.1s ease", textAlign: "left",
              }}
            >
              <span style={{ fontSize: 15, opacity: active ? 1 : 0.5 }}>{item.icon}</span>
              <span style={{
                fontFamily: "'DM Mono',monospace", fontSize: 12,
                letterSpacing: "0.05em",
                color: active ? "var(--black)" : "var(--dim)",
                fontWeight: 500,
              }}>
                {item.label.toUpperCase()}
              </span>
            </button>
          );
        })}
      </div>

      <div style={{ padding: "12px", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 10 }}>
        <EncryptionStatus active={true} />
        <DarkPoolModeToggle enabled={darkPool} onToggle={() => setDarkPool((p) => !p)} />
        <div style={{
          padding: "12px 14px",
          background: "var(--void)",
          border: "1px solid var(--border)",
          display: "flex", flexDirection: "column", gap: 4
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "var(--dim)", letterSpacing: "0.06em" }}>
              ACTIVE WALLET
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "'DM Mono',monospace", fontSize: 9, color: "var(--green)", background: "rgba(16, 185, 129, 0.1)", padding: "2px 6px", borderRadius: 10 }}>
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--green)" }} />
              ON
            </span>
          </div>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "var(--bright)", letterSpacing: "0.02em", overflow: "hidden", textOverflow: "ellipsis" }}>
            {wallet || "Not connected"}
          </div>
        </div>
      </div>
    </div>
  );
}

