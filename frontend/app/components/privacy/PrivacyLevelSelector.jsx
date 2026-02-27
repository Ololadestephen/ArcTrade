// ArcTrade — PrivacyLevelSelector (app/components/privacy)
const OPTIONS = [
  { id: "full",    label: "Full Encryption", desc: "All data hidden via Arcium MPC", icon: "🔐" },
  { id: "partial", label: "Partial",         desc: "Size hidden, price visible",     icon: "🔏" },
  { id: "public",  label: "Public",          desc: "Visible on-chain",               icon: "👁"  },
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
              padding: "10px 12px",
              background: value === opt.id ? "var(--cyan-dim)" : "var(--void)",
              border: `1px solid ${value === opt.id ? "rgba(0,229,204,0.3)" : "var(--border)"}`,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <span style={{ fontSize: 15 }}>{opt.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 12, fontWeight: 700,
                color: value === opt.id ? "var(--cyan)" : "var(--text)",
              }}>
                {opt.label}
              </div>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "var(--dim)" }}>
                {opt.desc}
              </div>
            </div>
            {value === opt.id && (
              <span style={{ color: "var(--cyan)", fontSize: 14 }}>✓</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

