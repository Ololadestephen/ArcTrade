// ArcTrade — EncryptionStatus (app/components/privacy)
export function EncryptionStatus({ active = true }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "12px 14px",
      background: "var(--black)",
      border: "1px solid var(--border)",
      borderRadius: 0,
    }}>
      <div style={{
        width: 7, height: 7, borderRadius: "50%",
        background: active ? "var(--cyan)" : "var(--amber)",
      }} />
      <div>
        <div style={{
          fontFamily: "'DM Mono',monospace", fontSize: 11,
          color: active ? "var(--cyan)" : "var(--amber)",
          letterSpacing: "0.08em",
          fontWeight: 500,
        }}>
          {active ? "MPC ENCRYPTED" : "PARTIAL"}
        </div>
      </div>
    </div>
  );
}
