// ArcTrade — PriceChart (app/components/trading)
import { useEffect, useRef } from "react";

export function PriceChart({ asset = "SOL/USDC", currentPrice, change }) {

  // Raydium SOL/USDC pool on Solana
  const containerId = "tradingview_chart";
  const containerRef = useRef(null);

  useEffect(() => {
    // Check if script already exists to avoid duplicates
    let script = document.getElementById("tradingview-widget-script");

    const initWidget = () => {
      if (typeof window.TradingView !== "undefined" && containerRef.current) {
        // Clear container first to prevent duplicate iframes during fast re-renders
        containerRef.current.innerHTML = "";
        new window.TradingView.widget({
          "autosize": true, // Dynamically fill the flex container instead of hardcoding 500px
          "symbol": "BINANCE:SOLUSDT",
          "interval": "60",
          "timezone": "Etc/UTC",
          "theme": "dark",
          "style": "1",
          "locale": "en",
          "toolbar_bg": "#f1f3f6",
          "enable_publishing": false,
          "hide_top_toolbar": false,
          "save_image": false,
          "container_id": containerId
        });
      }
    };

    if (!script) {
      script = document.createElement("script");
      script.id = "tradingview-widget-script";
      script.src = "https://s3.tradingview.com/tv.js";
      script.async = true;
      script.onload = initWidget;
      document.body.appendChild(script);
    } else {
      initWidget();
    }
  }, []);

  return (
    <div className="card animate-in" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div className="card-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontWeight: 700, color: "var(--bright)" }}>SOL / USDC</span>
          <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 18, color: "var(--cyan)", fontWeight: 300 }}>
            {currentPrice ? `$${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "--"}
          </span>
          {change && (
            <span className={`badge ${parseFloat(change) >= 0 ? "badge-green" : "badge-red"}`}>
              {parseFloat(change) >= 0 ? "+" : ""}{change}%
            </span>
          )}
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
        <div
          id={containerId}
          ref={containerRef}
          style={{ height: "100%", width: "100%" }}
        />
      </div>
    </div>
  );
}
