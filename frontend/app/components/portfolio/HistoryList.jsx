// ArcTrade — HistoryList (app/components/portfolio)
import { PrivacyBadge } from "../privacy/PrivacyBadge";

export function HistoryList({ history = [] }) {
    return (
        <div className="card animate-in">
            <div className="card-header">
                <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, color: "var(--ghost)", letterSpacing: "0.06em" }}>
                    TRADE HISTORY
                </span>
            </div>
            <div style={{ overflowX: "auto" }}>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Tx ID</th><th>Asset</th><th>Side</th><th>Size</th>
                            <th>Price</th><th>PnL</th><th>Privacy</th><th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map((h, i) => (
                            <tr key={i}>
                                <td style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "var(--dim)" }}>{h.id}</td>
                                <td style={{ fontWeight: 700, color: "var(--bright)" }}>{h.asset}</td>
                                <td><span className={`badge ${h.side === "Buy" ? "badge-green" : "badge-red"}`}>{h.side}</span></td>
                                <td style={{ fontFamily: "'DM Mono',monospace" }}>{h.size}</td>
                                <td style={{ fontFamily: "'DM Mono',monospace" }}>${h.price}</td>
                                <td style={{ fontFamily: "'DM Mono',monospace", fontWeight: 600 }}>{h.pnl}</td>
                                <td>{h.priv ? <PrivacyBadge on={true} /> : <span className="badge badge-amber">PUBLIC</span>}</td>
                                <td style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "var(--dim)" }}>{h.date}</td>
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
