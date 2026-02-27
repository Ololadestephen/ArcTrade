// ArcTrade — MEVProtectionBadge (app/components/privacy)
export function MEVProtectionBadge() {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "8px 14px",
      background: "var(--green-dim)",
      border: "1px solid rgba(16,185,129,0.2)",
      borderRadius: 2,
    }}>
      <span style={{ fontSize: 14 }}>🛡</span>
      <div>
        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "var(--green)", letterSpacing: "0.06em" }}>
          MEV PROTECTED
        </div>
        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "var(--dim)" }}>
          Front-running blocked
        </div>
      </div>
    </div>
  );
}

