export function PnLDisplay({ pnlAmount, pnlPercentage }) {
    const isProfit = pnlAmount >= 0;
    const color = isProfit ? "var(--green)" : "var(--red)";
    const sign = isProfit ? "+" : "";

    return (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontFamily: "'DM Mono',monospace", color: color, fontWeight: 500 }}>
                {sign}${Math.abs(pnlAmount).toFixed(2)}
            </span>
            {pnlPercentage !== undefined && (
                <span className={`badge ${isProfit ? "badge-green" : "badge-red"}`}>
                    {sign}{Math.abs(pnlPercentage).toFixed(2)}%
                </span>
            )}
        </div>
    );
}
