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
ArcTrade relies heavily on Arcium's confidential computing capabilities:
1. Users encrypt their trade parameters locally using the target Arcium node's public key.
2. The Solana smart contract (Anchor) stores this encrypted blob and assigns a task to the MPC cluster.
3. Arcium nodes compute the order matching logic inside secure enclaves without ever seeing the plaintext data.
4. Finalized PnL and trade execution results are published back to the Solana blockchain.

```text
User → Encrypts Order → Arcium MPC → Private Match → Final PnL → On-chain
```

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
