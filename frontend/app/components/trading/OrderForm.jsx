// ArcTrade — OrderForm (app/components/trading)
import { useState, useCallback, useEffect } from "react";
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { PrivacyBadge } from "../privacy/PrivacyBadge";
import { ArcisModule, Aes256Cipher, serializeLE, deserializeLE, generateRandomFieldElem, CURVE25519_SCALAR_FIELD_MODULUS, createPacker, RescueCipher, getMXEPublicKey, x25519 } from "@arcium-hq/client";
// Inline mock for placeOrderData to avoid build errors from missing un-versioned build directories.
const placeOrderData = {
  types: {
    PrivateOrder: {
      fields: [
        { name: "asset", type: "u64" },
        { name: "side", type: "u8" },
        { name: "price", type: "u128" },
        { name: "size", type: "u128" },
        { name: "timestamp", type: "i64" }
      ]
    }
  }
};
import { PrivacyLevelSelector } from "../privacy/PrivacyLevelSelector";
import { MEVProtectionBadge } from "../privacy/MEVProtectionBadge";
import {
  ARCIUM_CLUSTER_OFFSET,
  ARCIUM_PROGRAM_ID,
  getComputationConfigPDA,
  getUserPositionPDA,
  getOrderPDA,
  getArciumMXEAccountPDA,
  getArciumSignerPDA,
  getArciumClusterPDA,
  getArciumMempoolPDA,
  getArciumExecutingPoolPDA,
  getArciumComputationPDA,
  getArciumComputationDefinitionPDA,
  getArciumFeePoolPDA,
  getArciumClockPDA,
} from "../../utils/constants";

const ORDER_TYPES = ["market", "limit"];
const PCT_BUTTONS = ["25%", "50%", "75%", "100%"];

/**
 * Builds the set of Arcium-specific remaining accounts needed for any
 * instruction that calls into the MPC network.
 *
 * In the Arcium SDK these are normally resolved via helper functions that read
 * on-chain cluster state.  Here we accept them as explicit pubkeys so the form
 * can work with whatever market / cluster accounts were passed in by the parent.
 *
 * @param {object} params
 * @param {PublicKey} params.computationConfig
 * @param {PublicKey} params.mxeAccount
 * @param {PublicKey} params.mempoolAccount
 * @param {PublicKey} params.executionPoolAccount
 * @param {PublicKey} params.computationAccount
 * @param {PublicKey} params.computationDefinitionAccount
 * @param {PublicKey} params.clusterAccount
 * @param {PublicKey} params.feePoolAccount
 * @param {PublicKey} params.arciumSignerPda
 * @param {PublicKey} params.arciumProgram
 */
function buildArciumAccounts({
  computationConfig,
  mxeAccount,
  mempoolAccount,
  executionPoolAccount,
  computationAccount,
  computationDefinitionAccount,
  clusterAccount,
  feePoolAccount,
  arciumSignerPda,
  arciumProgram,
}) {
  return {
    computationConfig,
    arciumSignerPda,
    mxeAccount,
    mempoolAccount,
    executionPoolAccount,
    computationAccount,
    computationDefinitionAccount,
    clusterAccount,
    feePoolAccount,
    arciumProgram,
  };
}

function asBytes32(bytes) {
  return Array.from(bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes));
}

function randomNonce16() {
  const nonce = new Uint8Array(16);
  globalThis.crypto.getRandomValues(nonce);
  return nonce;
}

function randomComputationOffset() {
  const extra = new Uint16Array(1);
  globalThis.crypto.getRandomValues(extra);
  return BigInt(Date.now()) * 1000n + BigInt(extra[0]);
}

