use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod events;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("e6oyALFfDbVMy4gp3xVr5hRXo5VyCSw23gxk9M3YALM");

#[program]
pub mod private_trading {
    use super::*;

    pub fn initialize_market(
        ctx: Context<InitializeMarket>,
        args: InitializeMarketArgs,
    ) -> Result<()> {
        instructions::initialize_market(ctx, args)
    }

    pub fn initialize_user_position(
        ctx: Context<InitializeUserPosition>,
        public_collateral: u64,
    ) -> Result<()> {
        instructions::initialize_user_position(ctx, public_collateral)
    }

    pub fn initialize_computation_config(
        ctx: Context<InitializeComputationConfig>,
        instruction_offsets: Vec<u32>,
    ) -> Result<()> {
        instructions::initialize_computation_config(ctx, instruction_offsets)
    }

    pub fn place_order(ctx: Context<PlaceOrder>, args: PlaceOrderArgs) -> Result<()> {
        instructions::place_order(ctx, args)
    }

    pub fn match_orders(ctx: Context<MatchOrders>, args: MatchOrdersArgs) -> Result<()> {
        instructions::match_orders(ctx, args)
    }

    pub fn check_liquidation(
        ctx: Context<CheckLiquidation>,
        args: CheckLiquidationArgs,
    ) -> Result<()> {
        instructions::check_liquidation(ctx, args)
    }

    pub fn settle_trade(ctx: Context<SettleTrade>, args: SettleTradeArgs) -> Result<()> {
        instructions::settle_trade(ctx, args)
    }

    pub fn cancel_order(ctx: Context<CancelOrder>, args: CancelOrderArgs) -> Result<()> {
        instructions::cancel_order(ctx, args)
    }

    pub fn update_position(
        ctx: Context<UpdatePosition>,
        args: UpdatePositionArgs,
    ) -> Result<()> {
        instructions::update_position(ctx, args)
    }

    pub fn handle_callback(
        ctx: Context<HandleCallback>,
        args: HandleCallbackArgs,
    ) -> Result<()> {
        instructions::handle_callback(ctx, args)
    }
}
