use anchor_lang::prelude::*;

#[event]
pub struct OrderPlaced {
    pub order_hash: [u8; 32],
}

#[event]
pub struct OrderMatched {
    pub match_hash: [u8; 32],
}

#[event]
pub struct PositionUpdated {
    pub position_ref: [u8; 32],
}

#[event]
pub struct LiquidationExecuted {
    pub is_liquidated: bool,
}

#[event]
pub struct TradeSettled {
    pub realized_pnl: i64,
}