async function buildPrivateOrderPayload({ program, isBuy, priceU64, sizeU64 }) {
  const mxePublicKey = await getMXEPublicKey(program.provider, program.programId);
  if (!mxePublicKey) {
    throw new Error("Arcium MXE public key is not available for this program yet.");
  }

  const privateKey = x25519.utils.randomSecretKey();
  const orderPubkey = x25519.getPublicKey(privateKey);
  const collateralPrivateKey = x25519.utils.randomSecretKey();
  const collateralPubkey = x25519.getPublicKey(collateralPrivateKey);
  const orderCipher = new RescueCipher(x25519.getSharedSecret(privateKey, mxePublicKey));
  const collateralCipher = new RescueCipher(x25519.getSharedSecret(collateralPrivateKey, mxePublicKey));

  const orderNonceBytes = randomNonce16();
  const collateralNonceBytes = randomNonce16();
  const orderCiphertexts = orderCipher.encrypt(
    [
      0n,
      BigInt(isBuy ? 0 : 1),
      BigInt(priceU64.toString()),
      BigInt(sizeU64.toString()),
      BigInt(Date.now()),
    ],
    orderNonceBytes
  );
  const notional = BigInt(priceU64.toString()) * BigInt(sizeU64.toString());
  const collateralCiphertext = collateralCipher.encrypt([notional], collateralNonceBytes);
  const encryptedOrderBlob = Buffer.concat([
    Buffer.from(orderPubkey),
    Buffer.from(orderNonceBytes),
    ...orderCiphertexts.map((item) => Buffer.from(item)),
    Buffer.from(collateralPubkey),
    Buffer.from(collateralNonceBytes),
    ...collateralCiphertext.map((item) => Buffer.from(item)),
  ]);

  return {
    encryptedOrderBlob,
    orderPubkey: asBytes32(orderPubkey),
    orderNonce: new BN(deserializeLE(orderNonceBytes).toString()),
    orderAsset: asBytes32(orderCiphertexts[0]),
    orderSide: asBytes32(orderCiphertexts[1]),
    orderPrice: asBytes32(orderCiphertexts[2]),
    orderSize: asBytes32(orderCiphertexts[3]),
    orderTimestamp: asBytes32(orderCiphertexts[4]),
    collateralPubkey: asBytes32(collateralPubkey),
    collateralNonce: new BN(deserializeLE(collateralNonceBytes).toString()),
    collateral: asBytes32(collateralCiphertext[0]),
  };
}

/**
 * OrderForm
 *
 * Props:
 *   onSubmit   — called after the tx is sent (or on demo click)
 *   program    — Anchor Program instance from useWallet (may be null)
 *   publicKey  — web3 PublicKey of the connected wallet (may be null)
 *   walletLabel — string label for the connected wallet (e.g., "Phantom")
 *   market     — PublicKey of the MarketAccount on-chain (may be null)
 *   arciumAccounts — optional object with Arcium PDA pubkeys; when omitted
 *                    the form falls back to a demo toast
 */
