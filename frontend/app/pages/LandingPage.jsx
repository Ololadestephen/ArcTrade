import { Logo } from "../components/common/Logo";
import { usePrices } from "../hooks/usePrices";

const STATS = [
  ["100%", "Confidential Computing"],
  ["∞", "MEV Protection"],
  ["256-bit", "Encryption"],
  ["~400ms", "MPC Compute"],
];

const FEATURES = [
  { icon: "🌑", tag: "Dark Pool", title: "Hidden Orders", desc: "Encrypted order book. No one can front-run what they can't see." },
  { icon: "🛡", tag: "MEV Shield", title: "MEV Protected", desc: "Sandwich attacks are impossible when validators only see ciphertexts." },
  { icon: "⚡", tag: "MPC", title: "Private Liquidations", desc: "Liquidation checks inside Arcium's network. Your liq price is never exposed." },
];

export function LandingPage({ setPage }) {
  const { prices, loading } = usePrices();

  // Format real-time ticker items from API data
  const tickerItems = loading || Object.keys(prices).length === 0
    ? ["LOADING REAL-TIME DATA...", "SOL/USDC $...", "BTC/USDC $...", "ETH/USDC $..."]
    : Object.entries(prices).map(([sym, data]) => {
      const arrow = data.change >= 0 ? "▲" : "▼";
      return `${sym}/USDC $${data.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${arrow}${Math.abs(data.change)}%`;
    });

  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      <div className="grid-bg" />
      <div className="orb orb1" />
      <div className="orb orb2" />

      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "18px 48px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "var(--black)",
        borderBottom: "1px solid var(--border)",
      }}>
        <Logo onClick={() => setPage("landing")} />
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-primary" onClick={() => setPage("dashboard")}>Launch App</button>
        </div>
      </nav>

      <div style={{
        paddingTop: 90,
        overflow: "hidden",
        borderBottom: "1px solid var(--border)",
        background: "var(--black)",
        position: "relative",
        zIndex: 5
      }}>
        <div style={{
          display: "flex",
          gap: 60,
          padding: "10px 0",
          animation: "ticker 40s linear infinite",
          width: "max-content",
          willChange: "transform"
        }}>
          {[...tickerItems, ...tickerItems, ...tickerItems].map((t, i) => (
            <span key={i} style={{
              fontFamily: "'DM Mono',monospace",
              fontSize: 11,
              whiteSpace: "nowrap",
              padding: "0 10px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              opacity: 0.9
            }}>
              {t.includes("▲")
                ? <span style={{ color: "var(--green)" }}>{t}</span>
                : <span style={{ color: t.includes("▼") ? "var(--red)" : "var(--ghost)" }}>{t}</span>}
              <span style={{ width: 1, height: 12, background: "var(--border2)", marginLeft: 20 }} />
            </span>
          ))}
        </div>
      </div>

      <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "60px 48px 80px", position: "relative", zIndex: 1 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 20px",
          border: "1px solid var(--cyan-dim)", background: "var(--void)",
          borderRadius: 0, marginBottom: 40,
        }}>
          <span style={{ width: 8, height: 8, background: "var(--cyan)", animation: "blink 2s infinite" }} />
          <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 13, color: "var(--cyan)", letterSpacing: "0.1em", fontWeight: 500 }}>
            SOL/USDC {prices["SOL"]?.price ? `$${prices["SOL"].price.toLocaleString()}` : "LOADING"}
          </span>
        </div>

        <h1 style={{ fontSize: "clamp(48px,8.5vw,90px)", fontWeight: 800, lineHeight: 0.95, letterSpacing: "-0.04em", color: "var(--white)", maxWidth: 1000, marginBottom: 16 }}>
          Trade <span style={{ fontFamily: "'Instrument Serif',serif", fontStyle: "italic", fontWeight: 400, color: "var(--cyan)", textShadow: "0 0 30px var(--cyan-glow)" }}>privately</span>.<br />No compromises.
        </h1>

        <p style={{ fontSize: "clamp(16px,2.2vw,22px)", color: "var(--dim)", maxWidth: 640, lineHeight: 1.6, margin: "32px auto 56px", fontWeight: 400 }}>
          The first confidential order book on Solana. Powered by Arcium MPC. Your edge stays encrypted — only you know your hand.
        </p>

        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
          <button className="btn btn-primary btn-lg" style={{ minWidth: 220 }} onClick={() => setPage("dashboard")}>Start Trading →</button>
        </div>

        <div style={{
          display: "flex", marginTop: 100,
          border: "1px solid var(--border)",
          background: "var(--void)",
          borderRadius: 0,
          overflow: "hidden"
        }}>
          {STATS.map(([v, l], i) => (
            <div key={i} style={{ padding: "32px 56px", borderRight: i < 3 ? "1px solid var(--border)" : "none", textAlign: "center", transition: "background 0.3s" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 32, fontWeight: 300, color: "var(--white)", letterSpacing: "-0.02em" }}>
                <span style={{ color: "var(--cyan)" }}>{v}</span>
              </div>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "var(--dim)", marginTop: 8, letterSpacing: "0.15em", textTransform: "uppercase" }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: "140px 48px", maxWidth: 1300, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 80 }}>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 13, color: "var(--cyan)", letterSpacing: "0.2em", marginBottom: 20 }}>— MPC ARCHITECTURE —</div>
          <h2 style={{ fontSize: "clamp(40px,6vw,72px)", fontWeight: 800, letterSpacing: "-0.04em", color: "var(--white)", lineHeight: 0.95 }}>
            Built for <span style={{ fontFamily: "'Instrument Serif',serif", fontStyle: "italic", fontWeight: 400, color: "var(--cyan)" }}>institutional</span> security
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 2, background: "var(--black)", border: "1px solid var(--border)" }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{ background: "var(--void)", padding: "56px 48px", transition: "all 0.2s ease" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--border)";
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--void)";
                e.currentTarget.style.transform = "translateY(0)";
              }}>
              <div style={{ display: "inline-block", padding: "4px 12px", background: "var(--cyan-dim)", border: "1px solid var(--cyan-dim)", color: "var(--cyan)", fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: "0.1em", marginBottom: 28, textTransform: "uppercase" }}>{f.tag}</div>
              <div style={{ fontSize: 40, marginBottom: 28 }}>{f.icon}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "var(--white)", marginBottom: 14, letterSpacing: "-0.02em" }}>{f.title}</div>
              <div style={{ fontSize: 15, color: "var(--dim)", lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: "120px 48px", textAlign: "center", position: "relative", zIndex: 1, background: "var(--black)" }}>
        <h2 style={{ fontSize: "clamp(36px,5vw,60px)", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--bright)", marginBottom: 20 }}>
          Your edge stays <span style={{ fontFamily: "'Instrument Serif',serif", fontStyle: "italic", color: "var(--cyan)" }}>yours</span>
        </h2>
        <p style={{ fontSize: 16, color: "var(--dim)", maxWidth: 460, margin: "0 auto 40px", lineHeight: 1.8 }}>
          Open-source, audited, and built for traders who refuse to show their hand.
        </p>
        <button className="btn btn-primary btn-lg" onClick={() => setPage("dashboard")}>Start Trading Privately →</button>
        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, color: "var(--muted)", marginTop: 20 }}>
          Built with <span style={{ color: "var(--cyan)" }}>Arcium MPC</span> · <span style={{ color: "var(--cyan)" }}>Solana</span> · <span style={{ color: "var(--cyan)" }}>Anchor</span>
        </div>
      </section>

      <footer style={{ borderTop: "1px solid var(--border)", padding: "32px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, color: "var(--muted)" }}>© 2025 ArcTrade. Deployed on Solana Devnet.</div>
      </footer>
    </div>
  );
}

