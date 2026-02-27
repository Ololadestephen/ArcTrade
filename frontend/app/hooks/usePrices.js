import { useState, useEffect } from "react";

const COIN_IDS = {
    SOL: "solana",
    BTC: "bitcoin",
    ETH: "ethereum"
};

export function usePrices() {
    const [prices, setPrices] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchPrices = async () => {
        try {
            const url = `https://api.coingecko.com/api/v3/simple/price?ids=${Object.values(COIN_IDS).join(',')}&vs_currencies=usd&include_24hr_change=true`;

            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();

            const transformed = {
                "SOL": {
                    price: data.solana?.usd || 0,
                    change: data.solana?.usd_24h_change?.toFixed(2) || "0.00"
                },
                "BTC": {
                    price: data.bitcoin?.usd || 0,
                    change: data.bitcoin?.usd_24h_change?.toFixed(2) || "0.00"
                },
                "ETH": {
                    price: data.ethereum?.usd || 0,
                    change: data.ethereum?.usd_24h_change?.toFixed(2) || "0.00"
                }
            };

            setPrices(transformed);
            setLastUpdated(new Date());
            setError(null);
        } catch (err) {
            console.error("[usePrices] Error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrices();
        const interval = setInterval(fetchPrices, 60000);
        return () => clearInterval(interval);
    }, []);

    return { prices, loading, error, lastUpdated, refresh: fetchPrices };
}