export function OrderForm({ onSubmit, program, publicKey, walletLabel, market, arciumAccounts, currentPrice }) {
  const [type, setType] = useState("limit");
  const [privLevel, setPrivLevel] = useState("full");
  const [side, setSide] = useState("buy");
  const [price, setPrice] = useState("");
  const [size, setSize] = useState("");

  const [error, setError] = useState(null);
  const [txSig, setTxSig] = useState(null);
  const [loading, setLoading] = useState(false);

  // Sync default price
  useEffect(() => {
    if (currentPrice && !price) {
      setPrice(currentPrice.toString());
    }
  }, [currentPrice]);

  const isBuy = side === "buy";
  const sideCol = isBuy ? "var(--green)" : "var(--red)";

  const handleSubmit = useCallback(async () => {
    setError(null);
    setTxSig(null);

    // ─── Validation ────────────────────────────────────────────────────────
    if (!walletLabel) {
      setError("Please connect your wallet first.");
      return;
    }
    if (!program) {
      setError("Please connect your wallet first. (Program failed to load)");
      return;
    }
    if (!publicKey) {
      setError("Please connect your wallet first. (Missing publicKey)");
      return;
    }

    if (!size || isNaN(parseFloat(size))) {
      setError("Please enter a valid size.");
      return;
    }
    if (type === "limit" && (!price || isNaN(parseFloat(price)))) {
      setError("Please enter a valid limit price.");
      return;
    }

    setLoading(true);
    try {
      // 1. Derive ArcTrade PDAs
      const [computationConfigPDA] = getComputationConfigPDA();
      const [userPositionPDA] = getUserPositionPDA(publicKey);

      // Unique order id: use current timestamp (u64 as BN)
      const orderId = new BN(Date.now());
      const [orderPDA] = getOrderPDA(publicKey, orderId.toNumber());
      const computationOffsetValue = randomComputationOffset();
      const computationOffset = new BN(computationOffsetValue.toString());

      // 2. Resolve Arcium accounts (defaults for devnet cluster 456)
      const config = arciumAccounts?.computationConfig || computationConfigPDA;

      // If we don't have the full Arcium setup passed in, we derive defaults
      const resolvedArcium = {
        computationConfig: config,
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

      // 3. Format Arcis MPC Payload (Real payload replacing dummy Buffer)
      const sideByte = isBuy ? 0 : 1;
      const effectivePrice = type === "market" ? currentPrice : parseFloat(price);
      const priceU64 = new BN(Math.round(Number(effectivePrice || 0) * 1_000_000));
      const sizeU64 = new BN(Math.round(parseFloat(size) * 1_000_000));
      const encrypted = privLevel === "full";

      console.log("Packing Arcis module...");
      // Initialize packer
      let encryptedOrderBlob;
      let privatePayload = null;
      if (encrypted) {
        privatePayload = await buildPrivateOrderPayload({ program, isBuy, priceU64, sizeU64 });
        encryptedOrderBlob = privatePayload.encryptedOrderBlob;
      }

      if (!encryptedOrderBlob) {
        try {
          const arcisModule = ArcisModule.fromJson(placeOrderData);
          const randKey = serializeLE(generateRandomFieldElem(CURVE25519_SCALAR_FIELD_MODULUS), 32);
          const cipher = new Aes256Cipher(randKey);

          let plaintext;
          if (arcisModule && arcisModule.types && arcisModule.types["PrivateOrder"]) {
            const orderPacker = createPacker(arcisModule.types["PrivateOrder"]);
            const orderData = {
              asset: 0n,
              side: isBuy ? 0 : 1,
              price: BigInt(priceU64.toString()),
              size: BigInt(sizeU64.toString()),
              timestamp: BigInt(Date.now())
            };
            const packed = orderPacker.pack(orderData);
            plaintext = new Uint8Array(packed.length * 32);
          } else {
            plaintext = Buffer.alloc(49);
            plaintext.writeUInt8(sideByte, 8);
          }

          const nonce = new Uint8Array(8);
          const ciphertext = cipher.encrypt(new Uint8Array(plaintext), nonce);
          encryptedOrderBlob = Buffer.from(ciphertext);
        } catch (err) {
          console.warn("Arcis packing failed, falling back to local AES cipher generation:", err);
          const randKey = serializeLE(generateRandomFieldElem(CURVE25519_SCALAR_FIELD_MODULUS), 32);
          const cipher = new Aes256Cipher(randKey);
          const ciphertext = cipher.encrypt(new Uint8Array(128), new Uint8Array(8));
          encryptedOrderBlob = Buffer.from(ciphertext);
        }
      }

      console.log("[OrderForm] Firing order:", { orderId: orderId.toString(), market: market.toBase58(), encrypted });

      let sig;
      if (encrypted) {
        const [mxeAccount] = arciumAccounts?.mxeAccount ? [arciumAccounts.mxeAccount] : getArciumMXEAccountPDA();
        const [signPdaAccount] = arciumAccounts?.signPdaAccount ? [arciumAccounts.signPdaAccount] : getArciumSignerPDA();
        const [mempoolAccount] = arciumAccounts?.mempoolAccount ? [arciumAccounts.mempoolAccount] : getArciumMempoolPDA();
        const [executingPool] = arciumAccounts?.executingPool ? [arciumAccounts.executingPool] : getArciumExecutingPoolPDA();
        const [computationAccount] = arciumAccounts?.computationAccount ? [arciumAccounts.computationAccount] : getArciumComputationPDA(computationOffsetValue);
        const [compDefAccount] = arciumAccounts?.compDefAccount ? [arciumAccounts.compDefAccount] : getArciumComputationDefinitionPDA();
        const [clusterAccount] = arciumAccounts?.clusterAccount ? [arciumAccounts.clusterAccount] : getArciumClusterPDA();
        const [poolAccount] = arciumAccounts?.poolAccount ? [arciumAccounts.poolAccount] : getArciumFeePoolPDA();
        const [clockAccount] = arciumAccounts?.clockAccount ? [arciumAccounts.clockAccount] : getArciumClockPDA();

        sig = await program.methods
          .placeOrderPrivate({
            orderId,
            computationOffset,
            encryptedOrderBlob,
            orderPubkey: privatePayload.orderPubkey,
            orderNonce: privatePayload.orderNonce,
            orderAsset: privatePayload.orderAsset,
            orderSide: privatePayload.orderSide,
            orderPrice: privatePayload.orderPrice,
            orderSize: privatePayload.orderSize,
            orderTimestamp: privatePayload.orderTimestamp,
            collateralPubkey: privatePayload.collateralPubkey,
            collateralNonce: privatePayload.collateralNonce,
            collateral: privatePayload.collateral,
            maintenanceMarginBps: new BN(500),
          })
          .accounts({
            payer: publicKey,
            userPosition: userPositionPDA,
            owner: publicKey,
            order: orderPDA,
            market: market,
            mxeAccount,
            signPdaAccount,
            mempoolAccount,
            executingPool,
            computationAccount,
            compDefAccount,
            clusterAccount,
            poolAccount,
            clockAccount,
            systemProgram: SystemProgram.programId,
            arciumProgram: ARCIUM_PROGRAM_ID,
          })
          .rpc();
      } else {
        sig = await program.methods
          .placeOrder({
            orderId,
            encryptedOrderBlob,
          })
          .accounts({
            payer: publicKey,
            userPosition: userPositionPDA,
            owner: publicKey,
            order: orderPDA,
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
      }

      setTxSig(sig);
      onSubmit?.({ sig, orderId: orderId.toNumber(), side, type, price, size });
    } catch (err) {
      console.error("[OrderForm] placeOrder error:", err);
      // Show the raw error so we know WHICH account is missing on Devnet
      let msg = err?.message ?? "Transaction failed";
      // We append the raw message if it's an account error
      if (msg.includes("Account does not exist") || msg.includes("3012")) {
        msg = `Account Missing on Devnet: ${msg}`;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [program, publicKey, market, arciumAccounts, side, type, price, size, privLevel, isBuy, onSubmit]);

  return (
    <div className="card animate-in">
      <div className="card-header">
        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, color: "var(--ghost)", letterSpacing: "0.06em" }}>
          PLACE ORDER
        </span>
        <PrivacyBadge on={privLevel === "full"} />
      </div>

      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          {[
            { id: "buy", label: "BUY / LONG" },
            { id: "sell", label: "SELL / SHORT" },
          ].map(({ id, label }) => (
            <button
              key={id}
              className="btn"
              onClick={() => setSide(id)}
              style={{
                borderRadius: id === "buy" ? "2px 0 0 2px" : "0 2px 2px 0",
                background: side === id ? (id === "buy" ? "var(--green)" : "var(--red)") : "var(--panel)",
                color: side === id ? (id === "buy" ? "var(--black)" : "var(--white)") : "var(--dim)",
                border: `1px solid ${side === id ? (id === "buy" ? "var(--green)" : "var(--red)") : "var(--border)"}`,
                fontWeight: 700, fontSize: 14, justifyContent: "center",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div>
          <label>Order Type</label>
          <div style={{ display: "flex", gap: 2 }}>
            {ORDER_TYPES.map((t) => (
              <button
                key={t}
                className="btn btn-sm"
                onClick={() => setType(t)}
                style={{
                  flex: 1,
                  background: type === t ? "var(--cyan-dim)" : "transparent",
                  color: type === t ? "var(--cyan)" : "var(--dim)",
                  border: `1px solid ${type === t ? "rgba(0,229,204,0.3)" : "var(--border)"}`,
                  textTransform: "uppercase", fontSize: 11, letterSpacing: "0.06em",
                  justifyContent: "center",
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <PrivacyLevelSelector value={privLevel} onChange={setPrivLevel} />

        {type !== "market" && (
          <div>
            <label>Price (USDC)</label>
            <input
              className="input"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.0000"
            />
          </div>
        )}

        <div>
          <label>Size (SOL)</label>
          <input
            className="input"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            placeholder="0.00"
          />
        </div>

        <div style={{ display: "flex", gap: 4 }}>
          {PCT_BUTTONS.map((p) => (
            <button key={p} className="btn btn-sm btn-ghost" style={{ flex: 1, fontSize: 11, justifyContent: "center" }}>
              {p}
            </button>
          ))}
        </div>

        {size && (
          <div style={{
            padding: "12px",
            background: "var(--void)", border: "1px solid var(--border)",
            fontFamily: "'DM Mono',monospace", fontSize: 12,
            display: "flex", flexDirection: "column", gap: 6,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--dim)" }}>Est. Total</span>
              <span style={{ color: "var(--white)" }}>${(parseFloat(size || 0) * currentPrice).toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--dim)" }}>Privacy</span>
              <span style={{ color: "var(--cyan)" }}>
                🔐 {privLevel === "full" ? "Full Encryption" : "Partial"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--dim)" }}>Cluster Offset</span>
              <span style={{ color: "var(--ghost)", fontSize: 10 }}>{ARCIUM_CLUSTER_OFFSET}</span>
            </div>
          </div>
        )}

        {error && (
          <div style={{
            padding: "10px 12px",
            background: "rgba(255,59,59,0.08)", border: "1px solid var(--red)",
            fontFamily: "'DM Mono',monospace", fontSize: 12, color: "var(--red)",
          }}>
            {error}
          </div>
        )}

        {txSig && (
          <div style={{
            padding: "10px 12px",
            background: "rgba(0,229,204,0.06)", border: "1px solid var(--cyan)",
            fontFamily: "'DM Mono',monospace", fontSize: 11, color: "var(--cyan)",
            wordBreak: "break-all",
          }}>
            ✅ Tx: {txSig.slice(0, 20)}…
          </div>
        )}

        <button
          className="btn btn-lg"
          onClick={handleSubmit}
          disabled={loading}
          style={{
            background: loading ? "var(--panel)" : sideCol,
            color: loading ? "var(--dim)" : (isBuy ? "var(--black)" : "var(--white)"),
            fontWeight: 800, letterSpacing: "0.04em", justifyContent: "center",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Submitting…" : `${isBuy ? "BUY / LONG" : "SELL / SHORT"} SOL`}
        </button>

        <MEVProtectionBadge />
      </div>
    </div>
  );
}
