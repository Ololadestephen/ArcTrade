// ArcTrade — Logo (app/components/common)
export function Logo({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        background: "none", border: "none", cursor: "pointer",
      }}
    >
      <div style={{
        width: 28, height: 28,
        border: "1px solid var(--cyan)",
        display: "grid", placeItems: "center",
        transform: "rotate(45deg)", flexShrink: 0,
      }}>
        <div style={{
          width: 10, height: 10,
          background: "var(--cyan)",
          clipPath: "polygon(50% 0%,100% 50%,50% 100%,0% 50%)",
          animation: "pulse 2s infinite",
        }} />
      </div>
      <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: "-0.02em", color: "var(--white)" }}>
        Arc<span style={{ color: "var(--cyan)" }}>Trade</span>
      </span>
    </button>
  );
}

