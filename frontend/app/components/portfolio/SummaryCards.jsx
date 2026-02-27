// ArcTrade — SummaryCards (app/components/portfolio)
import { Sparkline } from "../common/Sparkline";

export function SummaryCards({ positions = [], orders = [] }) {
  const totalValue = positions.reduce((acc, p) => {
    const val = parseFloat(p.collateral?.toString().replace(/,/g, ''));
    return acc + (isNaN(val) ? 0 : val);
  }, 0);
  const totalPnL = positions.reduce((acc, p) => {
    const val = parseFloat(p.pnl.replace("$", "").replace("+", ""));
    return acc + (isNaN(val) ? 0 : val);
  }, 0);

  const cards = [
    {
      label: "Net Collateral",
      value: positions.length > 0 ? `$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "$0.00",
      sub: positions.length > 0 ? `Public Margin` : "No active positions",
      subColor: "var(--ghost)",
      icon: "💼",
      spark: true
    },
    { label: "Open Positions", value: positions.length, sub: "On-chain PDA", subColor: "var(--cyan)", icon: "📊", spark: false },
    { label: "Hidden Orders", value: orders.length, sub: "Encrypted instances", subColor: "var(--cyan)", icon: "🔐", spark: false },
    {
      label: "Total PnL",
      value: totalPnL >= 0 ? `+$${totalPnL.toFixed(2)}` : `-$${Math.abs(totalPnL).toFixed(2)}`,
      sub: "Unrealized",
      subColor: totalPnL >= 0 ? "var(--green)" : "var(--red)",
      icon: "📈",
      spark: false
    },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 2, marginBottom: 2 }}>
      {cards.map((c, i) => (
        <div key={i} className="card" style={{ padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{
              fontFamily: "'DM Mono',monospace", fontSize: 11,
              color: "var(--dim)", letterSpacing: "0.08em", textTransform: "uppercase",
            }}>
              {c.label}
            </div>
            <span style={{ fontSize: 18 }}>{c.icon}</span>
          </div>

          <div style={{
            fontFamily: "'DM Mono',monospace", fontSize: 24,
            fontWeight: 300, color: "var(--white)", marginBottom: 4,
          }}>
            {c.value}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: c.subColor }}>
              {c.sub}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

