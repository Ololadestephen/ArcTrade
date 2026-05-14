#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const anchor = require("@coral-xyz/anchor");
const { Connection, Keypair, PublicKey, SystemProgram, AddressLookupTableProgram } = require("@solana/web3.js");
const {
  ARCIUM_IDL,
  getArciumProgramId,
  getArciumProgram,
  getMXEAccAddress,
  getCompDefAccAddress,
  getLookupTableAddress,
} = require("../frontend/node_modules/@arcium-hq/client/build/index.cjs");

const ROOT = path.resolve(__dirname, "..");
const PROGRAM_ID = new PublicKey("e6oyALFfDbVMy4gp3xVr5hRXo5VyCSw23gxk9M3YALM");
const RPC_URL = process.env.ANCHOR_PROVIDER_URL || "https://api.devnet.solana.com";
const WALLET_PATH = process.env.ANCHOR_WALLET || path.join(process.env.HOME, ".config/solana/id.json");

const CIRCUITS = [
  ["place_order", "initPlaceOrderCompDef"],
  ["match_orders", "initMatchOrdersCompDef"],
  ["check_liquidation", "initCheckLiquidationCompDef"],
  ["settle_trade", "initSettleTradeCompDef"],
  ["cancel_order", "initCancelOrderCompDef"],
  ["update_position", "initUpdatePositionCompDef"],
];

function readKeypair(filePath) {
  return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(filePath, "utf8"))));
}

function compDefOffset(name) {
  const hash = crypto.createHash("sha256").update(name).digest();
  return hash.readUInt32LE(0);
}

async function main() {
  const connection = new Connection(RPC_URL, "confirmed");
  const wallet = new anchor.Wallet(readKeypair(WALLET_PATH));
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
    preflightCommitment: "confirmed",
  });
  anchor.setProvider(provider);

  const idl = {
    ...JSON.parse(fs.readFileSync(path.join(ROOT, "target/idl/private_trading.json"), "utf8")),
    address: PROGRAM_ID.toBase58(),
  };
  const program = new anchor.Program(idl, provider);
  const arciumProgram = getArciumProgram(provider);

  const mxeAccount = getMXEAccAddress(PROGRAM_ID);
  const mxe = await arciumProgram.account.mxeAccount.fetch(mxeAccount);
  const addressLookupTable = getLookupTableAddress(PROGRAM_ID, mxe.lutOffsetSlot);

  console.log(`RPC: ${RPC_URL}`);
  console.log(`Wallet: ${wallet.publicKey.toBase58()}`);
  console.log(`Program: ${PROGRAM_ID.toBase58()}`);
  console.log(`MXE: ${mxeAccount.toBase58()}`);
  console.log(`LUT: ${addressLookupTable.toBase58()}`);

  for (const [circuit, method] of CIRCUITS) {
    const offset = compDefOffset(circuit);
    const compDefAccount = getCompDefAccAddress(PROGRAM_ID, offset);
    const existing = await connection.getAccountInfo(compDefAccount, "confirmed");

    if (existing) {
      console.log(`skip ${circuit}: ${compDefAccount.toBase58()} already exists`);
      continue;
    }

    console.log(`init ${circuit}: ${compDefAccount.toBase58()}`);
    const sig = await program.methods[method]()
      .accounts({
        payer: wallet.publicKey,
        mxeAccount,
        compDefAccount,
        addressLookupTable,
        lutProgram: AddressLookupTableProgram.programId,
        arciumProgram: getArciumProgramId(),
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    console.log(`  tx ${sig}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
