use anchor_lang::prelude::*;

use crate::constants::{IX_UPDATE_POSITION, MAX_ENCRYPTED_POSITION_BLOB};
use crate::errors::PrivateTradingError;
use crate::events::PositionUpdated;
use crate::instructions::common::{bounded_blob, compute_deterministic_id, require_encrypted_accounts};
use crate::state::{ComputationConfigAccount, MarketAccount, UserPositionAccount};

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct UpdatePositionArgs {
    pub encrypted_position_blob: Vec<u8>,
}

pub fn update_position(ctx: Context<UpdatePosition>, args: UpdatePositionArgs) -> Result<()> {
    require!(!ctx.accounts.market.paused, PrivateTradingError::MarketPaused);

    let encrypted_position_blob =
        bounded_blob(args.encrypted_position_blob, MAX_ENCRYPTED_POSITION_BLOB)?;
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

    let user_position = &mut ctx.accounts.user_position;
    require_keys_eq!(
        user_position.owner,
        ctx.accounts.payer.key(),
        PrivateTradingError::UnauthorizedAccess
    );

    let computation_id = compute_deterministic_id(
        &ctx.accounts.payer.key(),
        user_position.nonce,
        IX_UPDATE_POSITION,
        &encrypted_position_blob,
    );
    user_position.pending_computation_id = computation_id;
    user_position.pending_instruction = IX_UPDATE_POSITION;

    emit!(PositionUpdated {
        position_ref: computation_id,
    });
    Ok(())
}

#[derive(Accounts)]
pub struct UpdatePosition<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        mut,
        has_one = owner @ PrivateTradingError::UnauthorizedAccess,
        seeds = [crate::constants::USER_POSITION_SEED, owner.key().as_ref()],
        bump = user_position.bump
    )]
    pub user_position: Account<'info, UserPositionAccount>,
    /// CHECK: User owner relation enforced by has_one.
    pub owner: UncheckedAccount<'info>,
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
