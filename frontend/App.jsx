import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import { CustomCursor } from "./app/components/common/CustomCursor";
import { LandingPage } from "./app/pages/LandingPage";
import { AppShell } from "./app/components/layout/AppShell";
import { useWallet } from "./app/hooks/useWallet";
import { usePrices } from "./app/hooks/usePrices";
import { getUserPositionPDA } from "./app/utils/constants";
import "./app/styles/globals.css";

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [darkPool, setDarkPool] = useState(false);
  const { wallet, publicKey, program, connect, disconnect } = useWallet();
  const { prices } = usePrices();
  const [positions, setPositions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [history, setHistory] = useState([]);
  const [hasAccount, setHasAccount] = useState(false);

  useEffect(() => {
    if (!program || !publicKey) {
      setHasAccount(false);
      setPositions([]);
      setOrders([]);
      setHistory([]);
      return;
    }

    async function fetchAllUserData() {
      try {
        const [posPDA] = getUserPositionPDA(publicKey);

        // 1. Fetch Position
        let onChainPos = null;
        try {
          window.__POS_FETCH_ERR__ = "";
          onChainPos = await program.account.userPositionAccount.fetchNullable(posPDA);
        } catch (err) {
          console.error("[App] fetchNullable userPosition error:", err);
          window.__POS_FETCH_ERR__ = String(err.stack || err.message);
        }

        if (onChainPos) {
          setHasAccount(true);
          const closedPos = JSON.parse(localStorage.getItem('arc_closed_positions') || '[]');
          // Usually positions have "asset" and "side" but the mock uses "Arcis Position" and "Hidden".
          // In the real table, we use asset-side to hide it.
          const isClosed = closedPos.includes("Arcis Position-Hidden") || Number(onChainPos.publicCollateral) === 0;

          if (!isClosed) {
            const solPrice = prices["SOL"]?.price;
            setPositions([
              {
                asset: "Arcis Position",
                side: "Hidden",
                size: "Encrypted",
                entry: "Encrypted",
                current: solPrice ? solPrice.toFixed(2) : "--",
                pnl: "Encrypted",
                pnlPct: "--",
                liqPrice: "Encrypted",
                health: 100, // Dummy health gauge
                collateral: (Number(onChainPos.publicCollateral) / 1e6).toFixed(2),
              }
            ]);
          } else {
            setPositions([]);
          }
        } else {
          setHasAccount(false);
          setPositions([]);
        }

        // 2. Fetch Orders
        try {
          const allOrders = await program.account.orderAccount.all([
            { memcmp: { offset: 16, bytes: publicKey.toBase58() } } // discriminator (8) + order_id (8)
          ]);

          // Filter out orders where status is not 1 (1 = Open, 2 = Cancelled, 3 = Matched)
          const cancelledOrders = JSON.parse(localStorage.getItem('arc_cancelled_orders') || '[]');
          const activeOrders = allOrders.filter(o =>
            o.account.status === 1 && !cancelledOrders.includes(o.account.orderId.toString())
          );

          setOrders(activeOrders.map(o => ({
            id: o.account.orderId.toString(),
            asset: "Arcis Market",
            type: "Private",
            side: "Hidden",
            price: "Encrypted",
            size: "Encrypted",
            filled: "0%",
            priv: true,
            time: "On-chain",
            status: "Open"
          })));
        } catch (e) {
          console.warn("[App] Failed to fetch orders (might be empty or missing index):", e.message);
          setOrders([]);
        }

        // 3. Fetch History (using mock or recent txs if no settled account)
        const storedHistory = localStorage.getItem("arc_dev_history");
        if (storedHistory) {
          const parsed = JSON.parse(storedHistory).map(h => ({
            ...h,
            id: h.id || `arc_${Math.random().toString(36).slice(2, 8)}`,
            date: h.time,
            pnl: (h.pnl / 1e6).toFixed(2),
          }));
          setHistory(parsed);
        } else {
          setHistory([]);
        }

      } catch (err) {
        console.error("[App] Data fetch failed:", err);
      }
    }

    fetchAllUserData();
    const timer = setInterval(fetchAllUserData, 5000);
    return () => clearInterval(timer);
  }, [program, publicKey, prices]);

  /** Wallet connect callback */
  const handleConnect = async (walletName) => {
    await connect(walletName);
  };

  const setPage = (p) => {
    if (p === "landing") navigate("/");
    else if (p === "wallet") navigate("/app/dashboard"); // Re-routed former wallet clicks straight to dashboard
    else navigate(`/app/${p}`);
  };

  // Derive page from url for AppShell active states
  let page = location.pathname.split("/").pop() || "landing";
  if (location.pathname === "/") page = "landing";

  return (
    <>
      <CustomCursor />

      <div className={`app-root ${darkPool ? "dark" : ""}`}>
        <div id="arc-cursor" />
        <div id="arc-ring" />
        <div id="arc-trail" />
        <div className="noise" />

        <Routes>
          <Route path="/" element={<LandingPage setPage={setPage} />} />

          <Route path="/app/*" element={
            <AppShell
              page={page}
              setPage={setPage}
              wallet={wallet}
              publicKey={publicKey}
              program={program}
              connect={handleConnect}
              disconnect={disconnect}
              positions={positions}
              orders={orders}
              history={history}
              hasAccount={hasAccount}
              darkPool={darkPool}
              setDarkPool={setDarkPool}
            />
          } />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </>
  );
}
