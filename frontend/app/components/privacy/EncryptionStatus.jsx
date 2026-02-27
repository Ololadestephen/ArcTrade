// ArcTrade — EncryptionStatus (app/components/privacy)
export function EncryptionStatus({ active = true }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "12px 14px",
      background: active ? "rgba(0, 229, 204, 0.05)" : "rgba(245,158,11,0.05)",
      border: `1px solid ${active ? "rgba(0, 229, 204, 0.15)" : "rgba(245,158,11,0.15)"}`,
      borderRadius: 8,
      boxShadow: active ? "inset 0 0 12px rgba(0, 229, 204, 0.05)" : "none",
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: 6,
        background: active ? "rgba(0, 229, 204, 0.1)" : "rgba(245,158,11,0.1)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 14,
        boxShadow: active ? "0 0 10px rgba(0, 229, 204, 0.2)" : "none",
      }}>
        {active ? "🔐" : "⚠️"}
      </div>
      <div>
        <div style={{
          fontFamily: "'DM Mono',monospace", fontSize: 11,
          color: active ? "var(--cyan)" : "var(--amber)",
          letterSpacing: "0.08em",
          fontWeight: 500,
        }}>
          {active ? "MPC ENCRYPTED" : "PARTIAL PRIVACY"}
        </div>
        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "var(--dim)", marginTop: 2 }}>
          Arcium MXE • 256-bit
        </div>
      </div>
    </div>
  );
}

