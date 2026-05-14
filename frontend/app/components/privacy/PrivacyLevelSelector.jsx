// ArcTrade — PrivacyLevelSelector (app/components/privacy)
const OPTIONS = [
  { id: "full", label: "Full encryption" },
  { id: "partial", label: "Partial" },
  { id: "public", label: "Public" },
];

export function PrivacyLevelSelector({ value, onChange }) {
  return (
    <div>
      <label>Privacy Level</label>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {OPTIONS.map((opt) => (
          <div
            key={opt.id}
            onClick={() => onChange(opt.id)}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "12px 14px",
              background: value === opt.id ? "var(--cyan-dim)" : "var(--void)",
              border: `1px solid ${value === opt.id ? "var(--cyan)" : "var(--border)"}`,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 12, fontWeight: 700,
                color: value === opt.id ? "var(--cyan)" : "var(--text)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}>
                {opt.label}
              </div>
            </div>
            {value === opt.id && (
              <span style={{ color: "var(--cyan)", fontSize: 14 }}>Selected</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
