use anchor_lang::prelude::*;
use arcium_anchor::prelude::*;
use arcium_client::idl::arcium::types::CallbackInstruction;

use crate::constants::{IX_PLACE_ORDER, MAX_ENCRYPTED_ORDER_BLOB, ORDER_SEED, ORDER_STATUS_OPEN};
use crate::errors::PrivateTradingError;
use crate::events::OrderPlaced;
use crate::instructions::common::{bounded_blob, compute_deterministic_id, require_encrypted_accounts};
use crate::state::{ComputationConfigAccount, MarketAccount, OrderAccount, UserPositionAccount};
use crate::{ArciumSignerAccount, ID};

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct PlaceOrderArgs {
    pub order_id: u64,
    pub encrypted_order_blob: Vec<u8>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct PlaceOrderPrivateArgs {
    pub order_id: u64,
    pub computation_offset: u64,
    pub encrypted_order_blob: Vec<u8>,
    pub order_pubkey: [u8; 32],
    pub order_nonce: u128,
    pub order_asset: [u8; 32],
    pub order_side: [u8; 32],
    pub order_price: [u8; 32],
    pub order_size: [u8; 32],
    pub order_timestamp: [u8; 32],
    pub collateral_pubkey: [u8; 32],
    pub collateral_nonce: u128,
    pub collateral: [u8; 32],
    pub maintenance_margin_bps: u64,
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

#[check_args]
pub fn place_order_private(
    ctx: Context<PlaceOrderPrivate>,
    args: PlaceOrderPrivateArgs,
) -> Result<()> {
    let market = &ctx.accounts.market;
    require!(!market.paused, PrivateTradingError::MarketPaused);

    let encrypted_order_blob = bounded_blob(args.encrypted_order_blob, MAX_ENCRYPTED_ORDER_BLOB)?;
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

    ctx.accounts.sign_pda_account.bump = ctx.bumps.sign_pda_account;

    #[args("place_order")]
    let computation_args = ArgBuilder::new()
        .x25519_pubkey(args.order_pubkey)
        .plaintext_u128(args.order_nonce)
        .encrypted_u64(args.order_asset)
        .encrypted_u8(args.order_side)
        .encrypted_u128(args.order_price)
        .encrypted_u128(args.order_size)
        .encrypted_i64(args.order_timestamp)
        .x25519_pubkey(args.collateral_pubkey)
        .plaintext_u128(args.collateral_nonce)
        .encrypted_u128(args.collateral)
        .plaintext_u64(args.maintenance_margin_bps)
        .build();

    let callback_instructions = vec![CallbackInstruction {
        program_id: ID,
        discriminator: crate::instruction::HandleCallback::DISCRIMINATOR.to_vec(),
        accounts: vec![],
    }];

    queue_computation(
        ctx.accounts,
        args.computation_offset,
        computation_args,
        callback_instructions,
        1,
        0,
    )?;

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

#[queue_computation_accounts("place_order", payer)]
#[derive(Accounts)]
#[instruction(args: PlaceOrderPrivateArgs)]
pub struct PlaceOrderPrivate<'info> {
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
    #[account(mut, address = derive_mxe_pda!())]
    pub mxe_account: Box<Account<'info, MXEAccount>>,
    #[account(
        init_if_needed,
        payer = payer,
        space = 8 + 1,
        seeds = [SIGN_PDA_SEED],
        bump
    )]
    pub sign_pda_account: Account<'info, ArciumSignerAccount>,
    /// CHECK: Arcium mempool PDA for the selected cluster.
    #[account(mut)]
    pub mempool_account: UncheckedAccount<'info>,
    /// CHECK: Arcium execution pool PDA for the selected cluster.
    #[account(mut)]
    pub executing_pool: UncheckedAccount<'info>,
    /// CHECK: Arcium computation PDA for this computation offset.
    #[account(mut)]
    pub computation_account: UncheckedAccount<'info>,
    pub comp_def_account: Account<'info, ComputationDefinitionAccount>,
    #[account(mut)]
    pub cluster_account: Account<'info, Cluster>,
    #[account(mut)]
    pub pool_account: Account<'info, FeePool>,
    #[account(mut)]
    pub clock_account: Account<'info, ClockAccount>,
    pub system_program: Program<'info, System>,
    pub arcium_program: Program<'info, Arcium>,
}
