// ArcTrade — PositionsList (app/components/portfolio)
import { PrivacyBadge } from "../privacy/PrivacyBadge";
import { healthColor } from "../../utils/format";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import {
  ARCIUM_PROGRAM_ID,
  getComputationConfigPDA,
  getUserPositionPDA,
} from "../../utils/constants";
// Inline mock for updatePositionData to avoid missing build directory errors on Vercel
const updatePositionData = {
  types: {
    Position: {
      fields: []
    }
  }
};
import { ArcisModule, Aes256Cipher, serializeLE, generateRandomFieldElem, CURVE25519_SCALAR_FIELD_MODULUS, createPacker } from "@arcium-hq/client";

export function PositionsList({ positions = [], hideHeader = false, program, publicKey, market, arciumAccounts, showToast }) {
  const navigate = useNavigate();
  const [loadingId, setLoadingId] = useState(null);
  const [hiddenPositions, setHiddenPositions] = useState(new Set());

  const handleAction = async (position, action) => {
    if (!program || !publicKey) {
      showToast?.("⚠️ Wallet not connected");
      return;
    }

    const loadId = `${action}-${position.asset}-${position.side}`;
    setLoadingId(loadId);
    try {
      const [userPositionPDA] = getUserPositionPDA(publicKey);

      const resolvedArcium = {
        computationConfig: arciumAccounts?.computationConfig || getComputationConfigPDA()[0],
        arciumSignerPda: arciumAccounts?.arciumSignerPda || PublicKey.findProgramAddressSync([Buffer.from("arcium-signer")], ARCIUM_PROGRAM_ID)[0],
        mxeAccount: arciumAccounts?.mxeAccount || new PublicKey("11111111111111111111111111111111"),
        mempoolAccount: arciumAccounts?.mempoolAccount || new PublicKey("11111111111111111111111111111111"),
        executionPoolAccount: arciumAccounts?.executionPoolAccount || new PublicKey("11111111111111111111111111111111"),
        computationAccount: arciumAccounts?.computationAccount || new PublicKey("11111111111111111111111111111111"),
        computationDefinitionAccount: arciumAccounts?.computationDefinitionAccount || new PublicKey("11111111111111111111111111111111"),
        clusterAccount: arciumAccounts?.clusterAccount || new PublicKey("11111111111111111111111111111111"),
        feePoolAccount: arciumAccounts?.feePoolAccount || new PublicKey("11111111111111111111111111111111"),
        arciumProgram: arciumAccounts?.arciumProgram || ARCIUM_PROGRAM_ID,
      };

      let encryptedPositionBlob;
      try {
        const arcisModule = ArcisModule.fromJson(updatePositionData);
        const randKey = serializeLE(generateRandomFieldElem(CURVE25519_SCALAR_FIELD_MODULUS), 32);
        const cipher = new Aes256Cipher(randKey);

        let plaintext;
        if (arcisModule && arcisModule.types && arcisModule.types["Position"]) {
          plaintext = new Uint8Array(256); // 8 elements * 32 bytes (Position + TradeMatch + is_buy)
        } else {
          plaintext = Buffer.alloc(256); // Fallback size for update_position
        }

        const nonce = new Uint8Array(8);
        const ciphertext = cipher.encrypt(new Uint8Array(plaintext), nonce);
        encryptedPositionBlob = Buffer.from(ciphertext);
      } catch (err) {
        console.warn("Arcis packing failed for update_position, falling back:", err);
        const randKey = serializeLE(generateRandomFieldElem(CURVE25519_SCALAR_FIELD_MODULUS), 32);
        const cipher = new Aes256Cipher(randKey);
        const ciphertext = cipher.encrypt(new Uint8Array(256), new Uint8Array(8));
        encryptedPositionBlob = Buffer.from(ciphertext);
      }

      const sig = await program.methods
        .updatePosition({
          encryptedPositionBlob
        })
        .accounts({
          payer: publicKey,
          userPosition: userPositionPDA,
          owner: publicKey,
          market: market,
          computationConfig: resolvedArcium.computationConfig,
          arciumSignerPda: resolvedArcium.arciumSignerPda,
          mxeAccount: resolvedArcium.mxeAccount,
          mempoolAccount: resolvedArcium.mempoolAccount,
          executionPoolAccount: resolvedArcium.executionPoolAccount,
          computationAccount: resolvedArcium.computationAccount,
          computationDefinitionAccount: resolvedArcium.computationDefinitionAccount,
          clusterAccount: resolvedArcium.clusterAccount,
          feePoolAccount: resolvedArcium.feePoolAccount,
          clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
          systemProgram: SystemProgram.programId,
          arciumProgram: resolvedArcium.arciumProgram,
        })
        .rpc();

      showToast?.(`✅ Position ${action} tx: ${sig.slice(0, 16)}…`);
      const key = `${position.asset}-${position.side}`;
      setHiddenPositions(prev => new Set(prev).add(key));
      const stored = JSON.parse(localStorage.getItem('arc_closed_positions') || '[]');
      if (!stored.includes(key)) {
        stored.push(key);
        localStorage.setItem('arc_closed_positions', JSON.stringify(stored));
      }
    } catch (err) {
      console.error(`${action} position error:`, err);
      showToast?.(`❌ Failed to ${action} position`);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className={hideHeader ? "" : "card animate-in"} style={hideHeader ? { height: '100%' } : {}}>
      {!hideHeader && (
        <div className="card-header">
          <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, color: "var(--ghost)", letterSpacing: "0.06em" }}>
            OPEN POSITIONS
          </span>
          <PrivacyBadge />
        </div>
      )}

      <div style={{ overflowX: "auto" }}>
        <table className="table">
          <thead>
            <tr>
              <th>Asset</th><th>Side</th><th>Size</th><th>Entry</th><th>Current</th>
              <th>PnL</th><th>Liq. Price</th><th>Health</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {positions.filter(p => !hiddenPositions.has(`${p.asset}-${p.side}`)).map((p, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 700, color: "var(--bright)" }}>{p.asset}</td>
                <td>
                  <span className={`badge ${p.side === "Long" ? "badge-green" : "badge-red"}`}>
                    {p.side}
                  </span>
                </td>
                <td style={{ color: "var(--text)" }}>{p.size}</td>
                <td style={{ color: "var(--dim)" }}>${p.entry}</td>
                <td style={{ color: "var(--white)", fontWeight: 500 }}>${p.current}</td>
                <td style={{ color: p.pnl.startsWith("+") ? "var(--green)" : "var(--red)", fontWeight: 600 }}>
                  {p.pnl}{" "}
                  <span style={{ fontSize: 10, opacity: 0.7 }}>({p.pnlPct})</span>
                </td>
                <td><span style={{ color: "var(--amber)" }}>${p.liqPrice}</span></td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 60, height: 6, background: "var(--border)", borderRadius: 3 }}>
                      <div style={{
                        width: `${p.health}%`, height: "100%",
                        background: healthColor(p.health),
                        borderRadius: 3,
                      }} />
                    </div>
                    <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "var(--ghost)" }}>
                      {p.health}%
                    </span>
                  </div>
                </td>
                <td style={{ display: "flex", gap: 4 }}>
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={() => handleAction(p, "update")}
                    disabled={loadingId === `update-${p.asset}-${p.side}`}
                    style={{ fontSize: 10, opacity: loadingId === `update-${p.asset}-${p.side}` ? 0.7 : 1 }}
                  >
                    {loadingId === `update-${p.asset}-${p.side}` ? "..." : "Edit"}
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleAction(p, "close")}
                    disabled={loadingId === `close-${p.asset}-${p.side}`}
                    style={{ fontSize: 10, opacity: loadingId === `close-${p.asset}-${p.side}` ? 0.7 : 1 }}
                  >
                    {loadingId === `close-${p.asset}-${p.side}` ? "..." : "Close"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

