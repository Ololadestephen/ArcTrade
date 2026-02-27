use anchor_lang::prelude::*;

use crate::constants::{
    IX_CANCEL_ORDER, IX_CHECK_LIQUIDATION, IX_MATCH_ORDERS, IX_PLACE_ORDER, IX_SETTLE_TRADE,
    IX_UPDATE_POSITION,
};
use crate::errors::PrivateTradingError;
use crate::events::{LiquidationExecuted, TradeSettled};
use crate::instructions::common::require_encrypted_accounts;
use crate::state::{ComputationConfigAccount, MarketAccount, UserPositionAccount};

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct HandleCallbackArgs {
    pub computation_id: [u8; 32],
    pub instruction_type: u8,
    pub callback_nonce: u64,
    pub realized_pnl: i64,
    pub liquidation_flag: bool,
    pub updated_collateral_balance: u64,
}

pub fn handle_callback(ctx: Context<HandleCallback>, args: HandleCallbackArgs) -> Result<()> {
    require!(!ctx.accounts.market.paused, PrivateTradingError::MarketPaused);
    require_encrypted_accounts(
        &ctx.accounts.arcium_signer_pda,
        &ctx.accounts.mxe_account,
        &ctx.accounts.mempool_account,
        &ctx.accounts.execution_pool_account,
        &ctx.accounts.computation_account,
        &ctx.accounts.computation_definition_account,
        &ctx.accounts.cluster_account,
        &ctx.accounts.fee_pool_account,
        &ctx.accounts.arcium_program,
        &ctx.accounts.computation_config,
    )?;

    require_keys_eq!(
        ctx.accounts.cluster_account.key(),
        ctx.accounts.arcium_callback_signer.key(),
        PrivateTradingError::InvalidCallbackSignature
    );

    let user_position = &mut ctx.accounts.user_position;
    require!(
        user_position.pending_computation_id != [0u8; 32],
        PrivateTradingError::DuplicateOrStaleCallback
    );
    require!(
        is_supported_instruction(args.instruction_type),
        PrivateTradingError::InvalidInstructionType
    );
    require!(
        args.callback_nonce == user_position.nonce,
        PrivateTradingError::InvalidNonce
    );
    require!(
        args.instruction_type == user_position.pending_instruction,
        PrivateTradingError::InvalidInstructionType
    );
    require!(
        args.computation_id == user_position.pending_computation_id,
        PrivateTradingError::ComputationIdMismatch
    );

    user_position.public_collateral = args.updated_collateral_balance;
    user_position.last_realized_pnl = args.realized_pnl;
    user_position.liquidation_flag = args.liquidation_flag;
    user_position.nonce = user_position
        .nonce
        .checked_add(1)
        .ok_or(PrivateTradingError::ArithmeticOverflow)?;
    user_position.pending_computation_id = [0u8; 32];
    user_position.pending_instruction = 0;

    emit!(TradeSettled {
        realized_pnl: args.realized_pnl,
    });
    emit!(LiquidationExecuted {
        is_liquidated: args.liquidation_flag,
    });

    Ok(())
}

fn is_supported_instruction(value: u8) -> bool {
    matches!(
        value,
        IX_PLACE_ORDER
            | IX_MATCH_ORDERS
            | IX_CHECK_LIQUIDATION
            | IX_SETTLE_TRADE
            | IX_CANCEL_ORDER
            | IX_UPDATE_POSITION
    )
}

#[derive(Accounts)]
pub struct HandleCallback<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(mut)]
    pub arcium_callback_signer: Signer<'info>,
    #[account(
        mut,
        seeds = [crate::constants::USER_POSITION_SEED, user_position.owner.as_ref()],
        bump = user_position.bump
    )]
    pub user_position: Account<'info, UserPositionAccount>,
    #[account(mut)]
    pub market: Account<'info, MarketAccount>,
    #[account(mut)]
    pub computation_config: Account<'info, ComputationConfigAccount>,
    /// CHECK: Required Arcium signer PDA.
    pub arcium_signer_pda: UncheckedAccount<'info>,
    /// CHECK: Required MXE account.
    pub mxe_account: UncheckedAccount<'info>,
    /// CHECK: Required mempool account.
    pub mempool_account: UncheckedAccount<'info>,
    /// CHECK: Required execution pool account.
    pub execution_pool_account: UncheckedAccount<'info>,
    /// CHECK: Required computation account.
    pub computation_account: UncheckedAccount<'info>,
    /// CHECK: Required computation definition account.
    pub computation_definition_account: UncheckedAccount<'info>,
    /// CHECK: Required cluster account.
    pub cluster_account: UncheckedAccount<'info>,
    /// CHECK: Required fee pool account.
    pub fee_pool_account: UncheckedAccount<'info>,
    pub clock: Sysvar<'info, Clock>,
    pub system_program: Program<'info, System>,
    /// CHECK: Arcium program id validated against config.
    pub arcium_program: UncheckedAccount<'info>,
}
