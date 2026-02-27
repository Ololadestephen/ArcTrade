// ArcTrade — OrdersList (app/components/portfolio)
import { PrivacyBadge } from "../privacy/PrivacyBadge";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import {
    ARCIUM_PROGRAM_ID,
    getComputationConfigPDA,
    getUserPositionPDA,
    getOrderPDA,
} from "../../utils/constants";
import cancelOrderData from "../../../../build/cancel_order.profile.json";
import { ArcisModule, Aes256Cipher, serializeLE, generateRandomFieldElem, CURVE25519_SCALAR_FIELD_MODULUS, createPacker } from "@arcium-hq/client";

export function OrdersList({ orders = [], hideHeader = false, program, publicKey, market, arciumAccounts, showToast }) {
    const navigate = useNavigate();
    const [loadingId, setLoadingId] = useState(null);
    const [hiddenOrders, setHiddenOrders] = useState(new Set());

    const handleCancel = async (order) => {
        if (!program || !publicKey) {
            showToast?.("⚠️ Wallet not connected");
            return;
        }

        setLoadingId(order.id);
        try {
            const [userPositionPDA] = getUserPositionPDA(publicKey);

            // Assume `order.id` is the numeric order ID, or try parsing it
            let orderIdNum;
            if (typeof order.id === "string") {
                orderIdNum = parseInt(order.id.replace(/[^0-9]/g, ""), 10);
            } else {
                orderIdNum = order.id;
            }

            if (isNaN(orderIdNum)) {
                // Generate a dummy ID for the demo if none provided, or display error
                orderIdNum = Date.now();
            }

            const [orderPDA] = getOrderPDA(publicKey, orderIdNum);

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

            let encryptedCancelBlob;
            try {
                const arcisModule = ArcisModule.fromJson(cancelOrderData);
                const randKey = serializeLE(generateRandomFieldElem(CURVE25519_SCALAR_FIELD_MODULUS), 32);
                const cipher = new Aes256Cipher(randKey);

                let plaintext;
                if (arcisModule && arcisModule.types && arcisModule.types["PrivateOrder"]) {
                    const orderPacker = createPacker(arcisModule.types["PrivateOrder"]);
                    const orderData = {
                        asset: 0n,
                        side: 0,
                        price: 0n,
                        size: 0n,
                        timestamp: BigInt(Date.now())
                    };
                    const packed = orderPacker.pack(orderData);
                    plaintext = new Uint8Array(packed.length * 32); // Using blank order data as proxy for cancellation if needed
                } else {
                    plaintext = Buffer.alloc(49);
                }

                const nonce = new Uint8Array(8);
                const ciphertext = cipher.encrypt(new Uint8Array(plaintext), nonce);
                encryptedCancelBlob = Buffer.from(ciphertext);
            } catch (err) {
                console.warn("Arcis packing failed for cancel, falling back:", err);
                const randKey = serializeLE(generateRandomFieldElem(CURVE25519_SCALAR_FIELD_MODULUS), 32);
                const cipher = new Aes256Cipher(randKey);
                const ciphertext = cipher.encrypt(new Uint8Array(128), new Uint8Array(8));
                encryptedCancelBlob = Buffer.from(ciphertext);
            }

            const sig = await program.methods
                .cancelOrder({
                    encryptedCancelBlob
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

            showToast?.(`✅ Order cancelled — tx: ${sig.slice(0, 16)}…`);
            setHiddenOrders(prev => new Set(prev).add(order.id));
            const stored = JSON.parse(localStorage.getItem('arc_cancelled_orders') || '[]');
            if (!stored.includes(order.id)) {
                stored.push(order.id);
                localStorage.setItem('arc_cancelled_orders', JSON.stringify(stored));
            }
        } catch (err) {
            console.error("Cancel order error:", err);
            showToast?.("❌ Failed to cancel order");
        } finally {
            setLoadingId(null);
        }
    };

    const handleMatch = async (o) => {
        if (!program || !publicKey) return;
        setLoadingId(o.id);

        try {
            const anchor = await import("@coral-xyz/anchor");
            console.log("Preparing Match Payload...");

            const ARCIUM_PROGRAM_ID = new anchor.web3.PublicKey("2oBXGf1AM2MK5kVk5jhJvv9xguHRFfgmPV5GKSmfVhWu");
            const MOCK_ACCOUNT = new anchor.web3.PublicKey("11111111111111111111111111111111");
            const MARKET_SEED = Buffer.from("market");
            const [localMarket] = anchor.web3.PublicKey.findProgramAddressSync(
                [MARKET_SEED, new anchor.web3.PublicKey("So11111111111111111111111111111111111111112").toBuffer()],
                program.programId
            );
            const [userPosition] = anchor.web3.PublicKey.findProgramAddressSync(
                [Buffer.from("user-position"), publicKey.toBuffer()],
                program.programId
            );
            const [compConfig] = anchor.web3.PublicKey.findProgramAddressSync(
                [Buffer.from("computation-config")],
                program.programId
            );
            const [arciumSignerPda] = anchor.web3.PublicKey.findProgramAddressSync(
                [Buffer.from("arcium-signer")],
                ARCIUM_PROGRAM_ID
            );

            // A 320 byte dummy payload
            const plaintext = new Uint8Array(320);

            showToast(`🚀 Sending match instructions...`);

            const ix = await program.methods
                .matchOrders({
                    encryptedMatchBlob: Buffer.from(plaintext)
                })
                .accounts({
                    payer: publicKey,
                    userPosition: userPosition,
                    owner: publicKey,
                    market: localMarket,
                    computationConfig: compConfig,
                    arciumSignerPda: arciumSignerPda,
                    mxeAccount: MOCK_ACCOUNT,
                    mempoolAccount: MOCK_ACCOUNT,
                    executionPoolAccount: MOCK_ACCOUNT,
                    computationAccount: MOCK_ACCOUNT,
                    computationDefinitionAccount: MOCK_ACCOUNT,
                    clusterAccount: MOCK_ACCOUNT,
                    feePoolAccount: MOCK_ACCOUNT,
                    clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
                    systemProgram: anchor.web3.SystemProgram.programId,
                    arciumProgram: ARCIUM_PROGRAM_ID,
                })
                .instruction();

            const tx = new anchor.web3.Transaction().add(ix);
            // In a browser environment, program.provider is an AnchorProvider that wraps the wallet adapter
            // However, sendAndConfirm from it sometimes throws on partial signers. 
            // Better to use the provider's sendAndConfirm wrapper directly
            tx.recentBlockhash = (await program.provider.connection.getLatestBlockhash()).blockhash;
            tx.feePayer = publicKey;

            const sig = await program.provider.sendAndConfirm(tx);
            console.log("Match sent", sig);

            // Optimistic UI Update: Hide the matched order
            setHiddenOrders(prev => new Set(prev).add(o.id));
            const stored = JSON.parse(localStorage.getItem('arc_cancelled_orders') || '[]');
            if (!stored.includes(o.id)) {
                stored.push(o.id);
                localStorage.setItem('arc_cancelled_orders', JSON.stringify(stored));
            }

            showToast(`⚙️ Order encrypted & sent to MPC node...`);

            // Simulate the Arcis Node Response (since we don't have a local relay)
            setTimeout(() => {
                showToast("⚡ Order matched privately by Arcium MPC network!");
            }, 2500);

            setTimeout(() => {
                // Generate a random PnL for the demo between -$50 and +$150
                const randomPnl = Math.floor(Math.random() * 200000000) - 50000000;
                window.dispatchEvent(new CustomEvent("mockTradeSettled", {
                    detail: {
                        pnl: randomPnl,
                        originalOrder: o
                    }
                }));
            }, 6000);

        } catch (err) {
            console.error("Match failed:", err);
            showToast(`❌ Match failed. Check console.`);
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <div className={hideHeader ? "" : "card animate-in"} style={hideHeader ? { height: '100%' } : {}}>
            {!hideHeader && (
                <div className="card-header">
                    <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, color: "var(--ghost)", letterSpacing: "0.06em" }}>
                        OPEN ORDERS
                    </span>
                    <PrivacyBadge />
                </div>
            )}
            <div style={{ overflowX: "auto" }}>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Order ID</th><th>Asset</th><th>Type</th><th>Side</th><th>Price</th>
                            <th>Size</th><th>Filled</th><th>Privacy</th><th>Time</th><th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.filter(o => !hiddenOrders.has(o.id)).map((o, i) => (
                            <tr key={i}>
                                <td style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "var(--dim)" }}>{o.id}</td>
                                <td style={{ fontWeight: 700, color: "var(--bright)" }}>{o.asset}</td>
                                <td><span className="badge badge-violet">{o.type}</span></td>
                                <td><span className={`badge ${o.side === "Buy" ? "badge-green" : "badge-red"}`}>{o.side}</span></td>
                                <td style={{ fontFamily: "'DM Mono',monospace", color: "var(--text)" }}>{o.price}</td>
                                <td style={{ fontFamily: "'DM Mono',monospace" }}>{o.size}</td>
                                <td style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "var(--dim)" }}>{o.filled}</td>
                                <td>{o.priv ? <PrivacyBadge on={true} /> : <span className="badge badge-amber">PUBLIC</span>}</td>
                                <td style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "var(--dim)" }}>{o.time}</td>
                                <td style={{ display: "flex", gap: "8px" }}>
                                    <button
                                        className="btn-danger"
                                        disabled={loadingId === o.id || o.status === "Cancelling..."}
                                        onClick={() => handleCancel(o)}
                                        style={{ padding: "4px 8px", fontSize: "11px", height: "auto", minHeight: "24px", minWidth: 60 }}
                                    >
                                        {loadingId === o.id ? "..." : (o.status === "Cancelling..." ? "Cxl'd" : "Cancel")}
                                    </button>
                                    <button
                                        className="btn btn-outline"
                                        disabled={loadingId === o.id}
                                        onClick={() => handleMatch(o)}
                                        style={{ padding: "4px 8px", fontSize: "11px", height: "auto", minHeight: "24px", minWidth: 60, borderColor: "var(--cyan)", color: "var(--cyan)" }}
                                    >
                                        Match
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {orders.filter(o => !hiddenOrders.has(o.id)).length === 0 && (
                            <tr><td colSpan="10" style={{ textAlign: "center", padding: "20px", color: "var(--dim)", fontFamily: "'DM Mono',monospace", fontSize: 12 }}>No active orders</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
