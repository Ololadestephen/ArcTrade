import { PublicKey } from "@solana/web3.js";

export const SOL_MINT_DEVNET = new PublicKey("So11111111111111111111111111111111111111112");

// ── Program ────────────────────────────────────────────────────────────────

/**
 * Deployed private_trading program ID (devnet).
 * Matches VITE_PROGRAM_ID in .env.local and Anchor.toml [programs.devnet].
 */
export const PROGRAM_ID = new PublicKey(
  import.meta.env.VITE_PROGRAM_ID ??
  "e6oyALFfDbVMy4gp3xVr5hRXo5VyCSw23gxk9M3YALM"
);

// ── Arcium network ─────────────────────────────────────────────────────────

/** Arcium program ID (fixed across environments). */
export const ARCIUM_PROGRAM_ID = new PublicKey(
  "2oBXGf1AM2MK5kVk5jhJvv9xguHRFfgmPV5GKSmfVhWu"
);

/**
 * Cluster offset used when constructing Arcium cluster-related PDAs.
 * Matches VITE_ARCIUM_CLUSTER_OFFSET in .env.local.
 * Set to 0 for the default devnet cluster.
 */
export const ARCIUM_CLUSTER_OFFSET: number = Number(
  import.meta.env.VITE_ARCIUM_CLUSTER_OFFSET ?? 456
);

// ── Solana ─────────────────────────────────────────────────────────────────

/** RPC endpoint. Falls back to public devnet. */
export const RPC_URL: string =
  import.meta.env.VITE_RPC_URL ?? "https://api.devnet.solana.com";

/** Cluster name passed to AnchorProvider / Connection helpers. */
export const CLUSTER: string = import.meta.env.VITE_CLUSTER ?? "devnet";

export const COMPUTATION_CONFIG_SEED = Buffer.from("computation-config");
export const MARKET_SEED = Buffer.from("market");

/** Derive the market PDA for a given asset mint. */
export function getMarketPDA(mint: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [MARKET_SEED, mint.toBuffer()],
    PROGRAM_ID
  );
}

/** Derive the computation_config PDA for the private_trading program. */

/** Derive the computation_config PDA for the private_trading program. */
export function getComputationConfigPDA(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [COMPUTATION_CONFIG_SEED],
    PROGRAM_ID
  );
}

/** Derive the user_position PDA for a given owner wallet. */
export function getUserPositionPDA(owner: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("user-position"), owner.toBuffer()],
    PROGRAM_ID
  );
}

/** Derive the order PDA for a payer + order_id. */
export function getOrderPDA(
  payer: PublicKey,
  orderId: number | bigint
): [PublicKey, number] {
  const idBuf = Buffer.alloc(8);
  idBuf.writeBigUInt64LE(BigInt(orderId));
  return PublicKey.findProgramAddressSync(
    [Buffer.from("order"), payer.toBuffer(), idBuf],
    PROGRAM_ID
  );
}
