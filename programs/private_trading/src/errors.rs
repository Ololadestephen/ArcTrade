use anchor_lang::prelude::*;

#[error_code]
pub enum PrivateTradingError {
    #[msg("Encrypted payload or format is invalid")]
    InvalidEncryption,
    #[msg("MPC computation failed")]
    MPCComputationFailed,
    #[msg("Callback signature/account is invalid")]
    InvalidCallbackSignature,
    #[msg("Unauthorized access")]
    UnauthorizedAccess,
    #[msg("Insufficient collateral")]
    InsufficientCollateral,
    #[msg("Market is paused")]
    MarketPaused,
    #[msg("Invalid nonce")]
    InvalidNonce,
    #[msg("Arithmetic overflow")]
    ArithmeticOverflow,
    #[msg("Invalid instruction type")]
    InvalidInstructionType,
    #[msg("Computation ID mismatch")]
    ComputationIdMismatch,
    #[msg("Duplicate or stale callback")]
    DuplicateOrStaleCallback,
    #[msg("Invalid account relationship")]
    InvalidAccount,
}
