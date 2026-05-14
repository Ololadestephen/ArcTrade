// ArcTrade — MEVProtectionBadge (app/components/privacy)
export function MEVProtectionBadge() {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "8px 14px",
      background: "var(--green-dim)",
      border: "1px solid var(--border)",
      borderRadius: 2,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)" }} />
      <div>
        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "var(--green)", letterSpacing: "0.06em" }}>
          MEV PROTECTED
        </div>
      </div>
    </div>
  );
}
