use anchor_lang::prelude::*;

use crate::constants::{IX_PLACE_ORDER, MAX_ENCRYPTED_ORDER_BLOB, ORDER_SEED, ORDER_STATUS_OPEN};
use crate::errors::PrivateTradingError;
use crate::events::OrderPlaced;
use crate::instructions::common::{bounded_blob, compute_deterministic_id, require_encrypted_accounts};
use crate::state::{ComputationConfigAccount, MarketAccount, OrderAccount, UserPositionAccount};

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct PlaceOrderArgs {
    pub order_id: u64,
    pub encrypted_order_blob: Vec<u8>,
}

pub fn place_order(ctx: Context<PlaceOrder>, args: PlaceOrderArgs) -> Result<()> {
    let market = &ctx.accounts.market;
    require!(!market.paused, PrivateTradingError::MarketPaused);

    let encrypted_order_blob = bounded_blob(args.encrypted_order_blob, MAX_ENCRYPTED_ORDER_BLOB)?;
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
        IX_PLACE_ORDER,
        &encrypted_order_blob,
    );
    user_position.pending_computation_id = computation_id;
    user_position.pending_instruction = IX_PLACE_ORDER;

    let order = &mut ctx.accounts.order;
    order.order_id = args.order_id;
    order.maker = ctx.accounts.payer.key();
    order.encrypted_order_blob = encrypted_order_blob;
    order.status = ORDER_STATUS_OPEN;
    order.bump = ctx.bumps.order;

    emit!(OrderPlaced {
        order_hash: computation_id,
    });
    Ok(())
}

#[derive(Accounts)]
#[instruction(args: PlaceOrderArgs)]
pub struct PlaceOrder<'info> {
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
    #[account(
        init,
        payer = payer,
        space = OrderAccount::LEN,
        seeds = [ORDER_SEED, payer.key().as_ref(), &args.order_id.to_le_bytes()],
        bump
    )]
    pub order: Account<'info, OrderAccount>,
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
