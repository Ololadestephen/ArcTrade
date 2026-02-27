pub const USER_POSITION_SEED: &[u8] = b"user-position";
pub const ORDER_SEED: &[u8] = b"order";
pub const MARKET_SEED: &[u8] = b"market";
pub const CONFIG_SEED: &[u8] = b"computation-config";

pub const MAX_ENCRYPTED_POSITION_BLOB: usize = 4096;
pub const MAX_ENCRYPTED_ORDER_BLOB: usize = 2048;
pub const MAX_INSTRUCTION_OFFSETS: usize = 32;

pub const ORDER_STATUS_OPEN: u8 = 1;
pub const ORDER_STATUS_CANCELLED: u8 = 2;
pub const ORDER_STATUS_MATCHED: u8 = 3;

pub const IX_PLACE_ORDER: u8 = 1;
pub const IX_MATCH_ORDERS: u8 = 2;
pub const IX_CHECK_LIQUIDATION: u8 = 3;
pub const IX_SETTLE_TRADE: u8 = 4;
pub const IX_CANCEL_ORDER: u8 = 5;
pub const IX_UPDATE_POSITION: u8 = 6;
