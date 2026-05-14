// ArcTrade — PrivacySummary (app/components/privacy)
const FIELDS = [
  { label: "Order Price", status: "encrypted" },
  { label: "Order Size", status: "encrypted" },
  { label: "Trade Direction", status: "encrypted" },
  { label: "Counterparty", status: "encrypted" },
  { label: "Final PnL", status: "revealed" },
];

export function PrivacySummary() {
  return (
    <div style={{
      padding: "16px",
      background: "var(--void)",
      border: "1px solid var(--border)",
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
              {f.status.toUpperCase()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
