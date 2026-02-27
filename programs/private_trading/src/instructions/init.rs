use anchor_lang::prelude::*;

use crate::constants::{CONFIG_SEED, MARKET_SEED, MAX_INSTRUCTION_OFFSETS, USER_POSITION_SEED};
use crate::errors::PrivateTradingError;
use crate::state::{ComputationConfigAccount, MarketAccount, UserPositionAccount};

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct InitializeMarketArgs {
    pub maintenance_margin: u64,
    pub fee_rate: u64,
}

pub fn initialize_market(ctx: Context<InitializeMarket>, args: InitializeMarketArgs) -> Result<()> {
    let market = &mut ctx.accounts.market;
    market.asset_mint = ctx.accounts.asset_mint.key();
    market.oracle_feed = ctx.accounts.oracle_feed.key();
    market.maintenance_margin = args.maintenance_margin;
    market.fee_rate = args.fee_rate;
    market.paused = false;
    market.bump = ctx.bumps.market;
    Ok(())
}

pub fn initialize_user_position(
    ctx: Context<InitializeUserPosition>,
    public_collateral: u64,
) -> Result<()> {
    let user_position = &mut ctx.accounts.user_position;
    user_position.owner = ctx.accounts.owner.key();
    user_position.encrypted_position_blob = Vec::new();
    user_position.public_collateral = public_collateral;
    user_position.nonce = 0;
    user_position.pending_computation_id = [0u8; 32];
    user_position.pending_instruction = 0;
    user_position.last_realized_pnl = 0;
    user_position.liquidation_flag = false;
    user_position.bump = ctx.bumps.user_position;
    Ok(())
}

pub fn initialize_computation_config(
    ctx: Context<InitializeComputationConfig>,
    instruction_offsets: Vec<u32>,
) -> Result<()> {
    require!(
        instruction_offsets.len() <= MAX_INSTRUCTION_OFFSETS,
        PrivateTradingError::InvalidAccount
    );
    let config = &mut ctx.accounts.computation_config;
    config.instruction_offsets = instruction_offsets;
    config.cluster_account = ctx.accounts.cluster_account.key();
    config.arcium_program = ctx.accounts.arcium_program.key();
    config.bump = ctx.bumps.computation_config;
    Ok(())
}

#[derive(Accounts)]
pub struct InitializeMarket<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    /// CHECK: Asset mint is used as an identifier.
    pub asset_mint: UncheckedAccount<'info>,
    /// CHECK: Oracle feed address is used as an identifier.
    pub oracle_feed: UncheckedAccount<'info>,
    #[account(
        init,
        payer = payer,
        space = MarketAccount::LEN,
        seeds = [MARKET_SEED, asset_mint.key().as_ref()],
        bump
    )]
    pub market: Account<'info, MarketAccount>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitializeUserPosition<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    pub owner: Signer<'info>,
    #[account(
        init,
        payer = payer,
        space = UserPositionAccount::LEN,
        seeds = [USER_POSITION_SEED, owner.key().as_ref()],
        bump
    )]
    pub user_position: Account<'info, UserPositionAccount>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitializeComputationConfig<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        init,
        payer = payer,
        space = ComputationConfigAccount::LEN,
        seeds = [CONFIG_SEED],
        bump
    )]
    pub computation_config: Account<'info, ComputationConfigAccount>,
    /// CHECK: Arcium cluster authority account.
    pub cluster_account: UncheckedAccount<'info>,
    /// CHECK: Arcium program id account.
    pub arcium_program: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}
