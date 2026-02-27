import { PrivacyBadge } from "../privacy/PrivacyBadge";
import { PnLDisplay } from "../trading/PnLDisplay";

export function TradeHistory({ history = [], hideHeader = false }) {
    return (
        <div className={hideHeader ? "" : "card animate-in"} style={hideHeader ? { height: '100%' } : {}}>
            {!hideHeader && (
                <div className="card-header">
                    <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, color: "var(--ghost)", letterSpacing: "0.06em" }}>
                        TRADE HISTORY
                    </span>
                </div>
            )}
            <div style={{ overflowX: "auto" }}>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Time</th><th>Asset</th><th>Type</th><th>Side</th><th>Price</th>
                            <th>Size</th><th>Realized PnL</th><th>Privacy</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map((t, i) => (
                            <tr key={i}>
                                <td style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "var(--dim)" }}>{t.time}</td>
                                <td style={{ fontWeight: 700, color: "var(--bright)" }}>{t.asset}</td>
                                <td><span className="badge badge-violet">{t.type}</span></td>
                                <td><span className={`badge ${t.side === "Buy" ? "badge-green" : "badge-red"}`}>{t.side}</span></td>
                                <td style={{ fontFamily: "'DM Mono',monospace", color: "var(--text)" }}>{t.price}</td>
                                <td style={{ fontFamily: "'DM Mono',monospace" }}>{t.size}</td>
                                <td>
                                    {t.pnl !== undefined && t.pnl !== "Encrypted" ? (
                                        <PnLDisplay pnlAmount={t.pnl / 1e6} />
                                    ) : (
                                        <span style={{ color: "var(--dim)" }}>--</span>
                                    )}
                                </td>
                                <td>{t.priv ? <PrivacyBadge on={true} /> : <span className="badge badge-amber">PUBLIC</span>}</td>
                            </tr>
                        ))}
                        {history.length === 0 && (
                            <tr><td colSpan="8" style={{ textAlign: "center", padding: "20px", color: "var(--dim)", fontFamily: "'DM Mono',monospace", fontSize: 12 }}>No trade history</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
