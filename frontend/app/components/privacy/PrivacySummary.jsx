// ArcTrade — PrivacySummary (app/components/privacy)
const FIELDS = [
  { label: "Order Price",      status: "encrypted", icon: "🔐" },
  { label: "Order Size",       status: "encrypted", icon: "🔐" },
  { label: "Trade Direction",  status: "encrypted", icon: "🔐" },
  { label: "Counterparty",     status: "encrypted", icon: "🔐" },
  { label: "Final PnL",        status: "revealed",  icon: "👁"  },
];

export function PrivacySummary() {
  return (
    <div style={{
      padding: "16px",
      background: "var(--void)",
      border: "1px solid var(--border)",
      borderRadius: 2,
      animation: "fadeIn 0.4s ease",
    }}>
      <div style={{
        fontFamily: "'DM Mono',monospace", fontSize: 11,
        color: "var(--cyan)", letterSpacing: "0.1em", marginBottom: 12,
      }}>
        PRIVACY SUMMARY
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {FIELDS.map((f) => (
          <div key={f.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, color: "var(--dim)" }}>
              {f.label}
            </span>
            <span style={{
              fontFamily: "'DM Mono',monospace", fontSize: 11,
              color: f.status === "encrypted" ? "var(--cyan)" : "var(--amber)",
            }}>
              {f.icon} {f.status.toUpperCase()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

