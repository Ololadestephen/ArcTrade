import { useState, useEffect, useMemo } from "react";
import { usePrices } from "../hooks/usePrices";
import { PriceChart } from "../components/trading/PriceChart";
import { OrderForm } from "../components/trading/OrderForm";
import { PrivacySummary } from "../components/privacy/PrivacySummary";
import { PositionsList } from "../components/portfolio/PositionsList";
import { OrdersList } from "../components/portfolio/OrdersList";
import { TradeHistory } from "../components/portfolio/TradeHistory";
import { useMatching } from "../hooks/useMatching";
import { useSettlement } from "../hooks/useSettlement";
import { useToast } from "../hooks/useToast";
import { getMarketPDA, getComputationConfigPDA, SOL_MINT_DEVNET, getUserPositionPDA } from "../utils/constants";
import { BN } from "@coral-xyz/anchor";
import * as anchor from "@coral-xyz/anchor";

export function TradePage({ program, publicKey, wallet, positions = [], orders = [], hasAccount }) {
  const { prices } = usePrices();
  const [activeTab, setActiveTab] = useState("positions");
  const [trades, setTrades] = useState([]);
  const [localHistory, setLocalHistory] = useState(() => {
    const cached = localStorage.getItem("arc_dev_history");
    return cached ? JSON.parse(cached) : [];
  });
  const [loading, setLoading] = useState(false);
  const { message: toast, show: showToast } = useToast(3500);

  // Derive necessary on-chain PDAs
  const [market] = useMemo(() => getMarketPDA(SOL_MINT_DEVNET), []);
  const [computationConfig] = useMemo(() => getComputationConfigPDA(), []);

  // Check if user has an initialized position
  const isInitialized = hasAccount;

  const solPrice = prices["SOL"]?.price;
  const solChange = prices["SOL"]?.change;

  // Update trades when solPrice changes significantly
  useEffect(() => {
    // In a real app, you would fetch real trades or subscribe to a websocket
  }, [solPrice]);

  useMatching(program);

  useSettlement(program, (settlementData) => {
    const o = settlementData.originalOrder || {};
    setLocalHistory(prev => {
      const updated = [{
        time: new Date().toLocaleTimeString(),
        asset: o.market || "Arcis Market",
        type: "Private",
        side: o.type || (settlementData.pnl >= 0 ? "Buy" : "Sell"),
        price: solPrice || "Encrypted",
        size: o.size || "Encrypted",
        pnl: settlementData.pnl,
        priv: true
      }, ...prev];
      localStorage.setItem("arc_dev_history", JSON.stringify(updated.slice(0, 50))); // Keep last 50
      return updated;
    });
  });

  const handleInitialize = async () => {
    if (!program || !publicKey) return;
    setLoading(true);
    try {
      showToast("🚀 Initializing your Arcium trading account...");
      const sig = await program.methods
        .initializeUserPosition(new BN(0))
        .accounts({
          payer: publicKey,
          owner: publicKey,
          userPosition: getUserPositionPDA(publicKey)[0],
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
      showToast(`✅ Account created! Tx: ${sig.slice(0, 16)}...`);
      // The polling in App.jsx will pick up the new position automatically
    } catch (err) {
      console.error("[TradePage] Init failed:", err);
      showToast("❌ Initialization failed. Check console.");
    } finally {
      setLoading(false);
    }
  };

  const handleOrder = ({ sig } = {}) => {
    if (sig) {
      showToast(`✅ Order submitted — tx: ${sig.slice(0, 16)}…`);
    } else {
      showToast("🔐 Order encrypted and submitted to MPC network…");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2, height: "calc(100vh - 100px)", animation: "fadeIn 0.4s ease" }}>
      {toast && (
        <div style={{
          position: "fixed", top: 80, right: 24, zIndex: 200, padding: "14px 20px",
          background: "var(--panel)", border: "1px solid var(--cyan)", borderRadius: 2,
          fontFamily: "'DM Mono',monospace", fontSize: 13, color: "var(--cyan)",
          animation: "slideIn 0.3s ease", maxWidth: 360,
        }}>
          {toast}
        </div>
      )}

      {/* DEBUG ERRORS IF PROGRAM FAILS */}
      {!program && window.__PROGRAM_INIT_ERR__ && (
        <div style={{
          margin: "0 0 16px 0", padding: "12px", background: "rgba(255,59,59,0.1)",
          border: "1px solid var(--red)", color: "var(--red)", fontFamily: "monospace",
          fontSize: 12, borderRadius: 4, whiteSpace: "pre-wrap"
        }}>
          <b>Developer Debug:</b> Anchor Program failed to initialize:
          <br />{window.__PROGRAM_INIT_ERR__}
        </div>
      )}

      {/* DEBUG ERRORS IF POSITION FAILS TO FETCH */}
      {window.__POS_FETCH_ERR__ && (
        <div style={{
          margin: "0 0 16px 0", padding: "12px", background: "rgba(255,165,0,0.1)",
          border: "1px solid var(--amber)", color: "var(--amber)", fontFamily: "monospace",
          fontSize: 12, borderRadius: 4, whiteSpace: "pre-wrap"
        }}>
          <b>Developer Debug:</b> Position failed to deserialize:
          <br />{window.__POS_FETCH_ERR__}
        </div>
      )}

      {/* MAIN TWO-COLUMN LAYOUT */}
      <div style={{ display: "flex", gap: 2, flex: 1, minHeight: 0 }}>

        {/* LEFT COLUMN: Stats, Chart & Positions */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>

          {/* Top Stats Bar */}
          <div className="card animate-in" style={{ padding: "12px 20px", display: "flex", gap: 32, alignItems: "center", borderRadius: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(0,229,204,0.1)", border: "1px solid rgba(0,229,204,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>◎</div>
              <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 18, color: "var(--white)" }}>SOL/USDC</span>
            </div>
            <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.1)" }} />
            <div>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "var(--dim)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Mark Price</div>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 14, color: "var(--cyan)", fontWeight: 500, marginTop: 2 }}>{solPrice ? `$${solPrice.toFixed(2)}` : "--"}</div>
            </div>
            <div>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "var(--dim)", textTransform: "uppercase", letterSpacing: "0.05em" }}>24H Change</div>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 14, color: (parseFloat(solChange) >= 0 ? "var(--green)" : "var(--red)"), fontWeight: 500, marginTop: 2 }}>{solChange ? `${parseFloat(solChange) > 0 ? "+" : ""}${parseFloat(solChange).toFixed(2)}%` : "--"}</div>
            </div>
            <div>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "var(--dim)", textTransform: "uppercase", letterSpacing: "0.05em" }}>24H Vol</div>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 14, color: "var(--white)", fontWeight: 500, marginTop: 2 }}>$227.85M</div>
            </div>
            <div>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "var(--dim)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Open Interest</div>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 14, color: "var(--white)", fontWeight: 500, marginTop: 2 }}>$45.2M</div>
            </div>
          </div>

          {/* Chart Area */}
          <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
            <PriceChart asset="SOL/USDC" currentPrice={solPrice} change={solChange} />
          </div>

          {/* Bottom Positions Area */}
          <div className="card animate-in" style={{ height: 280, display: "flex", flexDirection: "column", flexShrink: 0 }}>
            {/* Tabs Header */}
            <div style={{ padding: "0 16px", borderBottom: "1px solid var(--border)", display: "flex", gap: 24 }}>
              <button
                className={`tab ${activeTab === "positions" ? "active" : ""}`}
                onClick={() => setActiveTab("positions")}
                style={{ fontSize: 13, padding: "12px 4px", background: "transparent", color: activeTab === "positions" ? "var(--cyan)" : "var(--dim)" }}
              >
                Positions
              </button>
              <button
                className={`tab ${activeTab === "orders" ? "active" : ""}`}
                onClick={() => setActiveTab("orders")}
                style={{ fontSize: 13, padding: "12px 4px", background: "transparent", color: activeTab === "orders" ? "var(--cyan)" : "var(--dim)" }}
              >
                Open Orders
              </button>
              <button
                className={`tab ${activeTab === "history" ? "active" : ""}`}
                onClick={() => setActiveTab("history")}
                style={{ fontSize: 13, padding: "12px 4px", background: "transparent", color: activeTab === "history" ? "var(--cyan)" : "var(--dim)" }}
              >
                History
              </button>
            </div>

            {/* Tab Content */}
            <div style={{ flex: 1, minWidth: 0, overflowY: "auto", display: "flex", flexDirection: "column" }}>
              {activeTab === "positions" && (
                <PositionsList
                  positions={positions}
                  hideHeader={true}
                  program={program}
                  publicKey={publicKey}
                  market={market}
                  arciumAccounts={{ computationConfig }}
                  currentPrice={solPrice}
                  showToast={showToast}
                />
              )}
              {activeTab === "orders" && (
                <OrdersList
                  orders={orders}
                  hideHeader={true}
                  program={program}
                  publicKey={publicKey}
                  market={market}
                  arciumAccounts={{ computationConfig }}
                  showToast={showToast}
                />
              )}
              {activeTab === "history" && (
                <TradeHistory
                  history={localHistory}
                  hideHeader={true}
                />
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Order Form & Privacy */}
        <div style={{ width: 340, display: "flex", flexDirection: "column", gap: 2, flexShrink: 0 }}>
          {!isInitialized && publicKey && program && (
            <div className="animate-in" style={{
              padding: "16px 20px", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.4)",
              borderRadius: "8px", display: "flex", flexDirection: "column", gap: 12,
              boxShadow: "0 0 15px rgba(245,158,11,0.05)"
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ fontSize: 16, marginTop: 2 }}>⚠️</span>
                <div style={{ fontFamily: "'DM Mono',monospace", color: "var(--amber)", fontSize: 12, lineHeight: 1.4 }}>
                  Wallet connected but NO TRADING ACCOUNT found. Initialize to begin.
                </div>
              </div>
              <button
                className="btn"
                onClick={handleInitialize}
                disabled={loading}
                style={{ background: "var(--amber)", color: "var(--black)", fontWeight: 700, justifyContent: "center" }}
              >
                {loading ? "INITIALIZING..." : "INITIALIZE NOW"}
              </button>
            </div>
          )}

          <div style={{ flex: 1, minHeight: 0, overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
            <OrderForm
              onSubmit={handleOrder}
              program={program}
              publicKey={publicKey}
              walletLabel={wallet}
              market={market}
              arciumAccounts={{ computationConfig }}
              currentPrice={solPrice}
            />
            <div style={{ marginTop: 2 }}>
              <PrivacySummary />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
