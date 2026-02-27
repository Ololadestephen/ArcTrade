import { useEffect } from "react";
import { useToast } from "./useToast";

export function useSettlement(program, onSettled) {
    const { show } = useToast(5000);

    useEffect(() => {
        if (!program) return;

        const listenerId = program.addEventListener("TradeSettled", (event, slot) => {
            console.log("🏁 TradeSettled event caught:", event, slot);

            const realizedPnl = event.realizedPnl ? event.realizedPnl.toNumber() : 0;
            const isProfit = realizedPnl >= 0;
            const pnlFormatted = (Math.abs(realizedPnl) / 1e6).toFixed(2);

            show(`🏁 Trade settled! Realized PnL: ${isProfit ? '+' : '-'}$${pnlFormatted}`);

            if (onSettled) {
                onSettled({
                    pnl: realizedPnl,
                    slot,
                    timestamp: Date.now()
                });
            }
        });

        const mockListenerId = (e) => {
            const realizedPnl = e.detail.pnl;
            const originalOrder = e.detail.originalOrder;
            const isProfit = realizedPnl >= 0;
            const pnlFormatted = (Math.abs(realizedPnl) / 1e6).toFixed(2);

            show(`🏁 Trade settled! Realized PnL: ${isProfit ? '+' : '-'}$${pnlFormatted}`);

            if (onSettled) {
                onSettled({
                    pnl: realizedPnl,
                    originalOrder,
                    slot: 0,
                    timestamp: Date.now()
                });
            }
        };

        window.addEventListener("mockTradeSettled", mockListenerId);

        return () => {
            program.removeEventListener(listenerId).catch(console.error);
            window.removeEventListener("mockTradeSettled", mockListenerId);
        };
    }, [program, show, onSettled]);
}
