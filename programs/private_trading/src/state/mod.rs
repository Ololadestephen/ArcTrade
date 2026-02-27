use anchor_lang::prelude::*;

use crate::constants::{
    MAX_ENCRYPTED_ORDER_BLOB, MAX_ENCRYPTED_POSITION_BLOB, MAX_INSTRUCTION_OFFSETS,
};

#[account]
pub struct UserPositionAccount {
    pub owner: Pubkey,
    pub encrypted_position_blob: Vec<u8>,
    pub public_collateral: u64,
    pub nonce: u64,
    pub pending_computation_id: [u8; 32],
    pub pending_instruction: u8,
    pub last_realized_pnl: i64,
    pub liquidation_flag: bool,
    pub bump: u8,
}

impl UserPositionAccount {
    pub const LEN: usize = 8
        + 32
        + 4
        + MAX_ENCRYPTED_POSITION_BLOB
        + 8
        + 8
        + 32
        + 1
        + 8
        + 1
        + 1;
}

#[account]
pub struct OrderAccount {
    pub order_id: u64,
    pub maker: Pubkey,
    pub encrypted_order_blob: Vec<u8>,
    pub status: u8,
    pub bump: u8,
}

impl OrderAccount {
    pub const LEN: usize = 8 + 8 + 32 + 4 + MAX_ENCRYPTED_ORDER_BLOB + 1 + 1;
}

#[account]
pub struct MarketAccount {
    pub asset_mint: Pubkey,
    pub oracle_feed: Pubkey,
    pub maintenance_margin: u64,
    pub fee_rate: u64,
    pub paused: bool,
    pub bump: u8,
}

impl MarketAccount {
    pub const LEN: usize = 8 + 32 + 32 + 8 + 8 + 1 + 1;
}

#[account]
pub struct ComputationConfigAccount {
    pub instruction_offsets: Vec<u32>,
    pub cluster_account: Pubkey,
    pub arcium_program: Pubkey,
    pub bump: u8,
}

impl ComputationConfigAccount {
    pub const LEN: usize = 8 + 4 + (MAX_INSTRUCTION_OFFSETS * 4) + 32 + 32 + 1;
}
