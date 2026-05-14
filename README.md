# ArcTrade - Private Trading Built on Arcium MPC

ArcTrade is a decentralized, privacy-preserving trading terminal built on Solana. It utilizes the **Arcium MPC network** to enable features like encrypted mempools, hidden limit orders, and dark pool liquidity. 

By encrypting trader intent (size, side, entry price) until the trade is finalized, ArcTrade mitigates MEV extraction, front-running, and copy-trading, ensuring your edge stays yours.

![ArcTrade Terminal](assets/screenshot.png)

## Features
- **Encrypted Orders:** Order data is encrypted client-side and sent directly to the Arcium MPC network.
- **Dark Pool Matching:** Orders are matched privately without revealing the order book state.
- **MEV Protection:** Trades cannot be sandwiched or front-run since the mempool data is encrypted.
- **Sleek Trading Terminal:** A professional, fully featured UI inspired by modern institutional platforms.

## Arcium Integration
ArcTrade uses Arcium as the privacy layer for the trading engine. The project is split into two main parts:

- `encrypted-ixs/circuits/private_trading.rs` defines the confidential Arcis computations for private order validation, matching, liquidation checks, settlement, cancellation, and position updates.
- `programs/private_trading` is the Anchor/Solana state and settlement layer. It stores encrypted order and position blobs, records pending computation references, queues Arcium computations, and exposes callback-style settlement paths that reveal only final public outputs such as realized PnL and liquidation status.

The intended private execution flow is:

1. Users pack and encrypt trade parameters client-side, including side, size, price, position, collateral, and liquidation inputs.
2. The Solana program stores ciphertext rather than plaintext trader intent.
3. The `place_order_private` instruction calls Arcium `queue_computation(...)` for the `place_order` Arcis circuit.
4. Arcis confidential instructions perform matching, liquidation, and settlement logic over encrypted inputs.
5. Only final settlement outputs, such as realized PnL or liquidation flags, are made public on-chain.

```text
User → Encrypted Order/Position → Arcis Private Compute → Callback/Settlement → Final PnL On-chain
```

### Privacy Benefits

Public perpetuals and order-book systems leak trader intent before execution. Visible order size, side, entry price, and liquidation thresholds can enable copy-trading, front-running, sandwiching, and targeted liquidations. ArcTrade reduces this leakage by keeping the sensitive inputs encrypted through the trading workflow and revealing only the minimum final state needed for settlement.

### What to Review

- Confidential trading logic: `encrypted-ixs/circuits/private_trading.rs`
- Solana program entrypoints: `programs/private_trading/src/lib.rs`
- Real Arcium computation-definition setup: `programs/private_trading/src/instructions/arcium_comp_defs.rs`
- Queue-based private order entrypoint: `programs/private_trading/src/instructions/place_order.rs`
- Offchain circuit artifacts for Arcium nodes: `build/*.arcis`
- Encrypted state and callback tracking: `programs/private_trading/src/state/mod.rs`
- Arcium account validation and computation references: `programs/private_trading/src/instructions/common.rs`
- Callback-style final settlement: `programs/private_trading/src/instructions/callback.rs`

### Offchain Circuit Definitions

ArcTrade uses Arcium `0.9.7` and initializes computation definitions with offchain circuit sources. The compiled `.arcis` files are stored in the repository under `build/` so Arcium nodes can fetch them through public GitHub raw URLs instead of requiring expensive on-chain bytecode uploads. Each offchain source is paired with the generated `circuit_hash!` value, so nodes can verify that the downloaded circuit matches the compiled artifact.

When rebuilding circuits, use:

```bash
arcium build --skip-keys-sync
```

Then push the generated `build/*.arcis`, `build/*.hash`, `build/*.idarc`, and `build/*.weight` files. After deployment, initialize the computation definitions once by calling the `init_*_comp_def` instructions exposed by the Anchor program.

The frontend's full-privacy order path uses `@arcium-hq/client` to fetch the MXE public key, encrypt typed order fields with `RescueCipher`, derive the Arcium queue accounts, and call `place_order_private`. Non-full privacy mode remains available as a compatibility fallback.

## 🎮 Live Demo
Try ArcTrade on Devnet: [https://arctrades.vercel.app](https://arctrades.vercel.app)



## 🛠️ Built With
- **Frontend**: React, Vite, TypeScript
- **Smart Contracts**: Anchor, Rust
- **Privacy**: Arcium MPC Network
- **Styling**: CSS Variables, Neon Cyber theme
- **APIs**: Jupiter Price API, TradingView

## Getting Started

### Prerequisites
- Node.js (v18+)
- Solana CLI
- Anchor CLI (v0.32.1)

### Running the Frontend
```bash
cd frontend
npm install
npm run dev
```

### Running the Smart Contracts
Ensure your Solana cluster is set to `devnet`.
```bash
anchor build
anchor test
```
