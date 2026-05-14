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
  "Arcj82pX7HxYKLR92qvgZUAd7vGS1k4hQvAFcPATFdEQ"
);

/**
 * Cluster offset used when constructing Arcium cluster-related PDAs.
 * Matches VITE_ARCIUM_CLUSTER_OFFSET in .env.local.
 * Set to 0 for the default devnet cluster.
 */
export const ARCIUM_CLUSTER_OFFSET: number = Number(
  import.meta.env.VITE_ARCIUM_CLUSTER_OFFSET ?? 456
);

export const PLACE_ORDER_COMP_DEF_OFFSET = 2774547222;

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

function u32Le(value: number): Buffer {
  const buf = Buffer.alloc(4);
  buf.writeUInt32LE(value);
  return buf;
}

function u64Le(value: number | bigint): Buffer {
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64LE(BigInt(value));
  return buf;
}

export function getArciumMXEAccountPDA(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("MXEAccount"), PROGRAM_ID.toBuffer()],
    ARCIUM_PROGRAM_ID
  );
}

export function getArciumSignerPDA(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("ArciumSignerAccount")],
    PROGRAM_ID
  );
}

export function getArciumClusterPDA(
  clusterOffset: number = ARCIUM_CLUSTER_OFFSET
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("Cluster"), u32Le(clusterOffset)],
    ARCIUM_PROGRAM_ID
  );
}

export function getArciumMempoolPDA(
  clusterOffset: number = ARCIUM_CLUSTER_OFFSET
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("Mempool"), u32Le(clusterOffset)],
    ARCIUM_PROGRAM_ID
  );
}

export function getArciumExecutingPoolPDA(
  clusterOffset: number = ARCIUM_CLUSTER_OFFSET
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("Execpool"), u32Le(clusterOffset)],
    ARCIUM_PROGRAM_ID
  );
}

export function getArciumComputationPDA(
  computationOffset: number | bigint,
  clusterOffset: number = ARCIUM_CLUSTER_OFFSET
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("ComputationAccount"),
      u32Le(clusterOffset),
      u64Le(computationOffset),
    ],
    ARCIUM_PROGRAM_ID
  );
}

export function getArciumComputationDefinitionPDA(
  offset: number = PLACE_ORDER_COMP_DEF_OFFSET
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("ComputationDefinitionAccount"),
      PROGRAM_ID.toBuffer(),
      u32Le(offset),
    ],
    ARCIUM_PROGRAM_ID
  );
}

export function getArciumFeePoolPDA(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("FeePool")],
    ARCIUM_PROGRAM_ID
  );
}

export function getArciumClockPDA(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("ClockAccount")],
    ARCIUM_PROGRAM_ID
  );
}
