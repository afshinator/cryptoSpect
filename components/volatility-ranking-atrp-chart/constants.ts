// components/volatility-ranking-atrp-chart/constants.ts
// Constants and mock data for the VolatilityRankingATRP component

import type { VolatilityData } from './types';

/**
 * Mock volatility data for development and testing
 */
export const MOCK_VOLATILITY_DATA: VolatilityData = {
  type: "atrp",
  bag: "top20_bag",
  periods: [7, 14, 30],
  maxPeriod: 30,
  timestamp: Date.now(),
  data: [
    // High Volatility / Non-Stablecoins (Sorted by 30d ATRP for the list)
    { symbol: "DOT", results: [{ period: 30, vwatr: 0.15, atrp: 7.92 }] }, // Highest
    { symbol: "ADA", results: [{ period: 30, vwatr: 0.035, atrp: 7.64 }] },
    { symbol: "LINK", results: [{ period: 30, vwatr: 0.99, atrp: 7.08 }] },
    { symbol: "DOGE", results: [{ period: 30, vwatr: 0.01, atrp: 6.99 }] },
    { symbol: "SOL", results: [{ period: 30, vwatr: 9.85, atrp: 6.77 }] },
    { symbol: "XRP", results: [{ period: 30, vwatr: 0.14, atrp: 6.47 }] },
    { symbol: "ETH", results: [{ period: 30, vwatr: 211.99, atrp: 6.53 }] },
    { symbol: "BNB", results: [{ period: 30, vwatr: 47.96, atrp: 5.08 }] },
    { symbol: "BTC", results: [{ period: 30, vwatr: 4069.72, atrp: 4.33 }] }, // Lowest Non-Stable
    // Stablecoins (to be filtered out)
    { symbol: "USDT", results: [{ period: 30, vwatr: 0.0008, atrp: 0.07 }] },
    { symbol: "USDC", results: [{ period: 30, vwatr: 0.0002, atrp: 0.03 }] },
    { symbol: "DAI", results: [{ period: 30, vwatr: 0.0005, atrp: 0.05 }] },
    { symbol: "TUSD", results: [{ period: 30, vwatr: 0.0012, atrp: 0.15 }] },
    { symbol: "EGLD", results: [{ period: 30, vwatr: 0.5, atrp: 7.15 }] }, // Another non-stable
  ],
};

