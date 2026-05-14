import { usePrices } from "../hooks/usePrices";

const STATS = [
  ["Encrypted", "Orders and positions"],
  ["Private", "Matching logic"],
  ["Hidden", "Liquidation checks"],
  ["Public", "Final PnL only"],
];

const FEATURES = [
  {
    n: "01",
    tag: "Intent",
    title: "Orders stay private",
    desc: "Size, side, and price are packed into encrypted blobs before they become public state.",
  },
  {
    n: "02",
    tag: "Compute",
    title: "Arcis handles sensitive logic",
    desc: "Private circuits model matching, settlement, liquidation checks, cancellation, and position updates.",
  },
  {
    n: "03",
    tag: "Settlement",
    title: "Only results are revealed",
    desc: "The chain records settlement outputs like realized PnL and liquidation status, not the trader's full strategy.",
  },
];

const editorial = {
  page: "#f7f6f2",
  ink: "#111111",
  muted: "#555555",
  soft: "#9a9a9a",
  line: "#dedbd3",
  red: "#e74f3d",
  dark: "#3f3f3f",
};

export function LandingPage({ setPage }) {
  const { prices, loading } = usePrices();

  const tickerItems =
    loading || Object.keys(prices).length === 0
      ? [
          { text: "SOL/USDC loading", change: 0 },
          { text: "BTC/USDC loading", change: 0 },
          { text: "ETH/USDC loading", change: 0 },
        ]
      : Object.entries(prices).map(([sym, data]) => {
          const change = Number(data.change) || 0;
          return {
            text: `${sym}/USDC $${data.price.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })} ${change >= 0 ? "UP" : "DOWN"} ${Math.abs(change)}%`,
            change,
          };
        });

  return (
    <div
      style={{
        minHeight: "100vh",
        position: "relative",
        background: editorial.page,
        color: editorial.ink,
      }}
    >
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: "28px clamp(24px, 8vw, 140px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(247, 246, 242, 0.94)",
          borderBottom: `1px solid ${editorial.line}`,
          backdropFilter: "blur(10px)",
        }}
      >
        <button
          onClick={() => setPage("landing")}
          style={{
            background: "none",
            border: "none",
            color: editorial.ink,
            fontFamily: "'Instrument Serif', serif",
            fontSize: 28,
            lineHeight: 1,
            cursor: "pointer",
          }}
        >
          ArcTrade
        </button>
        <button
          onClick={() => setPage("dashboard")}
          style={{
            background: editorial.dark,
            color: "#ffffff",
            border: "none",
            padding: "13px 22px",
            fontFamily: "'DM Mono', monospace",
            fontSize: 12,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          Launch App
        </button>
      </nav>

      <div
        style={{
          paddingTop: 90,
          overflow: "hidden",
          borderBottom: `1px solid ${editorial.line}`,
          background: editorial.page,
          position: "relative",
          zIndex: 5,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 56,
            padding: "11px 0",
            animation: "ticker 40s linear infinite",
            width: "max-content",
            willChange: "transform",
          }}
        >
          {[...tickerItems, ...tickerItems, ...tickerItems].map((item, i) => (
            <span
              key={i}
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 11,
                whiteSpace: "nowrap",
                color:
                  item.change > 0
                    ? "var(--green)"
                    : item.change < 0
                      ? "var(--red)"
                      : editorial.muted,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              {item.text}
            </span>
          ))}
        </div>
      </div>

      <section
        style={{
          minHeight: "calc(100vh - 122px)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "96px clamp(24px, 12vw, 240px) 116px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 12,
            color: editorial.red,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            marginBottom: 34,
          }}
        >
          Solana private trading
        </div>

        <h1
          style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: "clamp(64px, 9vw, 132px)",
            fontWeight: 400,
            lineHeight: 0.92,
            letterSpacing: "0",
            color: editorial.ink,
            maxWidth: 940,
          }}
        >
          Stop leaking trader intent before execution.
        </h1>

        <div
          style={{
            width: "min(100%, 720px)",
            height: 2,
            background: editorial.red,
            margin: "26px 0 34px",
          }}
        />

        <p
          style={{
            fontSize: "clamp(18px, 2vw, 24px)",
            color: editorial.muted,
            maxWidth: 680,
            lineHeight: 1.55,
            fontWeight: 400,
          }}
        >
          ArcTrade keeps orders, positions, matching, and liquidation checks encrypted through Arcium. Only final settlement results need to be public.
        </p>

        <div
          style={{
            display: "flex",
            gap: 14,
            flexWrap: "wrap",
            marginTop: 54,
          }}
        >
          <button
            onClick={() => setPage("dashboard")}
            style={{
              background: editorial.dark,
              color: "#ffffff",
              border: "none",
              padding: "20px 34px",
              fontFamily: "'DM Mono', monospace",
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Launch ArcTrade
          </button>
          <div
            style={{
              alignSelf: "center",
              fontFamily: "'DM Mono', monospace",
              fontSize: 12,
              color: editorial.soft,
              letterSpacing: "0.04em",
            }}
          >
            Built on Solana + Arcium
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            width: "min(100%, 900px)",
            marginTop: 96,
            borderTop: `1px solid ${editorial.line}`,
            borderBottom: `1px solid ${editorial.line}`,
          }}
        >
          {STATS.map(([v, l], i) => (
            <div
              key={i}
              style={{
                padding: "28px 28px 28px 0",
                borderRight: i < STATS.length - 1 ? `1px solid ${editorial.line}` : "none",
              }}
            >
              <div
                style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontSize: 38,
                  color: editorial.ink,
                  lineHeight: 1,
                }}
              >
                {v}
              </div>
              <div
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 10,
                  color: editorial.red,
                  marginTop: 10,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                {l}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        style={{
          padding: "110px clamp(24px, 8vw, 140px)",
          borderTop: `1px solid ${editorial.line}`,
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 12,
            color: editorial.red,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            marginBottom: 70,
          }}
        >
          The privacy layer
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 0,
          }}
        >
          {FEATURES.map((f) => (
            <div
              key={f.n}
              style={{
                display: "grid",
                gridTemplateColumns: "92px 1fr",
                gap: 26,
                padding: "0 36px 42px 0",
              }}
            >
              <div
                style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontSize: 72,
                  lineHeight: 0.85,
                  color: editorial.ink,
                  borderRight: `1px solid ${editorial.red}`,
                  paddingRight: 24,
                }}
              >
                {f.n}
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 11,
                    color: editorial.red,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    marginBottom: 18,
                  }}
                >
                  {f.tag}
                </div>
                <h3
                  style={{
                    fontSize: 25,
                    color: editorial.ink,
                    letterSpacing: "0",
                    marginBottom: 12,
                  }}
                >
                  {f.title}
                </h3>
                <p
                  style={{
                    fontSize: 17,
                    color: editorial.muted,
                    lineHeight: 1.55,
                    maxWidth: 360,
                  }}
                >
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        style={{
          padding: "120px 48px",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
          borderTop: `1px solid ${editorial.line}`,
        }}
      >
        <div
          style={{
            maxWidth: 680,
            margin: "0 auto",
            border: `1px solid ${editorial.line}`,
            background: "#fbfaf7",
            padding: "76px clamp(28px, 6vw, 92px)",
          }}
        >
          <h2
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: "clamp(54px, 7vw, 96px)",
              fontWeight: 400,
              lineHeight: 0.95,
              color: editorial.ink,
              marginBottom: 22,
            }}
          >
            Private by default.
          </h2>
          <p
            style={{
              fontSize: 20,
              fontStyle: "italic",
              color: editorial.muted,
              margin: "0 auto 34px",
              lineHeight: 1.45,
            }}
          >
            The cost of leaked intent is higher than one transaction.
          </p>
          <button
            onClick={() => setPage("dashboard")}
            style={{
              background: editorial.dark,
              color: "#ffffff",
              border: "none",
              padding: "20px 34px",
              fontFamily: "'DM Mono', monospace",
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Launch App
          </button>
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 12,
              color: editorial.soft,
              marginTop: 18,
            }}
          >
            Devnet demo available
          </div>
        </div>
      </section>

      <footer
        style={{
          borderTop: `1px solid ${editorial.line}`,
          padding: "34px clamp(24px, 8vw, 140px)",
          display: "flex",
          gap: 24,
          alignItems: "flex-start",
          justifyContent: "space-between",
          position: "relative",
          zIndex: 1,
          color: editorial.muted,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: 24,
              color: editorial.ink,
              marginBottom: 10,
            }}
          >
            ArcTrade
          </div>
          <div style={{ maxWidth: 360, lineHeight: 1.6 }}>
            Privacy-preserving trading infrastructure for Solana markets.
          </div>
        </div>
        <div style={{ fontSize: 14 }}>© 2026 ArcTrade</div>
      </footer>
    </div>
  );
}
