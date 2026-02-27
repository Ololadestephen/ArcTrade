use arcis::*;

#[encrypted]
pub mod private_trading {
    use arcis::*;

    pub struct PrivateOrder {
        pub asset: u64,
        pub side: u8,
        pub price: u128,
        pub size: u128,
        pub timestamp: i64,
    }

    pub struct Position {
        pub entry_price: u128,
        pub size: u128,
        pub collateral: u128,
        pub liquidation_price: u128,
    }

    pub struct TradeMatch {
        pub matched_price: u128,
        pub matched_size: u128,
        pub is_valid: u8,
    }

    pub struct LiquidationInput {
        pub position_data: Position,
        pub oracle_price: u128,
    }

    pub struct TradeSettlement {
        pub realized_pnl: u128,
        pub is_profit: u8,
        pub liquidation_flag: u8,
        pub updated_position: Position,
    }

    #[instruction]
    pub fn place_order(
        order_ctxt: Enc<Shared, PrivateOrder>,
        collateral_ctxt: Enc<Shared, u128>,
        maintenance_margin_bps: u64,
    ) -> Enc<Mxe, PrivateOrder> {
        let mut order = order_ctxt.to_arcis();
        let collateral = collateral_ctxt.to_arcis();

        let notional = order.price * order.size;
        let required_collateral = (notional * (maintenance_margin_bps as u128)) / 10_000u128;

        if collateral < required_collateral {
            order.size = 0u128;
        }

        Mxe::get().from_arcis(order)
    }

    #[instruction]
    pub fn match_orders(
        maker_order_ctxt: Enc<Mxe, PrivateOrder>,
        taker_order_ctxt: Enc<Mxe, PrivateOrder>,
    ) -> Enc<Mxe, TradeMatch> {
        let maker = maker_order_ctxt.to_arcis();
        let taker = taker_order_ctxt.to_arcis();

        let (matched_size, matched_price, is_valid) = if maker.side != taker.side {
            (
                if maker.size < taker.size {
                    maker.size
                } else {
                    taker.size
                },
                (maker.price + taker.price) / 2u128,
                1u8,
            )
        } else {
            (0u128, 0u128, 0u8)
        };

        let result = TradeMatch {
            matched_price,
            matched_size,
            is_valid,
        };

        maker_order_ctxt.owner.from_arcis(result)
    }

    #[instruction]
    pub fn check_liquidation(input_ctxt: Enc<Mxe, LiquidationInput>) -> Enc<Mxe, u8> {
        let input = input_ctxt.to_arcis();
        let should_liquidate = if input.oracle_price <= input.position_data.liquidation_price {
            1u8
        } else {
            0u8
        };

        input_ctxt.owner.from_arcis(should_liquidate)
    }

    #[instruction]
    pub fn settle_trade(
        position_ctxt: Enc<Mxe, Position>,
        trade_ctxt: Enc<Mxe, TradeMatch>,
    ) -> Enc<Mxe, TradeSettlement> {
        let position = position_ctxt.to_arcis();
        let trade = trade_ctxt.to_arcis();

        let entry_notional = position.entry_price * trade.matched_size;
        let exit_notional = trade.matched_price * trade.matched_size;

        let (realized_pnl, is_profit) = if exit_notional >= entry_notional {
            (exit_notional - entry_notional, 1u8)
        } else {
            (entry_notional - exit_notional, 0u8)
        };

        let updated_position = Position {
            entry_price: trade.matched_price,
            size: position.size,
            collateral: position.collateral,
            liquidation_price: position.liquidation_price,
        };

        let output = TradeSettlement {
            realized_pnl,
            is_profit,
            liquidation_flag: 0u8,
            updated_position,
        };

        position_ctxt.owner.from_arcis(output)
    }

    #[instruction]
    pub fn cancel_order(order_ctxt: Enc<Mxe, PrivateOrder>) -> Enc<Mxe, u8> {
        let _order = order_ctxt.to_arcis();
        order_ctxt.owner.from_arcis(1u8)
    }

    #[instruction]
    pub fn update_position(
        position_ctxt: Enc<Mxe, Position>,
        trade_ctxt: Enc<Mxe, TradeMatch>,
        is_buy: u8,
    ) -> Enc<Mxe, Position> {
        let position = position_ctxt.to_arcis();
        let trade = trade_ctxt.to_arcis();

        let next_size = if is_buy == 1 {
            position.size + trade.matched_size
        } else if position.size > trade.matched_size {
            position.size - trade.matched_size
        } else {
            0u128
        };

        let next_liquidation_price = if next_size == 0 {
            0u128
        } else {
            position.liquidation_price
        };

        let next = Position {
            entry_price: trade.matched_price,
            size: next_size,
            collateral: position.collateral,
            liquidation_price: next_liquidation_price,
        };

        position_ctxt.owner.from_arcis(next)
    }
}
