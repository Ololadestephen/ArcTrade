// ArcTrade — PrivacyBadge (app/components/privacy)
export function PrivacyBadge({ on = true }) {
  return (
    <span className={`badge ${on ? "badge-cyan" : "badge-amber"}`}>
      <span style={{
        width: 5, height: 5,
        borderRadius: "50%",
        background: "currentColor",
        animation: "blink 1.5s infinite",
      }} />
      {on ? "ENCRYPTED" : "PARTIAL"}
    </span>
  );
}

