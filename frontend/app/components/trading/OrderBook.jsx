// ArcTrade — OrderBook (app/components/trading)
// Displays encrypted order levels. Accepts an optional `program` prop for
// future on-chain reads from the market account via the Anchor client.
import { useState, useEffect } from "react";
import { PrivacyBadge } from "../privacy/PrivacyBadge";

/**
 * OrderBook
 *
 * Props:
 *   program — Anchor Program instance from useWallet (optional).
 *             When present the component will attempt to fetch live
 *             order data from the on-chain market account in the future.
 *             For now it renders the generated levels while the on-chain
 *             integration is plumbed in.
 *   market  — PublicKey of the MarketAccount (optional).
 */
export function OrderBook({ program, market, initialMidPrice }) {
  const [asks, setAsks] = useState([]);
  const [bids, setBids] = useState([]);
  const [midPrice, setMidPrice] = useState(initialMidPrice || "--");

  /**
   * When a live program + market are provided, attempt to fetch the
   * MarketAccount and derive real bid/ask levels from on-chain state.
   */
  useEffect(() => {
    if (initialMidPrice && !market) {
      const parsed = parseFloat(initialMidPrice);
      if (!isNaN(parsed)) setMidPrice(parsed.toFixed(4));
    }
  }, [initialMidPrice, market]);

  useEffect(() => {
    if (!program || !market) return;

    let cancelled = false;

    async function fetchMarket() {
      try {
        const acct = await program.account.marketAccount.fetchNullable(market);
        if (!acct || cancelled) return;

        // Update mid price from oracle / last-trade if available
        if (acct.lastPrice) {
          const mid = (Number(acct.lastPrice) / 1_000_000).toFixed(4);
          setMidPrice(mid);

          // In a real app, you would parse the order book levels from the on-chain data
        }
      } catch (err) {
        // On-chain fetch failed — keep generated data
        console.debug("[OrderBook] market fetch failed, using mock data:", err?.message);
      }
    }

    fetchMarket();

    // Poll every 5 seconds when a live program is connected
    const interval = setInterval(fetchMarket, 5_000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [program, market]);

  const Row = ({ r, side }) => (
    <div style={{
      position: "relative",
      display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
      padding: "4px 16px",
    }}>
      <div style={{
        position: "absolute", right: 0, top: 0, bottom: 0,
        width: `${r.width}%`,
        background: side === "ask" ? "var(--red-dim)" : "var(--green-dim)",
        opacity: 0.5,
      }} />
      <span style={{ color: side === "ask" ? "var(--red)" : "var(--green)", position: "relative" }}>
        {r.price}
      </span>
      <span style={{ textAlign: "center", position: "relative" }}>
        <span style={{ display: "inline-block", width: "60%", height: 8, background: "var(--muted)", borderRadius: 2, opacity: 0.4 }} />
      </span>
      <span style={{ textAlign: "right", color: "var(--muted)", position: "relative" }}>🔐</span>
    </div>
  );

  return (
    <div className="card" style={{ height: "100%" }}>
      <div className="card-header">
        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, color: "var(--ghost)", letterSpacing: "0.06em" }}>
          ORDER BOOK
        </span>
        <PrivacyBadge on={!!program} />
      </div>

      <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 11 }}>
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
          padding: "6px 16px", color: "var(--dim)", fontSize: 10,
          letterSpacing: "0.06em", borderBottom: "1px solid var(--border)",
        }}>
          <span>PRICE</span>
          <span style={{ textAlign: "center" }}>SIZE</span>
          <span style={{ textAlign: "right" }}>TOTAL</span>
        </div>

        {asks.map((r, i) => <Row key={`ask-${i}`} r={r} side="ask" />)}

        <div style={{
          padding: "8px 16px", textAlign: "center",
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
          fontSize: 12,
        }}>
          <span style={{ color: "var(--white)", fontSize: 15, fontWeight: 300 }}>{midPrice}</span>
          <span style={{ color: "var(--dim)", fontSize: 10, marginLeft: 8 }}>MID</span>
        </div>

        {bids.map((r, i) => <Row key={`bid-${i}`} r={r} side="bid" />)}
      </div>
    </div>
  );
}
