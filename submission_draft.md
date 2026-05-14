### Link to Your Submission
`https://arctrade.vercel.app`

### GitHub Link (Optional)
`https://github.com/Ololadestephen/ArcTrade`

### Tweet Link (Optional)
[Leave this blank, or write a quick tweet about launching it and paste the link here]

### Additional Notes
**ArcTrade: A Privacy-Preserving Trading Terminal Powered by Arcium**

ArcTrade demonstrates how decentralized dark pools and hidden order books can exist on Solana using Arcium’s Multi-Party Computation (MPC) model.

**How it works & Privacy benefits:**
The privacy-critical trading logic is defined in `encrypted-ixs/circuits/private_trading.rs` using Arcis encrypted instructions. Trader intent such as order size, side, entry price, position state, collateral, and liquidation inputs is represented as encrypted data rather than public on-chain state.

Instead of executing matching and liquidation checks in plain text on Solana, the Anchor program acts as the public state and settlement layer. It stores encrypted order/position blobs, records pending computation references, validates Arcium-related accounts, and exposes callback-style settlement paths.

The intended execution model is that Arcis private computations process the sensitive inputs and return only minimal settlement outputs. This means the public chain does not need to reveal the trader's full strategy, order size, direction, entry price, or liquidation threshold before execution. Only final outputs such as realized PnL and liquidation status are revealed.

**Technical Execution:**
- **Frontend:** Sleek, brutalist React/Vite terminal designed to feel like an institutional workstation, utilizing TradingView for live charting.
- **Smart Contracts:** Built with Anchor and Rust, with Arcium/Arcis confidential trading logic in the `encrypted-ixs` crate.
- **Privacy:** MEV and copy-trading resistance by obscuring market intent prior to settlement.
