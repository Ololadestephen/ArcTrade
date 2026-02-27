// ArcTrade — useWallet (app/hooks)
// Wraps Phantom/Solflare browser wallet adapters and creates an Anchor
// Program instance that callers can use directly.
import { useState, useCallback, useMemo } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import idlFile from "../utils/idl.json";
import { PROGRAM_ID, RPC_URL } from "../utils/constants";

// Force the IDL to be treated as a plain object, in case Vite's JSON import gives it a default wrapper
const idl = idlFile.default || idlFile;

/**
 * Minimal wallet interface expected by AnchorProvider.
 * We resolve the real publicKey once we have access to the adapter.
 */
function walletAdapterToAnchor(adapter, pubKey) {
  return {
    publicKey: pubKey,
    signTransaction: (tx) => adapter.signTransaction(tx),
    signAllTransactions: (txs) => adapter.signAllTransactions(txs),
  };
}

/**
 * Connect to the user's Solana browser wallet and return an Anchor Program
 * instance for the private_trading program.
 *
 * Returned values:
 *   wallet       – raw PublicKey string (display), or null
 *   publicKey    – solana PublicKey object, or null
 *   program      – Anchor Program<PrivateTrading>, or null
 *   connection   – web3.js Connection
 *   connect(name)
 *   disconnect()
 *   isConnected
 */
export function useWallet() {
  const [walletLabel, setWalletLabel] = useState(null); // display string
  const [publicKey, setPublicKey] = useState(null); // web3 PublicKey
  const [anchorWallet, setAnchorWallet] = useState(null); // {publicKey, sign*}

  const connection = useMemo(
    () => new Connection(RPC_URL, "confirmed"),
    []
  );

  /** Attempt to connect to the named wallet provider. */
  const connect = useCallback(async (walletName) => {
    try {
      let adapter = null;

      if (walletName === "Phantom" && window.solana?.isPhantom) {
        adapter = window.solana;
      } else if (walletName === "Solflare" && window.solflare?.isSolflare) {
        adapter = window.solflare;
      } else if (walletName === "Backpack" && window.xnft?.solana) {
        adapter = window.xnft.solana;
      } else if (window.solana) {
        // Fallback: use whatever injected wallet is present
        adapter = window.solana;
      }

      if (!adapter) {
        console.warn(`[useWallet] No wallet adapter found for "${walletName}"`);
        // Graceful demo fallback — keeps the UI functional without a wallet
        setWalletLabel(`${walletName} (demo)`);
        setPublicKey(null);
        setAnchorWallet(null);
        return;
      }

      const resp = await adapter.connect();
      let pubkey = resp?.publicKey ?? adapter.publicKey;

      // Handle cases where the adapter connects but delays populating publicKey
      let retries = 0;
      while (!pubkey && retries < 10) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        pubkey = adapter.publicKey;
        retries++;
      }

      if (!pubkey) throw new Error("Wallet connected but no publicKey returned after waiting");

      setPublicKey(pubkey);
      setWalletLabel(pubkey.toBase58());
      setAnchorWallet(walletAdapterToAnchor(adapter, pubkey));
    } catch (err) {
      console.error("[useWallet] connect error:", err);
      // Ensure we clear out old state on failure rather than demo fallback
      setWalletLabel(null);
      setPublicKey(null);
      setAnchorWallet(null);
    }
  }, []);

  const disconnect = useCallback(() => {
    try { window.solana?.disconnect?.(); } catch (_) { }
    setWalletLabel(null);
    setPublicKey(null);
    setAnchorWallet(null);
  }, []);

  const program = useMemo(() => {
    if (!connection) return null;

    try {
      if (typeof window.Buffer === 'undefined') {
        console.error("[useWallet] window.Buffer is undefined, Anchor will fail!");
      }

      // If no wallet is connected, create a read-only dummy wallet so we can still query on-chain data
      const effectiveWallet = anchorWallet || {
        publicKey: PublicKey.default,
        signTransaction: () => Promise.reject(new Error("Wallet not connected")),
        signAllTransactions: () => Promise.reject(new Error("Wallet not connected")),
      };

      const provider = new AnchorProvider(connection, effectiveWallet, {
        commitment: "confirmed",
      });

      // Anchor >=0.30 expects `constructor(idl, provider)`.
      // We inject the address into the IDL so we can override it dynamically.
      const modifiedIdl = { ...idl, address: PROGRAM_ID.toBase58() };
      return new Program(modifiedIdl, provider);
    } catch (err) {
      console.error("[useWallet] Failed to create Anchor Program:", err.message, err.stack);
      window.__PROGRAM_INIT_ERR__ = String(err.stack || err.message);
      return null;
    }
  }, [anchorWallet, connection]);

  return {
    /** Short display string (base58 address or "WalletName (demo)") */
    wallet: walletLabel,
    /** web3.js PublicKey, or null */
    publicKey,
    /** Anchor Program<PrivateTrading> instance, or null */
    program,
    /** web3.js Connection to the configured cluster */
    connection,
    connect,
    disconnect,
    isConnected: walletLabel !== null,
  };
}
