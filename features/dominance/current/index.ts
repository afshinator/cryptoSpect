/**
 * Market Dominance Calculator
 * 
 * Main exports for the Market Dominance feature.
 * This module calculates market dominance percentages for BTC, ETH, stablecoins, and others.
 */

// Main calculation function
export { calculateDominance } from './DominanceCalculator';

// Data source functions
export {
    fetchAllMarketCapData, fetchBitcoinMarketCap,
    fetchEthereumMarketCap,
    fetchStablecoinsMarketCap, fetchTotalMarketCap
} from './dataSource';

// Types
export type {
    CategoryDominance, CoinGeckoGlobalData,
    CoinGeckoMarketData, DominanceAnalysis, MarketCapData
} from './types';

// Constants
export {
    BITCOIN_ID,
    ETHEREUM_ID
} from './constants';

// Stablecoin constants are exported from constants/stablecoins.ts
export {
    STABLECOIN_COUNT, STABLECOIN_IDS
} from '@/constants/stablecoins';

