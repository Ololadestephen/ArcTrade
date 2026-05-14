// ArcTrade — Sidebar (app/components/layout)
import { EncryptionStatus } from "../privacy/EncryptionStatus";
import { NAV_ITEMS } from "../../utils/navigation";

export function Sidebar({ page, setPage, wallet }) {
  return (
    <div style={{
      width: 220,
      background: "var(--void)",
      borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column",
      height: "100vh",
      position: "fixed", top: 0, left: 0,
      zIndex: 50,
    }}>
      <div style={{ padding: "24px 20px 18px", borderBottom: "1px solid var(--border)" }}>
        <button
          onClick={() => setPage("landing")}
          style={{
            background: "none",
            border: "none",
            color: "var(--ink)",
            fontFamily: "'Instrument Serif', serif",
            fontSize: 27,
            lineHeight: 1,
            cursor: "pointer",
          }}
        >
          ArcTrade
        </button>
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
                background: active ? "#3f3f3f" : "transparent",
                border: active ? "1px solid #3f3f3f" : "1px solid transparent",
                cursor: "pointer", marginBottom: 2,
                transition: "all 0.1s ease", textAlign: "left",
              }}
            >
              <span style={{
                fontFamily: "'DM Mono',monospace", fontSize: 12,
                letterSpacing: "0.05em",
                color: active ? "#ffffff" : "var(--dim)",
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
        <div style={{
          padding: "12px 14px",
          background: "var(--black)",
          border: "1px solid var(--border)",
          display: "flex", flexDirection: "column", gap: 4
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "var(--dim)", letterSpacing: "0.06em" }}>
              ACTIVE WALLET
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "'DM Mono',monospace", fontSize: 9, color: "var(--green)", background: "var(--green-dim)", padding: "2px 6px", borderRadius: 10 }}>
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
