// ArcTrade — DarkPoolModeToggle (app/components/privacy)
export function DarkPoolModeToggle({ enabled, onToggle }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "12px 14px",
      background: "rgba(0, 0, 0, 0.2)",
      border: "1px solid rgba(255, 255, 255, 0.03)",
      borderRadius: 8,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 6,
          background: "rgba(124, 58, 237, 0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14,
          border: "1px solid rgba(124, 58, 237, 0.2)",
        }}>
          🌑
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--bright)", letterSpacing: "0.02em" }}>Dark Pool Mode</div>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "var(--dim)", marginTop: 2 }}>
            Hides UI safely
          </div>
        </div>
      </div>
      <label className="toggle" style={{ transform: "scale(0.9)" }}>
        <input type="checkbox" checked={enabled} onChange={onToggle} />
        <span className="toggle-slider" />
      </label>
    </div>
  );
}

