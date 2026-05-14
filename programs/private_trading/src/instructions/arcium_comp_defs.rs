use anchor_lang::prelude::*;
use arcium_anchor::prelude::*;
use arcium_client::idl::arcium::types::{CircuitSource, OffChainCircuitSource};
use arcium_macros::circuit_hash;

use crate::ID;

const OFFCHAIN_CIRCUIT_BASE: &str =
    "https://raw.githubusercontent.com/Ololadestephen/ArcTrade/main/build";

fn offchain_circuit_source(circuit_name: &str, hash: [u8; 32]) -> CircuitSource {
    CircuitSource::OffChain(OffChainCircuitSource {
        source: format!("{}/{}.arcis", OFFCHAIN_CIRCUIT_BASE, circuit_name),
        hash,
    })
}

macro_rules! init_offchain_comp_def {
    ($fn_name:ident, $ctx_ty:ty, $circuit_name:literal) => {
        pub fn $fn_name(ctx: Context<$ctx_ty>) -> Result<()> {
            init_comp_def(
                ctx.accounts,
                Some(offchain_circuit_source(
                    $circuit_name,
                    circuit_hash!($circuit_name),
                )),
                None,
            )?;
            Ok(())
        }
    };
}

init_offchain_comp_def!(
    init_place_order_comp_def,
    InitPlaceOrderCompDef,
    "place_order"
);
init_offchain_comp_def!(
    init_match_orders_comp_def,
    InitMatchOrdersCompDef,
    "match_orders"
);
init_offchain_comp_def!(
    init_check_liquidation_comp_def,
    InitCheckLiquidationCompDef,
    "check_liquidation"
);
init_offchain_comp_def!(
    init_settle_trade_comp_def,
    InitSettleTradeCompDef,
    "settle_trade"
);
init_offchain_comp_def!(
    init_cancel_order_comp_def,
    InitCancelOrderCompDef,
    "cancel_order"
);
init_offchain_comp_def!(
    init_update_position_comp_def,
    InitUpdatePositionCompDef,
    "update_position"
);

macro_rules! comp_def_accounts {
    ($name:ident, $circuit_name:literal) => {
        #[init_computation_definition_accounts($circuit_name, payer)]
        #[derive(Accounts)]
        pub struct $name<'info> {
            #[account(mut)]
            pub payer: Signer<'info>,
            #[account(mut, address = derive_mxe_pda!())]
            pub mxe_account: Box<Account<'info, MXEAccount>>,
            #[account(mut)]
            /// CHECK: Checked by the Arcium program during computation definition init.
            pub comp_def_account: UncheckedAccount<'info>,
            #[account(mut, address = derive_mxe_lut_pda!(mxe_account.lut_offset_slot))]
            /// CHECK: Checked by the Arcium program.
            pub address_lookup_table: UncheckedAccount<'info>,
            #[account(address = LUT_PROGRAM_ID)]
            /// CHECK: Address lookup table program.
            pub lut_program: UncheckedAccount<'info>,
            pub arcium_program: Program<'info, Arcium>,
            pub system_program: Program<'info, System>,
        }
    };
}

comp_def_accounts!(InitPlaceOrderCompDef, "place_order");
comp_def_accounts!(InitMatchOrdersCompDef, "match_orders");
comp_def_accounts!(InitCheckLiquidationCompDef, "check_liquidation");
comp_def_accounts!(InitSettleTradeCompDef, "settle_trade");
comp_def_accounts!(InitCancelOrderCompDef, "cancel_order");
comp_def_accounts!(InitUpdatePositionCompDef, "update_position");
